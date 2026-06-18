import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import SearchCandidatePage from "./pages/searchCandidate/searchCandidate.jsx";
import CandidateProfile from "./pages/candidateProfile/candidateProfile.jsx";
import Analytics from "./pages/Analytics/analytics.jsx";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import SavedCadidates from './pages/savedCandidates/savedCandidates.jsx';
import AssessmentForm from './pages/Assessment/AssessmentForm.jsx';
import AssessmentTest from "./pages/Assessment/AssessmentTest";
import AdminAssessment from './pages/Assessment/AdminAssessment.jsx';
import AdminLogin from "./pages/AdminLogin";
import { Router } from 'lucide-react';
import AdminUser from './pages/AdminUser.jsx';

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
        <Route path="/assessment-test" element={<AssessmentTest />} />
        <Route path="/admin-assessment" element={<AdminAssessment />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-user" element={<AdminUser />} />
        
      </Routes>
    </BrowserRouter>
    // <CandidateProfile />
    // <Analytics />
  );
}

export default App;