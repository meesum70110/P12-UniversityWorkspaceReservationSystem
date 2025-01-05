// Importing necessary libraries and hooks
import { Link } from 'react-router-dom'; // Link component for navigation
import { useState } from 'react'; // useState hook for managing component state (not used in this file, but imported)

// Importing styles for the admin homepage
import '../styles/adminHomepage.css'; // CSS styles specific to the homepage
import 'animate.css'; // Animation library for visual effects

// Importing images for the admin options section
import account_icon from './Images/Home/collection/account.png'; // Image for "My Account" option
import records_icon from './Images/Home/collection/records.png'; // Image for "User Records" option
import signup_icon from './Images/Home/collection/signup.png'; // Image for "Add User" option
import feedback_icon from './Images/Home/collection/feedback.png'; // (Not used in this file)
import faqs_icon from './Images/Home/collection/faqs.png'; // Image for "FAQs" option
import analytics_icon from './Images/Home/collection/Coordinator_Dashboard.png'; // Cover image for the admin section
import AddUser_icon from './Images/Home/collection/AddUser.png';

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation bar component
import CustomFooter from './SharedComponents/customFooter'; // Footer component

// Functional component definition for the Admin homepage
const Admin = (prop) => {
    return (   
    <div className="homepage">
      {/* Main Nav Bar */}
      <NavMenu isAdmin={true} isHome={true} pagePath="/" />

      {/* Main Content Section */}
      <div className="content-wrapper">
        <h2>Welcome to Admin Dashboard</h2>
      </div>

      {/* Admin Options Moved to Bottom */}
      <div className="options-container">
        <section className="scrolling-wrapper animate__animated animate__fadeInUp">
          <div className="tile-emp">
            <img src={account_icon} alt="My Account" />
            <Link to="/account" className="form_btn">
              My Account
            </Link>
          </div>
          <div className="tile-admin">
            <img src={records_icon} alt="Employee Records" />
            <Link to="/record-manage" className="form_btn">
              User Records
            </Link>
          </div>
          <div className="tile-admin">
            <img src={signup_icon} alt="Add Employee" />
            <Link to="/create-account" className="form_btn">
              Add User
            </Link>
          </div>
          <div className="tile-emp">
            <img src={feedback_icon} alt="Surveys" />
            <Link to="/workspaces" className="form_btn">
              Book WorkSpaces
            </Link>
          </div>
          <div className="tile-admin">
            <img src={faqs_icon} alt="FAQS" />
            <Link to="/faqs-manage" className="form_btn">
              Create FAQS
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
