/**
 * cuAgent 项目专属防线：computer-use 只允许在 mac-mini 上执行（pi 端，tool_call 拦截）。
 *
 * 规则（2026-10-14 用户立，细则见 .pi/skills/computer-use/SKILL.md）：
 *   - 一切 computer-use 操作（含只读的 list_apps / get_app_state）都在 mac-mini 上执行，先登入后操作；
 *   - 默认禁止在本机（会话所在的 Mac）屏幕上使用；
 *   - 确需本机使用时，先说明理由并取得用户明确授权，授权形态：CLI 命令加
 *     `# AI_AUTHORIZED_LOCAL_COMPUTER_USE` 标记，或创建授权文件 tmp/ALLOW_LOCAL_COMPUTER_USE（用完即删）。
 *
 * 两条拦截路径：
 *   A) bash 命令——命令里出现本机执行 open-computer-use 的形态（未经 ssh 到 mac-mini）→ 拦；
 *   B) MCP 工具调用——.mcp.json 里 open-computer-use 的 command 不是 ssh（视为本机拉起）→ 拦。
 *      （.mcp.json 为 ssh 形态时，服务器进程跑在 mac-mini 上，调用天然是远端，全部放行。）
 *
 * 判定异常时不阻塞会话（与 twitter-guard / git-commit-guard 同一约定：fail open，
 * 个别拦截漏过由 SKILL.md 的文本纪律兜底）。
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const HOST = "mac-mini";
const BASH_MARK = "AI_AUTHORIZED_LOCAL_COMPUTER_USE";

/** 授权文件（在项目根 tmp/ 下，用完即删；相对会话工作目录解析）。 */
function allowFile(): string {
	return join(process.cwd(), "tmp", "ALLOW_LOCAL_COMPUTER_USE");
}

// —— bash 侧：本机执行 open-computer-use 的形态 ——
// 所有模式都要求「命令位 + 子命令 / 拉包形态」，避免把文档文本、grep / cat 的文件名参数误判成调用。
// 子命令白名单不含 help / version / install-*（只查帮助、看版本、改别家配置，不是 GUI 操作）。
const SUB = "mcp|doctor|call|snapshot|list-apps|turn-ended";
// 裸命令 / 路径形式：open-computer-use <子命令>（含 -mcp 别名）
const CLI_SUB = new RegExp(`(?:^|[\\s;&|(])(?:[\\w.~/-]*/)?open-computer-use(?:-mcp)?\\s+(?:${SUB})\\b`);
// 裸命令（不带子命令）：open-computer-use 直接执行会拉起授权引导界面，同样拦；
// 只认真正的命令位（行首 / ; && || | 之后），避免 `which open-computer-use` 这类查询被误拦。
const CLI_BARE = new RegExp(
	`(?:^|&&|\\|\\||;|\\|)\\s*(?:(?:sudo|env|nice|nohup|time)\\s+)*(?:[\\w.~/-]*/)?open-computer-use(?:-mcp)?\\s*(?:$|&&|\\|\\||;|\\|)`,
);
// npx / npm exec 拉取运行（不论参数，本机拉起该包一律拦）
const NPX_RUN = /(?:^|[\s;&|(])(?:npx|npm\s+(?:exec|x))(?:\s|$)[^;&|]*@qwen-code\/open-computer-use/;
// 原生二进制（app bundle 内的可执行文件）直跑
const APP_BIN = new RegExp(`(?:^|[\\s;&|(])(?:[\\w.~/-]*/)?OpenComputerUse\\s+(?:${SUB})\\b`);
// open 直接打开 app（含 `open -a "Open Computer Use"` 与 .app 路径两种形态）
const APP_OPEN = /(?:^|[\s;&|(])open\s+[^;&|]*Open Computer Use/;

/** 命令经 ssh 到目标设备（视为远端执行，放行）。 */
const SSH_TO_TARGET = new RegExp(`\\bssh\\b[^;|&]*\\b${HOST}\\b`);

function bashHit(command: string): boolean {
	return (
		CLI_SUB.test(command) ||
		CLI_BARE.test(command) ||
		NPX_RUN.test(command) ||
		APP_BIN.test(command) ||
		APP_OPEN.test(command)
	);
}

// —— MCP 侧 ——
// open-computer-use 的 9 个工具名（用于识别 mcp 网关 / 直连工具形态的调用目标）
const CU_TOOLS = new Set([
	"list_apps",
	"get_app_state",
	"click",
	"drag",
	"scroll",
	"type_text",
	"press_key",
	"set_value",
	"perform_secondary_action",
]);

/** .mcp.json 的 open-computer-use 是否为本机拉起（command 不是 ssh）。读不到 / 解析失败 → 无法判定，放行。 */
function configIsLocal(): boolean {
	try {
		const cfg = JSON.parse(readFileSync(join(process.cwd(), ".mcp.json"), "utf8")) as {
			mcpServers?: Record<string, { command?: unknown }>;
		};
		const srv = cfg?.mcpServers?.["open-computer-use"];
		if (!srv || typeof srv.command !== "string") return false;
		return srv.command !== "ssh";
	} catch {
		return false;
	}
}

const BASH_REASON =
	"[computer-use-guard] 已拦截：computer-use 默认只允许在 mac-mini 上执行（2026-10-14 用户立规），" +
	"本命令看起来会在本机运行 open-computer-use。正确做法：① 正常路径——经 ssh 到 mac-mini 执行" +
	"（如 `ssh mac-mini 'zsh -l -c \"open-computer-use ...\"'`），并先按 `.pi/skills/computer-use/SKILL.md`" +
	"的「登入与就绪检查」确认就绪；② 确需本机——先说明理由并取得用户明确授权，再在命令末尾加标记" +
	"`# AI_AUTHORIZED_LOCAL_COMPUTER_USE`。";

const MCP_REASON =
	"[computer-use-guard] 已拦截：`.mcp.json` 的 open-computer-use 未配置为经 ssh 到 mac-mini 启动" +
	"（视为本机模式），按规（2026-10-14 用户立）本机使用 computer-use 需用户明确授权。" +
	"已获用户明确授权时：在项目根 `mkdir -p tmp && touch tmp/ALLOW_LOCAL_COMPUTER_USE` 后重试（用完删除）；" +
	"否则请把 `.mcp.json` 恢复为 ssh 形态，流程见 `.pi/skills/computer-use/SKILL.md`。";

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event) => {
		try {
			const name = event.toolName ?? "";

			// A) bash：命令级拦截
			if (name === "bash") {
				const command = (event.input as { command?: string } | undefined)?.command ?? "";
				if (!command || !bashHit(command)) return;
				if (SSH_TO_TARGET.test(command)) return; // 经 ssh 到 mac-mini → 远端执行
				if (command.includes(BASH_MARK)) return; // 用户当次授权标记
				if (existsSync(allowFile())) return; // 用户当次授权文件
				return { block: true, reason: BASH_REASON };
			}

			// B) MCP：工具调用拦截（仅当服务器在本机拉起时）
			const input = (event.input ?? {}) as { server?: unknown; tool?: unknown };
			const isGateway = name === "mcp";
			const isCuNamespace = /open[_-]?computer[_-]?use/i.test(name);
			const isDirectCuTool = CU_TOOLS.has(name);
			const targetsCu =
				isCuNamespace ||
				isDirectCuTool ||
				(isGateway &&
					(input.server === "open-computer-use" || CU_TOOLS.has(String(input.tool ?? ""))));
			if (!targetsCu) return;
			if (!configIsLocal()) return; // 经 ssh → 远端执行
			if (existsSync(allowFile())) return; // 用户当次授权文件
			return { block: true, reason: MCP_REASON };
		} catch {
			// 判定异常时不阻塞会话（与既有 guard 一致）
		}
	});
}
