import {Link} from 'react-router-dom';
import {useState} from 'react';

import '../styles/homepage.css';
import 'animate.css';

// Importing user option images to be used in user option section of the webpage
import account_icon from './Images/Home/collection/account.png'
import records_icon from './Images/Home/collection/records.png'
import signup_icon from './Images/Home/collection/signup.png'
import feedback_icon from './Images/Home/collection/feedback.png'
import faqs_icon from './Images/Home/collection/faqs.png'

import analytics_icon from './Images/Home/collection/signup.png'

//Importing Shared Components
import NavMenu from "./SharedComponents/navMenu";
import CustomFooter from './SharedComponents/customFooter';

const Admin = (prop)=>{

    // let time = new Date().toLocaleTimeString();
    // const [displayTime, setDisplay] = useState(time);
    // const updateDisplayTime = () => {
    //     time = new Date().toLocaleTimeString();
    //     setDisplay(time);
    // }

    // setInterval(updateDisplayTime, 1000);

    return (   
        <div className="homepage">
            {/* Main Nav Bar */}
            <NavMenu isAdmin={true} isHome={true} pagePath="/"/>

            {/* Cover Section */}
            <div className="cover-wrapper">
                    <img src={analytics_icon} alt="HR Cover"/>
            </div>

            {/* Admin Options */}
            <section className="scrolling-wrapper animate__animated animate__fadeInUp">
                <div className="tile-emp">
                    <img src={account_icon} alt="My Account"/>
                    <Link to="/account" className="form_btn">My Account</Link>
                </div>
                <div className="tile-admin">
                    <img src={records_icon} alt="Employee Records"/>
                    <Link to="/record-manage" className="form_btn">User Records</Link>
                </div>
                <div className="tile-admin">
                    <img src={signup_icon} alt="Add Employee"/>
                    <Link to="/create-account" className="form_btn">Add User</Link>
                </div>
                <div className="tile-admin">
                    <img src={feedback_icon} alt="Generate Survey"/>
                    <Link to="/workspaces" className="form_btn">Add WorkSpace</Link>
                </div>
                <div className="tile-admin">
                    <img src={faqs_icon} alt="FAQS"/>
                    <Link to="/faqs-manage" className="form_btn">FAQS</Link>
                </div>
            </section>

            <CustomFooter/>

        </div>
    )
}

export default Admin

