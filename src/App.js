import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages'

import P_Firmalar from './pages/firmalar'
import P_Projeler from './pages/projeler'

import P_Pozlar from './pages/pozlar'
import P_Mahaller from './pages/mahaller'
import P_ProjeAyarlari from './pages/projeayarlari'

import P_MetrajOlustur from './pages/metrajolustur'
import P_MetrajOlusturPozlar from './pages/metrajolusturpozlar'
import P_MetrajOlusturPozMahaller from './pages/metrajolusturpozmahaller'
import P_MetrajOlusturCetvel from './pages/metrajolusturcetvel'

import P_MetrajOnaylaPozlar from './pages/metrajonaylapozlar'
import P_MetrajOnaylaPozMahaller from './pages/metrajonaylapozmahaller'
import P_MetrajOnayla from './pages/metrajonayla'
import P_MetrajOnaylaCetvel from './pages/metrajonaylacetvel'

import P_IsPaketler from './pages/ispaketler'
import P_isPaketPozlar from './pages/ispaketpozlar'
import P_isPaketPozMahaller from './pages/ispaketpozmahaller'
import P_KesifButce from './pages/butce'


function App() {

  return (
    <Routes>
      <Route path='/' element={<Home />} />

      <Route path='/firmalar' element={<P_Firmalar />} />
      <Route path='/projeler' element={<P_Projeler />} />

      <Route path='/pozlar' element={<P_Pozlar />} />
      <Route path='/mahaller' element={<P_Mahaller />} />
      <Route path='/proje-ayarlari' element={<P_ProjeAyarlari />} />

      <Route path='/metrajolustur' element={<P_MetrajOlustur />} />
      <Route path='/metrajolusturpozlar' element={<P_MetrajOlusturPozlar />} />
      <Route path='/metrajolusturpozmahaller' element={<P_MetrajOlusturPozMahaller />} />
      <Route path='/metrajolusturcetvel' element={<P_MetrajOlusturCetvel />} />

      <Route path='/metrajonaylapozlar' element={<P_MetrajOnaylaPozlar />} />
      <Route path='/metrajonaylapozmahaller' element={<P_MetrajOnaylaPozMahaller />} />
      <Route path='/metrajonayla' element={<P_MetrajOnayla />} />
      <Route path='/metrajonaylacetvel' element={<P_MetrajOnaylaCetvel />} />

      <Route path='/ispaketler' element={<P_IsPaketler />} />
      <Route path='/ispaketpozlar' element={<P_isPaketPozlar />} />
      <Route path='/ispaketpozmahaller' element={<P_isPaketPozMahaller />} />
      <Route path='/butce' element={<P_KesifButce />} />

    </Routes>
  );
}

export default App;
