import React, { useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';

// For accessing global state for logged in users
import { useAuthorize } from "../context/hook/useAuthorization";

import '../styles/profile.css'
import '../styles/record.css'

// Importing icon images to be used in user cards
import * as IoIcons from "react-icons/io";
import * as Io5Icons from "react-icons/io5";
import * as MdIcons from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";

import no_result_icon from './Images/Record/no-result-img.png'
import no_photo_icon from './Images/Profile/no-profile-img.png'

//Importing Shared Components
import NavMenu from "./SharedComponents/navMenu";
import LoadingIcon from "./SharedComponents/loading";

// Importing Alerts
import Swal from "sweetalert2";

// Importing Tooltips
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// Date formatting
import {format} from "date-fns";

const ManageRecords = (prop)=>{
    
    // userAccount object stores the current state including email, occupation, jwt
    const {userAccount} = useAuthorize();

    const [users, setUsers] = useState(null);
    const [userExist, setExist] = useState(true);

    const [email, setEmail] = useState('');
    const [inputText, setText] = useState('');
    const [emailResponse, setResponse] = useState('');
    const [emailRequestSubmit, setSubmit] = useState(null);

    const [department, setDepartment] = useState('');

    const [isFetching, setFetching] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    const options = [
        {label: 'All', value:'all', key: 1},
        {label: 'AI', value:'AI', key: 2},
        {label: 'Finance', value:'Finance', key: 3},
        {label: 'Data Science', value:'Data Science', key: 4},
        {label: 'Sales', value:'Sales', key: 5},
        {label: 'Other', value:'Other', key: 6}
    ]

    const fetchFilteredUser = async (UserFilter) => {
        setFetching(true)
        const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/', {
            method: 'POST',
            body: JSON.stringify({...UserFilter}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        });
        
        const resultJson = await result.json();
        console.log(resultJson)

        if (result.ok)
        {
            setUsers(resultJson);
            if(resultJson.length !== 0)
                setExist(true);
            else
                setExist(false);
        }

        setFetching(null);
    }

    // Use effect hook only run once initially when the page in rendered.
    useEffect(() => {  
        
        const fetchDefaultUser = async (UserFilter) => {
            setFetching(true)
            const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/', {
                method: 'POST',
                body: JSON.stringify({...UserFilter}),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userAccount.userToken}`
                }
            });
            
            const resultJson = await result.json();
            console.log(resultJson)
    
            if (result.ok)
            {
                setUsers(resultJson);
                if(resultJson.length !== 0)
                    setExist(true);
                else
                    setExist(false);
            }
    
            setFetching(null);
        }

        if(userAccount && userAccount.occupation === 'admin')
            fetchDefaultUser({email, department});
            
    }, [userAccount, email, department]);

    const handleFilterDepartment = (e) => {
        if(!userAccount)
            return;
        else if(userAccount.occupation !== 'admin')
            return;

        if(e.target.value === 'all')
        {
            setDepartment('');
            fetchFilteredUser({email, department : ''})
        }
        else
        {
            setDepartment(e.target.value);
            fetchFilteredUser({email, department : e.target.value})
        }
    }

    const handleFilterEmail = async (e) => {

        // Prevents default action of page refresh on form submission
        e.preventDefault();

        if(!userAccount)
            return;
        else if(userAccount.occupation !== 'admin')
            return;

        setSubmit(true);
        setIsLoading(true);

        if (!inputText){
            setEmail('');
            await fetchFilteredUser({department});
            return;
        }

        const result = await fetch('https://workspacereservation-backend.onrender.com/api/leave/email', {
            method: 'POST',
            body: JSON.stringify({email : inputText}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        });
        
        const resultJson = await result.json();

        if (result.ok)
        {
            setEmail(inputText);
            await fetchFilteredUser({email : inputText, department});
            setResponse(resultJson.mssg);
            setIsLoading(false);
        }
        else
        {
            setResponse(resultJson.error);
            setIsLoading(false);
        }
    }

    const handleClearEmail = async () => {
        setIsLoading(true);
        setText('');
        setSubmit(false);
        setEmail('')
        await fetchFilteredUser({email : '', department});
        setIsLoading(false);
    }

    const handleInputBox = async (e) => {
        setText(e.target.value);
        setResponse(null); 
        setSubmit(false);
        if(e.target.value === '')
        {
            setEmail('');
            fetchFilteredUser({email :'', department});
        }
    }

    const Navigate = useNavigate();
    const handleRecordNavigate = (employeeEmail) => {
        Navigate('/employee-account', {state : {email : employeeEmail}});
    }

    const handleDeleteUser = async(id) => {
        if(!userAccount)
            return;
        else if(userAccount.occupation !== 'admin')
            return;

        let cancelOperation = false;

        await Swal.fire({
            title: "Are you sure?",
            text: "Delete this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes",
            }).then((result) => {
            if (!result.isConfirmed) {
                cancelOperation = true;
            }
          });

          if (cancelOperation) {return;}

          const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        })

        const resultJson = await result.json();
        console.log(resultJson);

        if (result.ok)
        {

            Swal.fire({
                icon: "success",
                title: "User Account Deleted!",
                confirmButtonColor: "#1d578a",
            });
            fetchFilteredUser({email, department})
        }
        else
        {
            Swal.fire({
                icon: "error",
                title: "Could not delete user account!",
                confirmButtonColor: "#1d578a",
            });
        }
    }

    // Tooltip style
    const style = { backgroundColor: "#cbd6e2", color: "#222", fontSize: "13px", fontWeight: "normal" };

    return (   
        <div className="leavepage">

            {/* Main Nav Bar */}
            <NavMenu isAdmin={true} breadcrum="Records" pagePath="/record-manage"/>
            
            {/* Leave Add Form */}
            <div className="leave-management">
                <div className="leave-form-wrapper">
                    <div className="leave-search-form">
                        <div className="profile-form-search-secondary">
                            <h1 className="leave-heading user-heading">Search Employee</h1>
                            <div className="leave-form-unit user-department">
                                <label>Department</label>
                                <span className="absolute-icon-wrapper">
                                    <select 
                                        className="search-unit cursor-pointer"  
                                        onChange={handleFilterDepartment}
                                    >
                                        {options.map(option => (
                                            <option key={option.key} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                        <FaAngleDown className="drop-icon" />
                                    </span>
                            </div>
                            <div className="leave-form-unit user-email">
                                <label>Email</label>
                                <form className="absolute-icon-wrapper" onSubmit={handleFilterEmail}>
                                    <input 
                                        type="text" 
                                        onChange={handleInputBox}
                                        value={inputText}
                                        className="search-unit"
                                    />
                                    {!emailRequestSubmit && inputText && <button disabled={isLoading}>
                                        <Io5Icons.IoSearch className="checkmark-icon" />
                                    </button>}
                                    {emailRequestSubmit && inputText && <button disabled={isLoading} type="button" 
                                    onClick={handleClearEmail}>
                                        <IoIcons.IoMdCloseCircle  className="checkmark-icon clear-icon" />
                                    </button >}

                                </form>
                                {emailResponse && inputText && <div className="email-search-response">{emailResponse}</div>}
                            </div>
                        </div>
                    </div>
                </div>
                

                {/* Leave Cards */}
                <div className="leaves">
                    {isFetching && <LoadingIcon />}
                    {!userExist && !isFetching &&
                        <div className="no-leaves no-leaves-manage animate__animated animate__bounce">
                            <img src={no_result_icon} alt="Results None" />
                            <h2>No Results</h2>
                        </div>
                    }
                    {users && !isFetching && users.map((user) => (
                        <div key={user._id} className="leave-card profile-card animate__animated animate__fadeInUp">
                            <div className="profile-card-option-wrapper">
                                <MdIcons.MdEdit  className="profile-card-edit-icon" data-tooltip-id="edit" data-tooltip-content="Edit info" onClick={()=>handleRecordNavigate(user.email)}/>
                                <Tooltip id="edit" place="right" style={style}/>
                                <MdIcons.MdDelete className="leave-card-delete-icon" data-tooltip-id="delete" data-tooltip-content="Delete account" onClick={()=>handleDeleteUser(user._id)}/>
                                <Tooltip id="delete" place="left" style={style}/>
                            </div>
                            <ul className="profile-card-content-wrapper">
                                <li className="profile-card-photo-wrapper">
                                        {user.photo && <img src={user.photo} alt="Profile" />}
                                        {!user.photo && <img src={no_photo_icon} alt="No Profile" />}
                                </li>
                                <li className="profile-card-info-wrapper">
                                    <div className="li-content-profile">
                                        <label>Email:</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="li-content-profile">
                                        <label>Name:</label>
                                        <p className="li-profile-capitalize">{user.fname} {user.lname}</p>
                                    </div>
                                    <div className="li-content-profile">
                                        <label>Date of Birth:</label>
                                        <p>
                                            {format(new Date(user.dob), "dd/MM/yyyy")}
                                        </p>
                                    </div>
                                    <div className="li-content-profile">
                                        <label>Gender:</label>
                                        <p className="employee-p-wrapper">{user.gender === 'male' ? <IoIcons.IoIosMale className="employee-gender-icon"/> : <IoIcons.IoIosFemale className="employee-gender-icon"/>}</p>
                                    </div>
                                    <div className="li-content-profile">
                                        <label>Department:</label>
                                        <p>{user.department}</p>
                                    </div>
                                    <div className="li-content-profile">
                                        <label>Salary:</label>
                                        <p className="li-profile-name">{user.salary}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )

}

export default ManageRecords
