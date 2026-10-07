# Consolidated release validation — 7 October 2026 (IST)

## Executed locally

Server test suite: 58 tests, 56 passed, 0 failed, 2 skipped. Runtime: Node v24.19.0. Some inherited tests check module/source presence; they are not end-to-end assurance.

New exercised behaviour includes pure-planner procurement/production/QC/sales flows, partial material/labour allocation, balanced journals, returns, negative-stock and linked-quantity rejection, work-order WIP isolation, reversal dependencies, tenant permission guards, request hashing, email retry/dead-letter/idempotency mocks, encrypted backup cryptography and HTTP health/auth/CORS checks.

Extension tests exercise routing/cutting/folding order, partial stage capacity, machine event state transitions/run-pause timing, schedule boundaries/date hashing, MRP shortage aggregation, approval threshold exposure, linked settlement ageing, actual work-order cost, sales-order margin, manual payroll arithmetic, CSV parsing/sign/precision/duplicate rejection and subscription quota/feature policies. Anonymous HTTP calls to the new operations, approval, bank, commercial and HR endpoints return 401. Tenant/company/factory fields and scoped unique indexes were checked for all new models.

Client production build passed. Build reports a large PDF-tools chunk; this is a performance warning, not a build failure. Server JavaScript syntax checks are included in final packaging verification.

## Not executed / deployment blockers

- Both real MongoDB replica-set integration suites were skipped: no TEST_MONGODB_URI available. One covers ledger isolation/concurrency/rollback; the other covers overlapping machine assignment, idempotent events and stage capacity through HTTP routes. These need an actual database run. Approval, bank, HR and quota transaction paths also need real database acceptance testing.
- Razorpay capture/refund and Resend sending were tested with mocks, not real provider sandbox accounts.
- No live tenant migration, actual encrypted export/restore drill, hosted browser login journey, load test, penetration test or accountant sign-off was performed.
- No live GitHub push or Netlify/Render deployment was performed for this release.

## Staging acceptance checklist

1. Run all server tests including the real database suite. Create two companies and two factories; prove cross-company/factory reads and writes fail, including document IDs and support URLs.
2. Verify owner bootstrap, company ID/user ID login, weak password rejection, reset email/token expiry, disabled users and session invalidation after permission changes.
3. Reconcile legacy stock snapshot against physical stock and inventory valuations. Trial OPENING and activation on a staging copy; confirm old writes lock and history remains visible.
4. Run purchase → receipt → invoice → payment, sales → invoice → dispatch → receipt and return cases using real database transactions. Confirm stock/GL values and trial balance.
5. Run two BOM work orders, partial receipts and labour costs. Verify no cross-work-order WIP consumption, QC caps and reversal ordering. Confirm required shop-floor workflows fit this version before cutover.
6. Retry identical postings, submit concurrent issues and simulate database failures. Verify no duplicate document or partial stock/journal commit.
7. Capture a sandbox subscription payment; replay webhook and duplicate checkout verification. Confirm one paid term and invoice, correct customer/factory and tax snapshot.
8. Send test invoice emails, exercise failure retries, cancellation/expiry and full refund confirmation. Validate provider status before retrying ambiguous requests; manual payout reference must represent a real payout.
9. Verify billing access after expiry while operational access is blocked. Renew and confirm data retention plus cancellation/refund boundaries.
10. Pause staging writes, encrypted export, validate/tamper/wrong-key checks and restore into an empty target. Verify identifiers, dates, record counts and operational relationships; configure independent managed backups.
11. Review invoice legality/tax calculation, audit permissions, database credential access, retention policy and monitoring with the responsible professionals/operators.
12. Test all configured department stages with partial quantities: incomplete Cutting/Folding must block downstream work; incomplete Packing must block production receipt. Ensure operational completion reflects physical work, not just button clicks.
13. Concurrently assign overlapping schedules, try two active jobs on one machine, record breakdown/changeover, inspect seven-day Gantt/report and test due blocking maintenance. Confirm planned-job cancellation and documented correction process for completed jobs.
14. Register distinct roll SKUs, verify batch/set grouping, reject repeated receipts to registered rolls, scan QR after login and prove cross-factory access fails. Verify balance quantities against the authoritative ERP ledger.
15. Enable a test approval threshold using two company administrators. Direct posting above threshold and self-approval must fail. Test rejected/stale proposals, failed posting retry and one-time final document creation.
16. Review invoice terms/credit limits, partial receipts/returns, vendor pending and order cost/margin reports. Validate dates around month/fiscal-year boundaries. MRP suggestions must be reviewed for open purchase orders/material compatibility.
17. Import a small bank CSV, replay it, test sign mismatch and conflicting reference, match one document only, unmatch with a reason and test reversal protection. One BANK ledger per factory is the implemented model.
18. Prepare attendance/payslips with reviewed earnings/deductions; test duplicate creation, void/correction and print snapshots. Verify payroll statements do not silently post expenses or trigger salary payouts.
19. Test concurrent user creation/reactivation/department changes against plan limits. Test explicit ERP_CORE/ERP_SHOP_FLOOR/ERP_FINANCE/ERP_HR feature tags; legacy department-only plans deliberately retain ERP access until configured. Verify expired customers can login to billing while operational routes stay blocked.

Only after these checks should the candidate replace a production installation. Platform operator API restrictions do not eliminate infrastructure administrator access.
