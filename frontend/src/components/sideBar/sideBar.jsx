import React, { useState } from 'react';
import './sideBar.css';
import { createPortal } from 'react-dom';
import {House, Search, Bookmark, ChartSpline, LogOut, ClipboardPen} from 'lucide-react';
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

    const iconSize = 22;
    return(
        <div className='sidebar'>
            <div className='sidebarPanel'>
                <ul className="sidebarlist">
                    <li><button className='listitem' onClick={navigateDashboard} title="Dashboard" aria-label="Dashboard"><House size={iconSize} /><p className='buttonP'>Dashboard</p></button></li>
                    <li><button className='listitem' onClick={navigateSearchCandidate} title="Search Candidate" aria-label="Search Candidate"><Search size={iconSize} /><p className='buttonP'>Search Candidate</p></button></li>
                    <li><button className='listitem' onClick={navigateSavedCandidates} title="Saved Candidates" aria-label="Saved Candidates"><Bookmark size={iconSize} /><p className='buttonP'>Saved Candidates</p></button></li>
                    <li><button className='listitem' onClick={navigateAnalytics} title="Analytics" aria-label="Analytics"><ChartSpline size={iconSize} /><p className='buttonP'>Analytics</p></button></li>
                    <li><button className='listitem' onClick={navigateAdminAssessment} title="Assessment" aria-label="Assessment"><ClipboardPen size={iconSize} /><p className='buttonP'>Assessment</p></button></li>
                    <li><button className='listitem' onClick={handleLogoutClick} title="Logout" aria-label="Logout"><LogOut size={iconSize} /><p className='buttonP'>Logout</p></button></li>
                </ul>
            </div>

                {showLogoutModal && createPortal(
                    <div className='logout-modal-overlay' role="dialog" aria-modal="true">
                        <div className='logout-modal-content'>
                            <h2>Confirm Logout</h2>
                            <p>Are you confirm to logout</p>
                            <div className='logout-modal-actions'>
                                <button className='logout-button confirm' onClick={confirmLogout}>Yes, Logout</button>
                                <button className='logout-button cancel' onClick={cancelLogout}>Cancel</button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
    );
}

export default Sidebar;
