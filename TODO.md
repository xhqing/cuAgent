# TODO

待办清单（只放未完成项；已完成 / 已放弃移入 `TODO-archive.md`）。条目格式：`- [ ] **T<N>** 内容（记录：YYYY-MM-DD HH:MM）`；编号项目内全局递增、永不复用；紧急度用 `##` 分节：🔴 > 🟠 > 🟡 > 🟢。个人隐私类待办写入本机 `TODO.local.md`（已被 .gitignore 忽略），不写本文件。

## 🔴 红色（不修会亏钱 / 安全事故 / 结论错误 / 核心功能不可用）

- [ ] **T2** 在 mac-mini 屏幕上完成 computer-use 的两项系统授权：先登录桌面（当前停在登录窗口），再按 `.pi/skills/computer-use/references/mac-mini-setup.md` 第 3 节跑 `open-computer-use doctor` 引导，给「辅助功能」与「屏幕录制」添加实际运行主体（Open Computer Use.app / 其 launcher），最后再跑一次 doctor 确认两项就绪。改系统安全设置前先跟用户打招呼。（记录：2026-11-18 01:40）

- [ ] **T3** 实测「SSH 会话直起 MCP 的 GUI 上下文是否可用」并打通 computer-use：按 setup 文档第 5 节梯子逐层验证（SSH 通道 → 桌面登录 → doctor → list-apps → snapshot），再经 MCP 网关实测一次完整工具调用（如 `list_apps`）；若 SSH 直起被系统拦（截图黑屏 / 权限错），评估 `launchctl asuser` 与「桌面会话内 LaunchAgent 转发」两条备选路径。结果记入 CHANGELOG，并把 README / AGENTS 里的「待打通」表述收尾。（记录：2026-11-18 01:40）
