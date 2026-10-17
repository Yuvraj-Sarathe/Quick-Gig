// TODO: global auth state — see docs/architecture-overview.md (AuthContext.jsx)
// - on mount: read JWT from localStorage -> if present, GET /api/auth/me to restore the session
// - expose: user, token, role, loading, login(), register(), logout()
// - login/register persist the token to localStorage and set state
// - consumed by Navbar.jsx and ProtectedRoute.jsx (docs/data-flow.md §3)
