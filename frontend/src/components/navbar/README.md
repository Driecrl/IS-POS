# Navbar Component

## Information

Author:     Drie
Time:       2026/08/18
Unique ID:  CMP-NAV-001
Scope:      nav

## Description

Shared sidebar navigation for every authenticated page. Groups links
into Operations, Inventory, and Admin sections, highlights the active
route, and shows the current user with a logout action.

## When to Use

Use on every page inside the app that requires a logged-in session
(everything except /login). Replaces the old repeated
Dashboard/Log Out button pairs at the top of each page.

## How to Use

import Navbar from "#components/navbar";

<div className="flex">
  <Navbar activePath="/dashboard" />
  <main className="flex-1">{/* page content */}</main>
</div>

## Exported APIs

### Navbar (default export)

UUID:       CMP-NAV-001
DependsOn:  LIB-AUTH-001

## Notes

- Admin-only links (Users, Reports, Audit Trail) are hidden unless the
  session role is SUPER_ADMIN or ADMIN.
- Reads the session directly via `getSession()` — no props needed beyond
  `activePath`.
- `print:hidden` should still be applied by the parent page wrapper if
  the page has a printable section (e.g. POS receipt).