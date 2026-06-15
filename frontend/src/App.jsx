import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import SearchCandidatePage from "./pages/searchCandidate/searchCandidate.jsx";
import CandidateProfile from "./pages/candidateProfile/candidateProfile.jsx";
import Analytics from "./pages/Analytics/analytics.jsx";
import Assessment from "./pages/Assessment/Assessment.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/searchCandidate' element={<SearchCandidatePage />} />
        <Route path='/candidateProfile' element={<CandidateProfile />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/assessment' element={<Assessment />} />
      </Routes>
    </BrowserRouter>
    // <CandidateProfile />
    // <Analytics />
  );
}

export default App;