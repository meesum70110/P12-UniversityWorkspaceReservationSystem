// Importing the Link component from React Router for navigation
import { Link } from 'react-router-dom';

// Importing CSS styles specific to the login and not found pages
import '../styles/login.css'; // Styling for the login page
import '../styles/notfound.css'; // Styling for the not found page

// Importing animation library for adding bounce animation
import 'animate.css';

// Importing a placeholder image to display when the page is not found
import no_page_icon from './Images/Nan/not-found-img.png'; // Icon for the "Not Found" page

// Functional component definition for the NotFound page
const NotFound = (prop) => {
    return (   
        <div className="notfound">
            {/* Top bar for consistent layout styling */}
            <div className="top-bar-login"></div> 

            {/* Main content wrapper with bounce animation */}
            <div className="not-found-wrapper animate__animated animate__bounce">
                {/* Displaying an image to indicate the page is not found */}
                <img src={no_page_icon} alt="Record None" />
                {/* Link to navigate back to the login page */}
                <Link to="/login">Go Back</Link>
            </div>
        </div>
    );
};

// Exporting the NotFound component as the default export
export default NotFound;
