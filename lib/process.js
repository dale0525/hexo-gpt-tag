'use strict';

const front = require('hexo-front-matter');
const fs = require('hexo-fs');
const gptRequest = require('./gptRequest');

const process_post = async function (apiKey, max_tags, override, data) {
    // 1. Sanitize post content
    let frontmatter = front.parse(data.raw);
    let text = data.content.replace(/!\[.*\]\((.*?)\)/g, ""); // Remove images markdown
    text = text.replace("<!--more-->", ""); // Remove read more
    text = text.replace(/<\/?[^>]+>/g, ""); // Remove HTML tags
    text = text.replace(/\$[\s\S]+?\$/g, ""); // Remove Katex tags
    text = text.replace(/^\s*[\r\n]/gm, ""); // Remove empty lines
    text = frontmatter.title + ": " + text;  // Add title

    // 2. Get tags from text using GPT-3.5
    let tags_str = await gptRequest(apiKey, text, max_tags);
    if (!tags_str)
        return;
    tags_str = tags_str.replace("，", ",");
    tags_str = tags_str.replace("，", ",");
    tags_str = tags_str.replace("，", ",");
    tags_str = tags_str.replace(/\s*,\s*/g, ",");
    if (tags_str.charAt(tags_str.length - 1) === '.') {
        tags_str = tags_str.slice(0, -1);
    }
    const tags = tags_str.split(',');
    if (tags.length > 5) {
        tags = tags.slice(0, 5);
    }

    if (override) {
        frontmatter.tags = tags;
    }
    else {
        frontmatter.tags = tags.concat(frontmatter.tags);
    }
    let new_frontmatter = front.stringify(frontmatter);
    new_frontmatter = '---\n' + new_frontmatter;
    fs.writeFile(data.full_source, new_frontmatter, 'utf-8');
}


const process = async function (data) {
    // Only process posts
    if (!this.config.gpt_tag.enable)
        return data;
    if (data.layout != 'post')
        return data;
    if (!this.config.render_drafts && data.source.startsWith("_drafts/"))
        return data;

    const apiKey = this.config.gpt_tag.apiKey
    const max_tags = this.config.gpt_tag.max_tags;
    const override = this.config.gpt_tag.override;

    await process_post(apiKey, max_tags, override, data);

    return data;
}


module.exports = process;
