# TODO

待办清单（只放未完成项；已完成 / 已放弃移入 `TODO-archive.md`）。条目格式：`- [ ] **T<N>** 内容（记录：YYYY-MM-DD HH:MM）`；编号项目内全局递增、永不复用；紧急度用 `##` 分节：🔴 > 🟠 > 🟡 > 🟢。个人隐私类待办写入本机 `TODO.local.md`（已被 .gitignore 忽略），不写本文件。

## 🟠 橙色（边界情况出错 / 防护缺口 / 口径不一致可能演化为实际损失）

- [ ] **T5** 在一个可交互的 pi 会话里确认 `mcp` 网关能连上 `open-computer-use`：2026-11-18 13:45–13:55 本会话多次调用 `mcp`（状态 / 检索 / 连接 / 执行）一直返回 `MCP initialization is still in progress. Try again shortly.`，疑似项目级 MCP server 的批准提示没被处理、或初始化超 30 秒被记成超时。服务端本身没问题：同机 CLI（`list-apps` / `snapshot` / `doctor` / `call get_app_state`）与「SSH 直起的 `open-computer-use mcp` 走完整 JSON-RPC（initialize → tools/list → tools/call）」都已实测通过。（记录：2026-11-18 13:55）

## 🟡 黄色（文档措辞、格式漂移、卫生问题、不影响正确性的优化）

- [ ] **T4** 跟用户确认是否给 mac-mini 开「自动登录」：现在没开，重启后机器停在登录窗口，xpilot / Syncthing / Tailscale / pi 这些用户级 LaunchAgent 全不启动、computer-use 也不可用，得等人到机器前登录一次。开了能省掉这步，但属系统安全设置（开机直接进桌面），先问用户。（记录：2026-11-18 13:55）
