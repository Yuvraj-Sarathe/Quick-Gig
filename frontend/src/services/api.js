// TODO: centralized Axios client — see docs/data-flow.md §2 (steps 2-3)
// - axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" })
// - request interceptor: attach Authorization: Bearer <token> from localStorage
// - response interceptor: on 401 clear the session and redirect to /login
// - export helpers grouped per blueprint (see docs/api-endpoints.md):
//     auth: register/login/me | jobs: list/get/create/update/remove | applications: apply/mine/updateStatus
