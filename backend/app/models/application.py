# TODO: Application model — see docs/data-model.md
#   - fields: id, job_id (FK -> job.id), applicant_id (FK -> user.id),
#     cover_note, resume_path (file handled by app/services/),
#     status enum (applied -> reviewed -> accepted / rejected), applied_at
#   - unique constraint: one application per applicant per job
#   - relationship: applicant (User, individual) and job (Job)
