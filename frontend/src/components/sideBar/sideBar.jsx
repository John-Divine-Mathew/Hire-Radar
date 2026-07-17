import React from 'react';
import './sideBar.css';
import {House, Search, Bookmark, ChartSpline, ClipboardPen, CloudUpload} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Sidebar(){


    const nav = useNavigate();
    const navigateDashboard = ()=>{
        nav('/dashboard');
    }
    const navigateSearchCandidate = ()=>{
        nav('/searchCandidate');
    }
    const navigateReport = ()=>{
        nav('/report');
    }
    const navigateSavedCandidates = ()=>{
        nav('/savedCandidates');
    }
    const navigateAdminAssessment = ()=>{
        nav('/admin-assessment');
    }
    const navigateImportDrive = ()=>{
        nav('/import-drive');
    }
    const navigateManagerRequest = ()=>{
        nav('/manager-request');
    }
    const navigateDashboard_v2 = ()=>{
        nav('/dashboard_v2');
    }


    const iconSize = 22;
    return(
        <div className='sidebar'>
            <div className='sidebarPanel'>
                <ul className="sidebarlist">
                    <li><button className='listitem' onClick={navigateDashboard} title="Dashboard" aria-label="Dashboard"><House size={iconSize} /><p className='buttonP'>Dashboard</p></button></li>
                    <li><button className='listitem' onClick={navigateDashboard_v2} title="Dashboard v2" aria-label="Dashboard v2"><House size={iconSize} /><p className='buttonP'>Dashboard v2</p></button></li>
                    <li><button className='listitem' onClick={navigateSearchCandidate} title="Search Candidate" aria-label="Search Candidate"><Search size={iconSize} /><p className='buttonP'>Search Candidate</p></button></li>
                    <li><button className='listitem' onClick={navigateSavedCandidates} title="Saved Candidates" aria-label="Saved Candidates"><Bookmark size={iconSize} /><p className='buttonP'>Saved Candidates</p></button></li>
                    <li><button className='listitem' onClick={navigateAdminAssessment} title="Assessment" aria-label="Assessment"><ClipboardPen size={iconSize} /><p className='buttonP'>Assessment</p></button></li>
                    <li><button className='listitem' onClick={navigateImportDrive} title="Import Drive" aria-label="Import Drive"><CloudUpload size={iconSize} /><p className='buttonP'>Import Drive</p></button></li>
                    <li><button className='listitem' onClick={navigateReport} title="Report" aria-label="Report"><ChartSpline size={iconSize} /><p className='buttonP'>Report</p></button></li>
                    <li><button className='listitem' onClick={navigateManagerRequest} title="Manager Request" aria-label="Manager Request"><ClipboardPen size={iconSize} /><p className='buttonP'>Manager Request</p></button></li>
                </ul>
            </div>
            </div>
    );
}

export default Sidebar;
