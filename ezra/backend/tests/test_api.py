MON = "2026-09-28"  # a Monday


def make_goal(client, **kw):
    body = {"title": "Stretch", "start_date": "2026-09-01", **kw}
    r = client.post("/api/goals", json=body)
    assert r.status_code == 201, r.get_json()
    return r.get_json()


def test_health(client):
    assert client.get("/api/health").get_json() == {"status": "ok"}


def test_goal_validation(client):
    assert client.post("/api/goals", json={}).status_code == 400
    assert client.post("/api/goals", json={"title": "  "}).status_code == 400
    assert client.post("/api/goals", json={"title": "x", "days_of_week": [7]}).status_code == 400
    assert client.post("/api/goals", json={"title": "x", "start_date": "nope"}).status_code == 400
    assert client.post("/api/goals", data="not json").status_code == 400
    r = client.get("/api/goals/999")
    assert r.status_code == 404 and r.get_json()["error"]["code"] == "not_found"


def test_goal_edit_records_revision(client):
    g = make_goal(client, days_of_week=[0, 1, 2, 3, 4])
    r = client.patch(f"/api/goals/{g['id']}", json={"days_of_week": [0, 2], "note": "too much"})
    assert r.status_code == 200
    revs = client.get(f"/api/goals/{g['id']}/revisions").get_json()
    assert len(revs) == 1
    assert revs[0]["changes"]["days_of_week"] == {"from": [0, 1, 2, 3, 4], "to": [0, 2]}
    assert revs[0]["note"] == "too much"
    # no-op edit and archiving create no revision
    client.patch(f"/api/goals/{g['id']}", json={"days_of_week": [0, 2]})
    client.patch(f"/api/goals/{g['id']}", json={"archived": True})
    assert len(client.get(f"/api/goals/{g['id']}/revisions").get_json()) == 1
    assert client.get("/api/goals").get_json() == []
    assert len(client.get("/api/goals?include_archived=true").get_json()) == 1


def test_today_generates_respects_schedule_and_start(client):
    make_goal(client, title="Daily")
    make_goal(client, title="Tue only", days_of_week=[1])
    make_goal(client, title="Future", start_date="2026-10-15")
    data = client.get(f"/api/today?date={MON}").get_json()
    assert [o["goal"]["title"] for o in data["occurrences"]] == ["Daily"]
    # idempotent
    again = client.get(f"/api/today?date={MON}").get_json()
    assert [o["id"] for o in again["occurrences"]] == [o["id"] for o in data["occurrences"]]
    tue = client.get("/api/today?date=2026-09-29").get_json()
    assert {o["goal"]["title"] for o in tue["occurrences"]} == {"Daily", "Tue only"}


def test_occurrence_status(client):
    make_goal(client)
    occ = client.get(f"/api/today?date={MON}").get_json()["occurrences"][0]
    r = client.patch(f"/api/occurrences/{occ['id']}", json={"status": "done"})
    assert r.get_json()["status"] == "done" and r.get_json()["completed_at"]
    assert client.get(f"/api/today?date={MON}").get_json()["summary"]["goals_done"] == 1
    r = client.patch(f"/api/occurrences/{occ['id']}", json={"status": "pending"})
    assert r.get_json()["completed_at"] is None
    assert client.patch(f"/api/occurrences/{occ['id']}", json={"status": "failed"}).status_code == 400


def test_tasks_crud_and_today(client):
    t = client.post("/api/tasks", json={"title": "Call dentist", "due_date": MON}).get_json()
    client.post("/api/tasks", json={"title": "Someday"})
    assert client.post("/api/tasks", json={"title": "x", "goal_id": 42}).status_code == 400
    today = client.get(f"/api/today?date={MON}").get_json()
    assert [x["title"] for x in today["tasks"]] == ["Call dentist"]
    r = client.patch(f"/api/tasks/{t['id']}", json={"done": True})
    assert r.get_json()["completed_at"]
    assert client.get(f"/api/today?date={MON}").get_json()["tasks"] == []
    assert len(client.get("/api/tasks?done=false").get_json()) == 1
    assert client.delete(f"/api/tasks/{t['id']}").status_code == 204
    assert client.get(f"/api/tasks/{t['id']}").status_code == 404


def test_delete_goal_keeps_tasks(client):
    g = make_goal(client)
    t = client.post("/api/tasks", json={"title": "x", "goal_id": g["id"]}).get_json()
    assert client.delete(f"/api/goals/{g['id']}").status_code == 204
    assert client.get(f"/api/tasks/{t['id']}").get_json()["goal_id"] is None


def test_progress_and_recovery(client):
    make_goal(client)  # daily from 2026-09-01
    # Look at Sep 22-28 (7 days) without ever opening the app on those days: scheduled must still be 7.
    p = client.get("/api/progress?days=7&end=" + MON).get_json()
    assert p["goals"][0]["scheduled"] == 7 and p["goals"][0]["done"] == 0
    assert p["recovery"] and p["recovery"][0]["completion_rate"] == 0.0

    # complete one, skip one -> done 1 of (7 - 1) attempted
    for day, status in (("2026-09-27", "done"), ("2026-09-28", "skipped")):
        occ = client.get(f"/api/today?date={day}").get_json()["occurrences"][0]
        client.patch(f"/api/occurrences/{occ['id']}", json={"status": status})
    p = client.get("/api/progress?days=7&end=" + MON).get_json()
    g = p["goals"][0]
    assert (g["done"], g["skipped"], g["completion_rate"]) == (1, 1, round(1 / 6, 2))
    assert p["total_done"] == 1
    assert sum(d["done"] for d in p["per_day"]) == 1
    assert client.get("/api/progress?days=500").status_code == 400
