import './App.css';
// import { StoreContext } from './components/store'
// import { Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import { Routes, Route} from 'react-router-dom';
import Home from './pages'

import P_Firmalar from './pages/firmalar'

import P_Projects from './pages/projects'
import P_Projeler from './pages/projeler'
import P_FirmaPozlari from './pages/firmapozlari'
import P_FirmaWbs from './pages/firmawbs'
import P_FirmaKadrosu from './pages/firmakadrosu'

import P_Dashboard from './pages/dashboard'
import P_Wbs from './pages/wbs'
import P_PozHavuzu from './pages/pozhavuzu'
import P_Pozlar from './pages/pozlar'
import P_Lbs from './pages/lbs'
import P_Mahaller from './pages/mahaller'

import P_MahalListesiPozlar from './pages/mahallistesipozlar'
import P_MahalListesiPozMahaller from './pages/mahallistesipozmahaller'


import P_MahalMetraj from './pages/mahalmetraj'
import P_KisilerProject from './pages/kisilerproject'
import P_Raporlar from './pages/raporlar'

import P_MetrajOlusturPozlar from './pages/metrajolusturpozlar'
import P_MetrajOlusturPozMahaller from './pages/metrajolusturpozmahaller'
import P_MetrajOlusturCetvel from './pages/metrajolusturcetvel'

import P_MetrajOnaylaPozlar from './pages/metrajonaylapozlar'
import P_MetrajOnaylaPozMahaller from './pages/metrajonaylapozmahaller'
import P_MetrajOnayla from './pages/metrajonayla'
import P_MetrajOnaylaCetvel from './pages/metrajonaylacetvel'

import P_MetrajPozlar from './pages/metrajpozlar'
import P_MetrajPozMahaller from './pages/metrajpozmahaller'

import P_MetrajEdit from './pages/metrajedit'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Home />} />

      <Route path='/firmalar' element={<P_Firmalar/>} />
      <Route path='/projeler' element={<P_Projeler/>} />

      <Route path='/projects' element={<P_Projects />} />
      <Route path='/firmawbs' element={<P_FirmaWbs />} />
      <Route path='/firmapozlari' element={<P_FirmaPozlari />} />
      <Route path='/firmakadrosu' element={<P_FirmaKadrosu />} />

      {/* projects */}
      <Route path='/dashboard' element={<P_Dashboard />} />
      <Route path='/wbs' element={<P_Wbs />} />
      <Route path='/pozhavuzu' element={<P_PozHavuzu />} />
      <Route path='/pozlar' element={<P_Pozlar />} />
      <Route path='/lbs' element={<P_Lbs />} />
      <Route path='/mahaller' element={<P_Mahaller />} />

      <Route path='/mahallistesipozlar' element={<P_MahalListesiPozlar />} />
      <Route path='/mahallistesipozmahaller' element={<P_MahalListesiPozMahaller />} />

      <Route path='/mahalmetraj' element={<P_MahalMetraj />} />
      <Route path='/kisilerproject' element={<P_KisilerProject />} />
      <Route path='/raporlar' element={<P_Raporlar />} />

      <Route path='/metrajpozlar' element={<P_MetrajPozlar />} />
      <Route path='/metrajpozmahaller' element={<P_MetrajPozMahaller />} />

      <Route path='/metrajolusturpozlar' element={<P_MetrajOlusturPozlar />} />
      <Route path='/metrajolusturpozmahaller' element={<P_MetrajOlusturPozMahaller />} />
      <Route path='/metrajolusturcetvel' element={<P_MetrajOlusturCetvel />} />

      <Route path='/metrajonaylapozlar' element={<P_MetrajOnaylaPozlar />} />
      <Route path='/metrajonaylapozmahaller' element={<P_MetrajOnaylaPozMahaller />} />
      <Route path='/metrajonayla' element={<P_MetrajOnayla />} />
      <Route path='/metrajonaylacetvel' element={<P_MetrajOnaylaCetvel />} />
      
      <Route path='/metrajedit' element={<P_MetrajEdit />} />

    </Routes>
  );
}

export default App;
