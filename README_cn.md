<div align="center">
  <img src="assets/logo.svg" alt="cuAgent" width="640">
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![Version](https://img.shields.io/badge/Version-0.2.0-blue.svg)](VERSION)
[![Type](https://img.shields.io/badge/Type-Archived-lightgrey.svg)](#)

</div>

# cuAgent

> **⚠️ 已退役（2026-11-18）。** cuAgent 这个角色已被用户取消、从团队名册撤销。computer-use 能力已迁入 pi 的**全局层**（`~/.pi/agent/mcp-adapter.json` + 一个小巧的本地启动器），任何 agent 都能用：专用自动化机直接可用，用户自己的 Mac 需当次授权。**本仓库保留为存档、不再维护**——不加新功能、不发版。

> 🖱️ **cuAgent**（cu = computer-use）—— 电脑操作员。它用 computer-use 能力代替用户在**专用 Mac** 上操作界面：看屏幕、点击、输入、拖拽，把手工重复操作交给 agent。

[English](README.md)

cuAgent 曾是一个**专用计算机操作 agent**：通过 [open-computer-use](https://github.com/QwenLM/open-computer-use) MCP 接入 GUI 自动化——读取应用截图与无障碍树，执行点击、输入、拖拽等真实界面操作。默认情况下，它操作的是一台**经 SSH 接入的专用 Mac**（如 mac mini），而不是 agent 所在机器的屏幕。用户只需说清目标，剩下的界面操作由 cuAgent 完成。

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

## 原先怎么用

1. 准备**目标 Mac**：一台能通过 SSH 登入的机器（macOS 14+），并在其「系统设置 → 隐私与安全性」中授予**辅助功能**与**屏幕录制**；
2. 在 cuAgent 项目目录里启动支持 MCP 的 agent 客户端（pi）；
3. 首次使用需**批准本项目的 MCP server**（项目信任 + 一次性批准，属安全闸门）；
4. 直接对 agent 说清要操作什么（哪个应用、做什么、期望结果）。

配置原先在项目根 `.mcp.json`：`open-computer-use` 经 SSH 在目标机器上拉起（`ssh mac-mini … npx @qwen-code/open-computer-use@0.2.3 mcp`），固定版本。**该文件已随退役删除**——能力现在由全局配置承载（见下一节）。

---

## computer-use 现在在哪

- **注册位置**：`~/.pi/agent/mcp-adapter.json` 注册 `open-computer-use`；启动器 `~/.pi/agent/patch/computer-use/computer-use-mcp` 按机器探测 node / 全局包路径（两台机器共用同一份配置，靠云同步分发），都没装时退回固定版本的 `npx`。
- **规则与守卫**：全局 `~/.pi/agent/AGENTS.md` 的「电脑操作（computer-use）」节 + `~/.pi/agent/extensions/computer-use-guard.ts`。专用自动化机（macmini）直接可用；用户自己的 Mac 必须取得当次明确授权——命令末尾加 `# AI_AUTHORIZED_LOCAL_COMPUTER_USE`，或创建授权文件 `~/.pi/agent/state/local-computer-use-allow`（用完删除）。
- **状态**：mac mini 已于 2026-11-18 实测打通（`doctor` 两项权限均 granted；`list_apps` / `snapshot` / `get_app_state` 均正常返回）。

---

## 存档：mac-mini 环境（2026-11-18 实测）

把这部分留在这里，免得项目退役把运维经验一起带走：

- **系统**：macOS 15.8.3（Build 24H241），Mac mini 2018（Intel）。桌面必须已登录且未锁屏——`stat -f %Su /dev/console` 要返回登录用户名，返回 `root` 表示还停在登录窗口。
- **安装形态——固定路径**：`npm i -g --prefix ~/.local/node @qwen-code/open-computer-use@0.2.3`，CLI 落在 `~/.local/node/bin/open-computer-use`，App 在同目录的 `lib/node_modules/@qwen-code/open-computer-use/dist/Open Computer Use.app`。**prefix 必须固定**：系统隐私授权（TCC）绑定 App 的实际路径——用 `npx` 每次落在 `~/.npm/_npx/<hash>/`，缓存一清就换目录，已授予的「辅助功能 / 屏幕录制」会悄悄失效。
- **权限**：只能在那台机器自己的屏幕上人工授予（`open-computer-use doctor` 正常输出 `Permissions: accessibility=granted, screenRecording=granted`）。TCC 授权无法脚本化；换安装路径后需要重新授予。
- **分辨率**：`brew install displayplacer` 后钉住原生 1920x1080（非缩放）——全屏截图从 3840x2160 降到 1920x1080，截图体积与坐标精度都更友好：

  ```bash
  displayplacer "id:E386B15C-9C53-D770-9A98-209061F7BF93 res:1920x1080 hz:60 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0"
  ```

  屏 id 属于那台外接屏，换屏后用 `displayplacer list` 重新取。
- **用户级服务都是 LaunchAgent**：代理、Syncthing、Tailscale、pi 本身都只在桌面登录之后才启动。SSH 能通但代理不通、同步不动时，先确认机器是不是还停在登录窗口，别当网络故障查。
- **验证梯子**：`doctor` → `list-apps` → `snapshot <bundle-id>` → `call get_app_state --args '{"app":"com.apple.finder"}'`。从 SSH 会话直接拉起 MCP 服务是可行的，不需要 `launchctl asuser`、也不需要 LaunchAgent 转发；若报 `Timed out waiting for Open Computer Use.app agent to start.`，那是桌面会话没登录，不是权限问题。

---

## 安全边界（原设计，存档）

- **目标设备铁律**：computer-use 在专用机器上执行（经 SSH 接入）——默认绝不用在本机屏幕上，确需本机使用须取得用户明确授权；
- **破坏性 / 对外可见的动作先确认**：发送、删除、购买、对外发布等动作，动手前先向用户确认；
- **不打扰用户**：不动本机窗口与前台、不随意覆盖剪贴板；
- **范围限定**（2026-11-18 起被取代）：能力原先只在本项目内启用、不全局安装；现在已上收 pi 全局层，改按「本机需当次授权、专用机直接可用」执行。

---

## 许可与署名

版权所有 (c) 2026 xhqing and contributors，基于 [MIT License](LICENSE.md) 授权。

**署名要求**：如你基于本项目衍生或再分发，请保留版权声明与许可文件，并注明来源：[cuAgent](https://github.com/xhqing/cuAgent)。
