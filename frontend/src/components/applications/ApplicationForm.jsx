import { Box, TextField, Button, Typography, IconButton, Divider } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import UploadIcon from '@mui/icons-material/Upload'
import { useRef, useState } from 'react'
import { formatBytes } from '../../utils/format'

const MAX_FILES = 3
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB per file

export default function ApplicationForm({ onSubmit, submitting, job }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState('')
  const inputRef = useRef(null)

  const addFiles = (fileList) => {
    setFileError('')
    const next = [...files]
    for (const f of fileList) {
      if (next.length >= MAX_FILES) {
        setFileError(`Up to ${MAX_FILES} files per application.`)
        break
      }
      if (f.size > MAX_BYTES) {
        setFileError(`"${f.name}" is over 2 MB — attach a smaller copy.`)
        continue
      }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue
      next.push(f)
    }
    setFiles(next)
  }

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name))
    setFileError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(
      coverLetter,
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {job && (
        <>
          <Typography variant="subtitle2">{job.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {job.duration_hours}-hour gig · {job.is_remote ? 'Remote' : job.location}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
        </>
      )}

      <TextField
        label="Short cover note"
        placeholder="Tell them why you're the right pick — experience, availability, anything that helps."
        multiline
        rows={4}
        fullWidth
        required
        helperText={`${coverLetter.length}/500 — keep it human, two or three lines is plenty.`}
        inputProps={{ maxLength: 500 }}
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        sx={{ mb: 2.5 }}
      />

      {/* Attach files */}
      <Box
        sx={{
          mb: fileError ? 1 : 2.5,
          border: '1px dashed',
          borderColor: fileError ? 'error.main' : 'divider',
          borderRadius: '10px',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: 'green.faint',
                color: 'green.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AttachFileIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">Attach files (optional)</Typography>
              <Typography variant="caption" color="text.secondary">
                Resume or photos of past work · up to {MAX_FILES}, 2 MB each
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadIcon sx={{ fontSize: 17 }} />}
            onClick={() => inputRef.current?.click()}
          >
            Browse
          </Button>
        </Box>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = '' // allow re-choosing the same file after removing it
          }}
        />

        {files.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
            {files.map((f) => (
              <Box key={`${f.name}-${f.size}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">{formatBytes(f.size)}</Typography>
                <IconButton size="small" aria-label={`Remove ${f.name}`} onClick={() => removeFile(f.name)}>
                  <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {fileError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2, mt: -1 }}>
          {fileError}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Demo build — only file names travel with the application; real uploads arrive with the backend.
      </Typography>

      <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit application'}
      </Button>
    </Box>
  )
}
