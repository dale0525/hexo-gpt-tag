const { Configuration, OpenAIApi } = require("openai");
const { encode } = require('gpt-3-encoder');

const Cache = require('file-system-cache').default
const cache = Cache({ basePath: "./.cache" });

const maxTokens = 3800;

const gptRequest = async function (apiKey, text, max_tags) {
    // Check cache
    const value = cache.getSync(text);
    if (value) {
        // Hit cache
        return value;
    }

    // make sure not to exceed max tokens when using GPT-3.5 API
    const tokens = encode(text).length;
    if (tokens > maxTokens) {
        text = reduceLength(text, tokens);
    }

    // If not in cache, call API
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                { 'role': 'system', 'content': `假如你是一名IT网站编辑，擅长总结归纳文章内容。现在你有一项任务，归纳发送给你的文章内容，根据文章的主要话题生成标签。要求：1.标签字数尽可能少，使用单个词语或英文单词。2.使用更普适的词汇，防止生成含义类似但用语不同的标签。3.生成的标签数量不得超过${max_tags}个。` },
                { 'role': 'user', 'content': `日前，OpenAI 公布其大型语言模型的最新版本 GPT-4。\n据悉，与 ChatGPT 所用的模型相比，GPT-4 是多模态的，同时支持文本和图像输入功能。该新模型将产生更少的错误答案、更少地偏离谈话轨道、更少地谈论禁忌话题，甚至在许多标准化测试中比人类表现得更好。` },
                { 'role': 'assistant', 'content': `OpenAI,GPT-4,多模态` },
                { 'role': 'user', 'content': text }
            ],
        });
        const tags = response.data.choices[0].message.content;
        // Add to cache
        cache.setSync(text, tags);
        return tags;
    } catch (error) {
        return null;
    }
}

// if the article is too long, reduce the length
function reduceLength(text, tokens) {

    let currentTokens = tokens;

    // Split the text into smaller segments
    const paragraphs = text.split("\n");
    for (let i = paragraphs.length - 1; i >= 0; i--) {
        const paragraph = paragraphs[i];
        const paragraphToken = encode(paragraph).length;
        if (currentTokens - paragraphToken > maxTokens) {
            paragraphs.splice(i, 1);
            currentTokens -= paragraphToken;
        }
        else
        {
            paragraphs.splice(i, 1);
            break;
        }
    }
    return paragraphs.join("\n");
}
module.exports = gptRequest;
