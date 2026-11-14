# Changelog

## 1.0.0 — 2026-11-14

- 首个版本：在输入框工具栏注册 A− / 当前 px / A+ 控件，调整聊天正文的 `text` 字号（10–22 px，步进 1px）。
- 与「设置 → 通用 → 字号」共用同一持久化设置；跟随 `theme/change` 与 `locale/change` 实时刷新。
- 仅使用 `--dsw-alias-*` 主题 token，无硬编码颜色；不 import 任何 Harness Client 包。
