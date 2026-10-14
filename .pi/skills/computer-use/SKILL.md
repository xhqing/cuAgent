---
name: computer-use
description: cuAgent 的 computer-use 操作流程与设备铁律：用 computer-use 能力（open-computer-use MCP / mcp__open_computer_use 工具 / GUI 自动化：看屏幕、点击、输入、拖拽、操作应用）之前，必须先登入 mac-mini 并确认就绪，一切操作只落在 mac-mini 的屏幕与资源上；默认禁止在本机（会话所在的 Mac）屏幕上使用，确需本机使用时先说明理由并取得用户明确授权。MUST USE 当要调用 open-computer-use / mcp__open_computer_use 工具、经 mcp 网关调用 computer-use 工具、用 CLI 跑 open-computer-use、要操作某个应用的界面、或任务需要真实屏幕操作时——包括 list_apps / get_app_state 这类只读第一步也一样；也适用于排查 mac-mini 连不上 / 权限未就绪 / 界面操作失败时。
---

# computer-use（mac-mini 专属操作流程）

本 skill 管一件事：**cuAgent 的 computer-use 能力只在 mac-mini（SSH 别名 `mac-mini`）上使用，不让任何 GUI 操作落在本机会话所在的 Mac 上**。

规则背景（2026-10-14 用户立）：

- computer-use 会真实占用屏幕、移动鼠标、输入按键——落在用户正在使用的机器上就会打断用户，还可能误触用户手头的事；
- mac-mini 是留给自动化的设备：资源独立，可以放心让它切前台、转窗口、无人值守地跑；
- 本机（用户的主力 Mac）的窗口、剪贴板、前台状态属于用户，默认一律不碰。

## 三条铁律

1. **目标设备固定为 mac-mini**：一切 computer-use 操作（含只读的 `list_apps` / `get_app_state`）都必须在 mac-mini 上执行——先登入、再操作。
2. **默认禁止本机**：不得调用会在本机桌面生效的 computer-use 工具，也不得在本机直接运行 open-computer-use 命令。
3. **本机例外须授权**：确实必须在本机用时，先停下、说明理由、取得用户明确授权，再按文末「本机例外」流程执行；授权只限当次当范围，用完恢复默认。

## 每次任务的第一步：登入与就绪检查

三条都通过才能开始操作。任何一条不过：按 `references/mac-mini-setup.md` 排查，未解决之前**不要用 computer-use，更不要自行回退本机**。

**① 登入（SSH 通道）**

```bash
ssh -o BatchMode=yes -o ConnectTimeout=8 mac-mini 'echo OK && whoami'
```

回 `OK` + 用户名 → 通道可用。（别名、密钥都在本机 `~/.ssh/config`，正文不记具体连接信息。）

**② 桌面会话可用**（GUI 自动化要求 mac-mini 已登录桌面、未锁屏）

```bash
ssh mac-mini 'stat -f %Su /dev/console'   # 返回桌面登录用户名；返回 root = 停在登录窗口，需有人先登录
ssh mac-mini 'ioreg -n Root -d1 | grep -i "CGSSessionScreenIsLocked"'   # 无输出 = 未锁屏；输出 “…=Yes” = 已锁屏
```

**③ 工具与权限**

```bash
# 已全局安装（推荐）：
ssh mac-mini 'zsh -l -c "open-computer-use doctor"'
# 未安装（npx 固定版本，本项目 .mcp.json 用的这个形态）：
ssh mac-mini 'zsh -l -c "npx -y @qwen-code/open-computer-use@0.2.3 doctor"'
```

`doctor` 报缺权限 → 需在 **mac-mini 的屏幕**上给「辅助功能」和「屏幕录制」授权；报系统版本不支持 → 见 `references/mac-mini-setup.md` 的系统要求一节，先报给用户，别绕路。

> mac-mini 的非登录 SSH 环境 PATH 里没有 `/usr/local/bin`（node / npx / 全局 CLI 都装在那里），直接 `ssh mac-mini 'npx ...'` 会 command not found——要么用上面的 `zsh -l -c` 包一层，要么写绝对路径。

## 执行操作（两条路都落在 mac-mini 上）

**MCP 路径（常规）**：本项目的 MCP 已配置为经 SSH 在 mac-mini 上拉起（见 `.mcp.json`），对 `mcp` / `mcp__open_computer_use` 工具的调用天然在 mac-mini 生效。操作纪律照项目 `CLAUDE.md`：

- 每轮操作前先 `get_app_state` 拿最新状态；
- 优先按元素索引操作（比坐标稳），每步动作后用结果或再次 `get_app_state` 验证；
- 发送 / 删除 / 购买 / 对外发布等破坏性动作，动手前先向用户确认。

**CLI 路径（诊断 / 一次性任务）**：

```bash
ssh mac-mini 'zsh -l -c "open-computer-use list-apps"'
ssh mac-mini 'zsh -l -c "open-computer-use snapshot Safari"'
```

需要传 JSON 参数（`call get_app_state / click ...`）时，别硬拼多层引号——把调用序列写成 JSON 文件再传过去执行：

```bash
cat > tmp/calls.json <<'EOF'
[{"tool":"get_app_state","args":{"app":"Safari"}}]
EOF
scp tmp/calls.json mac-mini:/tmp/cu-calls.json
ssh mac-mini 'zsh -l -c "open-computer-use call --calls-file /tmp/cu-calls.json"'
```

## 本机例外（授权协议）

只有确认「必须在本机」且用户明确同意后才执行，一步都不能省：

1. **停下来说清楚三件事**：为什么必须是本机（例如目标应用只装在本机 / mac-mini 不可用及其原因 / 用户点名）、要动什么界面（哪个应用、大致范围）、预计多少操作；
2. **等用户明确回应**授权（「可以」「授权你用本机」之类）——用户没回应、或只是催进度，都**不算授权**，宁可等着；
3. **授权后执行**：
   - CLI 命令末尾加标记：`... # AI_AUTHORIZED_LOCAL_COMPUTER_USE`；
   - 需要走 MCP 时：在项目根创建授权文件 `tmp/ALLOW_LOCAL_COMPUTER_USE`（先 `mkdir -p tmp`；该文件只代表「当次授权生效」）；
4. **用完即止**：只做被授权范围内的事；结束后删掉授权文件，恢复默认。

## 工具强制（guard 扩展）

`.pi/extensions/computer-use-guard.ts` 会拦截未经授权的本机 computer-use 调用（bash 命令与 MCP 工具两条路都拦）。**被它拦住 = 走错了路**：不要删守卫、不要换写法绕过——要么回到「登入与就绪检查」去修 mac-mini，要么按上面「本机例外」拿授权。

## 排查

连不上 / 权限没就绪 / 操作失败时，读 `references/mac-mini-setup.md`：SSH 三种失败形态、macOS 版本要求（14+）、辅助功能与屏幕录制授权、桌面会话与锁屏、防睡眠、验证命令梯子、已知坑与备选方案。
