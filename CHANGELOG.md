# CHANGELOG

本文件记录本项目（cuAgent）每次文件增删改查的变更，写清「为什么改」和「改了什么」。版本号以项目根 `VERSION` 文件为唯一权威（当前 0.1.1）。

### 新增（CI 门禁：validate 检查 + main 分支 strict 保护）

- **为什么改**：用户 2026-11-03 立规「新建仓库一律必须 strict 模式的 PR CI」，并要求 28 个不合规的存量仓库统一执行最新标准。本项目此前在 PR 上没有门禁——改动合进 main 全靠人工把关，PR 可以拿旧 main 上通过的检查直接合并，回归防护存在缺口。本次补齐团队要求的「三件套」：PR 上真实跑的 CI 检查 + 挂成 required status check + `required_status_checks.strict = true`。
- **改了什么**（2026-11-03）：新增 `.github/workflows/validate.yml`（PR 与 main push 触发，检查名 `validate`）与 `.github/scripts/validate.py`（仓库卫生检查：必备文件存在、敏感文件未被跟踪、被跟踪文件不超过 10 MB、README 相对链接有效、Python / Shell 语法检查）；main 分支保护补挂 required check `validate` 并设 `strict=true`。
- **边界**：检查只做确定性、低误报的项目（required check 一旦误报就会卡住正常 PR，所以宁可少查）；不改动仓库任何原有内容。

## [未发布]

### 变更（项目规则文件本体统一改为 `AGENTS.md`，`CLAUDE.md` 弃用，2026-11-05）

- **为什么改**：用户 2026-11-05 立规「所有注册表项目与全局的规则文件本体统一用 `AGENTS.md`，`CLAUDE.md` 弃用」。pi 的上下文文件候选顺序是 `AGENTS.override.md` > `AGENTS.md` > `CLAUDE.md`（同一目录只加载第一个存在的），本体放在 `AGENTS.md` 后 `CLAUDE.md` 根本不参与加载——两份并存只会形成双份内容、随时漂移。
- **改了什么**：项目根 `CLAUDE.md` 改名为 `AGENTS.md`（实体本体，原先的 `AGENTS.md → CLAUDE.md` 软链接已删除）；项目内引用「项目 `CLAUDE.md` / 全局 `CLAUDE.md`」的条文、skill、hook、脚本与 README 同步改为 `AGENTS.md`。
- **回归检查**：加载顺序不受影响（`AGENTS.md` 本就排在 `CLAUDE.md` 之前）；子项目根目录的 `AGENTS.md` 软链接仍指向本项目 `AGENTS.md`，目标不变、照常解析。

### 变更（移除访问量徽章，配合停用集中式流量采集）

- **为什么改**：用户 2026-11-04 决定停用 xhqing 仓库的集中式访问量采集，同时不再在各仓库 README 展示访问量徽章。徽章的数据源必须由采集任务每天刷新，采集停掉之后徽章会冻结在旧值，而徽章文案写的是「Visits/day (14d)」——数字不再更新却仍显示成实时数据，留着反而误导读者。
- **改了什么**：`README.md` / `README_cn.md` 顶部徽章区删除那一枚 shields.io 访问量徽章（整行删除，数据源 `https://raw.githubusercontent.com/xhqing/xhqing/main/traffic/badges/<仓库名>.json`）；License / Version / Type 等其它徽章与正文一个字未动。
- **回归检查**：只删这一整行，徽章区所在的 `<p align="center">` / `<div>` 结构与相邻徽章不受影响；README 其余内容零改动。

## [0.2.0] - 2026-10-14

### 新增（computer-use skill + guard：操作只在 mac-mini、本机默认禁用）

- **为什么改**：2026-10-14 用户立规——computer-use 之前必须先登入 mac-mini，操作只落在 mac-mini 的屏幕与资源上；禁止直接在本机屏幕使用，确需本机须说明理由并取得用户明确授权。背景：此前 computer-use 在本机桌面执行，会抢占用户主力机的屏幕与前台；mac-mini 才是留给自动化的独立设备。
- **改了什么**（2026-10-14 20:30）：
  - 新增 `.pi/skills/computer-use/SKILL.md` + `references/mac-mini-setup.md`：三条铁律（目标设备固定 mac-mini / 默认禁止本机 / 本机例外须授权）、登入与就绪检查（SSH 通道、桌面登录与锁屏、工具与权限）、两条执行路径（MCP 经 SSH、CLI 经 SSH）、本机例外授权协议（标记 / 授权文件）、mac-mini 一次性搭建与排查（含 macOS 14+ 硬门槛）；
  - `.mcp.json`：`open-computer-use` 从本机 `npx` 直起改为**经 SSH 在 mac-mini 上拉起**（`ssh -o BatchMode=yes -o ConnectTimeout=10 mac-mini /usr/local/bin/npx … mcp`）——MCP 工具调用天然落在 mac-mini；
  - 新增 `.pi/extensions/computer-use-guard.ts`（项目级工具强制）：拦截未经授权的本机 computer-use——bash 命令（本机形态的 CLI / npx / 原生二进制调用）与 MCP 工具调用（`.mcp.json` 非 ssh 形态时视为本机模式）两条路都拦；放行条件为「经 ssh 到 mac-mini」或授权标记 / 授权文件（授权协议见 skill）；28 条用例已实测通过（测试脚本在 tmp/、未入库）；
  - `CLAUDE.md`：身份段、能力段、安全约束、工具与环境同步更新（目标设备铁律、本机禁用、例外授权、skill 与 guard 指引）；
  - `README.md` / `README_cn.md`：定位改为「操作一台经 SSH 接入的专用 Mac（如 mac mini）」、使用步骤与安全边界同步更新；
  - 新建 `TODO.md`：T1 = mac-mini 升级 macOS 14+ 并首次打通（当前 12.4 不满足系统要求，实测 dyld 崩溃；升级前 computer-use 整体不可用）；`.gitignore` 预置 `TODO.local.md` / `TODO-archive.local.md` 忽略行。
- **注意**：mac-mini 当前 macOS 12.4，不满足 open-computer-use 的 macOS 14+ 要求——**系统升级完成前 computer-use 整体不可用**（本机已被禁用，属规则的设计后果）；解锁行动见 TODO T1。

### 变更（移除项目模型固定：跟随 pi 全局默认）

- **为什么改**：2026-10-14 用户决定——项目不再固定 `dashscope/qwen3.8-max`，直接跟随 pi 的全局默认模型（全局改一处、所有项目对齐，省得每个项目单独维护模型配置）。
- **改了什么**：① 删除 `.pi/settings.json`（原固定 `defaultProvider: dashscope` / `defaultModel: qwen3.8-max`）；② `README.md` / `README_cn.md` 配置段同步：改为「不固定模型、跟随客户端默认；computer-use 需要能读图的模型」（截图处理的前提提醒保留）。全局默认 `tokenplus / deepseek-v4.1-flash` 已确认支持图像输入（模型注册表 `input: [text, image]`）。

## [0.1.1] - 2026-10-09

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
