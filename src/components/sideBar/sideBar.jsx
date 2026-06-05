import './sideBar.css';
import {House, Atom, Search, Bookmark, ChartSpline, History, MessageSquareMore, Settings, LogOut} from 'lucide-react';

function Sidebar(){

    const iconSize = 40;
    return(
        <div className='sidebar'>
                <ul className="sidebartitle">
                    <li><button className='listitem'><Atom size={55}/><p className='headingP'>Hire Radar</p></button></li>
                </ul>
                <ul className="sidebarlist">
                    <li><button className='listitem'><House size={iconSize} /><p>Dashboard</p></button></li>
                    <li><button className='listitem'><Search size={iconSize} /><p>Search Candidates</p></button></li>
                    <li><button className='listitem'><Bookmark size={iconSize} /><p>Saved Candidates</p></button></li>
                    <li><button className='listitem'><ChartSpline size={iconSize} /><p>Analytics</p></button></li>
                    <li><button className='listitem'><History size={iconSize} /><p>Search History</p></button></li>
                    <li><button className='listitem'><MessageSquareMore size={iconSize} /><p>Messages</p></button></li>
                    <li><button className='listitem'><Settings size={iconSize} /><p>Settings</p></button></li>
                    <li><button className='listitem'><LogOut size={iconSize} /><p>Logout</p></button></li>
                </ul>
        </div>
    );
}

export default Sidebar;