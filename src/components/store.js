import { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export const StoreContext = createContext(null)

// Supabase auth user'ını appUser formatına çevirir
function mapUser(user) {
  if (!user) return null
  return {
    id:        user.id,
    email:     user.email,
    mailTeyit: !!user.email_confirmed_at,
    isim:      user.user_metadata?.first_name || user.email.split('@')[0],
    soyisim:   user.user_metadata?.last_name  || '-',
  }
}

export default ({ children }) => {


  const myTema_ = {
    renkler: {
      baslik1: "lightgray",
      baslik2: "rgb(250, 215, 160)",
      baslik2_ayrac: "#8a2424",
      hazirlananMetraj: "rgb(255,165,0,0.4)",
      editMetraj: "yellow",
      inaktifGri: "rgb(225,225,225)",
      inactiveGray: "rgb(225,225,225)",
      metrajOnaylananBaslik: "rgba(202, 240, 248, 1)"
    },
    firstColor: "#3c4245",
    secondColor: "rgba(85, 210, 221, 1)",
    thirdColor: "#719192",
    fouthColor: "#dfcdc3"
  }
  const [myTema, setMyTema] = useState(myTema_)


  const [isContext] = useState(true)
  const topBarHeight = "3.5rem"
  const subHeaderHeight = "3.5rem"
  const drawerWidth = 240


  const [custom, setCustom] = useState()
  const [appUser, setAppUser] = useState(null)

  // Supabase session: sayfa yüklenince mevcut oturumu al, değişimleri dinle
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAppUser(mapUser(session?.user ?? null))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAppUser(mapUser(session?.user ?? null))
    })
    return () => subscription.unsubscribe()
  }, [])
  const [Layout_Show, setLayout_Show] = useState("login")

  const [selectedLbs, setSelectedLbs] = useState()
  const [selectedMahal, setSelectedMahal] = useState()
  const [selectedMahalBaslik, setSelectedMahalBaslik] = useState()
  const [selectedWbs, setSelectedWbs] = useState()
  const [selectedIsPaket, setSelectedIsPaket] = useState()
  const [selectedIsPaketVersiyon, setSelectedIsPaketVersiyon] = useState()
  const [selectedButceVersiyon, setSelectedButceVersiyon] = useState()

  const [selectedPoz, setSelectedPoz] = useState()
  const [selectedPozBaslik, setSelectedPozBaslik] = useState()

  const [selectedMahal_metraj, setSelectedMahal_metraj] = useState()
  const [selectedMahal_mahalListesi, setSelectedMahal_mahalListesi] = useState()

  const [selectedMetrajVersiyon, setSelectedMetrajVersiyon] = useState()
  const [selectedBirimFiyatVersiyon, setSelectedBirimFiyatVersiyon] = useState()

  const [selectedNode, setSelectedNode] = useState()
  const [editNodeMetraj, setEditNodeMetraj] = useState()
  const [onayNodeMetraj, setOnayNodeMetraj] = useState()
  const [showNodeMetraj, setShowNodeMetraj] = useState()
  const [nodeMetrajlar, setNodeMetrajlar] = useState()

  const [metrajMode, setMetrajMode] = useState("prepare") // "prepare" | "approve"
  const [metrajViewMode, setMetrajViewMode] = useState("wbsPoz") // "pozOnly" | "wbsPoz"
  const [metrajMahalViewMode, setMetrajMahalViewMode] = useState("lbsMahal") // "lbsOnly" | "mahalOnly" | "lbsMahal"
  const [mode_birimFiyatEdit, setMode_birimFiyatEdit] = useState()
  const [mode_isPaketEdit, setMode_isPaketEdit] = useState()
  const [mode_butceEdit, setMode_butceEdit] = useState()
  const [detailMode, setDetailMode] = useState()

  // const [RealmApp, setRealmApp] = useState(Realm.getApp("rapor724_v2-cykom"))
  const [selectedFirma, setSelectedFirma] = useState()
  const [selectedProje, setSelectedProje] = useState()
  const [firmaProject, setFirmaProject] = useState()
  const [mahalListesi_wbsIds, setMahalListesi_wbsIds] = useState()
  const [mahalListesi_lbsIds, setMahalListesi_lbsIds] = useState()
  const [pozlar, setPozlar] = useState()
  const [mahalMetrajlar, setMahalMetrajlar] = useState()
  const [pozMahalMetrajlar, setPozMahalMetrajlar] = useState()
  const [mahaller, setMahaller] = useState()
  const [mahalListesi, setMahalListesi] = useState()
  const [projectNames, setProjectNames] = useState()

  // const [showMetrajYapabilenler, setShowMetrajYapabilenler] = useState(RealmApp?.currentUser?.customData.customSettings.showMetrajYapabilenler)
  const [showMetrajYapabilenler, setShowMetrajYapabilenler] = useState()


  const [pageMetraj_show, pageMetraj_setShow] = useState("Pozlar")

  const [kesifWizardRows, setKesifWizardRows] = useState({})
  const [kesifWizardName, setKesifWizardName] = useState("")
  const [kesifWizardAciklama, setKesifWizardAciklama] = useState("")
  const [kesifWizardIsPaketVersiyonNumber, setKesifWizardIsPaketVersiyonNumber] = useState(null)
  const [kesifWizardActiveIsPaketId, setKesifWizardActiveIsPaketId] = useState(null)

  const store = {
    custom, setCustom,

    appUser, setAppUser,
    Layout_Show, setLayout_Show,

    selectedLbs, setSelectedLbs,
    selectedMahal, setSelectedMahal,
    selectedMahalBaslik, setSelectedMahalBaslik,
    selectedWbs, setSelectedWbs,
    selectedIsPaket, setSelectedIsPaket,
    selectedIsPaketVersiyon, setSelectedIsPaketVersiyon,
    selectedButceVersiyon, setSelectedButceVersiyon,


    selectedPoz, setSelectedPoz,
    selectedPozBaslik, setSelectedPozBaslik,

    selectedMahal_metraj, setSelectedMahal_metraj,
    selectedMahal_mahalListesi, setSelectedMahal_mahalListesi,

    selectedMetrajVersiyon, setSelectedMetrajVersiyon,
    selectedBirimFiyatVersiyon, setSelectedBirimFiyatVersiyon,

    selectedNode, setSelectedNode,

    editNodeMetraj, setEditNodeMetraj,
    onayNodeMetraj, setOnayNodeMetraj,
    showNodeMetraj, setShowNodeMetraj,
    nodeMetrajlar, setNodeMetrajlar,

    metrajMode, setMetrajMode,
    metrajViewMode, setMetrajViewMode,
    metrajMahalViewMode, setMetrajMahalViewMode,
    mode_birimFiyatEdit, setMode_birimFiyatEdit,
    mode_isPaketEdit, setMode_isPaketEdit,
    mode_butceEdit, setMode_butceEdit,
    detailMode, setDetailMode,


    // RealmApp, setRealmApp,
    selectedFirma, setSelectedFirma,
    selectedProje, setSelectedProje,
    firmaProject, setFirmaProject,
    mahalListesi_wbsIds, setMahalListesi_wbsIds,
    mahalListesi_lbsIds, setMahalListesi_lbsIds,
    mahaller, setMahaller,
    pozlar, setPozlar,
    mahalMetrajlar, setMahalMetrajlar,
    projectNames, setProjectNames,
    subHeaderHeight,
    topBarHeight,
    drawerWidth,
    mahalListesi, setMahalListesi,
    isContext,
    myTema, setMyTema,

    pozMahalMetrajlar, setPozMahalMetrajlar,

    showMetrajYapabilenler, setShowMetrajYapabilenler,

    pageMetraj_show, pageMetraj_setShow,

    kesifWizardRows, setKesifWizardRows,
    kesifWizardName, setKesifWizardName,
    kesifWizardAciklama, setKesifWizardAciklama,
    kesifWizardIsPaketVersiyonNumber, setKesifWizardIsPaketVersiyonNumber,
    kesifWizardActiveIsPaketId, setKesifWizardActiveIsPaketId,
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}