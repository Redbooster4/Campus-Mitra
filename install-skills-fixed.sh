#!/usr/bin/env bash
# Run from the Campus-Mitra repo root. Installs the chosen skills into .agents/skills (Antigravity project scope).
set -euo pipefail
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
for r in miqdadbadjuber/anti-slop ertugrul-dmr/clean-code-skills balamuru/antigravity-dev-skills; do
  git clone -q --depth 1 "https://github.com/$r" "$T/${r#*/}"
done
D=.agents/skills; mkdir -p "$D"
for s in antislop antislop-code antislop-ui antislop-layoutmobile antislop-copywriting; do cp -r "$T/anti-slop/skills/$s" "$D/"; done
for s in boy-scout clean-functions clean-names clean-general; do cp -r "$T/clean-code-skills/skills/typescript/$s" "$D/"; done
for s in incremental-orchestrator team-lead-orchestrator; do cp -r "$T/antigravity-dev-skills/.agents/skills/$s" "$D/"; done
[ -e .agent ] || ln -s .agents .agent   # older Antigravity builds read .agent/
echo "Installed:"; ls "$D"