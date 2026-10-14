# TODO

待办清单（只放未完成项；已完成 / 已放弃移入 `TODO-archive.md`）。条目格式：`- [ ] **T<N>** 内容（记录：YYYY-MM-DD HH:MM）`；编号项目内全局递增、永不复用；紧急度用 `##` 分节：🔴 > 🟠 > 🟡 > 🟢。个人隐私类待办写入本机 `TODO.local.md`（已被 .gitignore 忽略），不写本文件。

## 🔴 红色（不修会亏钱 / 安全事故 / 结论错误 / 核心功能不可用）

- [ ] **T1** mac-mini 升级到 macOS 14+ 并完成 computer-use 首次打通：open-computer-use 的 macOS 运行时要求 14.0+，当前 mac-mini（macOS 12.4）启动即 dyld 崩溃（2026-10-14 实测，AppKit 缺符号）；升级前 computer-use 整体不可用（本机已按规禁用）。升级后按 `.pi/skills/computer-use/references/mac-mini-setup.md` 完成安装、辅助功能 / 屏幕录制授权、验证梯子，并实测「SSH 会话直起 MCP 的 GUI 上下文是否可用」（若被系统拦，评估 launchctl / LaunchAgent 备选方案）。系统升级会打断 mac-mini、属用户设备决策，动手前先取得用户同意。（记录：2026-10-14 20:30）
