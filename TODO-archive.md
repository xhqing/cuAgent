# TODO 归档

已处理（已完成 / 已更新 / 已放弃 / 已转移）的待办条目存档，与 `TODO.md` 平行；编号保留、永不复用，内容原样保留可回溯。

## 🔴 红色

- [ ] **T1** mac-mini 升级到 macOS 14+ 并完成 computer-use 首次打通：open-computer-use 的 macOS 运行时要求 14.0+，当前 mac-mini（macOS 12.4）启动即 dyld 崩溃（2026-10-14 实测，AppKit 缺符号）；升级前 computer-use 整体不可用（本机已按规禁用）。升级后按 `.pi/skills/computer-use/references/mac-mini-setup.md` 完成安装、辅助功能 / 屏幕录制授权、验证梯子，并实测「SSH 会话直起 MCP 的 GUI 上下文是否可用」（若被系统拦，评估 launchctl / LaunchAgent 备选方案）。系统升级会打断 mac-mini、属用户设备决策，动手前先取得用户同意。（记录：2026-10-14 20:30）✅**已更新**（2026-11-18 01:40）——系统升级部分已完成：mac-mini 于 2026-11-17 深夜从 macOS 12.4 升到 15.8.3（Build 24H241），dyld 符号缺失崩溃已消失；剩余两项（GUI 授权的辅助功能 / 屏幕录制、SSH 会话直起 MCP 的 GUI 上下文实测）拆为 T2 / T3 继续跟踪。✅**已完成**（2026-11-18 13:55）——拆出的 T2 / T3 均已完成，mac-mini 上的 computer-use 已实测打通（GUI 权限两项 granted、固定路径安装、SSH 直起可用），本条整体收口。

- [ ] **T2** 在 mac-mini 屏幕上完成 computer-use 的两项系统授权：先登录桌面（当前停在登录窗口），再按 `.pi/skills/computer-use/references/mac-mini-setup.md` 第 3 节跑 `open-computer-use doctor` 引导，给「辅助功能」与「屏幕录制」添加实际运行主体（Open Computer Use.app / 其 launcher），最后再跑一次 doctor 确认两项就绪。改系统安全设置前先跟用户打招呼。（记录：2026-11-18 01:40）✅**已完成**（2026-11-18 13:55）——两项权限已由用户在 mac-mini 屏幕上手动授予，2026-11-18 13:45 复核 `doctor` 输出 `accessibility=granted, screenRecording=granted`。

- [ ] **T3** 实测「SSH 会话直起 MCP 的 GUI 上下文是否可用」并打通 computer-use：按 setup 文档第 5 节梯子逐层验证（SSH 通道 → 桌面登录 → doctor → list-apps → snapshot），再经 MCP 网关实测一次完整工具调用（如 `list_apps`）；若 SSH 直起被系统拦（截图黑屏 / 权限错），评估 `launchctl asuser` 与「桌面会话内 LaunchAgent 转发」两条备选路径。结果记入 CHANGELOG，并把 README / AGENTS 里的「待打通」表述收尾。（记录：2026-11-18 01:40）✅**已完成**（2026-11-18 13:55）——① SSH 直起 GUI 上下文可用，`launchctl asuser` / LaunchAgent 转发两条备选路径**不需要了**；② 梯子 ①~⑤ 全通，`list-apps` / `snapshot com.apple.finder` / `call get_app_state`（含 `image/png` 截图）均正常；③ 对 SSH 直起的 `open-computer-use mcp` 手工走完整 JSON-RPC（initialize → tools/list → tools/call `list_apps`）成功——**改由直连验证，没走 pi 的 `mcp` 网关**：该网关在 2026-11-18 下午的会话里一直报 `MCP initialization is still in progress`，已另开 T5 跟进；④ 「待打通」表述已在 `AGENTS.md` 与 skill 文档里收尾，结果记入 CHANGELOG。

- [ ] **T5** 在一个可交互的 pi 会话里确认 `mcp` 网关能连上 `open-computer-use`：2026-11-18 13:45–13:55 本会话多次调用 `mcp`（状态 / 检索 / 连接 / 执行）一直返回 `MCP initialization is still in progress. Try again shortly.`，疑似项目级 MCP server 的批准提示没被处理、或初始化超 30 秒被记成超时。服务端本身没问题：同机 CLI（`list-apps` / `snapshot` / `doctor` / `call get_app_state`）与「SSH 直起的 `open-computer-use mcp` 走完整 JSON-RPC（initialize → tools/list → tools/call）」都已实测通过。（记录：2026-11-18 13:55）✅**已放弃**（2026-11-18 14:10）——项目退役。本条的观察对象是**项目级** MCP 配置，而该配置已随 `.mcp.json` 删除、能力改由 pi 全局层（`~/.pi/agent/mcp-adapter.json` + 启动器）承载，原症状的前提不复存在。

- [ ] **T4** 跟用户确认是否给 mac-mini 开「自动登录」：现在没开，重启后机器停在登录窗口，xpilot / Syncthing / Tailscale / pi 这些用户级 LaunchAgent 全不启动、computer-use 也不可用，得等人到机器前登录一次。开了能省掉这步，但属系统安全设置（开机直接进桌面），先问用户。（记录：2026-11-18 13:55）✅**已放弃**（2026-11-18 14:10）——项目退役，这条不再属于本仓库的待办；其关注点（macmini 停在登录窗口会导致用户级服务与 computer-use 不可用）属全局能力的使用前提，已写进两份 README 的「存档：mac-mini 环境」一节，是否开自动登录留给全局层跟进。
