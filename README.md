# AFC Group — Finance, in focus

A polished, responsive demonstration workspace for Aircraft Finance Corporation and Asset Finance Corporation, with interactive dashboards, opportunity management, credit review, local approval drafts and 3D asset views.

## See the build

The ready-to-open demo is **[docs/index.html](docs/index.html)**. Download that file and open it in a current browser; no installation or account is required. All code, fonts and company logos are embedded in that single file. If GitHub Pages is enabled, the same build can be opened directly using the repository's Pages link.

Watch the **[South African narrated platform explainer](docs/platform-explainer.mp4)** for a one-minute overview.

## What works

Switch between Group, Aircraft and Asset views; drill into pipeline charts; search and filter opportunities; create leads; assign owners; review document checklists and policy ratios; save editable follow-ups for human review; inspect activity; and export CSV reports. Changes are saved on the reviewer's own device. Desktop and mobile layouts use the same workflows.

The colours were verified against the existing company websites: Aircraft Finance Corporation uses navy `#010c26` and white; Asset Finance Corporation uses amber `#f9a521` and charcoal `#2f2f2f`. The original logos are retained.

## Demonstration boundaries

All financial figures, people, client records and credit policies are fictional demonstration data. No real loan is approved, and no email is sent. Monday.com, Outlook and SharePoint are not connected. The static client build has no server/API: the online analyst and online text extraction require the full hosted app and are intentionally unavailable here. Manual and supplied-sample workflows remain available.

## Source and development

`client/` contains the React/TypeScript interface; `shared/` holds the typed demo fixtures and policy helpers; `server/` contains the optional Express/tRPC backend. The repository contains no private runtime credentials.

Use `pnpm install --frozen-lockfile`, then `pnpm dev`. `pnpm check` checks types; `pnpm build` creates the frontend and backend outputs; `pnpm start` serves the full build. The server honors `PORT`, defaulting to `3000`. The hosted analyst requires the deployment's managed service credentials, kept server-side.

Recreate the self-contained client demo after a production build with `python3 scripts/export-client-demo.py`. It writes `docs/index.html` and `deliverables/AFC_Workspace.html`.

## Client preview hosting

Where authorized and supported by the account, GitHub Pages can publish from the **main branch / docs folder**. Public visibility and Pages publication are separate owner-approved choices; a repository link alone does not render the application. A private repository requires an invitation for the client to see its files.
