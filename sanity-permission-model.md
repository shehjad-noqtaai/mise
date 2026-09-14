# Sanity Permission Model — Complete Reference

A deep-dive into how access control works across Sanity: the concepts, what you can do in the GUI (sanity.io/manage), and what you can do programmatically (Access API, Blueprints, CLI).

> Sources: Sanity docs — [Roles user guide](https://www.sanity.io/docs/user-guides/roles), [Roles and permissions (concepts)](https://www.sanity.io/docs/content-lake/roles-concepts), [Access API](https://www.sanity.io/docs/http-reference/access-api), [Authentication and tokens](https://www.sanity.io/docs/content-lake/http-auth), [Keeping your data safe](https://www.sanity.io/docs/content-lake/keeping-your-data-safe), [Platform terminology](https://www.sanity.io/docs/platform-management/platform-terminology), [SAML SSO](https://www.sanity.io/docs/developer-guides/sso-saml), [Blueprints roles](https://www.sanity.io/docs/blueprints/blueprints-role), [Restrict access to specific documents](https://www.sanity.io/docs/developer-guides/restrict-access-to-specific-documents).

---

## 1. Mental model

Sanity's permission system is built from four primitives:

| Primitive      | What it is                                                                                                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resource**   | A thing you can be granted access to: an **organization**, a **project**, and increasingly `media-library`, `canvas`, `dashboard`, `view`. Within a project, datasets and document filters are the content-level resources.                           |
| **Permission** | An `{name, action}` pair on a resource, e.g. `sanity-project-datasets` + `create`. Naming convention is roughly `{company}.{resourceType}.{objectName}.{action}` (with legacy exceptions). Pre-defined permissions are not editable; custom ones are. |
| **Role**       | A named bundle of permissions. Assigned to **users** and/or **robots** (`appliesToUsers` / `appliesToRobots`). A member can hold many roles.                                                                                                          |
| **Member**     | A user (person) or robot (token / service account) holding one or more roles on a resource.                                                                                                                                                           |

Key structural facts:

- **Organization → Projects → Datasets.** Orgs group projects for billing, SSO, and org-level roles. Projects are self-contained: members, tokens, webhooks, roles, and datasets are per-project and cannot be shared across projects. Content can be referenced across _datasets_ (cross-dataset references) but never across _projects_.
- **Org roles and project roles are separate systems.** An organization administrator does _not_ automatically get access to project content — but they _can_ manage project membership (including adding themselves).
- **One identity, many memberships.** A user with roles in several projects of an org is a single user, referenced by `sanityUserId`. Different login providers (Google vs. GitHub vs. email/password) with the same email are _different_ Sanity accounts.
- **Permissions are additive — there is no "deny".** A grant given anywhere (e.g. on _All datasets_) cannot be revoked by a more specific, more restrictive rule. Start from "No access" and grant upward.
- **Roles are resource-scoped.** A project role can only include document permissions for that project.

### How evaluation works

- All permissions default to **No access**; grants cascade from general scopes (all datasets) to specific ones (a dataset, a tag, a content resource).
- Because grants are additive, the effective permission is the **union** of everything the member's roles grant.
- **Gotcha:** if a dataset is **public**, every project member (and every anonymous API consumer) can read **published** content regardless of role — "no access" does not hide published documents in a public dataset.
- **Gotcha:** asset files (images/files on the CDN) are **never private**, even in private datasets. Anyone with the URL can fetch them. (Media Library adds asset-visibility controls + signed URLs for this.)

---

## 2. Default roles

### Organization roles

| Role                | Capabilities                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Administrator**   | Billing, legal contacts, org members, project ownership; can manage user membership of every org project (including own membership). |
| **Billing manager** | Billing details, legal contacts, attach projects to the org.                                                                         |
| **Developer**       | Create/attach projects, edit org metadata.                                                                                           |
| **Member**          | Default role; can _see_ teammates across all org projects.                                                                           |

> **Multi-tenancy gotcha:** Org Members can identify users in every project of the org. For multi-tenant setups, remove the "default organization role" so new users don't inherit `Member` visibility.

### Project roles (availability by plan)

| Role              | Access                                                                                  | Plan           |
| ----------------- | --------------------------------------------------------------------------------------- | -------------- |
| **Administrator** | Read/write all datasets; full access to all project settings.                           | All plans      |
| **Viewer**        | Read-only on all datasets; no settings. Can comment where comments are enabled.         | All plans      |
| **Editor**        | Read/write all datasets; limited settings (can modify datasets, not create them).       | Growth+        |
| **Developer**     | Read/write all datasets; developer-facing settings (tokens, CORS, webhooks, datasets…). | Growth+        |
| **Contributor**   | Read/write **drafts** only — can write but **not publish**; no settings.                | Growth+        |
| **Custom**        | Fully custom content + management permissions.                                          | **Enterprise** |

Billing note: the built-in **Viewer** role is free (doesn't consume a seat). Any _custom_ role — even read-only — bills as a regular user, and a Viewer who gains any additional role becomes billable.

### What a role can contain

Two categories, mirrored in the Manage UI:

1. **Content permissions** — per _All datasets_, per dataset, per **tag** (dataset group), and per **content resource** (GROQ filter). Actions on document filters: `read`, `create`, `update`, `manage`, `history`, `editHistory`, plus a `mode` action (e.g. publish mode) on filter-mode permissions. In the UI this surfaces as Read / Create & update / Publish against **All documents**, **Image assets**, **File assets**, and your custom resources.
2. **Management permissions** — project settings surface areas: project details, members, roles, tokens, datasets, tags, CORS origins, webhooks, GraphQL, usage, studio deploys (`sanity-project.deployStudio`), session creation (`sanity-project.createSession`).

> **Studio UX gotcha:** for a role to work well in the Studio, grant `Project Details: read`; also grant `Project Members: read` so Presence (avatars, "who's editing") works.

---

## 3. Dataset-level controls

- **Visibility:** datasets are **public** (anyone can query published content, unauthenticated) or **private** (auth required to read). Change it in Manage (Datasets tab) or via CLI:

  ```sh
  npx sanity dataset visibility set <datasetName> <public|private>
  ```

  Private datasets are still CDN-cacheable (cache is keyed on your token).

- **Tags** _(Growth plan+)_: group datasets (e.g. `production`, `staging`, or `elle`+`us`) and set role permissions once for the whole group. Managed under **Datasets → Tags** in Manage.

- Drafts and versions live under `drafts.**` / `versions.**` ID paths — the built-in "Draft documents" filter is literally `(_id in path("drafts.**") || _id in path("versions.**"))`, which is how Contributor-style "can edit drafts but not publish" behavior is expressed.

---

## 4. Custom roles, content resources & user attributes (Enterprise)

### Content resources (GROQ-filtered permissions)

A **content resource** is a GROQ filter defining a document subset you can grant actions on, e.g. `_type == "movie"`. Create them in Manage under **Access → Resources**, or via the API as `sanity.document.filter` permissions.

Rules and gotchas:

- Filters run against document attributes only — **no dereferencing** (`referenceField->` won't work). Compare `_ref` directly: `referenceField._ref == "some-id"`.
- Additive model applies: if a role already has `publish` on all documents, you cannot carve out a read-only subset with a resource filter.
- The `config.filter` also "accepts a groq filter or a dataset name" when creating custom permissions via the API — so a permission can be scoped to a dataset.

### Document-level access control (pattern)

Combine a metadata field with `identity()`:

1. Add an `allowedEditors: string[]` field (user IDs) to the schema — the [User Select Input plugin](https://www.sanity.io/plugins/sanity-plugin-user-select-input) gives a nice picker. Hide it from non-admins with `hidden: ({currentUser}) => currentUser.role !== 'administrator'`.
2. Create a content resource with filter: `identity() in allowedEditors` (`identity()` returns the current user's ID).
3. Grant the custom role e.g. **Publish** on that resource.
4. Optionally filter Structure Builder lists (`_type == "post" && identity() in allowedEditors`) so editors only _see_ what they can edit.

### User attributes & parameterized roles

**User attributes** are key-value pairs on a user within an org (`department="front_desk"`, `brand="vogue"`). Types: `string`, `integer`, `number`, `boolean`, and arrays (except boolean arrays). Two sources:

- **SAML:** every attribute in the SSO assertion is captured automatically, refreshed on each login.
- **Sanity (manual):** admins define/set values in Manage (**org → Members → Attributes**) or via the [User Attributes API](https://www.sanity.io/docs/http-reference/user-attributes). A Sanity value **overrides** the SAML value; removing the override reveals SAML again. You can't create a Sanity definition for a key SAML already provides.

Reference them in content-resource filters with `user::attributes()` to make **one parameterized role** instead of a role per team/brand/genre:

```groq
_type == "movie" && genre == user::attributes().genre
```

> **Security gotcha — fails open:** if the attribute is missing (typo, migration, unassigned user) `user::attributes().x` evaluates to `null`; if the document field is also missing you get `null == null` → `true`, granting access to _everything_ matching the type. Always guard:
>
> ```groq
> // coalesce guard
> _type == "hotel" && coalesce(user::attributes().loc, "__no_value__") == location
> // or explicit null check
> _type == "hotel" && user::attributes().loc != null && location == user::attributes().loc
> ```

---

## 5. Tokens & authentication

All API auth is `Authorization: Bearer <token>`.

| Token type                   | Scope                                                     | Lifetime                                                                 | Created via                                                                      |
| ---------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **Personal (user) token**    | Acts as you, full user access                             | ~1 year (shorter with SAML SSO); a new CLI login invalidates the old one | `sanity login` (inspect with `sanity debug --secrets`)                           |
| **Project robot token**      | One project                                               | Until deleted; expiry (`expiresAt`) settable in Manage and via API       | Manage → project → **API → Tokens** (needs developer/admin), or Access API       |
| **Organization robot token** | Org-wide (multi-project, SDK apps, Media Library, Canvas) | Until deleted / expiry                                                   | Manage → org → **Settings → API → Tokens** (needs org developer+), or Access API |

Token facts:

- A token is given a **role** that defines its access. Out of the box every project has **Viewer (read-only)** and **Editor (read+write)** token roles; Enterprise custom roles can be made robot-assignable (`appliesToRobots: true`).
- The secret is shown **exactly once** at creation and can never be retrieved again — lose it, create a new robot and delete the old one.
- Some management APIs require a _personal_ token and reject robot tokens (docs call this out per endpoint).
- Creating a project robot emails all project admins by default (`sendNotification=false` only allowed within 5 minutes of project creation).

Safety practices (from Sanity's own guidance):

- Never ship a token in client-side JS — a token in a public bundle makes a private dataset effectively public (or writable, if it's a write token).
- Never commit tokens; use env vars. One token per application so revocation is surgical.
- A leaked token is forever lost: delete it immediately regardless of how fast you re-hid it.
- Frontend submissions should go through a proxy/serverless function holding the write token.

---

## 6. SSO / SAML role mapping (Enterprise; role mapping is a Growth add-on)

Configured at the **organization** level in Manage (SAML SSO section):

- Users authenticate via your IdP (Okta, Entra/Azure AD, Google, Auth0…). Required attribute mappings: `email`, `firstName`, `lastName`. **All additional SAML attributes sync as user attributes** (feeding parameterized roles).
- **Role mapping per project:** rules evaluate the user's IdP _group membership_ against RE2-style regexes (`.*-admin`, `[aA]dmin` — no backrefs/lookahead) and map matches to Sanity roles; plus a default fallback role for users matching no rule.
- **Auto-update roles on login** re-applies mapping at every login and _disables manual role management_ in Manage for those users.
- Org slug (1–20 chars) enables `sanity login --sso <slug>` for CLI SSO login. Session TTL is configurable.
- Studio login screen is pointed at the provider via the Studio auth config.
- **Seat gotcha:** SAML users are distinct Sanity users — switching IdPs can duplicate people and consume extra seats.

---

## 7. What you can do in the GUI (sanity.io/manage)

Quick launcher from a project directory: `npx sanity manage`.

| Area                          | Where                                         | What's possible                                                                                                    |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Assign roles to members       | Project → **Members**                         | View members + roles, change roles (unless locked by SSO mapping), invite (only admins can invite admins), remove. |
| Create/edit custom roles      | Project → **Access → Roles** (Enterprise)     | Define role, add members, set Content Permissions + Management Permissions per dataset/tag/resource.               |
| Content resources             | Project → **Access → Resources** (Enterprise) | Create GROQ-filter resources; then grant actions on them per role.                                                 |
| User attributes               | Org → **Members → Attributes** (Enterprise)   | Define attribute keys/types, view SAML-captured ones, set/override/remove per-user values.                         |
| Dataset visibility            | Project → **Datasets**                        | Toggle public/private per dataset.                                                                                 |
| Dataset tags                  | Project → **Datasets → Tags** (Growth+)       | Create tags, attach datasets, set role permissions per tag.                                                        |
| API tokens (project)          | Project → **API → Tokens**                    | Create robot tokens with a role and (since Manage v2026-06-12) an expiration; delete tokens.                       |
| API tokens (org)              | Org → **Settings → API → Tokens**             | Create org-wide tokens for multi-project / SDK apps / Media Library / Canvas.                                      |
| SAML SSO                      | Org → **SAML SSO**                            | Full IdP setup, per-project role mapping, auto-update roles, session TTL, org slug.                                |
| Org membership & default role | Org → **Members**                             | Manage org roles; remove default org role (multi-tenant hygiene).                                                  |
| Access requests               | Project/org member screens                    | Approve/decline requests for access or role upgrades.                                                              |

The **Studio** enforces the same grants at edit time: fields/documents you can't update show "insufficient permissions" notices, publish is blocked without publish grants, and `S.context.currentUser` lets Structure Builder tailor lists per role.

---

## 8. What you can do via API

### 8.1 Access API (preferred)

Base: `https://api.sanity.io/v{apiVersion}/access/{resourceType}/{resourceId}/…` — current version `v2025-07-11` (access requests: `v2024-07-01`). Resource types: `organization` and `project` today (schemas already include `media-library`, `canvas`, `dashboard`, `view`). Works nicely through `@sanity/client`'s `client.request({uri, method, body})`.

> The older project-scoped [Roles API](https://www.sanity.io/docs/http-reference/roles) still exists but the Access API replaces it (`permissions` replaces legacy `grants`/`resources`; `users` replaces `ACL`; `name` is now the unique identifier — internal IDs are gone).

**Users & role assignment**

```text
GET    /access/{type}/{id}/users                              list users + roles (cursor pagination, filters: email, displayName)
GET    /access/{type}/{id}/users/{sanityUserId}               get one user
PUT    /access/{type}/{id}/users/{sanityUserId}/roles         replace whole role set  {roleNames: [...]}
PUT    /access/{type}/{id}/users/{sanityUserId}/roles/{role}  add one role
DELETE /access/{type}/{id}/users/{sanityUserId}/roles/{role}  remove one role (cannot remove the last one)
DELETE /access/{type}/{id}/users/{sanityUserId}               remove user entirely
DELETE /access/{type}/{id}/users/me                           leave a project/org yourself (no admin needed)
PUT    /access/organization/{id}/users/roles/default          apply org default role to all users
```

**Roles (custom role CRUD — needs the `advancedRolesManagement` feature, i.e. Enterprise)**

```text
GET    /access/{type}/{id}/roles                list roles (includeChildren for orgs)
POST   /access/{type}/{id}/roles                create custom role {name, title, description, appliesToUsers, appliesToRobots, permissions[]}
GET    /access/{type}/{id}/roles/{roleName}     read role
PUT    /access/{type}/{id}/roles/{roleName}     update (REPLACES the object incl. permissions; custom roles only)
DELETE /access/{type}/{id}/roles/{roleName}     delete (must be unassigned first)
```

**Permissions**

```text
GET    /access/{type}/{id}/permissions                    list all permission resources + their actions
POST   /access/{type}/{id}/permissions                    create custom permission {name, title, description, type, config}
GET    /access/{type}/{id}/permissions/{permissionName}   read
PUT    /access/{type}/{id}/permissions/{permissionName}   update (custom only)
DELETE /access/{type}/{id}/permissions/{permissionName}   delete (custom only)
```

Example — a document-filter permission then a role using it:

```ts
// custom permission scoped by GROQ
await client.request({
  uri: `/access/project/${projectId}/permissions`,
  method: 'POST',
  body: {
    name: 'post-editor-permission',
    title: 'Post editor',
    description: 'Documents of type post',
    type: 'sanity.document.filter',
    config: {filter: '_type == "post"'}, // also accepts a dataset name
  },
})

// role bundling that permission + a management grant
await client.request({
  uri: `/access/project/${projectId}/roles`,
  method: 'POST',
  body: {
    name: 'post-editor',
    title: 'Post Editor',
    description: 'Edit posts, deploy studio',
    permissions: [
      {name: 'sanity-project', action: 'deployStudio'},
      {name: 'post-editor-permission', action: 'read'},
      {name: 'post-editor-permission', action: 'update'},
    ],
  },
})
```

Custom `sanity.document.filter` permissions get `create/read/update/manage/history/editHistory` actions automatically.

**Effective-permission checks (any authenticated user, for themselves)**

```text
GET /access/{type}/{id}/user-permissions/me                     list my effective permissions
GET /access/{type}/{id}/user-permissions/me/check?permissions=  boolean map per requested permission
```

**Robots (service accounts / tokens)**

```text
GET    /access/{type}/{id}/robots            list robots (org: includeChildren)
POST   /access/{type}/{id}/robots            create robot {label, expiresAt?, memberships:[{resourceType, resourceId, roleNames[]}]} → returns secret ONCE
GET    /access/{type}/{id}/robots/{robotId}  metadata only (token not retrievable)
PUT    /access/{type}/{id}/robots/{robotId}  update expiry {expiresAt}
DELETE /access/{type}/{id}/robots/{robotId}  delete robot + revoke token
```

**Invites**

```text
GET    /access/{type}/{id}/invites                       list (pending by default; filter with status)
POST   /access/{type}/{id}/invites                       invite {email, role} — only admins can invite admins
DELETE /access/{type}/{id}/invites/{inviteId}            revoke
GET    /access/invites/me                                my invites (matched by email)
GET    /access/{type}/{id}/invites/token/{token}         read invite by token (NO auth required)
POST   /access/{type}/{id}/invites/token/{token}/accept  accept (402 if seat quota exceeded)
```

**Access requests** (`v2024-07-01`) — users can _request_ access/role upgrades:

```text
GET  /access/{type}/{id}/requests                       list (admins)
POST /access/{type}/{id}/requests                       create {type: "access"|"role", requestedRole?, note?, requestUrl?}
PUT  /access/{type}/{id}/requests/{id}/accept           accept {roleNames?}
PUT  /access/{type}/{id}/requests/{id}/decline          decline
GET  /access/requests/me                                my requests
```

**API-level invariants worth memorizing**

- Every user must always hold ≥ 1 role; role replacement assigns-before-revoking so users never drop to zero.
- **Last-administrator rule:** each resource must retain at least one user who can read users, read roles, and assign roles — enforced at the permission level, which is what makes even default roles removable (with `advancedRolesManagement`).
- Only administrators may grant/revoke roles carrying admin permissions (privilege-escalation guard; applies to default roles).
- Pagination is cursor-based (`nextCursor` + `limit`, default 100).
- "Access is propagated internally and may take up to a few minutes to be fully available across all systems."

### 8.2 Blueprints (roles as code, Enterprise)

Define roles alongside functions and other infra, deploy with the CLI:

```ts
// sanity.blueprint.ts
import {defineBlueprint, defineRole} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineRole({
      name: 'custom-robot-role',
      title: 'Custom Robot Role',
      appliesToRobots: true,
      permissions: [{name: 'sanity-project-cors', action: 'create'}],
    }),
  ],
})
```

```sh
npx sanity blueprints init . --type ts --project-id <id> --stack-name production
npx sanity blueprints deploy     # role becomes active
npx sanity blueprints destroy    # removes deployed resources
```

Requires `@sanity/blueprints` ≥ 0.11.0 and a caller with `sanity-project-roles` permission. Pairs with robot tokens to give Sanity Functions explicit, least-privilege access.

### 8.3 CLI touchpoints

```sh
npx sanity manage                                    # open Manage for this project
npx sanity login [--sso <org-slug>]                  # personal token (SSO-aware)
npx sanity debug --secrets                           # reveal your personal auth token
npx sanity dataset visibility set <name> <public|private>
npx sanity users invite <email> --role <roleName>    # invite via CLI
```

---

## 9. Permission catalog (cheat sheet)

Built-in **project** permission resources and their actions (from `GET /permissions`):

| Permission `name`                      | Type                          | Actions                                                                 |
| -------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `sanity-document-filter-all-documents` | `sanity.document.filter`      | create, read, update, manage, history, editHistory                      |
| `sanity-document-filter-drafts`        | `sanity.document.filter`      | same (filter: `drafts.**` + `versions.**` paths)                        |
| `sanity-document-filter-images`        | `sanity.document.filter`      | same (filter: `_type == "sanity.imageAsset"`)                           |
| `sanity-document-filter-files`         | `sanity.document.filter`      | same (filter: `_type == "sanity.fileAsset"`)                            |
| `sanity-all-documents`                 | `sanity.document.filter.mode` | mode (e.g. `{mode: "publish", history: true}` — how admins get publish) |
| `sanity-project`                       | `sanity.project`              | read, update, delete, createSession, deployStudio                       |
| `sanity-project-members`               | `sanity.project.members`      | invite, read, update, delete                                            |
| `sanity-project-roles`                 | `sanity.project.roles`        | create, read, update, delete                                            |
| `sanity-project-tokens`                | `sanity.project.tokens`       | read, create, delete                                                    |
| `sanity-project-datasets`              | `sanity.project.datasets`     | read, create, update, delete                                            |
| `sanity-project-tags`                  | `sanity.project.tags`         | read, create, update, delete                                            |
| `sanity-project-cors`                  | `sanity.project.cors`         | read, create, delete                                                    |
| `sanity-project-webhooks`              | `sanity.project.webhooks`     | read, create, update, delete                                            |
| `sanity-project-graphql`               | `sanity.project.graphql`      | manage                                                                  |
| `sanity-project-usage`                 | `sanity.project.usage`        | read                                                                    |

Org-level equivalents exist for the org resource itself (incl. `billing`), members, roles, tokens, projects (`attach`/`detach`), legal, SSO (`saml`), sessions, plus newer surfaces: `sanity-media-library*` (assets read/create/publish, members, signed URLs, its own document filters), `sanity-sdk-applications` (read/deploy/delete), dashboard/view/canvas/blueprints permission families — ~46 permission types in total.

---

## 10. Gotchas — the condensed list

1. **Additive only, no deny.** A broad grant can't be narrowed by a specific rule. Design roles bottom-up from No access.
2. **Public dataset = public published content**, regardless of roles. Private datasets still require auth even for reads.
3. **Asset files are never private** (outside Media Library visibility controls) — private dataset or not.
4. **Custom read-only roles are billable**; only the built-in Viewer is free.
5. **No dereferencing in resource filters** — use `ref._ref == "..."`.
6. **`user::attributes()` fails open on `null == null`** — always `coalesce()` or null-check in filters.
7. **Robot token secrets show once**; recovery = recreate + delete old.
8. **Personal tokens** expire (~1 yr; less with SAML) and are rotated by CLI re-login; robot tokens live until deleted/expiry.
9. **SSO auto-update roles** disables manual role edits in Manage.
10. **Org admins ≠ project access** — but they can grant themselves membership; plan trust boundaries accordingly.
11. **Org Members see all org users** — remove the default org role for multi-tenant orgs.
12. **Role `PUT` replaces, not merges** — send the full permission list every time.
13. **You can't delete an assigned role** or remove a user's last role; every resource must keep a "last administrator".
14. **Same email ≠ same user** across login providers; SAML migration can double-count seats.
15. **Grant `Project Details: read` (+ `Project Members: read`)** to custom editor roles or the Studio experience degrades.
16. **Access changes propagate in minutes**, not instantly — don't panic-test immediately after a grant.

---

## 11. Feature availability by plan

| Capability                                                                      | Plan                       |
| ------------------------------------------------------------------------------- | -------------------------- |
| Admin + Viewer roles, editor/viewer token roles                                 | Free (all plans)           |
| Editor / Developer / Contributor roles                                          | Growth                     |
| Dataset **tags**                                                                | Growth                     |
| SAML role mapping                                                               | Growth add-on / Enterprise |
| Custom roles, content resources, custom permissions (`advancedRolesManagement`) | Enterprise                 |
| User attributes / parameterized roles                                           | Enterprise                 |
| SAML SSO                                                                        | Enterprise                 |
| Blueprints `defineRole`                                                         | Enterprise                 |
