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

## AgriLink × MiroFish 融合样页

访问地址：https://upstardata.github.io/mirofish-frontend-preview/fusion/

`/fusion/` 是独立的静态交互样页，源码在 `source/fusion/`，发布文件在 `docs/fusion/`；原有 `/` MiroFish 页保持独立。样页支持从事实、关联路径和直接入口准备输入，展示前端检查、手动推进的阶段/轮次、静态结果以及来源回跳。所有对象、证据、数值、日志和运行 ID 均为合成示意；没有后端、模型推演、持久 run、真实权限与服务端准入。它实现的是 [LLM-316 融合设计与输入契约草案 V0.1] 的交互候选，字段与准入规则仍待 LLM-302 专业评审。

本地启动与检查：

```sh
python3 -m http.server 8000 --directory docs
# 打开 http://localhost:8000/fusion/
NODE_PATH="$(npm root -g)" node artifacts/browser-check.cjs
```

`browser-check.cjs` 使用本机 Playwright 安装验证桌面和 390px 主路径。修改源码后同步发布文件：

```sh
cp source/fusion/* docs/fusion/
```
