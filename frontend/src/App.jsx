import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import SearchCandidatePage from "./pages/searchCandidate/searchCandidate.jsx";
import CandidateProfile from "./pages/candidateProfile/candidateProfile.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/searchCandidate' element={<SearchCandidatePage />} />
        <Route path='/candidateProfile' element={<CandidateProfile />} />
      </Routes>
    </BrowserRouter>
    // <ProfileOverview />
  );
}

export default App;