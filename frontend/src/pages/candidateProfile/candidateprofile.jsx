import Sidebar from '../../components/sideBar/sideBar.jsx';
import '../../App.css';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation  } from 'react-router-dom';
import './candidateProfile.css'

function CandidateProfile(){
    const nav = useNavigate();
    const loc = useLocation();
    const backFunc = ()=>{
        if (loc.key === 'default') {
            nav('/');
        } else {
            nav(-1);
        }
    }

        // const userId = 805;
        // const [userData,setUserData] = useState({});
        // const getListData = async()=>{
        //     try {
        //         const response = await fetch(`http://localhost:5000/hireRadar/emptempsave/${userId}`); // default get req
        //         const jsonData = await response.json();
        //         setUserData(jsonData);
        //     } catch (err) {
        //         console.error(err.message);
        //     }
        // }
        // useEffect(()=>{
        //     getListData();
        // },[]);







    return( <div className='mainDiv'>
                <Sidebar />
                <div className='mainpage'>
                    <div className='buttonDiv' onClick={()=>backFunc()}><button className='btsButton'><ChevronLeft size={30}/><p>Back to Search</p></button></div>
                    <div className='topDiv'>
                        <div>
                            <img className='profilePic' />
                            <ul>
                                <li><p>Name</p><p>Status</p></li>
                                <li>Designation</li>
                                <li><p>Experience</p><p>Location</p></li>
                                <li><p>Profile</p><p>Resume</p></li>
                            </ul>
                        </div>
                        <div>
                            <div>Match Score</div>
                            <div>Description</div>
                        </div>
                    </div>
                    <div className='middleDiv'>
                        <ul>
                            <li><button className='profileListItem'><p className='profileP'>Overview</p></button></li>
                            <li><button className='profileListItem'><p className='profileP'>Experience</p></button></li>
                            <li><button className='profileListItem'><p className='profileP'>Education</p></button></li>
                            <li><button className='profileListItem'><p className='profileP'>Skills</p></button></li>
                            <li><button className='profileListItem'><p className='profileP'>Projects</p></button></li>
                            <li><button className='profileListItem'><p className='profileP'>Resume</p></button></li>
                            <li><button className='profileListItem'><p className='profileP'>Activity</p></button></li>
                        </ul>
                    </div>
                    <div className='bottomDiv'>
                        <div>
                            <h3>About</h3>
                            <p></p>
                            <h3>Skills</h3>
                            <ul className='skillsList'></ul>
                        </div>
                        <div>
                            <h3>Experience</h3>
                        </div>
                    </div>
                </div>
            </div>);
}

export default CandidateProfile;