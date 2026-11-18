<div align="center">
  <img src="assets/logo.svg" alt="cuAgent" width="640">
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![Version](https://img.shields.io/badge/Version-0.2.0-blue.svg)](VERSION)
[![Type](https://img.shields.io/badge/Type-Archived-lightgrey.svg)](#)

</div>

# cuAgent

> **⚠️ Retired — 2026-11-18.** The cuAgent role was cancelled and removed from the team roster. The computer-use capability now lives in pi's **global layer** (`~/.pi/agent/mcp-adapter.json` plus a small local launcher), so every agent can use it: the automation Mac directly, your own Mac only with per-use approval. **This repository is kept as an archive and is no longer maintained** — no new features, no releases.

> 🖱️ **cuAgent** (cu = computer-use) — computer operator. It operated a dedicated Mac's GUI for you through computer-use: reading the screen, clicking, typing, and dragging, so manual, repetitive work was handled by an agent.

[简体中文](README_cn.md)

cuAgent was a dedicated computer-operation agent: it connected to native GUI automation through the [open-computer-use](https://github.com/QwenLM/open-computer-use) MCP — reading app screenshots and accessibility trees, performing real interface actions like clicks, typing, and drags. By default it operated a **dedicated Mac reached over SSH** (such as a mac mini), not the screen of the machine it ran on. You described the goal; cuAgent did the interface work.

---

## What it could do

| Tool | Purpose |
|---|---|
| `list_apps` | List apps on this computer (running + recently used) |
| `get_app_state` | Capture a screenshot + accessibility tree of the app's key window |
| `click` / `drag` / `scroll` | Click / drag / scroll |
| `type_text` / `press_key` | Type text / press keys and shortcuts |
| `set_value` / `perform_secondary_action` | Set a control's value / invoke a secondary accessibility action |

---

## How it worked

1. Prepare the **target Mac** — a machine you can log into over SSH (macOS 14+), with **Accessibility** and **Screen Recording** granted in System Settings → Privacy & Security;
2. Start an MCP-capable agent client (pi) in the cuAgent project directory;
3. On first use, **approve this project's MCP server** (project trust + a one-time approval — a deliberate safety gate);
4. Tell the agent what to operate (which app, what to do, expected result).

Configuration used to live in the project-root `.mcp.json`: `open-computer-use` was launched over SSH on the target machine (`ssh mac-mini … npx @qwen-code/open-computer-use@0.2.3 mcp`) against a pinned version. **That file was removed as part of the retirement** — the capability is configured globally now (next section).

---

## Where computer-use lives now

- **Registration**: `~/.pi/agent/mcp-adapter.json` registers `open-computer-use`; the launcher `~/.pi/agent/patch/computer-use/computer-use-mcp` probes the node / global-install paths on each machine (the two machines share one config over cloud sync) and falls back to a pinned `npx` version.
- **Rules and guard**: global `~/.pi/agent/AGENTS.md` (the computer-use section) plus `~/.pi/agent/extensions/computer-use-guard.ts`. The automation Mac (macmini) is usable directly; the user's own Mac requires an explicit per-use approval — the `# AI_AUTHORIZED_LOCAL_COMPUTER_USE` marker or the approval file `~/.pi/agent/state/local-computer-use-allow`.
- **Status**: mac mini verified working on 2026-11-18 (`doctor` reports both permissions granted; `list_apps` / `snapshot` / `get_app_state` all return data).

---

## Archive: the mac mini environment (measured 2026-11-18)

Kept here so the operational know-how does not disappear with the project:

- **System**: macOS 15.8.3 (Build 24H241) on a Mac mini 2018 (Intel). Desktop must be logged in and unlocked — `stat -f %Su /dev/console` must return the login user, not `root`.
- **Install shape — fixed path**: `npm i -g --prefix ~/.local/node @qwen-code/open-computer-use@0.2.3` puts the CLI at `~/.local/node/bin/open-computer-use` and the app at `~/.local/node/lib/node_modules/@qwen-code/open-computer-use/dist/Open Computer Use.app`. **Keep the prefix stable**: the system privacy grant (TCC) is bound to the app's real path — a per-run `npx` copy under `~/.npm/_npx/<hash>/` changes path as soon as the cache is cleared, and the granted Accessibility / Screen Recording permissions silently stop applying.
- **Permissions**: granted by hand on the machine's own screen (`open-computer-use doctor` → `Permissions: accessibility=granted, screenRecording=granted`). TCC grants cannot be scripted; re-grant after moving the install to a new path.
- **Display resolution**: `brew install displayplacer`, then pin the native 1920x1080 (scaling off) — full-screen captures drop from 3840x2160 to 1920x1080, which is friendlier for both payload size and coordinate precision:

  ```bash
  displayplacer "id:E386B15C-9C53-D770-9A98-209061F7BF93 res:1920x1080 hz:60 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0"
  ```

  The screen id belongs to that monitor; re-read it with `displayplacer list`.
- **User-level services are LaunchAgents**: the proxy, Syncthing, Tailscale and pi itself only start after a desktop login. If SSH works but the proxy does not and sync stalls, check whether the machine is still sitting at the login window before hunting for a network fault.
- **Verification ladder**: `doctor` → `list-apps` → `snapshot <bundle-id>` → `call get_app_state --args '{"app":"com.apple.finder"}'`. Launching the MCP server straight from an SSH session works — no `launchctl asuser` or LaunchAgent relay needed; a `Timed out waiting for Open Computer Use.app agent to start.` error means the desktop session is missing, not that permissions are wrong.

---

## Safety boundaries (as designed, archived)

- **Target-device rule**: computer-use ran on the dedicated machine (reached over SSH) — never on the local screen without an explicit, user-approved exception;
- **Confirm destructive / externally visible actions first**: sending, deleting, purchasing, publishing — ask the user before acting;
- **Stay out of the way**: do not touch the local machine's windows or foreground; never overwrite the clipboard unless asked;
- **Scoped by design** (superseded on 2026-11-18): the capability used to be enabled only inside this project, never globally. It has since been lifted into pi's global layer with a per-machine approval rule.

---

## License & Attribution

Copyright (c) 2026 xhqing and contributors. Licensed under the [MIT License](LICENSE.md).

**Attribution:** If you derive from or redistribute this project, please retain the copyright notice and license file, and credit the source: [cuAgent](https://github.com/xhqing/cuAgent).
