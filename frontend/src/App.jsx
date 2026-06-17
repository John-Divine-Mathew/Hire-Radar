import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import SearchCandidatePage from "./pages/searchCandidate/searchCandidate.jsx";
import CandidateProfile from "./pages/candidateProfile/candidateProfile.jsx";
import Analytics from "./pages/Analytics/analytics.jsx";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import SavedCadidates from './pages/savedCandidates/savedCandidates.jsx';
import AssessmentForm from './pages/Assessment/AssessmentForm.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/searchCandidate' element={<SearchCandidatePage />} />
        <Route path='/candidateProfile' element={<CandidateProfile />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/savedCandidates' element={<SavedCadidates />} />
        <Route path='/assessmentform' element={<AssessmentForm />} />
      </Routes>
    </BrowserRouter>
    // <CandidateProfile />
    // <Analytics />
  );
}

export default App;