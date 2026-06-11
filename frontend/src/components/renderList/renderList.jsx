import { Bookmark, User } from 'lucide-react';
import PropTypes from "prop-types";
import './renderList.css';

function RenderList(props){
    const cndArray = props.Array;

    return(
        <div className='renderListDiv'><ul>

            {cndArray.map((i)=>(
                <li className='renderListItem'>
                    <div className='profileDiv'>
                        <div className='cndIcon'><User size={40}/></div>
                        <div className='cndDetails'> 
                            <p className='nameP'>{i.cndname}</p>
                            <ul className='detailsList'>
                                <li className='detailsListItem'>{i.cndrole}</li>
                                <li className='detailsListItem'>{i.cndexperience}</li>
                                <li className='detailsListItem'>{i.cndlocation}</li>
                                <li className='detailsListItem'>{i.cndstatus}</li>
                            </ul>
                            <ul className='skillsList'>
                                {i.cndskills.split(',').map((s)=>(<li className='skillListItem'>{s}</li>))}
                            </ul>
                        </div>
                    </div>
                    <div className='profileEndDiv'>
                        <Bookmark size='40' className='saveButton'/>
                        <ul className='cndScoreView'>
                            <li>Match Score</li>
                            <li>80%</li>
                            <li><button className='profileButton'>View Profile</button></li>
                        </ul>
                    </div>
                </li>
            ))}

        </ul></div>
    );

}

RenderList.propTypes = {

}
RenderList.defaultProps = {

}

export default RenderList;