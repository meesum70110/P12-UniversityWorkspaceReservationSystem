// Importing necessary libraries and hooks
import { useState } from "react"; // useState hook for managing component state
import { Link } from 'react-router-dom'; // Link component for navigation between routes
import { IconContext } from "react-icons"; // Icon context to control icon properties
import { MenuOptionsAdmin, MenuOptionsEmployee } from "./menuOptions"; // Menu options for admin and employee roles

// Importing the authorization hook to update global state when logging out
import { useAuthorize } from "../../context/hook/useAuthorization";

// Importing icons for use in the navigation bar
import * as HiIcons from "react-icons/hi2"; // Hamburger menu icon
import * as IoIcons from "react-icons/io"; // Close icon
import * as RiIcons from "react-icons/ri"; // Home icons
import * as MdIcons from "react-icons/md"; // Breadcrumb arrow

// Importing logo and styles
import logo from '../Images/Nav/Lums_Logo.png'; // Logo image
import Swal from "sweetalert2"; // SweetAlert for logout confirmation

// Functional component definition for the navigation menu
const NavMenu = (prop) => {
    // Extracting props passed to the component
    const { isAdmin, isHome, breadcrum, pagePath } = prop;

    // Extracting the `dispatch` function from the authorization context
    const { dispatch } = useAuthorize();

    // State for showing or hiding the side menu
    const [ShowMenu, setShow] = useState(false);

    // State for toggling the home icon appearance
    const [homeChange, setHomeChange] = useState(false);

    // Handlers for changing the home icon on hover
    const handleHomeIconChangeFill = () => setHomeChange(true);
    const handleHomeIconChangeLine = () => setHomeChange(false);

    // Function to toggle the visibility of the side menu
    const setShowMenu = () => {
        setShow(!ShowMenu);
    };

    // Handler for the logout process
    const handleLogOut = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "Log out of your account?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Log out",
        }).then((result) => {
            if (result.isConfirmed) {
                // Function to perform logout actions
                const logout = () => {
                    localStorage.removeItem('userAccount'); // Remove user data from local storage
                    dispatch({ type: 'LOGOUT' }); // Update global state to reflect logged-out status
                };
                logout();
            }
        });
    };

    return (
        <div className="navigation-menu">
            {/* Main navigation bar */}
            <ul className="nav-options">
                {/* Left-aligned navigation options */}
                <li className="align-left">
                    {isHome ? (
                        <div></div> // Placeholder for the home page
                    ) : (
                        <div className="placeholder">
                            {/* Home link with hover effects */}
                            <Link 
                                to={isAdmin ? '/' : '/TA'} 
                                className="placeholder" 
                                onMouseEnter={handleHomeIconChangeFill} 
                                onMouseLeave={handleHomeIconChangeLine}
                            >
                                {!homeChange && <RiIcons.RiHomeLine className="nav-option-icon-home" />} {/* Outline home icon */}
                                {homeChange && <RiIcons.RiHomeFill className="nav-option-icon" />} {/* Filled home icon */}
                            </Link>
                            <div className="breadcrums">
                                {/* Breadcrumb for the current page */}
                                <MdIcons.MdArrowForwardIos className="breadcrums-arrow" />{breadcrum}
                            </div>
                        </div>
                    )}
                </li>

                {/* Centered logo */}
                <li>
                    <img src={logo} alt="Logo" className="nav-logo" />
                </li>

                {/* Right-aligned navigation options */}
                <li className="align-right">
                    <div className="placeholder">
                        {/* Hamburger menu icon to toggle the side menu */}
                        <HiIcons.HiMiniBars3 className="nav-option-icon" onClick={setShowMenu} />
                    </div>

                    {/* Side menu for navigation */}
                    <nav className={ShowMenu ? 'side-menu active' : 'side-menu'}>
                        <ul className="menu-option-all" onClick={setShowMenu}>
                            {/* Close button for the side menu */}
                            <li className="menu-collapse">
                                <IoIcons.IoMdClose className="nav-option-icon" />
                            </li>

                            {/* Navigation options provided by context */}
                            <IconContext.Provider value={{ size: 25 }}> {/* Icon size context */}
                                {isAdmin && MenuOptionsAdmin.map((option, index) => (
                                    <li key={index} className="menu-option">
                                        <Link 
                                            to={option.path} 
                                            className={pagePath !== option.path ? 'option-standard' : 'option-highlight'}
                                        >
                                            {option.title} {/* Admin menu options */}
                                        </Link>
                                    </li>
                                ))}
                                {!isAdmin && MenuOptionsEmployee.map((option, index) => (
                                    <li key={index} className="menu-option">
                                        <Link 
                                            to={option.path} 
                                            className={pagePath !== option.path ? 'option-standard' : 'option-highlight'}
                                        >
                                            {option.title} {/* Employee menu options */}
                                        </Link>
                                    </li>
                                ))}
                            </IconContext.Provider>

                            {/* Logout button */}
                            <li>
                                <button className="menu-option-btn-logout" onClick={handleLogOut}>
                                    Log Out
                                </button>
                            </li>
                        </ul>
                    </nav>
                </li>
            </ul>
        </div>
    );
};

// Exporting the NavMenu component as the default export
export default NavMenu;
