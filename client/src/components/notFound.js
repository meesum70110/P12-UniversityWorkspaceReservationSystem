import {Link} from 'react-router-dom';

import '../styles/login.css'
import '../styles/notfound.css'
import 'animate.css';

import no_page_icon from './Images/Nan/not-found-img.png'

const NotFound = (prop)=>{


    return (   
        <div className="notfound">
            <div className="top-bar-login">
            </div>

            <div className="not-found-wrapper animate__animated animate__bounce">
                <img src={no_page_icon} alt="Record None" />
                <Link to="/login">Go Back</Link>
            </div>

        </div>
    )
}

export default NotFound
