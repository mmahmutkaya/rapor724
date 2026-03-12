export const METRAJ_STATUS_COLORS = {
  unread: '#f57c00',
  approved: '#2e7d32',
  revised: '#1565c0',
  seen: '#757575',
  rejected: '#d32f2f',
}

function normalizeSession(input) {
  if (!input) return {}
  if (typeof input === 'string') return { status: input }
  return input
}

export function getMeasurementVisualStatus(input) {
  const sess = normalizeSession(input)
  const status = sess.status
  const hasRevision = Array.isArray(sess.revision_snapshot) && sess.revision_snapshot.length > 0

  if (status === 'approved' && hasRevision) return 'revised'
  if (status === 'revised') return 'revised'
  if (status === 'approved') return 'approved'
  if (status === 'ready') return 'unread'
  if (status === 'seen') return 'seen'
  if (status === 'rejected' || status === 'revise_requested') return 'rejected'
  if (status === 'draft') return 'seen'

  return 'seen'
}

export function getMeasurementDotColor(input) {
  const visual = getMeasurementVisualStatus(input)
  return METRAJ_STATUS_COLORS[visual] || METRAJ_STATUS_COLORS.seen
}

export function getMeasurementStatusLabel(input) {
  const visual = getMeasurementVisualStatus(input)
  if (visual === 'unread') return 'Henüz okunmamış'
  if (visual === 'approved') return 'Onaylanmış'
  if (visual === 'revised') return 'Onay sonrası revize'
  if (visual === 'rejected') return 'Reddedilmiş'
  return 'Görüldü'
}

export function getMeasurementChipStyle(input) {
  const visual = getMeasurementVisualStatus(input)
  if (visual === 'unread') return { backgroundColor: '#FFF3E0', color: '#E65100', fontWeight: 600 }
  if (visual === 'approved') return { backgroundColor: '#E8F5E9', color: '#1B5E20', fontWeight: 600 }
  if (visual === 'revised') return { backgroundColor: '#E3F2FD', color: '#0D47A1', fontWeight: 600 }
  if (visual === 'rejected') return { backgroundColor: '#FFEBEE', color: '#B71C1C', fontWeight: 600 }
  return { backgroundColor: '#ECEFF1', color: '#37474F', fontWeight: 600 }
}
