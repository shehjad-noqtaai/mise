# Pulling Audit Logs from the Sanity Activity Log API

A practical guide to reading activity (audit) events programmatically using the
**pull** API. There is no public webhook/streaming/subscribe endpoint — to be
"notified" of new events you poll this API (see [Polling for new events](#polling-for-new-events)).

## Basics

|                  |                                                             |
| ---------------- | ----------------------------------------------------------- |
| **Base URL**     | `https://api.sanity.io`                                     |
| **API version**  | `v2021-02-01`                                               |
| **Auth**         | Bearer token (`Authorization: Bearer <token>`)              |
| **Order**        | Reverse-chronological by `timestamp`                        |
| **Access scope** | Token only returns activity for orgs/projects it can access |

Set your token before running the examples:

```bash
export SANITY_AUTH_TOKEN="<your-token>"
```

Minimal request:

```bash
curl -sS \
  -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?limit=10"
```

## Endpoints

Both endpoints accept the **same filters**.

| Endpoint                               | Use for                          |
| -------------------------------------- | -------------------------------- |
| `GET /v2021-02-01/activity`            | JSON — app integrations, polling |
| `GET /v2021-02-01/activity/export/csv` | CSV — bulk exports / audits      |

## Filters

| Filter                  | Use it to                                                                         |
| ----------------------- | --------------------------------------------------------------------------------- |
| `actorId`               | Find events **performed by** a user. Use `actorId=null` for events with no actor. |
| `userId`                | Find events where a user is the **target**.                                       |
| `projectId`             | Find project activity.                                                            |
| `organizationId`        | Find organization-level activity.                                                 |
| `action`                | Find specific activity types, e.g. `project.name.edit`.                           |
| `startTime` / `endTime` | Restrict to a time range (RFC 3339 timestamps).                                   |
| `limit` / `offset`      | Page through matching events.                                                     |

### Combining rules

- **Same filter repeated = "any of" (OR):**
  ```bash
  curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
    "https://api.sanity.io/v2021-02-01/activity?action=project.name.edit&action=organization.name.edit&limit=25"
  ```
- **Different filters = AND (must match all):**
  ```bash
  curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
    "https://api.sanity.io/v2021-02-01/activity?projectId=<id>&action=project.name.edit&startTime=2026-06-01T00:00:00Z&endTime=2026-06-09T23:59:59Z&limit=25"
  ```
- Do **not** combine `organizationId` + `projectId` expecting "org _plus_ project" — AND semantics mean it must match both.
- For **all** activity a user token can see, omit both `organizationId` and `projectId`.

> There is no `/me` endpoint. To get a person's activity, filter by their Sanity
> user ID via `actorId` (acted) or `userId` (target).

## Common queries

```bash
# Activity performed by a user
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?actorId=<user-id>&limit=25"

# A user's activity within a project
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?actorId=<user-id>&projectId=<project-id>&limit=25"

# Organization-level activity
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?organizationId=<org-id>&limit=25"

# Project activity across multiple projects
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?projectId=<id-a>&projectId=<id-b>&limit=25"
```

## Pagination

JSON defaults to `limit=10`; values above `100` are capped at `100`.

```bash
# First page
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?projectId=<id>&limit=25&offset=0"

# Second page
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?projectId=<id>&limit=25&offset=25"
```

> ⚠️ Offset pagination can shift if new events arrive while you page. For stable
> exports/audits, page through **fixed time windows** with `startTime`/`endTime`
> instead of relying on `offset`.

```bash
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  "https://api.sanity.io/v2021-02-01/activity?projectId=<id>&startTime=2026-06-01T00:00:00Z&endTime=2026-06-09T23:59:59Z&limit=100"
```

## CSV export

```bash
curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
  -o activity-log.csv \
  "https://api.sanity.io/v2021-02-01/activity/export/csv?projectId=<id>&limit=5000"
```

CSV limit rules differ from JSON:

- Omitted `limit` → defaults to `10000` events.
- Values above `50000` are capped at `50000`.
- Explicit values `<= 10` fall back to the CSV default of `10000` (use `limit=11`+ for a small test).

CSV headers are sorted alphabetically. Metadata keys appear as dynamic
`metadata.<key>` columns when present in the returned events.

## Event shape (JSON)

Each event includes (fields present depend on the event):

```json
{
  "id": "ale-...",
  "version": "...",
  "actorId": "...",
  "actorName": "...",
  "actorEmail": "actor@example.com",
  "action": "project.name.edit",
  "timestamp": "2026-06-30T00:00:00Z",
  "description": "...",
  "correlationId": "...",
  "metadata": {"key": "value"},
  "userId": "...",
  "userName": "...",
  "userEmail": "user@example.com",
  "projectId": "...",
  "projectDisplayName": "...",
  "organizationId": "...",
  "organizationDisplayName": "...",
  "transactionId": "...",
  "documentId": "...",
  "datasetName": "..."
}
```

## Polling for new events

There is no push/subscribe API, so to react to new events, poll with a moving
time window and dedupe on event `id`.

```bash
#!/usr/bin/env bash
# Poll for new activity events every 30s.
set -euo pipefail

PROJECT_ID="<project-id>"
STATE_FILE="last_seen.txt"
OVERLAP_SECONDS=60   # re-scan a little to avoid boundary misses

since="$(cat "$STATE_FILE" 2>/dev/null || date -u -v-5M +%Y-%m-%dT%H:%M:%SZ)"

while true; do
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  curl -sS -H "Authorization: Bearer $SANITY_AUTH_TOKEN" \
    "https://api.sanity.io/v2021-02-01/activity?projectId=${PROJECT_ID}&startTime=${since}&endTime=${now}&limit=100" \
    | jq -c '.[]'    # hand each event to your handler / dedupe by .id

  # rewind the window slightly so events near the boundary aren't missed
  since="$(date -u -v-"${OVERLAP_SECONDS}"S -j -f %Y-%m-%dT%H:%M:%SZ "$now" +%Y-%m-%dT%H:%M:%SZ)"
  echo "$now" > "$STATE_FILE"
  sleep 30
done
```

Guidelines for a reliable poller:

- Anchor on `timestamp` windows, **not** `offset` (offset drifts as events land).
- **Overlap** consecutive windows slightly and **dedupe on `id`** — events near
  `now` may not be fully visible yet.
- If a window returns a full page (`limit` reached), **narrow the window** and
  re-query to page through it.

## Error responses

```json
{
  "code": 400,
  "status": "Bad Request",
  "message": "duplicate parameter: limit"
}
```

| Status | When it happens                                                                      |
| ------ | ------------------------------------------------------------------------------------ |
| `400`  | Unknown filter, duplicate single-value filter, invalid timestamp, or invalid number. |
| `401`  | Missing token, invalid token, or no access to the requested data.                    |
| `500`  | The API could not complete the request.                                              |
| `503`  | The request timed out or was canceled.                                               |

These filters **cannot be repeated** (doing so returns `400`):

```text
limit
offset
startTime
endTime
```
