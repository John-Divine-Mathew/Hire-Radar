import Sidebar from "../../components/sideBar/sideBar";
import { FunnelPlus, FunnelX, Eye, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import './savedCandidates.css';
import { format } from 'date-fns';

function SavedCandidates(){
    const [candidates, setCandidates] = useState([]);

    const getListData = async() => {
        try {
            const response = await fetch("http://localhost:5000/hireRadar/cndpermsave");
            const jsonData = await response.json();
            setCandidates(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getListData();
    }, []);

    return(
        <div className='mainDiv'>
            <Sidebar />
            <div className='mainpage'>
                <div className='scSearchBarContainer'>
                    <div className='scSearchBar'>
                        <h2>Saved Candidates</h2>
                        <input type="text" placeholder="Search saved candidates..." className='Input'/>
                    </div>
                    <button className='scFilterButton'><FunnelPlus size={25}/><p>Filter</p></button>
                </div>
                <div className='tableContainer'>
                    <table className='candidatesTable'>
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Role</th>
                                <th>Experience</th>
                                <th>Match Score</th>
                                <th>Saved On</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((candidate) => (
                                <tr key={candidate.cndid} className='candidateRow'>
                                    <td className='candidateCell'>
                                        <div className='candidateInfo'>
                                            <img src={candidate.cndphoto} alt={candidate.cndname} className='candidatePhoto'/>
                                            <div className='candidateDetails'>
                                                <p className='candidateName'>{candidate.cndname}</p>
                                                <p className='candidateLocation'>{candidate.cndlocation}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{candidate.cndrole}</td>
                                    <td>{candidate.cndexperience}</td>
                                    <td className='matchScore'>{candidate.matchScore || '80%'}</td>
                                    <td>{candidate.searchDate || format(new Date(), 'dd/MM/yyyy')}</td>
                                    <td className='actionCell'>
                                        <Eye size={20} className='actionIcon'/>
                                        <MoreVertical size={20} className='actionIcon'/>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='pagination'>
                    <p>Showing 1 to {candidates.length} of {candidates.length} results</p>
                </div>
            </div>
        </div>
    );
}

export default SavedCandidates;