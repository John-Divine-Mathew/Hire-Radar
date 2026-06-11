import { User } from 'lucide-react';
import PropTypes from "prop-types";
import './renderList.css';

function RenderList(props){

    const text = props.skills
    const skillsArr = text.split(",");

    return(
            <li className='renderListItem'>
                <div className='profileDiv'>
                    <div className='cndIcon'><User size={40}/></div>
                    <div className='cndDetails'> 
                        <p className='nameP'>{props.name}</p>
                        <ul className='detailsList'>
                            <li className='detailsListItem'>{props.role}</li>
                            <li className='detailsListItem'>{props.experience}</li>
                            <li className='detailsListItem'>{props.location}</li>
                            <li className='detailsListItem'>{props.status}</li>
                        </ul>
                        <ul className='skillsList'>
                            {skillsArr.map((s)=>(<li className='skillListItem'>{s}</li>))}
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