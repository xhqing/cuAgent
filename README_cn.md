<div align="center">
  <img src="assets/logo.svg" alt="cuAgent" width="640">
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![Version](https://img.shields.io/badge/Version-0.1.1-blue.svg)](VERSION)
[![Type](https://img.shields.io/badge/Type-AI%20Agent-FF1493.svg)](#)
<img src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/xhqing/xhqing/main/traffic/badges/cuAgent.json" alt="Visits/day (14d)" />

</div>

# cuAgent

> 🖱️ **cuAgent**（cu = computer-use）—— 电脑操作员。用 computer-use 能力代替用户操作本机电脑界面：看屏幕、点击、输入、拖拽——把手工重复操作交给 agent。

[English](README.md)

cuAgent 是一个**专用计算机操作 agent**：它通过 [open-computer-use](https://github.com/QwenLM/open-computer-use) MCP 接入本机 GUI 自动化——读取应用截图与无障碍树，执行点击、输入、拖拽等真实界面操作。用户只需说清目标，剩下的界面操作由 cuAgent 完成。

---

## 能做什么

| 工具 | 作用 |
|---|---|
| `list_apps` | 列出本机应用（运行中 + 最近使用过） |
| `get_app_state` | 取目标应用关键窗口的截图 + 无障碍树 |
| `click` / `drag` / `scroll` | 点击 / 拖拽 / 滚动 |
| `type_text` / `press_key` | 输入文本 / 按键与快捷键 |
| `set_value` / `perform_secondary_action` | 控件赋值 / 触发无障碍次级动作 |

---

## 怎么用

1. 在 cuAgent 项目目录里启动支持 MCP 的 agent 客户端（pi / Claude Code）；
2. 首次使用需**批准本项目的 MCP server**（项目信任 + 一次性批准，属安全闸门）；
3. macOS 需在「系统设置 → 隐私与安全性」授予**辅助功能**与**屏幕录制**权限；
4. 直接对 agent 说清要操作什么（哪个应用、做什么、期望结果）。

配置在项目根 [`.mcp.json`](.mcp.json)：`open-computer-use` 由 `npx` 拉起 `@qwen-code/open-computer-use` 固定版本——**只在本项目内启用、不全局安装**。项目默认模型在 `.pi/settings.json` 中固定为 `dashscope/qwen3.8-max`（取其图像输入能力以处理截图），可自行更换。

---

## 安全边界

- **破坏性 / 对外可见的动作先确认**：发送、删除、购买、对外发布等动作，动手前先向用户确认；
- **不打扰用户**：后台操作应用、不抢前台窗口、不随意覆盖剪贴板；
- **范围限定**：computer-use 能力只存在于本项目，其它项目与全局配置均不启用。

---

## 许可与署名

版权所有 (c) 2026 All Contributors，基于 [MIT License](LICENSE.md) 授权。

**署名要求**：如你基于本项目衍生或再分发，请保留版权声明与许可文件，并注明来源：[cuAgent](https://github.com/xhqing/cuAgent)。
