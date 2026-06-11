import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import SearchCandidatePage from "./pages/searchCandidate/searchCandidate.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/searchCandidate' element={<SearchCandidatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;