# SiteForge — Requirements & Scope

## Project Overview
SiteForge is a web platform for managing construction/engineering projects, tracking phases, budgets, and collaborations between owners, managers, and contractors.

## Goals
- Deliver an MVP to manage projects, phases, budgets, and basic user roles.
- Provide a secure, role-based system for project access and approvals.
- Integrate simple reporting and export for finance and stakeholders.

## Stakeholders
- Project Owner
- Project Manager
- Contractor
- Finance/Accountant
- Viewer/Stakeholder

## MVP Features (Functional)
- User authentication and role-based access control (Admin, Manager, Contractor, Viewer).
- Create / Read / Update / Delete projects and project phases.
- Define and track budgets per project and phase; record budget adjustments.
- Upload attachments and notes per project/phase.
- Simple reporting: project budget summary and export CSV/PDF.
- Basic notifications (email or in-app) for approvals and status changes.

## Non-Functional Requirements
- Security: password hashing, JWT for sessions, role checks on every API.
- Performance: pages should load within 2s for typical project sizes.
- Scalability: design for horizontal scaling of frontend and stateless backend.
- Reliability: data backups and transactional safety for budget updates.
- Accessibility: follow WCAG AA where practical for MVP.

## High-level Data Model (candidate entities)
- User (id, name, email, role, status)
- Project (id, title, ownerId, status, startDate, endDate)
- Phase (id, projectId, title, status, startDate, endDate)
- Budget (id, phaseId, amountAllocated, amountSpent, currency)
- Task/LineItem (id, phaseId, description, costEstimate, assigneeId)
- Attachment (id, parentId, parentType, filename, url)
- Comment (id, parentId, authorId, body, createdAt)

## APIs / Integrations (MVP)
- REST API endpoints for auth, users, projects, phases, budgets, attachments.
- Optional integration: payment processor or accounting export (CSV).

## Acceptance Criteria (MVP)
- Users can sign up/login and access only permitted projects.
- Managers can create projects and phases and assign budgets.
- Budget totals and adjustments reflect correctly in reports.
- Attachments can be uploaded and downloaded.

## Constraints & Assumptions
- Use existing `server` and `client` apps as base (see `server/src` and `client/src`).
- PostgreSQL (or similar RDBMS) preferred for budget integrity and transactional updates.
- Authentication: start with JWT; add refresh tokens if needed.

## Next Steps (Design Phase tasks)
1. Inventory existing code (endpoints, models, DB migrations).
2. Define canonical data model and DB schema for core entities.
3. Draft API contracts (routes, request/response shapes).
4. Design frontend pages and component mapping to APIs.
5. Identify cross-cutting concerns: auth middleware, error handling, file storage.

## Files To Inspect First
- `server/src/app.js` — main Express setup
- `server/src/controllers` — controller patterns
- `server/src/data/store.js` — data access
- `client/src/pages` — existing pages and routing
- `client/src/api/client.js` — API client setup

---
Generated on: 2026-07-16
