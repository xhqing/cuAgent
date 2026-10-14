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

> 🖱️ **cuAgent** (cu = computer-use) — computer operator. It operates a dedicated Mac's GUI for you through computer-use: reading the screen, clicking, typing, and dragging — so manual, repetitive work is handled by an agent.

[简体中文](README_cn.md)

cuAgent is a dedicated computer-operation agent: it connects to native GUI automation through the [open-computer-use](https://github.com/QwenLM/open-computer-use) MCP — reading app screenshots and accessibility trees, performing real interface actions like clicks, typing, and drags. By default it operates a **dedicated Mac reached over SSH** (such as a mac mini) — not the screen of the machine it runs on. You describe the goal; cuAgent does the interface work.

---

## What it can do

| Tool | Purpose |
|---|---|
| `list_apps` | List apps on this computer (running + recently used) |
| `get_app_state` | Capture a screenshot + accessibility tree of the app's key window |
| `click` / `drag` / `scroll` | Click / drag / scroll |
| `type_text` / `press_key` | Type text / press keys and shortcuts |
| `set_value` / `perform_secondary_action` | Set a control's value / invoke a secondary accessibility action |

---

## How to use it

1. Prepare the **target Mac** — a machine you can log into over SSH (macOS 14+), with **Accessibility** and **Screen Recording** granted in System Settings → Privacy & Security;
2. Start an MCP-capable agent client (pi / Claude Code) in the cuAgent project directory;
3. On first use, **approve this project's MCP server** (project trust + a one-time approval — a deliberate safety gate);
4. Just tell the agent what to operate (which app, what to do, expected result).

Configuration lives in the project-root [`.mcp.json`](.mcp.json): `open-computer-use` is launched over SSH on the target machine (`ssh mac-mini … npx @qwen-code/open-computer-use@0.2.3 mcp` — swap `mac-mini` for your own SSH alias) against a pinned version — **enabled only inside this project, never installed globally**. No model is pinned — the project runs on your agent client's default; note that computer-use needs a **vision-capable model**, since it reads screenshots.

---

## Safety boundaries

- **Target-device rule**: computer-use runs on the dedicated machine (reached over SSH) — by default **never on the local screen**; using it locally requires an explicit, user-approved exception;
- **Confirm destructive / externally visible actions first**: sending, deleting, purchasing, publishing — ask the user before acting;
- **Stay out of the way**: don't touch the local machine's windows or foreground; never overwrite the clipboard without being asked;
- **Scoped by design**: the computer-use capability exists only in this project; no other project or global config enables it.

---

## License & Attribution

Copyright (c) 2026 All Contributors. Licensed under the [MIT License](LICENSE.md).

**Attribution:** If you derive from or redistribute this project, please retain the copyright notice and license file, and credit the source: [cuAgent](https://github.com/xhqing/cuAgent).
