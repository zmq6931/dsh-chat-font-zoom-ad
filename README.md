# dsh-chat-font-zoom-ad — 聊天字体缩放

给 DeepSeek Harness Web GUI（含桌面端）的**输入框工具栏**加一个紧凑的 **A− / 14 / A+** 控件：点一下就把**聊天正文**放大或缩小 1px（10–22 px）。

> 📦 **源码 / GitHub：**[zmq6931/dsh-chat-font-zoom-ad](https://github.com/zmq6931/dsh-chat-font-zoom-ad) &nbsp;·&nbsp; MIT License

- 与「设置 → 通用 → 字号」共用同一份持久化设置（`text` 字号角色），重启后保留。
- 聊天正文、Markdown 标题、用户气泡和输入框草稿会一起变化；代码块仍由「代码字号」与桌面端 `Ctrl/Cmd + +/−` 控制。
- 桌面端已有 `Ctrl + +/−`（同时调整正文 / 代码 / 终端），本插件补的是**聊天内可见的按钮**，并实时显示当前字号。
- 到达边界（10 或 22 px）时对应按钮自动禁用；浅色 / 深色主题跟随宿主 token，无硬编码颜色。

## 安装

本地目录（开发 / 自用）：

```bash
dsh plugin --profile desktop add link:C:/Andy/deepseek_HARNESS/dsh-chat-font-zoom-ad
```

或在「插件」面板里填 `link:C:/Andy/deepseek_HARNESS/dsh-chat-font-zoom-ad`。安装后刷新页面，输入框右侧（提交按钮前）出现 A− / A+ 控件即生效。

## 结构

| 文件 | 作用 |
| --- | --- |
| `index.js` | Host 半：空实现，仅承载 Loader 行。 |
| `client.js` | 浏览器半：注册 `conversation.input.right` 控件，调用客户端 `theme.setFontSize('text', px)`。 |
| `cordis.patch.yml` | 插入 `chat-font-zoom` 行。 |
| `locale/en.json`、`locale/zh.json` | 插件列表里的标题与说明。 |
| `icon.svg` | 插件图标。 |

## 实现要点

- 不 import 任何 Harness Client 包：`React` 来自浏览器模块表，样式只用 `--dsw-alias-*` 主题 token。
- 通过 `ctx.slots.register(..., inject: () => ({ store, t }))` 注入一个小 store；组件用 `React.useSyncExternalStore` 跟随 `theme/change`、`locale/change` 重渲染，因此宿主快捷键或设置页改动时，控件里显示的字号不会过期。
- `setFontSize` 由宿主 theme 服务校验并写入设置命名空间，插件自己不持久化任何配置。

MIT License.
