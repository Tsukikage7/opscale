import assert from "node:assert/strict";
import test from "node:test";

import { buildSkillInstallArgs, formatCommand, parseAgentTarget } from "../src/install.js";

test("parseAgentTarget accepts supported agent names", () => {
  assert.equal(parseAgentTarget(undefined), undefined);
  assert.equal(parseAgentTarget("codex"), "codex");
  assert.equal(parseAgentTarget("claude"), "claude-code");
  assert.equal(parseAgentTarget("claude-code"), "claude-code");
  assert.equal(parseAgentTarget("cursor"), "cursor");
});

test("parseAgentTarget rejects unsupported agents", () => {
  assert.throws(() => parseAgentTarget("unknown"), /Unsupported agent/);
});

test("buildSkillInstallArgs builds the default global skills installer command", () => {
  assert.deepEqual(buildSkillInstallArgs({ global: true, dryRun: false, skipSkill: false }), [
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
    "--yes",
    "--global",
  ]);
});

test("buildSkillInstallArgs adds an explicit agent when requested", () => {
  assert.deepEqual(buildSkillInstallArgs({ agent: "codex", global: true, dryRun: false, skipSkill: false }), [
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
    "--yes",
    "--agent",
    "codex",
    "--global",
  ]);
});

test("formatCommand returns a copyable command", () => {
  assert.equal(
    formatCommand("npm", buildSkillInstallArgs({ agent: "cursor", global: false, dryRun: true, skipSkill: false })),
    "npm exec --yes --package skills@1.5.9 -- skills add Tsukikage7/opscale --skill opscale --yes --agent cursor",
  );
});
