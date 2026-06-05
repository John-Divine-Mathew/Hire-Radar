import Sidebar from '../../components/sideBar/sideBar.jsx';
import '../../App.css';
import './searchCandidate.css';
import {ChevronDown} from 'lucide-react';

function SearchCandidatePage(){

    return( <div className='mainDiv'>
                <div><Sidebar /></div>
                <div className='mainpage'>
                    <div className='searchbarcontainer'>
                        <div className='searchbar'>
                            <div className='searchbarinput'>
                                <input className='Input' type="text"></input>
                                <button className='searchButton'>Search</button>
                            </div>
                            <button className='filterButton'>Filters</button>
                        </div>
                        <div>
                            <ul className='filterbar'>
                                <li><button className='filterListItem'><p className='filterbarp'>Experience</p><ChevronDown /></button></li>
                                <li><button className='filterListItem'><p className='filterbarp'>Skills</p><ChevronDown /></button></li>
                                <li><button className='filterListItem'><p className='filterbarp'>Location</p><ChevronDown /></button></li>
                                <li><button className='filterListItem'><p className='filterbarp'>Education</p><ChevronDown /></button></li>
                                <li><button className='filterListItem'><p className='filterbarp'>Availability</p><ChevronDown /></button></li>
                                <li><button className='filterListItem'><p className='filterbarp'>More Filters</p><ChevronDown /></button></li>
                            </ul>
                        </div>
                    </div>
                    <div></div>
                    <div className='renderlistdiv'>
                        <ul>{<li></li>}</ul> {/*render lists*/}
                    </div>
                </div>
            </div>);
}

export default SearchCandidatePage;


/*


<>
    <div>
        <div>
            <div></div>
            <div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</>

*/