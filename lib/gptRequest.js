const { Configuration, OpenAIApi } = require("openai");
const { encode } = require("gpt-3-encoder");

const Cache = require("file-system-cache").default;
const cache = Cache({ basePath: "./.cache" });

const gptRequest = async function (apiKey, text, max_tags, max_tokens, model) {
    // Check cache
    const value = cache.getSync(text);
    if (value) {
        // Hit cache
        return value;
    }

    // make sure not to exceed max tokens when using GPT-3.5 API
    const tokens = encode(text).length;
    if (tokens > max_tokens) {
        text = reduceLength(text, tokens);
    }

    // If not in cache, call API
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    try {
        const response = await openai.createChatCompletion({
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

- List the tags as a comman separated string.

# Examples

**Input**: Blog Post about "The Benefits of Yoga for Mental Health"
- Detailed analysis reveals themes of "mental well-being", "physical health", "yoga practices", and related lifestyle tips.

**Output**:
yoga, mental health, benefits of yoga, well-being, lifestyle

# Notes

- Ensure tags are diverse enough to cover different aspects of the blog content.
- Avoid overly generic tags unless they are highly relevant to the blog post.
- A single tag should be in the same main language of the post, or in English.
- Use no more than ${max_tags} tags.`,
                },
                { role: "user", content: text },
            ],
            temperature: 0,
        });
        const tags = response.data.choices[0].message.content;
        // Add to cache
        cache.setSync(text, tags);
        return tags;
    } catch (error) {
        return null;
    }
};

// if the article is too long, reduce the length
function reduceLength(text, tokens) {
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
