// Importing necessary libraries and hooks
import { Link } from 'react-router-dom'; // Link component for navigation
import { useState } from 'react'; // useState hook for managing component state (not used in this file, but imported)

// Importing styles for the admin homepage
import '../styles/homepage.css'; // CSS styles specific to the homepage
import 'animate.css'; // Animation library for visual effects

// Importing images for the admin options section
import account_icon from './Images/Home/collection/account.png'; // Image for "My Account" option
import records_icon from './Images/Home/collection/records.png'; // Image for "User Records" option
import signup_icon from './Images/Home/collection/signup.png'; // Image for "Add User" option
import feedback_icon from './Images/Home/collection/feedback.png'; // (Not used in this file)
import faqs_icon from './Images/Home/collection/faqs.png'; // Image for "FAQs" option
import analytics_icon from './Images/Home/collection/signup.png'; // Cover image for the admin section

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation bar component
import CustomFooter from './SharedComponents/customFooter'; // Footer component

// Functional component definition for the Admin homepage
const Admin = (prop) => {
    return (   
        <div className="homepage">
            {/* Main Navigation Bar */}
            <NavMenu isAdmin={true} isHome={true} pagePath="/" /> {/* NavMenu for the Admin homepage */}

            {/* Cover Section */}
            <div className="cover-wrapper">
                {/* Displaying the cover image */}
                <img src={analytics_icon} alt="HR Cover" />
            </div>

            {/* Admin Options Section */}
            <section className="scrolling-wrapper animate__animated animate__fadeInUp">
                {/* Tile for "My Account" */}
                <div className="tile-emp">
                    <img src={account_icon} alt="My Account" /> {/* Image for "My Account" */}
                    <Link to="/account" className="form_btn">My Account</Link> {/* Link to the "My Account" page */}
                </div>

                {/* Tile for "User Records" */}
                <div className="tile-admin">
                    <img src={records_icon} alt="Employee Records" /> {/* Image for "User Records" */}
                    <Link to="/record-manage" className="form_btn">User Records</Link> {/* Link to the "User Records" page */}
                </div>

                {/* Tile for "Add User" */}
                <div className="tile-admin">
                    <img src={signup_icon} alt="Add Employee" /> {/* Image for "Add User" */}
                    <Link to="/create-account" className="form_btn">Add User</Link> {/* Link to the "Add User" page */}
                </div>

                {/* Tile for "FAQs" */}
                <div className="tile-admin">
                    <img src={faqs_icon} alt="FAQS" /> {/* Image for "FAQs" */}
                    <Link to="/faqs-manage" className="form_btn">FAQS</Link> {/* Link to the "FAQs" page */}
                </div>
            </section>

            {/* Footer Section */}
            <CustomFooter /> {/* Custom footer component */}
        </div>
    );
};

// Exporting the Admin component as the default export
export default Admin;
