import { spawn } from "node:child_process";

export type AgentTarget = "codex" | "claude-code" | "cursor";

export interface InstallOptions {
  agent: AgentTarget;
  global: boolean;
  dryRun: boolean;
}

const SKILL_SOURCE = "Tsukikage7/opscale";
const SKILL_NAME = "opscale";

export function parseAgentTarget(value: string | undefined): AgentTarget {
  switch (value) {
    case undefined:
    case "":
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
    "--agent",
    options.agent,
    "--yes",
  ];

  if (options.global) {
    args.push("--global");
  }

  return args;
}

export function formatCommand(command: string, args: string[]): string {
  return [command, ...args.map(quoteShellArg)].join(" ");
}

export async function runInstall(options: InstallOptions): Promise<void> {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const args = buildSkillInstallArgs(options);

  if (options.dryRun) {
    console.log(formatCommand("npm", args));
    printInstallNextSteps();
    return;
  }

  console.log(`Installing Opscale Skill for ${options.agent}...`);
  await run(command, args);
  printInstallNextSteps();
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

function printInstallNextSteps(): void {
  console.log(`
Next steps:
  1. Configure a read-only database locally:
     npx opscale@latest config init

  2. Verify schema access:
     npx opscale@latest schema

  3. Ask your AI agent:
     Use Opscale to show paid orders by day for the last 7 days.
`);
}

function quoteShellArg(value: string): string {
  if (/^[A-Za-z0-9_./:@=-]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}
