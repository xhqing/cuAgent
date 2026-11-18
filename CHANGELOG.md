# CHANGELOG

本文件记录本项目（cuAgent）每次文件增删改查的变更，写清「为什么改」和「改了什么」。版本号以项目根 `VERSION` 文件为唯一权威（当前 0.2.0）。

### 新增（CI 门禁：validate 检查 + main 分支 strict 保护）

- **为什么改**：用户 2026-11-03 立规「新建仓库一律必须 strict 模式的 PR CI」，并要求 28 个不合规的存量仓库统一执行最新标准。本项目此前在 PR 上没有门禁——改动合进 main 全靠人工把关，PR 可以拿旧 main 上通过的检查直接合并，回归防护存在缺口。本次补齐团队要求的「三件套」：PR 上真实跑的 CI 检查 + 挂成 required status check + `required_status_checks.strict = true`。
- **改了什么**（2026-11-03）：新增 `.github/workflows/validate.yml`（PR 与 main push 触发，检查名 `validate`）与 `.github/scripts/validate.py`（仓库卫生检查：必备文件存在、敏感文件未被跟踪、被跟踪文件不超过 10 MB、README 相对链接有效、Python / Shell 语法检查）；main 分支保护补挂 required check `validate` 并设 `strict=true`。
- **边界**：检查只做确定性、低误报的项目（required check 一旦误报就会卡住正常 PR，所以宁可少查）；不改动仓库任何原有内容。

## [未发布]

### 变更（项目退役：cuAgent 角色注销，computer-use 能力已上收 pi 全局层）

- **为什么改**：2026-11-18 用户决定**取消 cuAgent 这个智能体、从团队名册撤销**，同时把 computer-use 提升为 pi 的全局能力——任何 agent 都能用，规则改为「专用自动化机（macmini）直接可用、用户本机需当次授权」。本仓库因此不再承载任何活跃职责：继续留着项目级 MCP 配置与守卫会和全局配置冲突（同一能力两处注册），留着操作流程 skill 也会误导后来的会话按已失效的入口走。
- **改了什么**（2026-11-18 14:10）：
  - `README.md` / `README_cn.md`：顶部加退役说明（角色已注销、能力迁入 pi 全局、仓库保留为存档不再维护）；正文改为过去时并补「computer-use 现在在哪」一节（全局注册位置、启动器、守卫与授权规则）；新增「存档：mac-mini 环境」一节，把原 `.pi/skills/computer-use/references/mac-mini-setup.md` 里仍有价值的知识并进来（macOS 15.8.3、固定安装路径与 TCC 授权的绑定关系、两项权限、displayplacer 1920x1080、LaunchAgent 与登录窗口的关系、验证梯子）；Type 徽章由 `AI Agent` 改为 `Archived`；
  - `AGENTS.md`：重写为退役声明——不再作为活跃 Agent 维护，只做存档维护，并指明 computer-use 现在的位置与授权规则；
  - **删除 `.mcp.json`**（能力已全局，项目级注册会与 `~/.pi/agent/mcp-adapter.json` 冲突）；
  - **删除 `.pi/extensions/computer-use-guard.ts`**（守卫已在全局 `~/.pi/agent/extensions/computer-use-guard.ts`）；
  - **删除 `.pi/skills/computer-use/`**（`SKILL.md` + `references/mac-mini-setup.md`）——其中有效的 mac-mini 环境知识已合并进两份 README，其余为项目级操作流程，随项目停用一并作废；
  - `TODO.md` / `TODO-archive.md`：T4（是否给 mac-mini 开自动登录）与 T5（pi 的 mcp 网关 init timeout）标 ✅**已放弃**并归档——项目退役，T5 的前提（项目级 MCP 配置）已随 `.mcp.json` 删除，T4 的关注点随能力上收转向全局层；T1 / T2 / T3 此前已归档为完成。
- **回归检查**：README 双语信息点一致（退役说明、能力新位置、mac-mini 存档资料、许可段四块对应）；徽章与正文口径一致（Type 已改 Archived）；不再有指向已删除文件的活链接——正文提到 `.mcp.json` / `.pi/skills/…` / `.pi/extensions/…` 时都明确写成历史或已删除。

### 变更（computer-use 打通收尾：T2 / T3 结项、环境现状与固定安装路径）

- **为什么改**：2026-11-18 下午 mac-mini 上的 computer-use 已实测打通（两项 GUI 权限授予、固定路径安装、SSH 直起可用），此前文档与 TODO 里的「待授权 / 待实测 / 待打通」表述全部过时。另外三件事必须记下来，否则下次踩坑：① **TCC 权限绑定 App 的实际路径**——npx 形态每次落在 `~/.npm/_npx/<hash>/`，缓存被清就换目录、已授予的辅助功能 / 屏幕录制随之失效；② **分辨率改成原生 1920x1080**（displayplacer）后全屏截图从 3840x2160 降到 1920x1080，对截图体积与坐标精度都更友好；③ **用户级服务全是 LaunchAgent**（xpilot / Syncthing / Tailscale / pi），机器停在登录窗口时一律不启动——SSH 通但代理不通 / 同步不动，先查登录状态，别当网络故障排查。
- **改了什么**（2026-11-18 13:55）：
  - `.mcp.json`：`open-computer-use` 的启动命令从 `npx -y @qwen-code/open-computer-use@0.2.3 mcp` 改为 mac-mini 上的固定安装路径 `~/.local/node/bin/open-computer-use mcp`（原因同上①，版本仍固定 0.2.3，参数结构不变）；
  - `.pi/skills/computer-use/references/mac-mini-setup.md`：新增第 0 节「环境现状（mac-mini 实况，2026-11-18 实测）」——系统版本、固定安装路径与 App 位置、`doctor` 输出、已实测链路、1920x1080 via displayplacer（含复现命令与屏 id）、LaunchAgent 与登录窗口的关系；第 1 节「当前状态」改为指向该节；第 2 节「一次性安装」改为实际采用的 `npm i -g --prefix ~/.local/node` 形态并说明为何不用 npx / `/usr/local`；第 3 节补「两项均已授予」；第 5 节补「①~⑤ 全通」；第 7 节把「SSH 会话里的 GUI 上下文限制（待实测）」改写为「已实测可用，不需要 `launchctl asuser` / LaunchAgent 转发」（两条备选路径作废）；第 8 节新增欢迎向导（MiniBuddy）卡 Apple 账号登录的处理，并把 Command Line Tools 的处理升级为实测可用的 `sudo softwareupdate --install "Command Line Tools for Xcode-16.4"` 加「残留安装器窗口会进截图」的提醒；
  - `.pi/skills/computer-use/SKILL.md`：③「工具与权限」只留固定路径命令 + `doctor` 正常输出示例，删掉 npx 备选并写明「不要改回 npx」的原因；末尾排查段补「先看环境现状」；
  - `AGENTS.md`：「工具与环境」的 MCP 配置段改为「固定安装路径 + 不要用 npx + 已打通」；权限条目改为「已授予，换机 / 换安装路径才需重授」；顺带把「MCP 客户端（pi / Claude Code）」改为只留 pi（本项目只用 pi）；
  - `TODO.md` / `TODO-archive.md`：T2 / T3 标 ✅ 已完成并归档（原文字不动、追加完成说明），T1 追加「拆出的 T2 / T3 已完成」的收口补记；新增 **T5**（🟠 pi 的 `mcp` 网关连不上，待可交互会话确认）与 **T4**（🟡 是否给 mac-mini 开自动登录）。
- **实测记录**（2026-11-18 13:45–13:55，本机经 SSH 在 mac-mini 上跑）：`sw_vers` = 15.8.3（24H241）；`stat -f %Su /dev/console` = `mac`（已登录桌面）；`doctor` = `accessibility=granted, screenRecording=granted`；`list-apps` 返回 Notion / Qwen / Terminal / Finder / DingTalk / Chrome 等；`snapshot com.apple.finder` 返回完整无障碍树；`call get_app_state` 返回无障碍树 + `image/png`；对 SSH 直起的 `~/.local/node/bin/open-computer-use mcp` 手工走 JSON-RPC（initialize → tools/list → tools/call `list_apps`）全部成功；`displayplacer list` 显示 1920x1080 @ 60Hz、scaling off；`xpilot status` = Running（SOCKS 1080 / HTTP 1087）；`git version 2.39.5`。**未通过**：本会话的 pi `mcp` 网关一直返回 `MCP initialization is still in progress`（已记 T5，与服务端可用性无关）。
- **回归检查**：SKILL.md 的 `description` 未动，`check_description.py` 仍 PASS（440/1024）；`.mcp.json` 只换启动命令，`ssh -o BatchMode=yes mac-mini '~/.local/node/bin/open-computer-use mcp'` 已实测可用；两份 README 的「macOS 14+ / 授予两项权限」属通用要求，仍然成立、无需改动。

### 变更（mac-mini 升级到 macOS 15.8.3：文档现状同步，T1 拆分归档）

- **为什么改**：computer-use 的硬门槛是 macOS 14+，此前 mac-mini 停在 12.4，一启动就 dyld 崩溃（AppKit 缺符号），整套能力不可用。2026-11-17 深夜至 2026-11-18 凌晨已把 mac-mini 从 12.4 升到 15.8.3（Build 24H241）：先下 15.8.1 完整安装器、用 launchd 以 root 跑 `startosinstall` 升到 15.8.1，再 `softwareupdate --install` 升到 15.8.3。实测 dyld 崩溃消失（`version` 子命令正常返回 0.2.3），但机器停在登录窗口、GUI 权限未授权，能力仍未打通——文档里的「12.4 未就绪」表述已过时，必须换成现状。
- **改了什么**（2026-11-18 01:40）：
  - `AGENTS.md`「工具与环境」的 MCP 配置段：改为「已升级到 macOS 15.8.3（2026-11-18），当前待完成 GUI 授权与实测，见 TODO T2 / T3」；
  - `TODO.md`：T1 按「已更新」规则移入新建的 `TODO-archive.md`（原有文字一字不动）；剩余工作拆为 **T2**（在 mac-mini 屏幕上授予辅助功能 / 屏幕录制并跑 doctor 复核）与 **T3**（SSH 会话直起 MCP 的 GUI 上下文实测，含 `launchctl asuser` / LaunchAgent 两条备选路径）；
  - `.pi/skills/computer-use/references/mac-mini-setup.md`：第 1 节补「当前状态（2026-11-18）」，标明升级已完成、dyld 崩溃消失、`mcp` 当前报 `Timed out waiting for Open Computer Use.app agent to start.`（因无 GUI 会话），并把原 12.4 崩溃症状标为「留作排查参考」；新增第 8 节「升级后的坑」——登录前用户级服务全停、Command Line Tools 被清空导致 `git` 不可用、系统代理指向未启动的本机代理、第三方系统扩展需重新批准、Tailscale 需手动 up；锁屏检测条目补注「macOS 15.8.3 上未复验」；
  - 顺带修正头部遗留的版本号描述（0.1.1 → 0.2.0，与 `VERSION` 对齐）。
- **回归检查**：SKILL.md 与两份 README 的「macOS 14+」要求仍成立、无需改动；TODO 编号连续（T1 归档保留编号，新增 T2 / T3）；文档内所有 TODO 引用已指向新编号。

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
