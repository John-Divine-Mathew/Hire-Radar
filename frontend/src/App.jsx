import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import SearchCandidatePage from "./pages/searchCandidate.jsx";
import CandidateProfile from "./pages/candidateProfile.jsx";
import Analytics from "./pages/analytics.jsx";
import Report from "./pages/Report.jsx";
import Dashboard from "./pages/dashboard.jsx";
import SavedCadidates from './pages/savedCandidates.jsx';
import AssessmentForm from './pages/Assessment/AssessmentForm.jsx';
import AssessmentTest from "./pages/Assessment/AssessmentTest";
import AdminAssessment from './pages/Assessment/AdminAssessment.jsx';
import QuestionBank from "./pages/QuestionBank.jsx";
import AdminLogin from "./pages/AdminLogin";
import AdminUser from './pages/AdminUser.jsx';
import ImportDrive from './pages/ImportDrive.jsx';
import Dashboard_v2 from './pages/dashboard_v2.jsx';

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
        <Route path='/report' element={<Report />} />
        <Route path='/savedCandidates' element={<SavedCadidates />} />
        <Route path='/assessmentform' element={<AssessmentForm />} />
        <Route path="/assessment-test" element={<AssessmentTest />} />
        <Route path="/admin-assessment" element={<AdminAssessment />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-user" element={<AdminUser />} />
        <Route path="/import-drive" element={<ImportDrive />} />
        <Route path="/dashboard_v2" element={<Dashboard_v2 />} />
        
        
      </Routes>
    </BrowserRouter>
    // <CandidateProfile />
    // <Analytics />
  );
}

export default App;