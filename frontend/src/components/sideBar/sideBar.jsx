import React, { useState } from 'react';
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

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    }

    const confirmLogout = () => {
        logoutUser();
        setShowLogoutModal(false);
        nav('/');
    }

    const cancelLogout = () => {
        setShowLogoutModal(false);
    }

    const iconSize = 30;
    return(
        <div className='sidebar'>
                <ul className="sidebartitle">
                    <li className='brandTitle'>
                        <img src="/hirotec-logo.webp" alt="Hirotec Logo" className='sidebarLogo' />
                        <p className='headingP'>Hire Radar</p>
                    </li>
                </ul>
                <ul className="sidebarlist">
                    <li><button className='listitem' onClick={navigateDashboard}><House size={iconSize} /><p className='buttonP'>Dashboard</p></button></li>
                    <li><button className='listitem' onClick={navigateSearchCandidate}><Search size={iconSize} /><p className='buttonP'>Search Candidate</p></button></li>
                    <li><button className='listitem' onClick={navigateSavedCandidates}><Bookmark size={iconSize} /><p className='buttonP'>Saved Candidates</p></button></li>
                    <li><button className='listitem' onClick={navigateAnalytics}><ChartSpline size={iconSize} /><p className='buttonP'>Analytics</p></button></li>
                    <li><button className='listitem' onClick={navigateAdminAssessment}><ClipboardPen size={iconSize} /><p className='buttonP'>Assessment</p></button></li>
                    <li><button className='listitem' onClick={handleLogoutClick}><LogOut size={iconSize} /><p className='buttonP'>Logout</p></button></li>
                </ul>

                {showLogoutModal && (
                    <div className='logout-modal-overlay'>
                        <div className='logout-modal-content'>
                            <h2>Confirm Logout</h2>
                            <p>Are you confirm to logout</p>
                            <div className='logout-modal-actions'>
                                <button className='logout-button confirm' onClick={confirmLogout}>Yes, Logout</button>
                                <button className='logout-button cancel' onClick={cancelLogout}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

export default Sidebar;