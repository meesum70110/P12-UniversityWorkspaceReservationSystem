import {useState} from "react";
import {Link} from 'react-router-dom';
import {IconContext} from "react-icons";
import {MenuOptionsAdmin, MenuOptionsEmployee} from "./menuOptions";

// For updating global state when logging out
import {useAuthorize} from "../../context/hook/useAuthorization";

// Importing icon images to be used in NavBar
import * as HiIcons from "react-icons/hi2";
import * as IoIcons from "react-icons/io";
import * as RiIcons from "react-icons/ri";
import * as MdIcons from "react-icons/md";

import logo from '../Images/Nav/Lums_Logo.png'

// Importing Alerts
import Swal from "sweetalert2";

const NavMenu = (prop)=>{

    const {isAdmin, isHome, breadcrum, pagePath} = prop;

    const {dispatch} = useAuthorize();

    const [ShowMenu, setShow] = useState(false);
    const [homeChange, setHomeChange] = useState(false);

    const handleHomeIconChangeFill = (e) => {
        setHomeChange(true);
    }
    const handleHomeIconChangeLine = (e) => {
        setHomeChange(false);
    }

    const setShowMenu = () => {
        setShow(!ShowMenu);
    };

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
                const logout = () => {
                    // Remove user from local storage
                    localStorage.removeItem('userAccount');
                    // Update global state to logged out
                    dispatch({type: 'LOGOUT'});
                }
                logout();
            }
          });
    }

    return (   
        <div className="navigation-menu">
            <ul className="nav-options">
                <li className="align-left">
                    {
                        isHome ? 
                        <div></div> 
                        : 
                        <div className="placeholder">
                            <Link to={isAdmin ? '/' : '/user'} className="placeholder" onMouseEnter={handleHomeIconChangeFill} onMouseLeave={handleHomeIconChangeLine}>
                                {!homeChange && <RiIcons.RiHomeLine  className="nav-option-icon-home"/>}
                                {homeChange && <RiIcons.RiHomeFill className="nav-option-icon"/>}
                            </Link>
                            <div className="breadcrums"><MdIcons.MdArrowForwardIos className="breadcrums-arrow"/>{breadcrum}</div>
                        </div>
                    }  
                </li>
                <li>
                    <img src={logo} alt="Logo" className="nav-logo"/>
                </li>
                <li className="align-right">
                    <div  className="placeholder">
                        <HiIcons.HiMiniBars3 className="nav-option-icon" onClick={setShowMenu}/>
                    </div>
                    <nav className={ShowMenu ? 'side-menu active' : 'side-menu'}>
                        <ul className="menu-option-all" onClick={setShowMenu} >
                            <li className="menu-collapse">
                                <IoIcons.IoMdClose className="nav-option-icon"/>
                            </li>
                                <IconContext.Provider value={{size: 25}}>
                                {isAdmin && MenuOptionsAdmin.map((option, index) => {
                                    return (
                                        <li key={index} className="menu-option">
                                            <Link to={option.path} className={pagePath !== option.path ? 'option-standard' : 'option-highlight'}>
                                                {option.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                                {!isAdmin && MenuOptionsEmployee.map((option, index) => {
                                    return (
                                        <li key={index} className="menu-option">
                                            <Link to={option.path} className={pagePath !== option.path ? 'option-standard' : 'option-highlight'}>
                                                {option.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                                </IconContext.Provider>
                            <li>
                                <button className="menu-option-btn-logout" onClick={handleLogOut}>Log Out</button>
                            </li>
                        </ul>
                    </nav>
                </li>
            </ul>
        </div>
    )
}

export default NavMenu

