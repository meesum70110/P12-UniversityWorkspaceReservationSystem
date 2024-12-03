// Importing necessary libraries and hooks
import { Link } from 'react-router-dom'; // Link component for navigation
import { useState } from 'react'; // useState hook for managing component state (not used in this file, but imported)

// Importing styles for the homepage
import '../styles/homepage.css'; // CSS styles specific to the homepage
import 'animate.css'; // Animation library for visual effects

// Importing images for the user options section
import account_icon from './Images/Home/collection/account.png'; // Image for the "My Account" option
import survey_icon from './Images/Home/collection/feedback.png'; // Image for the "Surveys" option
import faqs_icon from './Images/Home/collection/faqs.png'; // Image for the "FAQs" option

// Importing the cover image for the employee section
import employee_icon from './Images/Home/cover/reservationLogo.png'; // Image for the cover section

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation bar component
import CustomFooter from './SharedComponents/customFooter'; // Footer component

// Functional component definition for the Employee homepage
const Employee = (prop) => {
    return (   
        <div className="homepage">
            {/* Main Navigation Bar */}
            <NavMenu isHome={true} pagePath="/employee" /> {/* NavMenu for the Employee homepage */}

            {/* Cover Section */}
            <div className="cover-wrapper">
                {/* Displaying the cover image */}
                <img src={employee_icon} alt="HR Cover" />
            </div>

            {/* Employee Options Section */}
            <section className="scrolling-wrapper animate__animated animate__fadeInUp">
                {/* Tile for "My Account" */}
                <div className="tile-emp">
                    <img src={account_icon} alt="My Account" /> {/* Image for "My Account" */}
                    <Link to="/account" className="form_btn">My Account</Link> {/* Link to the "My Account" page */}
                </div>

                {/* Tile for "View WorkSpaces" */}
                <div className="tile-emp">
                    <img src={survey_icon} alt="Surveys" /> {/* Image for "Surveys" */}
                    <Link to="/workspaces" className="form_btn">Book WorkSpace</Link> {/* Link to the "Book WorkSpaces" page */}
                </div>

                {/* Tile for "FAQs" */}
                <div className="tile-emp">
                    <img src={faqs_icon} alt="FAQS" /> {/* Image for "FAQs" */}
                    <Link to="/faqs" className="form_btn">FAQS</Link> {/* Link to the "FAQs" page */}
                </div>
            </section>

            {/* Footer Section */}
            <CustomFooter /> {/* Custom footer component */}
        </div>
    );
};

// Exporting the Employee component as the default export
export default Employee;
