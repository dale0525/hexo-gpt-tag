const { OpenAI } = require("openai");
const { encode } = require("gpt-3-encoder");
const crypto = require("crypto");

const Cache = require("file-system-cache").default;
const cache = Cache({ basePath: "./.cache" });

const gptRequest = async function (apiKey, text, max_tags, max_tokens, model, base_url) {
    const hash = crypto.createHash("md5").update(text, "utf8").digest("hex");
    // Check cache
    const value = cache.getSync(hash);
    if (value) {
        // Hit cache
        console.log(`Skipping due to hitting cache`);
        return JSON.parse(value);
    }

    // make sure not to exceed max tokens when using GPT-3.5 API
    const tokens = encode(text).length;
    if (tokens > max_tokens) {
        text = reduceLength(text, tokens, max_tokens);
    }

    // If not in cache, call API
    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: base_url,
    });
    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `
Generate a list of highly relevant tags for a given blog post to optimize categorization and discoverability.

# Tag Generation Guidelines

1. **Content Analysis**:
   - Identify 2-3 core themes as primary tags
   - Extract 3-5 supporting topics as secondary tags
   - Include 1-2 specific technical terms or proper nouns when applicable

2. **Tag Quality Requirements**:
   - Primary tags should represent broad categories
   - Secondary tags should be more specific sub-topics
   - Tags must directly relate to the content
   - Avoid redundant or overlapping tags
   - Exclude overly generic terms unless essential

3. **Tag Format Specifications**:
   - Keep tags concise (1-3 words maximum)
   - Use the same language as the blog post
   - Maintain consistent capitalization
   - Use spaces to separate words in phrases
   - Remove stop words (e.g., "the", "and", "of")

4. **Tag Relevance Validation**:
   - Each tag must appear in or directly relate to the content
   - Tags should cover at least 80% of the main topics
   - Ensure tags are useful for search and discovery

# Output Format

- Return tags as a JSON array
- Maximum ${max_tags} tags
- Order tags by importance (primary tags first)
- Example: ["Web Development", "JavaScript", "React Hooks", "State Management"]

# Examples

**Input**: Blog Post about "Advanced React State Management Techniques"
**Output**: ["React", "State Management", "useReducer", "Context API", "Performance Optimization"]

**Input**: Blog Post about "机器学习在医疗中的应用"
**Output**: ["机器学习", "医疗", "预测分析", "患者数据", "AI伦理"]

# Notes

- Prioritize accuracy over quantity
- Ensure tags are actionable and searchable
- Maintain consistency with existing tag conventions
`,
                },
                { role: "user", content: text },
            ],
            temperature: 0,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "blog_tags",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            tags: {
                                type: "array",
                                description:
                                    "A list of tags associated with a blog.",
                                items: {
                                    type: "string",
                                    description: "The name of a single tag.",
                                },
                            },
                        },
                        required: ["tags"],
                        additionalProperties: false,
                    },
                },
            },
        });
        const result = response.choices[0].message.content;
        const tags = JSON.parse(result).tags;
        console.log(tags);
        // Add to cache
        cache.setSync(hash, JSON.stringify(tags));
        return tags;
    } catch (error) {
        console.log(error.message);
        return null;
    }
};

// if the article is too long, reduce the length
function reduceLength(text, tokens, max_tokens) {
    let currentTokens = tokens;

    // Split the text into smaller segments
    const paragraphs = text.split("\n");
    for (let i = paragraphs.length - 1; i >= 0; i--) {
        const paragraph = paragraphs[i];
        const paragraphToken = encode(paragraph).length;
        if (currentTokens - paragraphToken > max_tokens) {
            paragraphs.splice(i, 1);
            currentTokens -= paragraphToken;
        } else {
            paragraphs.splice(i, 1);
            break;
        }
    }
    return paragraphs.join("\n");
}
module.exports = gptRequest;
