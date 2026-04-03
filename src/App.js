import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages'

import P_Firmalar from './pages/firmalar'
import P_FirmaAyarlari from './pages/firmaayarlari'
import P_Projeler from './pages/projeler'

import P_Wbs from './pages/wbs'
import P_Pozlar from './pages/pozlar'
import P_Mahaller from './pages/mahaller'
import P_ProjeAyarlari from './pages/projeayarlari'

import P_Metraj from './pages/metraj'
import P_MetrajPozlar from './pages/metrajpozlar'
import P_MetrajPozMahaller from './pages/metrajpozmahaller'
import P_MetrajCetvel from './pages/metrajcetvel'

import P_IsPaketler from './pages/ispaketler'
import P_isPaketPozlar from './pages/ispaketpozlar'
import P_isPaketPozMahaller from './pages/ispaketpozmahaller'
import P_KesifButce from './pages/butce'
import P_Ihale from './pages/ihale'
import P_IhalePozlar from './pages/ihalepozlar'
import P_Ekip from './pages/ekip'
import P_FirmaKadro from './pages/firmakadro'
import P_FirmaYetki from './pages/firmayetki'
import P_Davet from './pages/davet'


function App() {

  return (
    <Routes>
      <Route path='/' element={<Home />} />

      <Route path='/firmalar' element={<P_Firmalar />} />
      <Route path='/firma-ayarlari' element={<P_FirmaAyarlari />} />
      <Route path='/projeler' element={<P_Projeler />} />

      <Route path='/wbs' element={<P_Wbs />} />
      <Route path='/pozlar' element={<P_Pozlar />} />
      <Route path='/mahaller' element={<P_Mahaller />} />
      <Route path='/proje-ayarlari' element={<P_ProjeAyarlari />} />

      <Route path='/metraj' element={<P_Metraj />} />
      <Route path='/metraj/pozlar' element={<P_MetrajPozlar />} />
      <Route path='/metraj/pozlar/:pozId/mahaller' element={<P_MetrajPozMahaller />} />
      <Route path='/metraj/cetvel' element={<P_MetrajCetvel />} />

      <Route path='/ispaketler' element={<P_IsPaketler />} />
      <Route path='/ispaketpozlar' element={<P_isPaketPozlar />} />
      <Route path='/ispaketpozmahaller' element={<P_isPaketPozMahaller />} />
      <Route path='/butce' element={<P_KesifButce />} />
      <Route path='/ihale' element={<P_Ihale />} />
      <Route path='/ihale/pozlar' element={<P_IhalePozlar />} />
      <Route path='/ekip' element={<P_Ekip />} />
      <Route path='/firma-kadro' element={<P_FirmaKadro />} />
      <Route path='/firma-yetki' element={<P_FirmaYetki />} />
      <Route path='/davet' element={<P_Davet />} />

    </Routes>
  );
}

export default App;
