#!/usr/bin/env bash
# End-to-end check of the EZRA API using curl. Needs: bash, curl, python3.
# Usage: ./smoke-test.sh [base_url]     (default http://localhost:5000)
# It creates one goal and one task, exercises the endpoints, then deletes both.
BASE="${1:-http://localhost:5000}"
DAY="$(date +%F)"
FAILS=0

jget() { python3 -c "import sys,json; d=json.load(sys.stdin); print($1)"; }

# req METHOD PATH [JSON_BODY]  -> sets $CODE and $BODY
req() {
  local method="$1" path="$2" body="${3:-}" out
  if [ -n "$body" ]; then
    out=$(curl -s -w '\n%{http_code}' -X "$method" "$BASE$path" -H 'Content-Type: application/json' -d "$body")
  else
    out=$(curl -s -w '\n%{http_code}' -X "$method" "$BASE$path")
  fi
  CODE="${out##*$'\n'}"; BODY="${out%$'\n'*}"
}

# check "label" EXPECTED_CODE
check() {
  if [ "$CODE" = "$2" ]; then echo "PASS  $1 ($CODE)"
  else echo "FAIL  $1: expected $2, got $CODE"; echo "      $BODY"; FAILS=$((FAILS+1)); fi
}

echo "Testing $BASE  (date used: $DAY)"; echo

req GET /api/health;                                                  check "health" 200
if [ "$CODE" != "200" ]; then
  echo; echo "Server not reachable at $BASE. Is it running? (docker compose ps)"; exit 1
fi

# --- goals ---
req POST /api/goals "{\"title\":\"Smoke test goal\",\"days_of_week\":[],\"start_date\":\"$DAY\"}"
check "create goal" 201;  GOAL=$(echo "$BODY" | jget "d['id']")
req POST /api/goals '{"title":"  "}';                                 check "reject empty goal title" 400
req GET /api/goals/999999;                                            check "unknown goal -> 404" 404
req PATCH /api/goals/$GOAL '{"title":"Smoke test goal (edited)","note":"smoke test"}'
check "edit goal" 200
req GET /api/goals/$GOAL/revisions;                                   check "list revisions" 200
echo "$BODY" | jget "'      revisions recorded: %d' % len(d)"

# --- today + occurrences ---
req GET "/api/today?date=$DAY";                                       check "today" 200
OCC=$(echo "$BODY" | jget "[o['id'] for o in d['occurrences'] if o['goal_id']==$GOAL][0]")
req PATCH /api/occurrences/$OCC '{"status":"done"}';                  check "mark occurrence done" 200
req PATCH /api/occurrences/$OCC '{"status":"nonsense"}';              check "reject bad status" 400

# --- tasks ---
req POST /api/tasks "{\"title\":\"Smoke test task\",\"due_date\":\"$DAY\",\"goal_id\":$GOAL}"
check "create task" 201;  TASK=$(echo "$BODY" | jget "d['id']")
req POST /api/tasks '{}';                                             check "reject task without title" 400
req GET "/api/tasks?done=false";                                      check "list open tasks" 200
req PATCH /api/tasks/$TASK '{"done":true}';                           check "complete task" 200

# --- progress ---
req GET "/api/progress?days=7&end=$DAY";                              check "progress" 200
echo "$BODY" | jget "'      done in window: %s, goals tracked: %d' % (d['total_done'], len(d['goals']))"

# --- cleanup ---
req DELETE /api/tasks/$TASK;                                          check "delete task" 204
req DELETE /api/goals/$GOAL;                                          check "delete goal" 204

echo; [ "$FAILS" -eq 0 ] && echo "All checks passed." || echo "$FAILS check(s) failed."
exit "$FAILS"