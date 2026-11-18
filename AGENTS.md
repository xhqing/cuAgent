# cuAgent（已退役，2026-11-18）

> cuAgent 这个角色已被用户取消、从团队名册撤销；computer-use 能力已上收 pi 全局层。**本仓库保留为存档，不再作为活跃 Agent 维护**——不接新任务、不加功能、不发版，只做存档维护（文档修正、安全清理）。

## 要用 computer-use 时去哪

- **能力位置**：pi 全局层——`~/.pi/agent/mcp-adapter.json` 里的 `open-computer-use`，由启动器 `~/.pi/agent/patch/computer-use/computer-use-mcp` 本地拉起；工具为 `list_apps` / `get_app_state` / `click` / `drag` / `scroll` / `type_text` / `press_key` / `set_value` / `perform_secondary_action`。
- **规则**：全局 `~/.pi/agent/AGENTS.md` 的「电脑操作（computer-use）」节——专用自动化机（macmini）直接可用；用户自己的 Mac 必须先取得**当次**授权（命令末尾加 `# AI_AUTHORIZED_LOCAL_COMPUTER_USE`，或创建授权文件 `~/.pi/agent/state/local-computer-use-allow`，用完删除）。守卫是全局 `~/.pi/agent/extensions/computer-use-guard.ts`。
- **mac-mini 的环境细节**（系统版本、固定安装路径与 TCC 绑定的关系、两项权限、1920x1080 分辨率、登录窗口与 LaunchAgent 的关系、验证梯子）：见本仓库 `README.md` / `README_cn.md` 的「存档：mac-mini 环境」一节。

## 在本仓库里干活时的边界

- 只做存档维护：文档修正、脱敏、链接修复。不重新启用项目级 MCP、不加回守卫、不恢复 `.pi/skills` 下的操作流程。
- 改动照常走 worktree + `/add` → `/commit` → PR 流程，不直接推 `main`。
- 通用工作纪律（读取优先 / 增改查优先 / 临时产物放 `tmp/` / 汇报前验证）见全局 `~/.pi/agent/AGENTS.md`「工作规则」节。

## 沿革

- 2026-10-09：computer-use 恢复启用，限定只有 cuAgent 能用（项目级 MCP + SSH 到 mac-mini）。
- 2026-11-18：用户决定取消该智能体、从名册撤销，同时把能力装进 pi 全局；本项目退役，GitHub 仓库保留为存档。
