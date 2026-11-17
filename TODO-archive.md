# TODO 归档

已处理（已完成 / 已更新 / 已放弃 / 已转移）的待办条目存档，与 `TODO.md` 平行；编号保留、永不复用，内容原样保留可回溯。

## 🔴 红色

- [ ] **T1** mac-mini 升级到 macOS 14+ 并完成 computer-use 首次打通：open-computer-use 的 macOS 运行时要求 14.0+，当前 mac-mini（macOS 12.4）启动即 dyld 崩溃（2026-10-14 实测，AppKit 缺符号）；升级前 computer-use 整体不可用（本机已按规禁用）。升级后按 `.pi/skills/computer-use/references/mac-mini-setup.md` 完成安装、辅助功能 / 屏幕录制授权、验证梯子，并实测「SSH 会话直起 MCP 的 GUI 上下文是否可用」（若被系统拦，评估 launchctl / LaunchAgent 备选方案）。系统升级会打断 mac-mini、属用户设备决策，动手前先取得用户同意。（记录：2026-10-14 20:30）✅**已更新**（2026-11-18 01:40）——系统升级部分已完成：mac-mini 于 2026-11-17 深夜从 macOS 12.4 升到 15.8.3（Build 24H241），dyld 符号缺失崩溃已消失；剩余两项（GUI 授权的辅助功能 / 屏幕录制、SSH 会话直起 MCP 的 GUI 上下文实测）拆为 T2 / T3 继续跟踪。
