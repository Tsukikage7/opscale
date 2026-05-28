import assert from "node:assert/strict";
import test from "node:test";

import { buildSkillInstallArgs, formatCommand, parseAgentTarget } from "../src/install.js";

test("parseAgentTarget accepts supported agent names", () => {
  assert.equal(parseAgentTarget(undefined), "codex");
  assert.equal(parseAgentTarget("codex"), "codex");
  assert.equal(parseAgentTarget("claude"), "claude-code");
  assert.equal(parseAgentTarget("claude-code"), "claude-code");
  assert.equal(parseAgentTarget("cursor"), "cursor");
});

test("parseAgentTarget rejects unsupported agents", () => {
  assert.throws(() => parseAgentTarget("unknown"), /Unsupported agent/);
});

test("buildSkillInstallArgs builds the global skills installer command", () => {
  assert.deepEqual(buildSkillInstallArgs({ agent: "codex", global: true, dryRun: false }), [
    "exec",
    "--yes",
    "--package",
    "skills@1.5.9",
    "--",
    "skills",
    "add",
    "Tsukikage7/opscale",
    "--skill",
    "opscale",
    "--agent",
    "codex",
    "--yes",
    "--global",
  ]);
});

test("formatCommand returns a copyable command", () => {
  assert.equal(
    formatCommand("npm", buildSkillInstallArgs({ agent: "cursor", global: false, dryRun: true })),
    "npm exec --yes --package skills@1.5.9 -- skills add Tsukikage7/opscale --skill opscale --agent cursor --yes",
  );
});
