import './sideBar.css';
import {House, Atom, Search, Bookmark, ChartSpline, MessageSquareMore, LogOut, ClipboardPen} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../utils/auth';

function Sidebar(){

    const nav = useNavigate();
    const navigateDashboard = ()=>{
        nav('/dashboard');
    }
    const navigateSearchCandidate = ()=>{
        nav('/searchCandidate');
    }
    const navigateAnalytics = ()=>{
        nav('/analytics');
    }
    const navigateSavedCandidates = ()=>{
        nav('/savedCandidates');
    }
    const navigateAdminAssessment = ()=>{
        nav('/admin-assessment');
    }
    const handleLogout = () => {
        logoutUser();
        nav('/');
    }

    const iconSize = 30;
    return(
        <div className='sidebar'>
                <ul className="sidebartitle">
                    <li className='brandTitle'><Atom size={50}/><p className='headingP'>Hire Radar</p></li>
                </ul>
                <ul className="sidebarlist">
                    <li><button className='listitem' onClick={navigateDashboard}><House size={iconSize} /><p className='buttonP'>Dashboard</p></button></li>
                    <li><button className='listitem' onClick={navigateSearchCandidate}><Search size={iconSize} /><p className='buttonP'>Search Candidate</p></button></li>
                    <li><button className='listitem' onClick={navigateSavedCandidates}><Bookmark size={iconSize} /><p className='buttonP'>Saved Candidates</p></button></li>
                    <li><button className='listitem' onClick={navigateAnalytics}><ChartSpline size={iconSize} /><p className='buttonP'>Analytics</p></button></li>
                    <li><button className='listitem' onClick={navigateAdminAssessment}><ClipboardPen size={iconSize} /><p className='buttonP'>Assessment</p></button></li>
                    <li><button className='listitem' onClick={handleLogout}><LogOut size={iconSize} /><p className='buttonP'>Logout</p></button></li>
                </ul>
        </div>
    );
}

export default Sidebar;