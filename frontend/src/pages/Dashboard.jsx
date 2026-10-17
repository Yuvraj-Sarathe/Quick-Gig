// TODO: user dashboard — role-aware, see docs/data-flow.md §4
// - individual: my applications + current status (GET /api/applications/mine)
// - organization: my posted jobs (GET /api/jobs?mine=1) + per-job applicant lists
//   (GET /api/jobs/<id>/applications) and status updates (PATCH /api/applications/<id>)
// - guard the whole page with <ProtectedRoute>
