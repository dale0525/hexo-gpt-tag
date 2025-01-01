# hexo-gpt-tag

---

使用 GPT，根据您的文章内容自动生成标签。

## 安装

```bash
npm install hexo-gpt-tag
```

## 使用方法

1.  将以下内容添加到您的 Hexo 站点的 `_config.yml` 文件中：

```yaml
gpt_tag:
    enable: true
    apiKey: <YOUR_OPENAI_API_KEY>
    override: true # 是否覆盖原有tag
    max_tags: 5 # 生成最多多少个tag
    max_tokens: 2048 # (可选) 发送给gpt的最大正文token数量
    model: gpt-4o-mini, # 使用的gpt模型
    base_url: "https://api.openai.com/v1" # (可选) OpenAI API 地址
    prompt: "<YOUR_OWN_PROMPT>" # (可选) 生成tag的提示词
```

您可以从[这里](https://platform.openai.com/account/api-keys)获取 API 密钥。使用 API 可能需要付费计划。

2.  当准备生成站点时，运行以下命令：

`hexo clean && hexo generate`

**确保运行`hexo clean` 和 `hexo generate`。**

3. 如果文章正文没有更改，不会重新生成 tag。如果要重新生成 tag，请删除`./.chache`文件夹并重新生成站点。
