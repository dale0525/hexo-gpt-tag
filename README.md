# hexo-gpt-tag

Automatically generate article tags with GPT-3.5
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
```

You can get your API key from [here](https://platform.openai.com/account/api-keys). It may require a paid plan to use the API.

2. Run the following command when ready to generate your site:

```
hexo clean && hexo generate
```

***Make sure to run BOTH `hexo clean` and `hexo generate`.***

