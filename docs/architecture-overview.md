# QuickGig - Architecture & Component Reference

This document explains what every file and folder does in our QuickGig monorepo and how they fit together.

**Companion docs**: [`data-model.md`](data-model.md) · [`api-endpoints.md`](api-endpoints.md) · [`data-flow.md`](data-flow.md) · [`decisions.md`](decisions.md)

---

## 1. Repository Root
*   **`README.md`**: Project overview, setup steps, and team instructions.
*   **`.gitignore`**: Keeps `node_modules/`, `venv/`, `.env`, and build artifacts out of Git.
*   **`docs/`**: This documentation folder (architecture, data model, API endpoints, open decisions).
*   **`.gitkeep`**: Placeholder files that keep otherwise-empty folders (e.g. `services/`, `migrations/`) tracked by Git.

---

## 2. Backend (`/backend`)
The backend is a **Flask** REST API responsible for handling data storage, business logic, user authentication, and secure routes.

*   **`run.py`**: The main entry point to start the Flask development server.
*   **`config.py`**: Holds configuration settings like database connection strings, secret keys, and mail credentials.
*   **`requirements.txt`**: Lists all Python libraries needed (Flask, Flask-SQLAlchemy, PyJWT, Celery, etc.).
*   **`migrations/`**: Automatically generated database migration files (handled via Flask-Migrate/Alembic) to keep database tables updated.
*   **`app/`**: The core package containing the application logic.
    *   **`__init__.py`**: The app factory file. It initializes the Flask app, connects database extensions, and registers routes.
    *   **`models/`**: Defines the SQLAlchemy database structure (fields detailed in [`data-model.md`](data-model.md)).
        *   `user.py`: Schema for users, supporting both Individual and Organization roles.
        *   `job.py`: Schema for job/gig postings, tracking status (Open, Closed, Completed).
        *   `application.py`: Schema mapping applicants to specific jobs.
        *   *Review model (`review.py`): not created — deferred, see [`decisions.md`](decisions.md).*
    *   **`routes/`**: Blueprint files that handle incoming HTTP requests and send JSON responses (paths listed in [`api-endpoints.md`](api-endpoints.md)).
        *   `auth_routes.py`: Handles user registration, login, and JWT token issuing.
        *   `job_routes.py`: Handles creating, reading, updating, and searching/filtering job listings.
        *   `app_routes.py`: Handles job application submissions and status changes.
    *   **`services/`**: Handles complex auxiliary business logic like file uploads (resumes/avatars) and email alerts (via Flask-Mail).
    *   **`utils/`**: Reusable helper functions, specifically custom decorators for verifying user JWT tokens and role permissions.

---

## 3. Frontend (`/frontend`)
The frontend is a **React** single-page application built using Vite. Since we are building this first for our presentation, it can run independently or connect to the Flask backend via Axios.

*   **`vite.config.js`**: Configuration file for the Vite build tool and development server.
*   **`package.json`**: Lists all Node dependencies (`react`, `react-router-dom`, `axios`, `mui`).
*   **`public/`**: Stores static assets (favicons, public images) that don't pass through the build bundler.
*   **`src/`**: Contains the source code of our React application.
    *   **`main.jsx`**: The root entry point that mounts our React application into the DOM.
    *   **`App.jsx`**: Houses the main layout and **React Router** configuration, mapping URL paths to specific page components.
    *   **`index.css`**: Global stylesheet and base styles (final styling stack undecided — see [`decisions.md`](decisions.md)).
    *   **`assets/`**: Local images, logos, and graphic illustrations used across pages.
    *   **`components/`**: Reusable UI blocks.
        *   `Navbar.jsx`: Navigation bar that dynamically shifts links based on whether the user is logged in.
        *   `Footer.jsx`: Bottom footer component.
        *   `JobCard.jsx`: Reusable layout card to display individual gig listings during searches.
        *   `ProtectedRoute.jsx`: A route guard component that blocks unauthorized users from viewing private pages like the dashboard.
    *   **`context/`**: Global state management.
        *   `AuthContext.jsx`: Keeps track of the logged-in user's token, profile data, and role across the entire application.
    *   **`pages/`**: Full-screen views tied to our router.
        *   `Home.jsx`: Landing page and hero intro.
        *   `Login.jsx`: Screen for entering credentials and receiving a JWT token.
        *   `Register.jsx`: Multi-path sign-up page letting users choose between Individual or Organization accounts.
        *   `JobListings.jsx`: Search, category browsing, and filtering dashboard for open gigs.
        *   `JobDetails.jsx`: Full breakdown of a single job post with an "Apply Now" action.
        *   `PostJob.jsx`: Multi-step form wizard allowing organizations to draft and publish new gigs.
        *   `Dashboard.jsx`: User profile view to track active applications and managed jobs.
    *   **`services/`**: External communication layer.
        *   `api.js`: Configures a centralized **Axios** client instance with the backend base URL and automatic header injection.
    *   **`utils/`**: Pure helper functions for formatting currency, parsing dates, or validating form inputs.
