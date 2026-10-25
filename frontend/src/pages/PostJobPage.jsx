import { Container, Typography, Alert } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJob } from '../api/jobsApi'
import { useAuth } from '../context/AuthContext'
import JobForm from '../components/jobs/JobForm'

export default function PostJobPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = async (jobData, image) => {
    setError('')
    try {
      const newJob = await createJob({ ...jobData, posted_by: user.id }, image)
      navigate(`/jobs/${newJob.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
      <Typography variant="h2" component="h1">Post a job</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Set it up once — pay, place, and hours go on the listing exactly as you enter them.
      </Typography>
      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      <JobForm onSubmit={handleSubmit} />
    </Container>
  )
}
