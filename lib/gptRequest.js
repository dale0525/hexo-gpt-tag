const { OpenAI } = require("openai");
const { encode } = require("gpt-3-encoder");
const crypto = require("crypto");

const Cache = require("file-system-cache").default;
const cache = Cache({ basePath: "./.cache" });

const gptRequest = async function (apiKey, text, max_tokens, model, base_url, prompt) {
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
                    content: prompt,
                },
                { role: "user", content: text },
            ],
            temperature: 0,
            response_format: {
                'type': 'json_object'
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
