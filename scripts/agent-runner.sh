#!/bin/bash
# =============================================================================
# Agent Runner — Poll Supabase agent_queue and launch Claude Code agents
# Usage: bash scripts/agent-runner.sh
# Stop: Ctrl+C
# =============================================================================

set -euo pipefail

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
POLL_INTERVAL="${POLL_INTERVAL:-15}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ SUPABASE_URL et SUPABASE_ANON_KEY requis dans .env"
  exit 1
fi

# Agent command mapping
get_agent_prompt() {
  case "$1" in
    seo-audit)      echo "Realise l'audit SEO complet du site" ;;
    analytics)      echo "Analyse les keywords et le positionnement" ;;
    fact-check)     echo "Verifie les articles contre les sources officielles" ;;
    opportunities)  echo "Cherche les opportunites de contenu" ;;
    editorial)      echo "Traite les tickets, liens internes et opportunites" ;;
    validator)      echo "Valide le site - build, frontmatter, liens, images" ;;
    internal-links) echo "Analyse le maillage interne et suggere des liens" ;;
    *)              echo "" ;;
  esac
}

# Supabase API helper
sb_fetch() {
  curl -s "${SUPABASE_URL}/rest/v1/$1" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json"
}

sb_patch() {
  curl -s -X PATCH "${SUPABASE_URL}/rest/v1/$1" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "$2"
}

echo "🤖 Agent Runner demarre — poll toutes les ${POLL_INTERVAL}s"
echo "   Supabase: ${SUPABASE_URL}"
echo "   Ctrl+C pour arreter"
echo ""

while true; do
  # Fetch oldest pending task
  TASK=$(curl -s "${SUPABASE_URL}/rest/v1/agent_queue?status=eq.pending&order=requested_at.asc&limit=1" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

  # Check if we got a task
  TASK_ID=$(echo "$TASK" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null || echo "")

  if [ -n "$TASK_ID" ]; then
    AGENT_NAME=$(echo "$TASK" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['agent_name'])")
    PROMPT=$(get_agent_prompt "$AGENT_NAME")

    if [ -z "$PROMPT" ]; then
      echo "⚠️  Agent inconnu: $AGENT_NAME — skip"
      sb_patch "agent_queue?id=eq.${TASK_ID}" '{"status":"failed","error_message":"Agent inconnu","completed_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
      continue
    fi

    echo "🚀 [$(date +%H:%M:%S)] Lancement: $AGENT_NAME (task $TASK_ID)"

    # Mark as running
    sb_patch "agent_queue?id=eq.${TASK_ID}" '{"status":"running","started_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'

    # Run the agent
    if claude -p "$PROMPT" --agent "$AGENT_NAME" 2>&1; then
      echo "✅ [$(date +%H:%M:%S)] $AGENT_NAME termine avec succes"
      sb_patch "agent_queue?id=eq.${TASK_ID}" '{"status":"completed","completed_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
    else
      echo "❌ [$(date +%H:%M:%S)] $AGENT_NAME echoue"
      sb_patch "agent_queue?id=eq.${TASK_ID}" '{"status":"failed","completed_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","error_message":"Agent exit non-zero"}'
    fi

    echo ""
  fi

  sleep "$POLL_INTERVAL"
done
