import { Box, TextField, MenuItem, FormControlLabel, Switch, Button, Typography, Grid, IconButton } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import { useRef, useState } from 'react'
import { CATEGORY_OPTIONS, PAY_TYPES } from '../../utils/constants'
import { AREA_NAMES } from '../../utils/locations'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // must match the backend limit
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function SectionLabel({ children, sx }) {
  return (
    <Typography
      variant="subtitle2"
      sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider', color: 'green.dark', ...sx }}
    >
      {children}
    </Typography>
  )
}

export default function JobForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    is_remote: false, pay_amount: '', pay_type: 'fixed', duration_hours: ''
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const imageInputRef = useRef(null)

  const handleImage = (fileList) => {
    setImageError('')
    const file = fileList?.[0]
    if (!file) return
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      setImageError('Photos must be a JPG, PNG or WebP file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('That photo is over 4 MB — attach a smaller version.')
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, pay_amount: Number(form.pay_amount), duration_hours: Number(form.duration_hours) }, image)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 5 }}>
      <SectionLabel>The work</SectionLabel>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField label="Job title" placeholder="e.g. Weekend market stall setup" fullWidth required value={form.title} onChange={handleChange('title')} />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={5}
            required
            helperText="Two or three honest sentences is plenty — what happens on the day matters most."
            value={form.description}
            onChange={handleChange('description')}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField select label="Category" fullWidth required value={form.category} onChange={handleChange('category')}>
            {CATEGORY_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Duration (hrs)"
            type="number"
            fullWidth
            required
            value={form.duration_hours}
            onChange={handleChange('duration_hours')}
          />
        </Grid>
      </Grid>

      <SectionLabel sx={{ mt: 5 }}>Pay & location</SectionLabel>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch checked={form.is_remote} onChange={handleChange('is_remote')} />}
            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>This gig can be done remotely</Typography>}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label="Location / area"
            fullWidth
            required={!form.is_remote}
            disabled={form.is_remote}
            helperText={form.is_remote ? 'Remote gig — no location needed.' : 'Pick the area — gig-seekers near it will find it first.'}
            value={form.location}
            onChange={handleChange('location')}
          >
            <MenuItem value="" disabled><em>Select an area in Bhopal</em></MenuItem>
            {AREA_NAMES.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Pay amount (₹)"
            type="number"
            fullWidth
            required
            helperText="In rupees — listed exactly like this."
            value={form.pay_amount}
            onChange={handleChange('pay_amount')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select label="Pay type" fullWidth value={form.pay_type} onChange={handleChange('pay_type')}>
            {PAY_TYPES.map((p) => <MenuItem key={p} value={p}>{p === 'hourly' ? 'Hourly rate' : 'Fixed for the job'}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <SectionLabel sx={{ mt: 5 }}>Photo (optional)</SectionLabel>
      <Box
        sx={{
          border: '1px dashed',
          borderColor: imageError ? 'error.main' : 'divider',
          borderRadius: '10px',
          p: 2,
          mb: 5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {image ? (
            <Box
              component="img"
              src={imagePreview}
              alt="Selected gig photo preview"
              sx={{ width: 88, height: 66, borderRadius: '10px', border: '1px solid', borderColor: 'divider', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <Box
              sx={{
                width: 88, height: 66, borderRadius: '10px', bgcolor: 'green.faint', color: 'green.dark',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid', borderColor: 'divider',
              }}
            >
              <AttachFileIcon sx={{ fontSize: 20 }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2">{image ? image.name : 'Add a photo of the work'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {image ? 'Looks good — it travels with the listing.' : 'A stall, a room, equipment — helps gig-seekers trust the work. 4 MB max.'}
            </Typography>
            {imageError && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {imageError}
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => imageInputRef.current?.click()}
          >
            {image ? 'Change' : 'Browse'}
          </Button>
          {image && (
            <IconButton size="small" aria-label="Remove photo" onClick={() => { setImage(null); setImagePreview(''); setImageError('') }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
        <input
          ref={imageInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleImage(e.target.files)}
        />
      </Box>

      <Button type="submit" variant="contained" size="large" fullWidth sx={{ mb: 3 }}>
        Post this job
      </Button>
    </Box>
  )
}
