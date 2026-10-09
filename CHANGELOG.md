# CHANGELOG

本文件记录本项目（cuAgent）每次文件增删改查的变更，写清「为什么改」和「改了什么」。版本号以项目根 `VERSION` 文件为唯一权威（当前 0.1.0）。

## [未发布]

### 变更（发布后收尾：组织名册收录与访问量采集登记，MEMO M1 归档）

- **为什么改**：2026-10-09 项目开源发布（v0.1.0）后，兜现 `MEMO.md` M1——组织名册收录与访问量采集登记两项发布后收尾，按闭环纪律把 M1 移入归档。
- **改了什么**（2026-10-09 22:06）：① `MEMO.md` 的 M1 移入新建的 `MEMO-archive.md`（✅ 已完成，含完成说明）；② 组织侧变更在 xhqing 仓库完成——个人主页 README（组织总览实际展示位；CyberRipple 已按 2026-09-08 决策挂起留白）架构图与名册补入 cuAgent，`scripts/update_traffic.py` 登记访问量采集；详见该仓库 CHANGELOG。

## [0.1.0] - 2026-10-09

### 新增（项目建立：computer-use 专用 agent，能力仅限本项目启用）

- **为什么改**：用户 2026-10-09 要求建立 cuAgent——一个 computer-use 专用 agent（用 GUI 自动化代替用户操作本机电脑界面），并明确 computer-use 能力**只有 cuAgent 能用**（只在项目级启用，不装全局）。
- **改了什么**（2026-10-09 21:22）：
  - 新建项目 `~/Developer/cuAgent`：`CLAUDE.md`（角色文件）+ 符号链接 `AGENTS.md`、中英双语 `README.md` / `README_cn.md`、`assets/logo.svg`、`VERSION`（0.1.0）、本 CHANGELOG、`.gitignore`、`LICENSE.md`（MIT）；
  - `.mcp.json`：项目级 MCP 配置——`open-computer-use`（`npx` 拉起 `@qwen-code/open-computer-use@0.2.3 mcp`，固定版本、不装全局；其它项目与全局配置不启用）；
  - `.pi/settings.json`：项目默认模型固定为 `dashscope/qwen3.8-max`（取图像输入能力以处理截图；随仓库发布、声明本项目的模型要求），两份 README 同步补说明；
  - 命名按当日修订后的新惯例（名称以 `Agent` 结尾、前缀尽可能简单）；
  - `MEMO.md`：M1 备忘——本项目开源到 GitHub（用户确认发布）时，补进 CyberRipple 组织总览与 xhqing 访问量采集；
  - `git init` 本地初始化（不建远程、不 push）。
