import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../components/store'
import P_MetrajOlusturCetvel from './CetvelOlustur'
import P_MetrajOnaylaCetvel from './CetvelOnayla'

export default function P_MetrajCetvel() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromModule = searchParams.get('from') === 'ihale' ? 'ihale' : 'metraj'
  const { selectedProje, selectedIsPaket, selectedPoz, selectedMahal, metrajMode } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate(`/${fromModule}`)
    else if (!selectedPoz) navigate(`/${fromModule}/pozlar`)
    else if (!selectedMahal) navigate(`/${fromModule}/pozlar`)
  }, [selectedProje, selectedIsPaket, selectedPoz, selectedMahal, navigate])

  if (!selectedProje || !selectedIsPaket || !selectedPoz || !selectedMahal) return null

  if (metrajMode === 'approve') return <P_MetrajOnaylaCetvel />
  return <P_MetrajOlusturCetvel />
}
