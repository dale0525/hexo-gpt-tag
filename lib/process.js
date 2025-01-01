"use strict";

const front = require("hexo-front-matter");
const fs = require("hexo-fs");
const gptRequest = require("./gptRequest");

const process_post = async function (
    apiKey,
    max_tokens,
    override,
    model,
    data,
    base_url,
    prompt
) {
    // 1. Sanitize post content
    let frontmatter = front.parse(data.raw);
    console.log(`Generating tags for ${frontmatter.title}`);
    let text = data.content.replace(/!\[.*\]\((.*?)\)/g, ""); // Remove images markdown
    text = text.replace("<!--more-->", ""); // Remove read more
    text = text.replace(/<\/?[^>]+>/g, ""); // Remove HTML tags
    text = text.replace(/\$[\s\S]+?\$/g, ""); // Remove Katex tags
    text = text.replace(/^\s*[\r\n]/gm, ""); // Remove empty lines
    text = frontmatter.title + ": " + text; // Add title

    // 2. Get tags from text using GPT-3.5
    let tags = await gptRequest(
        apiKey,
        text,
        max_tokens,
        model,
        base_url,
        prompt
    );
    if (!tags) return;

    if (override) {
        frontmatter.tags = tags;
    } else {
        frontmatter.tags = tags.concat(frontmatter.tags);
    }
    let new_frontmatter = front.stringify(frontmatter);
    new_frontmatter = "---\n" + new_frontmatter;
    fs.writeFile(data.full_source, new_frontmatter, "utf-8");
};

const process = async function (data) {
    // Only process posts
    if (!this.config.gpt_tag.enable) return data;
    if (data.layout != "post") return data;
    if (!this.config.render_drafts && data.source.startsWith("_drafts/"))
        return data;

    const apiKey = this.config.gpt_tag.apiKey;
    const max_tags = this.config.gpt_tag.max_tags;
    const override = this.config.gpt_tag.override;
    const model = this.config.gpt_tag.model;
    const max_tokens = this.config.gpt_tag.max_tokens || 2048;
    const base_url =
        this.config.gpt_tag.base_url || "https://api.openai.com/v1";
    const prompt =
        this.config.gpt_tag.prompt ||
        `
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
`;

    await process_post(
        apiKey,
        max_tokens,
        override,
        model,
        data,
        base_url,
        prompt
    );

    return data;
};

module.exports = process;
