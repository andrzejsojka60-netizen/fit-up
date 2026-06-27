# Fit Up 🏋️

渐进式健身训练追踪应用 —— 基于 12 周推拉蹲计划的单页 Web 工具。

## 功能

- 📅 **12 周周期性训练计划** — 推拉蹲分化，4 阶段递进
- 🎯 **1RM 极限重量推荐** — 输入各动作极限重量，自动计算每次训练的推荐负荷
- 📈 **渐进超负荷提示** — 上周完成自动建议加重量
- 📝 **组间记录** — 记录每组重量、次数、RPE，一键标记完成
- 📊 **训练历史** — 按日期回顾所有训练记录
- 💾 **纯本地存储** — 所有数据保存在浏览器 localStorage，无需账号
- 📱 **移动端优化** — 响应式设计，手机上使用流畅

## 快速开始

1. 下载 `index.html`
2. 用浏览器打开即可使用
3. 建议部署到 GitHub Pages / Gitee Pages 方便手机访问

## 文件说明

| 文件 | 说明 |
|:---|:---|
| `index.html` | 主应用（包含 HTML/CSS/JS） |
| `训练计划.md` | 12 周训练计划详细文档 |
| `训练知识库.md` | 动作库、RPE 说明等参考资料 |
| `阅读计划.md` | 配套阅读清单 |

## 技术栈

- 纯 HTML/CSS/JS，零依赖
- localStorage 持久化
- 事件委托模式

## 部署到 GitHub Pages

1. 创建 GitHub 仓库，上传所有文件
2. Settings → Pages → Source: `main` branch, root directory → Save
3. 等待 1-2 分钟，访问 `https://<用户名>.github.io/<仓库名>/`

> 如果 GitHub 访问不稳定，推荐使用 [Gitee Pages](https://gitee.com/) 替代。
