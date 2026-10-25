import { Card, CardContent, Box, Skeleton } from '@mui/material'

// Loading placeholder matching JobCard's proportions.
export default function JobCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton width={90} height={24} />
          <Skeleton width={56} height={24} />
        </Box>
        <Skeleton width="85%" height={28} />
        <Skeleton width="100%" height={18} sx={{ mt: 1 }} />
        <Skeleton width="70%" height={18} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2.5 }}>
          <Skeleton width={110} height={18} />
          <Skeleton width={60} height={18} />
        </Box>
      </CardContent>
    </Card>
  )
}
