# QuickGig - Data Flow & Request Lifecycle

This document details how data flows between the user, the React frontend, and the Flask backend.

---

## 1. How the Frontend Works (Presentation Mode)
1. **App Initialization**: When the app starts, `main.jsx` renders `App.jsx`.
2. **Routing**: `App.jsx` uses **React Router** to match the current URL path to a page inside `src/pages/` (e.g., loading `JobListings.jsx` when visiting `/jobs`).
3. **State & Auth**: `AuthContext.jsx` checks local storage for an existing JWT token. If found, user state is populated globally so `Navbar.jsx` and `ProtectedRoute.jsx` know who is logged in.
4. **UI Rendering**: Pages pull layout components from `src/components/` and render data using cards and forms.

---

## 2. Communication Lifecycle (Frontend ⇄ Backend)
When the frontend communicates with the Flask backend, the request follows this path:

1. **Trigger**: A user performs an action in React (e.g., clicks "Login" in `Login.jsx` or submits a gig in `PostJob.jsx`).
2. **API Call**: The page calls a function inside `src/services/api.js`.
3. **HTTP Request**: **Axios** sends an HTTP request (`GET`, `POST`, etc.) to the Flask server endpoint base URL.
4. **Backend Routing**: `run.py` only starts the server — the request is handled by the app created in the factory (`app/__init__.py`), which maps the URL to the correct Blueprint (`auth_routes.py`, `job_routes.py`, or `app_routes.py`).
5. **Middleware / Security**: Custom decorators inside `app/utils/` intercept protected routes to verify the attached JWT token and check user permissions.
6. **Database Operation**: The route handler uses SQLAlchemy models (`user.py`, `job.py`, `application.py`) to query or update the PostgreSQL database.
7. **Response**: Flask formats the result into JSON and sends it back to the React frontend, which updates its state and re-renders the UI.

---

## 3. Authentication Lifecycle
1. **Submit**: `Register.jsx` or `Login.jsx` posts credentials through `api.js` to `/api/auth/register` or `/api/auth/login`.
2. **Issue**: `auth_routes.py` validates the credentials and returns a signed JWT.
3. **Store**: The frontend saves the token (localStorage) and updates `AuthContext.jsx`.
4. **Attach**: The Axios client in `api.js` adds `Authorization: Bearer <token>` to every later request.
5. **Verify**: Decorators in `app/utils/` decode the token and check the user's role before the route handler runs.
6. **Gate**: `ProtectedRoute.jsx` reads the same context to allow or redirect private pages, and `Navbar.jsx` switches links based on role.

---

## 4. Application Status Lifecycle
1. **Apply**: An individual clicks "Apply Now" on `JobDetails.jsx`, which calls `POST /api/applications`.
2. **Record**: `app_routes.py` creates an Application row with status `applied`.
3. **Review**: The owning organization lists applicants and moves the status to `reviewed`.
4. **Decide**: The organization sets `accepted` or `rejected`; the applicant sees the change on `Dashboard.jsx`.
5. **Complete gig**: Once the work is done, the organization updates the job status `open` → `closed` / `completed`.
