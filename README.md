# hexo-gpt-tag

Automatically generate article tags with GPT-3.5 or GPT-4
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
  model: gpt-4 # gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4, gpt-4-32k
```

You can get your API key from [here](https://platform.openai.com/account/api-keys). It may require a paid plan to use the API.

2. Run the following command when ready to generate your site:

```
hexo clean && hexo generate
```

***Make sure to run BOTH `hexo clean` and `hexo generate`.***

