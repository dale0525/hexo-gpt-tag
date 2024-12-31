# hexo-gpt-tag

Automatically generate article tags with GPT
[中文文档](/README-CN.md)

## Installation

```
npm install hexo-gpt-tag
```

## Usage

1. Add the following to your Hexo site's `_config.yml` file:

```yaml
gpt_tag:
    enable: true
    apiKey: <YOUR OPENAI API KEY>
    override: true # whether to override existing tags
    max_tags: 5 # Generate at most how many tags
    max_tokens: 2048 # The maximum number of blog tokens used to send to gpt
    model: gpt-4o-mini, # The gpt model to use
    base_url: "https://api.openai.com/v1" # OpenAI API base URL
```

You can get your API key from [here](https://platform.openai.com/account/api-keys). It may require a paid plan to use the API.

2. Run the following command when ready to generate your site:

```
hexo clean && hexo generate
```

**_Make sure to run BOTH `hexo clean` and `hexo generate`._**

3. Tags will not be regenerated if blog post is not changed. Remove `./.cache` folder and generate your site if you want to regenerate tags even if blog post is not changed.
