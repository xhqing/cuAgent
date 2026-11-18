# mac-mini 搭建与排查（computer-use 目标设备）

> 本文件回答「怎么把 mac-mini 准备好、坏了怎么查」。日常操作流程（铁律、登入检查、本机例外）见 `../SKILL.md`。
> 连接信息（IP / 用户名 / 密钥）一律看本机 `~/.ssh/config` 的 `mac-mini` 条目，本文件不重复记录。

## 目录

0. [环境现状（mac-mini 实况）](#0-环境现状mac-mini-实况2026-11-18-实测)
1. [系统要求（硬门槛）](#1-系统要求硬门槛)
2. [一次性安装](#2-一次性安装)
3. [权限授权（辅助功能 / 屏幕录制）](#3-权限授权辅助功能--屏幕录制)
4. [桌面会话与防睡眠](#4-桌面会话与防睡眠)
5. [验证命令梯子](#5-验证命令梯子)
6. [SSH 连不上：三种失败形态](#6-ssh-连不上三种失败形态)
7. [已知坑与备选方案](#7-已知坑与备选方案)
8. [升级后的坑（12.4 → 15.8.3 实测）](#8-升级后的坑124--1583-实测)

---

## 0. 环境现状（mac-mini 实况，2026-11-18 实测）

**computer-use 已打通，可以直接用。** 这一段是 mac-mini 的实况快照：出问题时先对照本节，再往下查。

- **系统**：macOS 15.8.3（Build 24H241），Mac mini 2018（Intel）；桌面已登录、未锁屏（`stat -f %Su /dev/console` 返回的是登录用户名，不是 `root`）。
- **安装形态：固定路径，不要换回 npx**。全局装在用户 home 下——CLI `~/.local/node/bin/open-computer-use`，App `~/.local/node/lib/node_modules/@qwen-code/open-computer-use/dist/Open Computer Use.app`，版本固定 0.2.3。**TCC 授权绑定 app 的实际路径**：npx 形态每次落在 `~/.npm/_npx/<hash>/`，缓存一清就换目录，已授予的「辅助功能 / 屏幕录制」随之失效、表现为突然权限全无。`.mcp.json` 指向的就是这个固定路径。
- **权限**：`open-computer-use doctor` 输出 `Permissions: accessibility=granted, screenRecording=granted`（由用户在 mac-mini 屏幕上手动授予）。
- **SSH 直起可用，不需要绕路**：从 SSH 会话直接拉起 MCP 服务与 App，GUI 上下文正常，无需 `launchctl asuser` / LaunchAgent 转发（那些只是当初未验证时的备选思路）。已实测（2026-11-18）：`list-apps`（Notion / Qwen / Terminal / Finder / DingTalk / Chrome 等）、`snapshot com.apple.finder`（完整无障碍树）、`call get_app_state --args '{"app":"com.apple.finder"}'`（无障碍树 + `image/png` 截图）、以及对 SSH 直起的 `open-computer-use mcp` 手工走完整 JSON-RPC（initialize → tools/list → tools/call `list_apps`）均成功。pi 侧的 `mcp` 网关若报 `MCP initialization is still in progress`，那是客户端初始化超时（见 TODO T5），与服务端可用性无关。
- **分辨率：原生 1920x1080（非缩放）**。用 `brew install displayplacer` 装好后设成原生分辨率，全屏截图从 3840x2160 降到 1920x1080，截图体积与坐标精度都更友好。复现 / 恢复：

  ```bash
  ssh mac-mini 'displayplacer "id:E386B15C-9C53-D770-9A98-209061F7BF93 res:1920x1080 hz:60 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0"'
  ```

  屏 id 是这台 mac-mini 当前外接屏的值，换屏会变——用 `displayplacer list` 重新取。
- **用户级服务全是 LaunchAgent**：xpilot（代理，SOCKS 1080 / HTTP 1087）、Syncthing、Tailscale、pi 都只在**用户登录桌面之后**才启动。机器若停在登录窗口，它们一律不跑：SSH 能通、代理不通、同步不动、pi 不在线——**先查是不是停在登录窗口（第 4 节），别当网络故障排查**。
- **升级 / 重装后先看第 8 节**：欢迎向导卡 Apple 账号登录、Command Line Tools 被清空等坑都记在那里。

## 1. 系统要求（硬门槛）

- **macOS 14.0+**。open-computer-use 的 macOS 原生运行时（0.2.x）最低系统版本是 14.0（二进制内 `LC_BUILD_VERSION minos = 14.0`，上游项目 README 同样写明 macOS 14+）。
- **当前状态**：mac-mini 已是 **macOS 15.8.3（Build 24H241）**，dyld 崩溃消失、GUI 权限已授、computer-use 已实测打通——实况见上面「环境现状」一节。若 `mcp` 报 `Timed out waiting for Open Computer Use.app agent to start.`，多半是桌面没登录（第 4 节），不是版本或权限问题。
- **不满足时的症状**（2026-10-14 在 macOS 12.4 上实测，留作排查参考）：任何子命令一启动就 dyld 崩溃——

  ```
  dyld: Symbol not found: _$sSo6CGRectV6AppKitE4fill5usingySo22NSCompositingOperationV_tF
    Expected in: /System/Library/Frameworks/AppKit.framework/Versions/C/AppKit
  ```

  AppKit 缺 macOS 14 才提供的符号，属硬性不兼容，不是配置问题。
- 没有任何兼容 macOS 12 的构建：npm 上全部版本（0.2.0～0.2.3）同一门槛；上游源项目（iFurySt/open-codex-computer-use，Swift）也只提供 14+ 的二进制。**唯一出路是升级系统**。
- Mac mini 2018（型号 Macmini8,1）官方支持升级到 macOS 14 / 15；**本机已于 2026-11-17 深夜实测升到 15.8.3**（路径与副作用见第 8 节）。
- **系统升级属于会打断用户设备的操作，动手前必须向用户说明并取得同意。**

## 2. 一次性安装

**当前采用的形态：装在用户 home 下的固定路径**（`~/.local/node`）——CLI `~/.local/node/bin/open-computer-use`，App 在同目录的 `lib/node_modules/@qwen-code/open-computer-use/dist/` 下。选它而不选 `/usr/local` 或 npx，是因为 **TCC 授权绑定 app 的实际路径**：路径一变，已授予的「辅助功能 / 屏幕录制」就跟着失效（详见上面「环境现状」一节）。复装 / 升级：

```bash
ssh mac-mini 'zsh -l -c "npm i -g --prefix ~/.local/node @qwen-code/open-computer-use@0.2.3"'
ssh mac-mini '~/.local/node/bin/open-computer-use --version'
```

要点：

- **升级时 `--prefix` 保持不变**：包目录固定，app 路径就不变，已有授权继续有效；**不要用 `npx` 跑常驻 MCP**（npx 缓存被清 → 路径变化 → 权限失效）。
- mac-mini 上另有 Homebrew 的 node（`/usr/local/bin/node`）；非登录 SSH 的 PATH 实测已包含 `~/.local/node/bin`，但为稳妥可写绝对路径或 `zsh -l -c "..."`。
- 版本固定（`@0.2.3`）：不要用 `latest`，避免版本漂移后行为变化；升级版本号时同步改 `.mcp.json` 与本文件 / `../SKILL.md` 里的版本引用。
- **装到新路径后要让用户在 mac-mini 屏幕上重新确认一次权限**（旧授权不会自动跟过去），见第 3 节。
- **安装 / 升级属于对 mac-mini 的改动，先跟用户说一声再执行**。

## 3. 权限授权（辅助功能 / 屏幕录制）

GUI 自动化需要两项系统权限，**只能在 mac-mini 的屏幕上授予**（人不在跟前时可用「屏幕共享」连过去操作）：

1. 在 mac-mini 上运行一次 `open-computer-use doctor`——它会报告缺哪项、并引导打开对应设置页；
2. 手动路径：系统设置 → 隐私与安全性 → **辅助功能** / **屏幕录制** → 按 doctor 的提示添加运行主体（Open Computer Use.app 或对应的 launcher / 进程）；
3. 再跑一次 `doctor` 确认两项都就绪。

注意：

- **当前状态（2026-11-18）**：两项均已授予（`accessibility=granted, screenRecording=granted`），无需再动；换机 / 重装到新路径时才需重来。
- 改动权限同样是改 mac-mini 的系统安全设置，先跟用户打招呼；
- 屏幕共享 / VNC 只是「人工去 mac-mini 桌面操作」的通道，不属于 computer-use 能力本身；但打开远程桌面窗口会占用本机屏幕，除非用户要求或同意，不要主动开。

## 4. 桌面会话与防睡眠

- **必须已登录桌面**：`stat -f %Su /dev/console` 返回登录用户名（正常）；返回 `root` 表示停在登录窗口——GUI 自动化不可用，需要用户先在 mac-mini 上登录。
- **锁屏检测**：`ioreg -n Root -d1 | grep -i CGSSessionScreenIsLocked`——输出 `…=Yes` 表示已锁屏（需先解锁）；无输出通常表示未锁屏（macOS 12.4 实测如此，该键只在锁屏时出现；15.8.3 上未复验）。
- **睡眠**：默认电源策略下机器睡下去 SSH 也断。要长期跑任务，先在 mac-mini 上开防睡眠（用前跟用户说一声）：

  ```bash
  ssh mac-mini 'nohup caffeinate -dimsu >/dev/null 2>&1 &'
  ```

  用完记得收掉（`ssh mac-mini 'pkill caffeinate'`），避免长期通电空转。

## 5. 验证命令梯子

从浅到深，每步通过再下一层；同一条链上的命令也可直接抄进排查汇报：

```bash
ssh -o BatchMode=yes -o ConnectTimeout=8 mac-mini 'echo OK && whoami'   # ① 通道
ssh mac-mini 'stat -f %Su /dev/console'                                 # ② 桌面登录
ssh mac-mini 'zsh -l -c "open-computer-use doctor"'                     # ③ 权限
ssh mac-mini 'zsh -l -c "open-computer-use list-apps"'                  # ④ 枚举应用
ssh mac-mini 'zsh -l -c "open-computer-use snapshot Safari"'            # ⑤ 无障碍树（换成实际在跑的应用）
```

**当前状态（2026-11-18）**：①~⑤ 全部通过；对 SSH 直起的 `open-computer-use mcp` 手工走完整 JSON-RPC（initialize → tools/list → tools/call `list_apps`）也成功。梯子无需再逐层走，出问题时按症状跳着查。

## 6. SSH 连不上：三种失败形态

| 现象 | 大概率原因 | 处理 |
|---|---|---|
| `Operation timed out` / 连不上 | 设备睡眠 / 不在同一网络 / mDNS 名解析失败 | 先 ping 一下 `~/.ssh/config` 里 `mac-mini` 的 HostName（mDNS 名）；唤醒机器（同一局域网可试 Wake-on-LAN）；必要时换 IP 直连（IP 同样见 `~/.ssh/config`，只在本机改，别写进仓库） |
| `Connection refused` | mac-mini 的「远程登录」被关了 / sshd 没监听 | 需要有人在 mac-mini 上开「系统设置 → 通用 → 共享 → 远程登录」 |
| `Permission denied (publickey)` | 密钥不匹配 / 用户名不对 | 核对 `~/.ssh/config` 的 `mac-mini` 条目；重配公钥 |
| `Host key verification failed` | mac-mini 重装 / 换机导致主机指纹变了 | 先人工核对新指纹，再 `ssh-keygen -R <host>` 清旧记录——**先跟用户确认，不要自动清** |

## 7. 已知坑与备选方案

- **SSH 直起 GUI 上下文：已实测可用（2026-11-18）**。从 SSH 会话直接拉起的 `open-computer-use`（含 `mcp` 子命令）能正常截图、拿到无障碍树，**不需要 `launchctl asuser`、也不需要 LaunchAgent 转发**——那两条只是当初未验证时的备选思路，不要再按它们折腾。前提仍是桌面已登录且未锁屏（第 4 节）：未登录时表现为 `Timed out waiting for Open Computer Use.app agent to start.`，锁屏时表现为截图黑屏 / 操作无效——都是会话状态问题，不是权限问题。
- **不要用本机凑合**：mac-mini 没就绪时，唯一允许的本机操作是「拿到用户明确授权」后的例外流程（见 `../SKILL.md`），其余情况宁可等、宁可报错。
- **跨网络访问**：`mac-mini` 别名默认是局域网直连。需要外网访问（VPN / 隧道）时属于新的安全边界，先和用户确认再动。

## 8. 升级后的坑（12.4 → 15.8.3 实测）

2026-11-17 深夜的升级路径：`softwareupdate --fetch-full-installer` 下 15.8.1 完整安装器 → launchd 以 root 跑 `startosinstall` 升到 15.8.1 → `softwareupdate --install "macOS Sequoia 15.8.3-24H241" --restart` 升到 15.8.3。系统本身升级顺利，但「登录之后才生效」的东西全被打回初始状态——**重启后先按这份清单过一遍，再查 computer-use 本身**：

1. **欢迎向导（MiniBuddy）卡在 Apple 账号登录**：升级后首次开机弹出的「欢迎使用 macOS」向导，网络请求走系统代理（此时代理指向还没起来的 xray），于是卡在 Apple 账号登录页、怎么点都不动。处理（2026-11-18 实测有效的三步）：① 杀掉向导进程；② 写跳过标志——`/Library/Preferences/com.apple.SetupAssistant.plist` 里 `DidSeeOSWelcome` / `DidSeeCloudSetup` / `DidSeeMiniBuddy` / `LastSeenCloudProductVersion=15.8.3` 均置 1（该 plist 属 root，读要用 `plutil -p` 或 sudo）；③ 在 launchd 里禁用向导：`launchctl disable gui/$(id -u)/com.apple.SetupAssistant`，验证 `launchctl print-disabled gui/$(id -u) | grep SetupAssistant` 显示 `=> disabled`。**这台是自动化设备，别为了过向导去登 Apple 账号**。
2. **停在登录窗口，用户级服务全不启动**：没人登录桌面时 `stat -f %Su /dev/console` 返回 `root`，xpilot / xray 这类本机代理服务、Syncthing、Tailscale、pi 这些 LaunchAgent 只在该用户登录后才起，登录前一律停摆（未开自动登录）。处理：先在 mac-mini 上完成桌面登录；是否开自动登录属系统安全设置，先跟用户确认（见 TODO T4）。
3. **Command Line Tools 被清空，`git` 不可用**：`/Library/Developer/CommandLineTools` 目录还在但内容被移除。处理：`sudo softwareupdate --install "Command Line Tools for Xcode-16.4"`（无 GUI 也能跑，实测自动装好），装完用 `xcode-select -p` 与 `git --version` 复核（当前为 `git version 2.39.5 (Apple Git-154)`）；装完屏幕上可能残留一个「Install Command Line Developer Tools」窗口一直挂着，截图时会被拍到，在 mac-mini 上关掉即可。
4. **系统代理指向未启动的本机代理**：系统代理仍指向 `127.0.0.1:1087`，而该代理服务登录前不会自启——走代理的程序失败、直连正常，容易被误判成网络故障。处理：等用户级服务起来后复核代理链（`xpilot status` 应显示 Running，SOCKS 1080 / HTTP 1087）。
5. **第三方系统扩展需重新批准**：Samsung MTP 驱动等处于 `activated waiting for user`，要在「系统设置 → 通用 → 登录项与扩展」里逐项放行，否则相关设备不可用。
6. **Tailscale 需手动 up**：升级后 Tailscale 虽在线但不随登录自启，登录桌面后手动 `Tailscale up`（或用菜单栏应用拉起）。

另一个容易误判的点：**GUI 会话没起来时**，`open-computer-use mcp` 会报 `Timed out waiting for Open Computer Use.app agent to start.`——这不是权限问题、也不是二进制不兼容，先把桌面会话与登录解决掉（第 4 节），再跑第 5 节梯子。
