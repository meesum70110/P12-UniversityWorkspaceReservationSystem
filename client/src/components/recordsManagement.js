// Importing necessary React functionalities and hooks
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';  // Importing the hook to navigate between routes programmatically

// Importing the authorization hook to access global state for logged-in users
import { useAuthorize } from "../context/hook/useAuthorization";

// Importing CSS styles specific to profile and record pages
import '../styles/profile.css';
import '../styles/record.css';

// Importing icon components from React Icons for use in the user cards
import * as IoIcons from "react-icons/io";  // Importing all icons from IoIcons
import * as Io5Icons from "react-icons/io5";  // Importing all icons from Io5Icons
import * as MdIcons from "react-icons/md";  // Importing all icons from Material Design icons
import { FaAngleDown } from "react-icons/fa6";  // Importing the angle down icon for dropdowns

// Importing placeholder images
import no_result_icon from './Images/Record/no-result-img.png';  // Icon for no results
import no_photo_icon from './Images/Profile/no-profile-img.png';  // Placeholder image for profiles without photos

// Importing shared React components
import NavMenu from "./SharedComponents/navMenu";  // Navigation menu component
import LoadingIcon from "./SharedComponents/loading";  // Loading spinner component

// Importing SweetAlert for enhanced alert messages
import Swal from "sweetalert2";  // A promise-based alert system

// Importing and setting up tooltips
import 'react-tooltip/dist/react-tooltip.css';  // CSS styles for tooltips
import { Tooltip } from 'react-tooltip';  // Tooltip component for showing contextual information

// Importing the date-fns library for date formatting
import { format } from "date-fns";  // Function to format dates

// Functional component definition for ManageRecords
const ManageRecords = (prop) => {
    // Using the authorization hook to retrieve the current userAccount object
    const { userAccount } = useAuthorize();

    // Defining state variables for user data and filtering options
    const [users, setUsers] = useState(null);  // State for storing the list of users
    const [userExist, setExist] = useState(true);  // State to track if any users exist

    // State variables for filtering users by email or department
    const [email, setEmail] = useState('');  // State for storing the filtered email
    const [inputText, setText] = useState('');  // State for storing the email input text
    const [emailResponse, setResponse] = useState('');  // State for email search response messages
    const [emailRequestSubmit, setSubmit] = useState(null);  // State for tracking email filter submission

    // State variables for department filtering
    const [department, setDepartment] = useState('');  // State for storing the selected department

    // State variables for managing loading and fetching status
    const [isFetching, setFetching] = useState(null);  // State for tracking if users are being fetched
    const [isLoading, setIsLoading] = useState(null);  // State for tracking the loading status of operations

    // Defining the list of department options for filtering
    const options = [
        { label: 'All', value: 'all', key: 1 },  // Option to show all departments
        { label: 'AI', value: 'AI', key: 2 },  // Option for AI department
        { label: 'Finance', value: 'Finance', key: 3 },  // Option for Finance department
        { label: 'Data Science', value: 'Data Science', key: 4 },  // Option for Data Science department
        { label: 'Sales', value: 'Sales', key: 5 },  // Option for Sales department
        { label: 'Other', value: 'Other', key: 6 }  // Option for other departments
    ];

    // Function to fetch users based on the provided filter criteria
    const fetchFilteredUser = async (UserFilter) => {
        setFetching(true);  // Indicating that data fetching is in progress
        const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/', {
            method: 'POST',  // Using POST method to send filter criteria
            body: JSON.stringify({ ...UserFilter }),  // Sending filter criteria in the request body
            headers: {
                'Content-Type': 'application/json',  // Setting the content type as JSON
                'Authorization': `Bearer ${userAccount.userToken}`  // Including the authorization token
            }
        });

        const resultJson = await result.json();  // Parsing the JSON response
        console.log(resultJson);  // Logging the result for debugging

        if (result.ok) {
            setUsers(resultJson);  // Storing the fetched users in the state
            setExist(resultJson.length !== 0);  // Updating the existence state based on the result
        }

        setFetching(null);  // Indicating that data fetching is complete
    };

    // useEffect hook to fetch default users when the component mounts or when dependencies change
    useEffect(() => {
        const fetchDefaultUser = async (UserFilter) => {
            setFetching(true);
            const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/', {
                method: 'POST',
                body: JSON.stringify({ ...UserFilter }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userAccount.userToken}`
                }
            });

            const resultJson = await result.json();
            console.log(resultJson);

            if (result.ok) {
                setUsers(resultJson);
                setExist(resultJson.length !== 0);
            }

            setFetching(null);
        };

        if (userAccount && userAccount.occupation === 'admin') {
            fetchDefaultUser({ email, department });
        }
    }, [userAccount, email, department]);  // Dependencies for the hook

    // Function to handle the department filter change event
    // Updates the state and fetches users based on the selected department
    const handleFilterDepartment = (e) => {
        if (!userAccount) return;  // Preventing unauthorized access
        if (userAccount.occupation !== 'admin') return;  // Restricting to admin users

        if (e.target.value === 'all') {
            setDepartment('');  // Resetting the department state for "all" option
            fetchFilteredUser({ email, department: '' });  // Fetching all users
        } else {
            setDepartment(e.target.value);  // Updating the department state
            fetchFilteredUser({ email, department: e.target.value });  // Fetching filtered users
        }
    };

    // Function to handle the email filter submission
    const handleFilterEmail = async (e) => {
        e.preventDefault();  // Preventing default form submission behavior

        if (!userAccount) return;  // Preventing unauthorized access
        if (userAccount.occupation !== 'admin') return;  // Restricting to admin users

        setSubmit(true);  // Indicating that the filter is submitted
        setIsLoading(true);  // Starting the loading spinner

        if (!inputText) {
            setEmail('');  // Clearing the email filter state
            await fetchFilteredUser({ department });  // Fetching users filtered by department only
            return;
        }

        const result = await fetch('https://workspacereservation-backend.onrender.com/api/leave/email', {
            method: 'POST',  // Using POST to submit the email filter
            body: JSON.stringify({ email: inputText }),  // Sending the email in the request body
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`  // Including the authorization token
            }
        });

        const resultJson = await result.json();  // Parsing the response

        if (result.ok) {
            setEmail(inputText);  // Updating the email state with the input text
            await fetchFilteredUser({ email: inputText, department });  // Fetching filtered users
            setResponse(resultJson.mssg);  // Setting the response message
        } else {
            setResponse(resultJson.error);  // Setting the error message
        }

        setIsLoading(false);  // Stopping the loading spinner
    };

    // Function to clear the email filter and fetch all users
    const handleClearEmail = async () => {
        setIsLoading(true);  // Starting the loading spinner
        setText('');  // Clearing the input text
        setSubmit(false);  // Resetting the submission state
        setEmail('');  // Clearing the email state
        await fetchFilteredUser({ email: '', department });  // Fetching users filtered by department only
        setIsLoading(false);  // Stopping the loading spinner
    };

    // Function to handle input changes in the email search box
    const handleInputBox = async (e) => {
        setText(e.target.value);  // Updating the input text state
        setResponse(null);  // Clearing the response message
        setSubmit(false);  // Resetting the submission state

        if (e.target.value === '') {
            setEmail('');  // Clearing the email state if input is empty
            fetchFilteredUser({ email: '', department });  // Fetching users filtered by department only
        }
    };

    // Using the useNavigate hook to get the navigation function
    const Navigate = useNavigate();

    // Function to navigate to the employee account page with the selected email
    const handleRecordNavigate = (employeeEmail) => {
        Navigate('/employee-account', { state: { email: employeeEmail } });  // Navigating with the email in the state
    };

    // Function to handle user deletion
    const handleDeleteUser = async (id) => {
        if (!userAccount) return;  // Preventing unauthorized access
        if (userAccount.occupation !== 'admin') return;  // Restricting to admin users

        let cancelOperation = false;  // Flag to track if the operation is canceled

        // Showing a confirmation alert before deletion
        await Swal.fire({
            title: "Are you sure?",
            text: "Delete this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes"
        }).then((result) => {
            if (!result.isConfirmed) {
                cancelOperation = true;  // Setting the cancel flag if not confirmed
            }
        });

        if (cancelOperation) return;  // Exiting if the operation is canceled

        const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/' + id, {
            method: 'DELETE',  // Using DELETE to remove the user
            headers: {
                'Authorization': `Bearer ${userAccount.userToken}`  // Including the authorization token
            }
        });

        const resultJson = await result.json();  // Parsing the response
        console.log(resultJson);  // Logging the result for debugging

        if (result.ok) {
            Swal.fire({
                icon: "success",
                title: "User Account Deleted!",
                confirmButtonColor: "#1d578a",
            });
            fetchFilteredUser({ email, department });  // Refreshing the user list after deletion
        } else {
            Swal.fire({
                icon: "error",
                title: "Could not delete user account!",
                confirmButtonColor: "#1d578a",
            });
        }
    };

    // Tooltip styling configuration
    const style = { backgroundColor: "#cbd6e2", color: "#222", fontSize: "13px", fontWeight: "normal" };

    // JSX for rendering the ManageRecords component
    return (
        <div className="leavepage">
            {/* Navigation menu for the admin panel */}
            <NavMenu isAdmin={true} breadcrum="Records" pagePath="/record-manage" />

            {/* Main content section for managing records */}
            <div className="leave-management">
                {/* User search form */}
                <div className="leave-form-wrapper">
                    <div className="leave-search-form">
                        <div className="profile-form-search-secondary">
                            <h1 className="leave-heading user-heading">Search User</h1>
                            {/* Dropdown for selecting department */}
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

                            {/* Email search input */}
                            <div className="leave-form-unit user-email">
                                <label>Email</label>
                                <form className="absolute-icon-wrapper" onSubmit={handleFilterEmail}>
                                    <input
                                        type="text"
                                        onChange={handleInputBox}
                                        value={inputText}
                                        className="search-unit"
                                    />
                                    {!emailRequestSubmit && inputText && (
                                        <button disabled={isLoading}>
                                            <Io5Icons.IoSearch className="checkmark-icon" />
                                        </button>
                                    )}
                                    {emailRequestSubmit && inputText && (
                                        <button disabled={isLoading} type="button" onClick={handleClearEmail}>
                                            <IoIcons.IoMdCloseCircle className="checkmark-icon clear-icon" />
                                        </button>
                                    )}
                                </form>
                                {emailResponse && inputText && (
                                    <div className="email-search-response">{emailResponse}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User list or no results message */}
                <div className="leaves">
                    {isFetching && <LoadingIcon />}
                    {!userExist && !isFetching && (
                        <div className="no-leaves no-leaves-manage animate__animated animate__bounce">
                            <img src={no_result_icon} alt="Results None" />
                            <h2>No Results</h2>
                        </div>
                    )}
                    {users && !isFetching && users.map(user => (
                        <div key={user._id} className="leave-card profile-card animate__animated animate__fadeInUp">
                            <div className="profile-card-option-wrapper">
                                <MdIcons.MdEdit
                                    className="profile-card-edit-icon"
                                    data-tooltip-id="edit"
                                    data-tooltip-content="Edit info"
                                    onClick={() => handleRecordNavigate(user.email)}
                                />
                                <Tooltip id="edit" place="right" style={style} />
                                <MdIcons.MdDelete
                                    className="leave-card-delete-icon"
                                    data-tooltip-id="delete"
                                    data-tooltip-content="Delete account"
                                    onClick={() => handleDeleteUser(user._id)}
                                />
                                <Tooltip id="delete" place="left" style={style} />
                            </div>
                            <ul className="profile-card-content-wrapper">
                                <li className="profile-card-photo-wrapper">
                                    {user.photo ? (
                                        <img src={user.photo} alt="Profile" />
                                    ) : (
                                        <img src={no_photo_icon} alt="No Profile" />
                                    )}
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
                                        <p>{format(new Date(user.dob), "dd/MM/yyyy")}</p>
                                    </div>
                                    <div className="li-content-profile">
                                        <label>Gender:</label>
                                        <p className="employee-p-wrapper">
                                            {user.gender === 'male' ? (
                                                <IoIcons.IoIosMale className="employee-gender-icon" />
                                            ) : (
                                                <IoIcons.IoIosFemale className="employee-gender-icon" />
                                            )}
                                        </p>
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
    );
};

export default ManageRecords;

