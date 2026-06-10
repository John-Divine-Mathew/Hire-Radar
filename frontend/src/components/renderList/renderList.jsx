import { User } from 'lucide-react';
import PropTypes from "prop-types";
import './renderList.css';

function RenderList(){

    return(
            <li className='renderListItem'>
                <div className='profileDiv'>
                    <div className='cndIcon'><User size={40}/></div>
                    <div className='cndDetails'> 
                        <p className='nameP'>NAME</p>
                        <ul className='detailsList'>
                            <li className='detailsListItem'>Designation</li>
                            <li className='detailsListItem'>Location</li>
                            <li className='detailsListItem'>Experience</li>
                            <li className='detailsListItem'>Status</li>
                        </ul>
                        <ul className='skillsList'>
                            <li className='skillListItem'>Skill 1</li>
                            <li className='skillListItem'>Skill 2</li>
                            <li className='skillListItem'>Skill 3</li>
                        </ul>
                    </div>
                </div>
                <ul className='cndScoreView'>
                    <li>Match Score</li>
                    <li>80%</li>
                    <li><button className='profileButton'>View Profile</button></li>
                </ul>
            </li>
    );

}

RenderList.propTypes = {

}
RenderList.defaultProps = {

}

export default RenderList;