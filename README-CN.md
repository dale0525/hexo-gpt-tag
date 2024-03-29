# hexo-gpt-tag

---

使用 GPT-3.5或GPT-4，根据您的文章内容自动生成标签。

安装
--

```bash
npm install hexo-gpt-tag
```

使用方法
----

1.  将以下内容添加到您的 Hexo 站点的 `_config.yml` 文件中：

```yaml
gpt_tag:
  enable: true
  apiKey: <YOUR OPENAI API KEY>
  override: true # 是否覆盖原有tag
  max_tags: 5 # 生成最多多少个tag
  model: gpt-4 # gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4, gpt-4-32k
```

您可以从[这里](https://platform.openai.com/account/api-keys)获取 API 密钥。使用 API 可能需要付费计划。

2.  当准备生成站点时，运行以下命令：

`hexo clean && hexo generate`

**确保运行`hexo clean` 和 `hexo generate`。**
