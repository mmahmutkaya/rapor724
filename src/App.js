import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages'


function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/projects' element={<div> Projeler  </div>} />
      <Route path='/people' element={<div> Kişiler  </div>} />
      <Route path='/companies' element={<div> Firmalar  </div>} />
    </Routes>
  );
}

export default App;
