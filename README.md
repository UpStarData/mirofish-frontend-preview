# agrilink 推演层前端演示

组合页面：https://upstardata.github.io/mirofish-frontend-preview/agrilink-v084/

在 AgriLink v0.8.4 的“推演层”中加载五步推演界面。事实与关联层的选择会生成输入问题和浏览器内的文本证据。图谱、角色、模拟轮次、报告及互动答复由 `source/frontend/src/api/demo.js` 的固定样例提供；不调用后端，也不代表真实预测。直接打开前端首页时，可用“使用农业交易演示数据”启动流程。

`source/frontend/` 基于 [MiroFish 官方仓库](https://github.com/666ghj/MiroFish) 提交 `117ed37758cdc96f73b7d5e0d22713c50439695f`，保留上游源码许可与归属说明。`docs/` 是 GitHub Pages 发布目录。上游名称仅用于源码归属，页面 UI 使用 agrilink 品牌。

重新构建：

```sh
cd source/frontend
npm ci
npm run build
```

旧的 `/fusion/` 样页地址会跳转到组合页面。
