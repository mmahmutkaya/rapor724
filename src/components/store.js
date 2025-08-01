import { createContext, useState } from 'react'
// import { useApp } from "./useApp.js";
import * as Realm from "realm-web";

export const StoreContext = createContext(null)

export default ({ children }) => {

  // const RealmApp = useApp();

  // const teamMembersNames = ['John', 'Mary', 'Jason', 'David']

  // const [sharing, setSharing] = useState([])
  // const [help, setHelp] = useState([])


  const myTema_ = {
    renkler: {
      baslik1: "lightgray",
      baslik2: "rgb(250, 215, 160)",
      baslik2_ayrac: "#8a2424",
      hazirlananMetraj: "rgb(255,165,0,0.4)",
      editMetraj: "yellow",
      inaktifGri: "rgb(225,225,225)",
      inactiveGray: "rgb(225,225,225)",
      metrajOnaylananBaslik:"rgba(202, 240, 248, 1)"
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
  const [Layout_Show, setLayout_Show] = useState("login")

  const [selectedLbs, setSelectedLbs] = useState()
  const [selectedMahal, setSelectedMahal] = useState()
  const [selectedMahalBaslik, setSelectedMahalBaslik] = useState()
  const [selectedWbs, setSelectedWbs] = useState()

  const [selectedPoz, setSelectedPoz] = useState()
  const [selectedPoz_metraj, setSelectedPoz_metraj] = useState()
  const [selectedPoz_mahalListesi, setSelectedPoz_mahalListesi] = useState()
  const [selectedPozBaslik, setSelectedPozBaslik] = useState()

  const [selectedMahal_metraj, setSelectedMahal_metraj] = useState()
  const [selectedMahal_mahalListesi, setSelectedMahal_mahalListesi] = useState()

  const [selectedNode, setSelectedNode] = useState()
  const [selectedNode_metraj, setSelectedNode_metraj] = useState()
  const [editNodeMetraj, setEditNodeMetraj] = useState()
  const [onayNodeMetraj, setOnayNodeMetraj] = useState()
  const [showNodeMetraj, setShowNodeMetraj] = useState()
  const [nodeMetrajlar, setNodeMetrajlar] = useState()
  
  const [detailMode, setDetailMode] = useState()

  const [RealmApp, setRealmApp] = useState(Realm.getApp("rapor724_v2-cykom"))
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

  const [showMetrajYapabilenler, setShowMetrajYapabilenler] = useState(Realm.getApp("rapor724_v2-cykom").currentUser.customData.customSettings.showMetrajYapabilenler)


  const [pageMetraj_show, pageMetraj_setShow] = useState("Pozlar")

  const store = {
    custom, setCustom,

    Layout_Show, setLayout_Show,

    selectedLbs, setSelectedLbs,
    selectedMahal, setSelectedMahal,
    selectedMahalBaslik, setSelectedMahalBaslik,
    selectedWbs, setSelectedWbs,

    selectedPoz, setSelectedPoz,
    selectedPoz_metraj, setSelectedPoz_metraj,
    selectedPoz_mahalListesi, setSelectedPoz_mahalListesi,
    selectedPozBaslik, setSelectedPozBaslik,

    selectedMahal_metraj, setSelectedMahal_metraj,
    selectedMahal_mahalListesi, setSelectedMahal_mahalListesi,

    selectedNode, setSelectedNode,
    selectedNode_metraj, setSelectedNode_metraj,

    editNodeMetraj, setEditNodeMetraj,
    onayNodeMetraj, setOnayNodeMetraj,
    showNodeMetraj, setShowNodeMetraj,
    nodeMetrajlar, setNodeMetrajlar,
    detailMode, setDetailMode,


    RealmApp, setRealmApp,
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

    pageMetraj_show, pageMetraj_setShow
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}