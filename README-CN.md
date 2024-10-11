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
    apiKey: <YOUR OPENAI API KEY>
    override: true # 是否覆盖原有tag
    max_tags: 5 # 生成最多多少个tag
    max_tokens: 2048 # 发送给gpt的最大正文token数量
    model: gpt-4o-mini # 使用的gpt模型
```

您可以从[这里](https://platform.openai.com/account/api-keys)获取 API 密钥。使用 API 可能需要付费计划。

2.  当准备生成站点时，运行以下命令：

`hexo clean && hexo generate`

**确保运行`hexo clean` 和 `hexo generate`。**
