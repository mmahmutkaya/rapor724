import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../components/store'
import P_MetrajOlusturCetvel from './CetvelOlustur'
import P_MetrajOnaylaCetvel from './CetvelOnayla'

export default function P_MetrajCetvel() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, selectedMahal, metrajMode } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/metraj')
    else if (!selectedPoz) navigate('/metraj/pozlar')
    else if (!selectedMahal) navigate('/metraj/pozlar')
  }, [selectedProje, selectedIsPaket, selectedPoz, selectedMahal, navigate])

  if (!selectedProje || !selectedIsPaket || !selectedPoz || !selectedMahal) return null

  if (metrajMode === 'approve') return <P_MetrajOnaylaCetvel />
  return <P_MetrajOlusturCetvel />
}
