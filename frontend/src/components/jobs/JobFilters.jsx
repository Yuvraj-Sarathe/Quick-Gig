import { Box, TextField, MenuItem, FormControlLabel, Switch, InputAdornment, Typography, Button, CircularProgress } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NearMeIcon from '@mui/icons-material/NearMe'
import { CATEGORY_OPTIONS } from '../../utils/constants'

export default function JobFilters({ filters, setFilters, sx, nearMe, nearMeStatus, onToggleNearMe }) {
  const locating = nearMeStatus === 'locating'

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        pt: 2,
        pb: 3,
        ...sx,
      }}
    >
      <TextField
        placeholder="Search jobs"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        sx={{ width: 280 }}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </InputAdornment>
          ),
          sx: { bgcolor: 'background.paper' },
        }}
      />
      <TextField
        select
        label="Category"
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        sx={{ width: 190 }}
        size="small"
      >
        <MenuItem value="">All categories</MenuItem>
        {CATEGORY_OPTIONS.map((c) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        control={
          <Switch
            checked={filters.remoteOnly}
            onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
          />
        }
        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Remote only</Typography>}
        sx={{ ml: 0.5 }}
      />

      <Button
        onClick={onToggleNearMe}
        disabled={locating || nearMeStatus === 'unsupported'}
        variant={nearMe ? 'contained' : 'outlined'}
        size="small"
        startIcon={
          locating
            ? <CircularProgress size={14} color="inherit" />
            : <NearMeIcon sx={{ fontSize: 18 }} />
        }
        sx={{ ml: 'auto', fontWeight: 600 }}
        aria-pressed={nearMe}
      >
        {locating ? 'Locating you…' : nearMe ? 'Near me · on' : 'Gigs near me'}
      </Button>
    </Box>
  )
}
