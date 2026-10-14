# mac-mini 搭建与排查（computer-use 目标设备）

> 本文件回答「怎么把 mac-mini 准备好、坏了怎么查」。日常操作流程（铁律、登入检查、本机例外）见 `../SKILL.md`。
> 连接信息（IP / 用户名 / 密钥）一律看本机 `~/.ssh/config` 的 `mac-mini` 条目，本文件不重复记录。

## 目录

1. [系统要求（硬门槛）](#1-系统要求硬门槛)
2. [一次性安装](#2-一次性安装)
3. [权限授权（辅助功能 / 屏幕录制）](#3-权限授权辅助功能--屏幕录制)
4. [桌面会话与防睡眠](#4-桌面会话与防睡眠)
5. [验证命令梯子](#5-验证命令梯子)
6. [SSH 连不上：三种失败形态](#6-ssh-连不上三种失败形态)
7. [已知坑与备选方案](#7-已知坑与备选方案)

---

## 1. 系统要求（硬门槛）

- **macOS 14.0+**。open-computer-use 的 macOS 原生运行时（0.2.x）最低系统版本是 14.0（二进制内 `LC_BUILD_VERSION minos = 14.0`，上游项目 README 同样写明 macOS 14+）。
- **不满足时的症状**（2026-10-14 在 mac-mini 的 macOS 12.4 上实测）：任何子命令一启动就 dyld 崩溃——

  ```
  dyld: Symbol not found: _$sSo6CGRectV6AppKitE4fill5usingySo22NSCompositingOperationV_tF
    Expected in: /System/Library/Frameworks/AppKit.framework/Versions/C/AppKit
  ```

  AppKit 缺 macOS 14 才提供的符号，属硬性不兼容，不是配置问题。
- 没有任何兼容 macOS 12 的构建：npm 上全部版本（0.2.0～0.2.3）同一门槛；上游源项目（iFurySt/open-codex-computer-use，Swift）也只提供 14+ 的二进制。**唯一出路是升级系统**。
- Mac mini 2018（型号 Macmini8,1）官方支持升级到 macOS 14 / 15。升级方式：在 mac-mini 上「系统设置 → 通用 → 软件更新」（下载体积大、耗时以小时计，升级期间设备不可用）。
- **系统升级属于会打断用户设备的操作，动手前必须向用户说明并取得同意。**

## 2. 一次性安装

mac-mini 已装 Homebrew 的 node（Intel 路径 `/usr/local/bin/node`）。装 CLI 二选一：

```bash
# 方式 A：全局安装（推荐，后续命令干净）
ssh mac-mini 'zsh -l -c "npm i -g @qwen-code/open-computer-use@0.2.3"'
ssh mac-mini 'zsh -l -c "open-computer-use --version"'

# 方式 B：不装全局，npx 每次拉取（本项目 .mcp.json 用的这个形态；首次下载较慢，之后走 ~/.npm/_npx 缓存）
ssh mac-mini 'zsh -l -c "npx -y @qwen-code/open-computer-use@0.2.3 version"'
```

要点：

- 全局安装后命令位于 `/usr/local/bin/`；**非登录 SSH 的 PATH 通常不含 /usr/local/bin**——远端执行一律 `zsh -l -c "..."` 或写绝对路径（`/usr/local/bin/open-computer-use`）。
- 版本固定（`@0.2.3`）：不要用 `latest`，避免版本漂移后行为变化；升级版本号时同步改 `.mcp.json` 与 SKILL.md 里的版本引用。
- **安装 / 升级属于对 mac-mini 的改动，先跟用户说一声再执行**（后续所有“往 mac-mini 上装东西”的行动沿用这个口径）。

## 3. 权限授权（辅助功能 / 屏幕录制）

GUI 自动化需要两项系统权限，**只能在 mac-mini 的屏幕上授予**（人不在跟前时可用「屏幕共享」连过去操作）：

1. 在 mac-mini 上运行一次 `open-computer-use doctor`——它会报告缺哪项、并引导打开对应设置页；
2. 手动路径：系统设置 → 隐私与安全性 → **辅助功能** / **屏幕录制** → 按 doctor 的提示添加运行主体（Open Computer Use.app 或对应的 launcher / 进程）；
3. 再跑一次 `doctor` 确认两项都就绪。

注意：

- 改动权限同样是改 mac-mini 的系统安全设置，先跟用户打招呼；
- 屏幕共享 / VNC 只是「人工去 mac-mini 桌面操作」的通道，不属于 computer-use 能力本身；但打开远程桌面窗口会占用本机屏幕，除非用户要求或同意，不要主动开。

## 4. 桌面会话与防睡眠

- **必须已登录桌面**：`stat -f %Su /dev/console` 返回登录用户名（正常）；返回 `root` 表示停在登录窗口——GUI 自动化不可用，需要用户先在 mac-mini 上登录。
- **锁屏检测**：`ioreg -n Root -d1 | grep -i CGSSessionScreenIsLocked`——输出 `…=Yes` 表示已锁屏（需先解锁）；无输出通常表示未锁屏（macOS 12.4 实测如此，该键只在锁屏时出现）。
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

①②③ 全过后，MCP 路径（`.mcp.json` 经 SSH 拉起）才具备可用条件；**首次联通要实测一次完整工具调用**（例如用 `mcp` 网关调 `list_apps`），把结果记入 CHANGELOG 或 TODO。

## 6. SSH 连不上：三种失败形态

| 现象 | 大概率原因 | 处理 |
|---|---|---|
| `Operation timed out` / 连不上 | 设备睡眠 / 不在同一网络 / mDNS 名解析失败 | 先 ping 一下 `~/.ssh/config` 里 `mac-mini` 的 HostName（mDNS 名）；唤醒机器（同一局域网可试 Wake-on-LAN）；必要时换 IP 直连（IP 同样见 `~/.ssh/config`，只在本机改，别写进仓库） |
| `Connection refused` | mac-mini 的「远程登录」被关了 / sshd 没监听 | 需要有人在 mac-mini 上开「系统设置 → 通用 → 共享 → 远程登录」 |
| `Permission denied (publickey)` | 密钥不匹配 / 用户名不对 | 核对 `~/.ssh/config` 的 `mac-mini` 条目；重配公钥 |
| `Host key verification failed` | mac-mini 重装 / 换机导致主机指纹变了 | 先人工核对新指纹，再 `ssh-keygen -R <host>` 清旧记录——**先跟用户确认，不要自动清** |

## 7. 已知坑与备选方案

- **SSH 会话里的 GUI 上下文限制（待实测）**：macOS 从 SSH 会话直起的进程不在 Aqua 桌面登录上下文里，GUI 自动化可能被系统拦（截图黑屏、操作报权限错等）。mac-mini 升级到 14+ 后首次打通时，**先按第 5 节梯子实测**；若确认被拦，可考虑的思路：① `launchctl asuser <uid> ...` 把进程放进桌面用户上下文；② 用 LaunchAgent 在桌面会话里常驻一个转发进程。**这些都是未验证方向，实测确认前不要写死任何方案**，更不要因此回退本机。
- **不要用本机凑合**：mac-mini 没就绪时，唯一允许的本机操作是「拿到用户明确授权」后的例外流程（见 `../SKILL.md`），其余情况宁可等、宁可报错。
- **跨网络访问**：`mac-mini` 别名默认是局域网直连。需要外网访问（VPN / 隧道）时属于新的安全边界，先和用户确认再动。
