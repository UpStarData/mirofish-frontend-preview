# MiroFish 前端体验页

访问地址：https://upstardata.github.io/mirofish-frontend-preview/

这是 [MiroFish 官方仓库](https://github.com/666ghj/MiroFish) 提交 `117ed37758cdc96f73b7d5e0d22713c50439695f` 的独立前端界面体验页。`source/` 保存对应源码、中文 README 和 AGPL-3.0 许可；`docs/` 是 GitHub Pages 发布的静态文件。

为静态托管调整了子路径和 hash 路由，并加入无后端提示。浏览器中的 API 请求会被阻止，所选文件和填写内容不会发送到服务器。页面可浏览前端界面；图谱生成和推演需要另行运行官方后端，不在此体验页提供。

重新构建：

```sh
cd source/frontend
npm ci
npm run build
```

GitHub Pages 发布源为 `main` 分支的 `/docs` 目录。
