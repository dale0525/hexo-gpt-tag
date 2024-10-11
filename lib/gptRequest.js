const { OpenAI } = require("openai");
const { encode } = require("gpt-3-encoder");
const crypto = require("crypto");

const Cache = require("file-system-cache").default;
const cache = Cache({ basePath: "./.cache" });

const gptRequest = async function (apiKey, text, max_tags, max_tokens, model) {
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
    });
    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `
Generate a list of relevant tags for a given blog post to help categorize and enhance discoverability.

# Steps

1. **Analyze the Blog Content**: Review the blog post to identify key themes, topics, and specific terms frequently referenced.
2. **Identify Keywords**: Extract prominent keywords and phrases that capture the essence of the blog content.
3. **Determine Audience and Purpose**: Consider the target audience and the blog post's objective to ensure the tags align with these factors.
4. **Create Tags**: Use the identified keywords and topics to create concise, relevant tags that reflect the main subjects of the blog post.

# Output Format

- List the tags as an array.
- A single tag should be in the same main language of the post, or in English.
- Use no more than ${max_tags} tags.
- A single tag should be a single word or a short phrase.
- Capitalize the first letter of each tag.

# Examples

**Input**: Blog Post about "The Benefits of Yoga for Mental Health"
- Detailed analysis reveals themes of "mental well-being", "physical health", "yoga practices", and related lifestyle tips.

**Output**:
["yoga", "mental health", "benefits of yoga", "well-being", "lifestyle"]

# Notes

- Ensure tags are diverse enough to cover different aspects of the blog content.
- Avoid overly generic tags unless they are highly relevant to the blog post.
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
