import Sidebar from '../../components/sideBar/sideBar.jsx';
import '../../App.css';
import './searchCandidate.css';

function SearchCandidatePage(){

    return( <div className='mainDiv'>
                <div><Sidebar /></div>
                <div className='mainpage'>
                    <div className='searchbarcontainer'>
                        <div className='searchbar'>
                            <div>
                                <input type="text"></input>
                                <button>Search</button>
                            </div>
                            <div><button>Filters</button></div>
                        </div>
                        <div>
                            <ul className='filterbar'>
                                <li>Experience</li>
                                <li>Skills</li>
                                <li>Location</li>
                                <li>Education</li>
                                <li>Availabillity</li>
                                <li>More Filters</li>
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