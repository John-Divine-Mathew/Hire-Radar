import './sideBar.css';
import {House, Atom, Search, Bookmark, ChartSpline, History, MessageSquareMore, Settings, LogOut, ClipboardPen} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Sidebar(){

    const nav = useNavigate();
    const navigateHome = ()=>{
        nav('/home');
    }
    const navigateSearchCandidate = ()=>{
        nav('/searchCandidate');
    }

    const iconSize = 30;
    return(
        <div className='sidebar'>
                <ul className="sidebartitle">
                    <li><button className='listitem' onClick={navigateHome}><Atom size={50}/><p className='headingP'>Hire Radar</p></button></li>
                </ul>
                <ul className="sidebarlist">
                    <li><button className='listitem'><House size={iconSize} /><p className='buttonP'>Dashboard</p></button></li>
                    <li><button className='listitem' onClick={navigateSearchCandidate}><Search size={iconSize} /><p className='buttonP'>Search Candidate</p></button></li>
                    <li><button className='listitem'><Bookmark size={iconSize} /><p className='buttonP'>Saved Candidates</p></button></li>
                    <li><button className='listitem'><ChartSpline size={iconSize} /><p className='buttonP'>Analytics</p></button></li>
                    <li><button className='listitem'><History size={iconSize} /><p className='buttonP'>Search History</p></button></li>
                    <li><button className='listitem'><ClipboardPen size={iconSize} /><p className='buttonP'>Assessment</p></button></li>
                    <li><button className='listitem'><MessageSquareMore size={iconSize} /><p className='buttonP'>Messages</p></button></li>
                    <li><button className='listitem'><Settings size={iconSize} /><p className='buttonP'>Settings</p></button></li>
                    <li><button className='listitem'><LogOut size={iconSize} /><p className='buttonP'>Logout</p></button></li>
                </ul>
        </div>
    );
}

export default Sidebar;