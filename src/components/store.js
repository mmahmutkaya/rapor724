import { createContext, useState } from 'react'
import { useApp } from "./useApp.js";

export const StoreContext = createContext(null)

export default ({ children }) => {
  
  const RealmApp = useApp();

  // const teamMembersNames = ['John', 'Mary', 'Jason', 'David']

  // const [sharing, setSharing] = useState([])
  // const [help, setHelp] = useState([])

  
  const myTema_ = {
    firstColor: "#3c4245",
    secondColor: "#5f6769",
    thirdColor:"#719192",
    fouthColor:"#dfcdc3"
  }
  const [myTema, setMyTema] = useState(myTema_)
  

  const [isContext] = useState(true)
  const topBarHeight = "3.5rem"
  const subHeaderHeight = "3.5rem"
  const drawerWidth = 240
  
  
  const [custom, setCustom] = useState()
  const [selectedLbs, setSelectedLbs] = useState()
  const [selectedWbs, setSelectedWbs] = useState()
  const [selectedPoz, setSelectedPoz] = useState()
  const [selectedMahal, setSelectedMahal] = useState()
  const [selectedMahalBaslik, setSelectedMahalBaslik] = useState()
  const [selectedPozBaslik, setSelectedPozBaslik] = useState()
  const [isProject, setIsProject] = useState()
  const [pozlar, setPozlar] = useState()
  const [mahalMetrajlar, setMahalMetrajlar] = useState()
  const [pozMahalMetrajlar, setPozMahalMetrajlar] = useState()
  const [mahaller, setMahaller] = useState()
  const [mahalListesi, setMahalListesi] = useState()
  const [projectNames, setProjectNames] = useState()

  const store = {
    projectNames, setProjectNames,
    subHeaderHeight,
    topBarHeight,
    drawerWidth,
    selectedLbs, setSelectedLbs,
    selectedMahal, setSelectedMahal,
    selectedMahalBaslik, setSelectedMahalBaslik,
    selectedPozBaslik, setSelectedPozBaslik,
    selectedWbs, setSelectedWbs,
    selectedPoz, setSelectedPoz,
    isProject, setIsProject,
    pozlar, setPozlar,
    mahaller, setMahaller,
    mahalMetrajlar, setMahalMetrajlar,
    pozMahalMetrajlar, setPozMahalMetrajlar,
    mahalListesi, setMahalListesi,
    isContext,
    custom, setCustom,
    myTema, setMyTema
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}