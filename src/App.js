import './App.css';
// import { StoreContext } from './components/store'
// import { Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import { Routes, Route} from 'react-router-dom';
import Home from './pages'
import P_Companies from './pages/companies'
import P_Projects from './pages/projects'
import P_Dashboard from './pages/dashboard'
import P_Wbs from './pages/wbs'
import P_Pozlar from './pages/pozlar'
import P_Lbs from './pages/lbs'
import P_Mahaller from './pages/mahaller'
import P_MahalListesi from './pages/mahallistesi'
import P_Metraj from './pages/metraj'
import P_MetrajEdit from './pages/metrajedit'
import P_Raporlar from './pages/raporlar'


function App() {

  // const { isProject } = useContext(StoreContext)

  // const navigate = useNavigate()

  // if(!isProject) 
  
  return (
    <Routes>
      <Route path='/' element={<Home />} />

      <Route path='/projects' element={<P_Projects />} />
      <Route path='/people' element={<div> Kişiler  </div>} />
      {/* <Route path='/companies' element={<div> Firmalar  </div>} /> */}

      {/* projects */}
      <Route path='/companies' element={<P_Companies />} />
      <Route path='/dashboard' element={<P_Dashboard />} />
      <Route path='/wbs' element={<P_Wbs />} />
      <Route path='/pozlar' element={<P_Pozlar />} />
      <Route path='/lbs' element={<P_Lbs />} />
      <Route path='/mahaller' element={<P_Mahaller />} />
      <Route path='/mahallistesi' element={<P_MahalListesi />} />
      <Route path='/metraj' element={<P_Metraj />} />
      <Route path='/metrajedit' element={<P_MetrajEdit />} />
      <Route path='/raporlar' element={<P_Raporlar />} />

    </Routes>
  );
}

export default App;
