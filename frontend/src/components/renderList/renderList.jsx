import { User } from 'lucide-react';

////props

function RenderList(){
    return(
        <div className='renderListDiv'>
            <div>
                <div className='cndIcon'><User /></div>
                <div className='cndDetails'> 
                    <p></p>
                    <ul className='detailsList'>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                    <ul className='skillsList'></ul>
                </div>
            </div>
            <div>
                <p>Match Score</p>
                <p></p>
                <button>View Profile</button>
            </div>
        </div>
    );

}

export default RenderList;
