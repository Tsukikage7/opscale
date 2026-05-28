import { spawn } from "node:child_process";

export type AgentTarget = "codex" | "claude-code" | "cursor";

export interface InstallOptions {
  agent?: AgentTarget;
  global: boolean;
  dryRun: boolean;
  skipSkill: boolean;
}

const SKILL_SOURCE = "Tsukikage7/opscale";
const SKILL_NAME = "opscale";

export function parseAgentTarget(value: string | undefined): AgentTarget | undefined {
  switch (value) {
    case undefined:
    case "":
      return undefined;
    case "codex":
      return "codex";
    case "claude":
    case "claude-code":
      return "claude-code";
    case "cursor":
      return "cursor";
    default:
      throw new Error(`Unsupported agent: ${value}. Use codex, claude-code, or cursor.`);
  }
}

export function buildSkillInstallArgs(options: InstallOptions): string[] {
  const args = [
    "exec",
    "--yes",
    "--package",
    "skills@1.5.9",
    "--",
    "skills",
    "add",
    SKILL_SOURCE,
    "--skill",
    SKILL_NAME,
    "--yes",
  ];

  if (options.agent) {
    args.push("--agent", options.agent);
  }

  if (options.global) {
    args.push("--global");
  }

  return args;
}

export function formatCommand(command: string, args: string[]): string {
  return [command, ...args.map(quoteShellArg)].join(" ");
}

export async function runInstall(options: InstallOptions): Promise<void> {
  if (options.skipSkill) {
    console.log("Skipping Skill install.");
    return;
  }

  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const args = buildSkillInstallArgs(options);

  if (options.dryRun) {
    console.log(formatCommand("npm", args));
    return;
  }

  const target = options.agent ? ` for ${options.agent}` : "";
  console.log(`Installing Opscale Skill${target}...`);
  await run(command, args);
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

function quoteShellArg(value: string): string {
  if (/^[A-Za-z0-9_./:@=-]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}
