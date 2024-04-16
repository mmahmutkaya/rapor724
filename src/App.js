import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages'
import P_Companies from './pages/companies'
import P_Projects from './pages/projects'
import P_Dashboard from './pages/dashboard'
import P_Wbs from './pages/wbs'
import P_Pozlar from './pages/pozlar'


function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/companies' element={<P_Companies />} />
      <Route path='/projects' element={<P_Projects />} />
      <Route path='/dashboard' element={<P_Dashboard />} />
      <Route path='/wbs' element={<P_Wbs />} />
      <Route path='/pozlar' element={<P_Pozlar />} />

      <Route path='/projects' element={<P_Projects />} />
      <Route path='/people' element={<div> Kişiler  </div>} />
      <Route path='/companies' element={<div> Firmalar  </div>} />
    </Routes>
  );
}

export default App;
