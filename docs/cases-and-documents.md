# Cases & documents (mobile)

The mobile **Cases** tab mirrors the web app's case register (`mlf` → `features/cases`, `app/api/cases/**`).
There is no mobile-specific backend: every screen calls the same web API routes with the bearer token.

## Web → mobile feature map

| Web feature (mlf) | API | Mobile |
| --- | --- | --- |
| Case list, search, filters (hearing today / week, missing court no., batta due, defects) | `GET /api/cases` | `cases/index.tsx`: search + quick-filter pills, pull to refresh |
| Register case (`CaseFormDialog`, 6 sections) | `POST /api/cases` | `cases/new.tsx` → `CaseForm` |
| Edit case | `PATCH /api/cases/:id` | `cases/[unitId]/edit.tsx` (client locked, as on web) |
| Court cascade State → District → Complex → Court | `GET /api/courts/meta` | `CourtCascade`: server search at each level, typed "Use …" value for courts not listed |
| Case type → stage catalog | local config | `features/cases/stages.ts`, copied from `config/company/case-stages.ts` |
| Case detail: court, next hearing, case no., fee, parties | `GET /api/cases/:id` | `cases/[unitId]/index.tsx` |
| Pipeline status strip + allowed transitions | `PATCH /api/cases/:id/status` | `CaseStatusStrip` (confirm before each move) |
| Filing checklist, batta due, awaiting service, return reason | `PATCH /api/cases/:id/checklist` | `CaseFilingChecklist` (shown only while the case is pre-number) |
| Add hearing | `POST /api/cases/:id/hearings` | `cases/[unitId]/hearing.tsx` |
| Adjourn hearing | `POST /api/hearings/:id/adjourn` | `cases/[unitId]/adjourn.tsx` |
| Case documents: list, upload, download, delete | `/api/documents`, `/api/documents/:id/download` | `CaseDocumentsPanel`, `cases/[unitId]/upload.tsx` |
| Register case from a client's page | `?clientUnitId=` | Client detail → "+ Register case"; case rows open the case |

### Not on mobile yet

- Kanban board view, Excel export, CSV import of cases and hearings. These are desk tasks, so they stay web-only.
- Fee roll-up, payments and waivers on the case page.
- Case list pagination: the list loads the newest 50 (the API maximum). Use search or filters for older cases.
- Client-level documents page (documents attached to a client rather than a case).

## Document access

Access follows the user's permissions (`PublicUser.permissions`, keys like `cases.upload`).
The app uses them only to show or hide buttons. The server checks every request again (`features/documents/server/access.ts`).

| Action | Staff needs | Client-portal login |
| --- | --- | --- |
| See the case and its documents | `cases.view` | Only its own cases. Receipts and expense bills are hidden. |
| Open or share a document | `cases.view` | Own documents only |
| Upload | `cases.upload` | `cases.upload`, limited to ID proof, evidence, affidavit or other |
| Delete | `cases.upload` | Never |
| Register a case | `cases.create` | Never |
| Edit, change status, checklist, hearings | `cases.edit` | Never |

When a permission is missing, the related button is hidden. Opening the Cases tab without `cases.view` shows "Ask your admin to grant…".
Admins grant these permissions on the web: **Permissions → matrix**.

### Opening files

`/api/documents/:id/download` needs the `Authorization` header, so the app cannot simply open the URL in a browser.
Instead, `downloadAndShareDocument` downloads the file to the cache with `expo-file-system` (sending the bearer header) and then opens the OS share sheet with `expo-sharing`. From there the user can open, save or forward the file.

### Uploading

`expo-document-picker` only offers PDF, JPG, PNG and WEBP files. Files over 10 MB are rejected before upload.
The upload is sent as multipart to `POST /api/documents` with `caseUnitId`.
These limits mirror `config/company/compliance.ts`.

## Keeping in sync with the web

These files are copies of web config, so update them when the web changes:

- `features/cases/constants.ts`: statuses, transitions, checklist items, case types, our-side options, acts, adjourn outcomes
- `features/cases/stages.ts`: stage catalogs per case type (the server rejects a stage that belongs to a different case type)
- `features/documents/constants.ts`: document types and upload limits
