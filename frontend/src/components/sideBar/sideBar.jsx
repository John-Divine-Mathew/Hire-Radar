import './sideBar.css';
import {House, Atom, Search, Bookmark, ChartSpline, MessageSquareMore, Settings, LogOut, ClipboardPen} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Sidebar(){

    const nav = useNavigate();
    const navigateHome = ()=>{
        nav('/home');
    }
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

    const iconSize = 30;
    return(
        <div className='sidebar'>
                <ul className="sidebartitle">
                    <li><button className='listitem' onClick={navigateHome}><Atom size={50}/><p className='headingP'>Hire Radar</p></button></li>
                </ul>
                <ul className="sidebarlist">
                    <li><button className='listitem' onClick={navigateDashboard}><House size={iconSize} /><p className='buttonP'>Dashboard</p></button></li>
                    <li><button className='listitem' onClick={navigateSearchCandidate}><Search size={iconSize} /><p className='buttonP'>Search Candidate</p></button></li>
                    <li><button className='listitem' onClick={navigateSavedCandidates}><Bookmark size={iconSize} /><p className='buttonP'>Saved Candidates</p></button></li>
                    <li><button className='listitem' onClick={navigateAnalytics}><ChartSpline size={iconSize} /><p className='buttonP'>Analytics</p></button></li>
                    <li><button className='listitem'><ClipboardPen size={iconSize} /><p className='buttonP'>Assessment</p></button></li>
                    <li><button className='listitem'><MessageSquareMore size={iconSize} /><p className='buttonP'>Messages</p></button></li>
                    <li><button className='listitem'><Settings size={iconSize} /><p className='buttonP'>Settings</p></button></li>
                    <li><button className='listitem'><LogOut size={iconSize} /><p className='buttonP'>Logout</p></button></li>
                </ul>
        </div>
    );
}

export default Sidebar;