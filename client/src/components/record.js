// Importing necessary React functionalities and hooks
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';  // Importing the hook to navigate programmatically between routes

// Context and hooks for authorization to access global state for logged-in users
import { useAuthorize } from "../context/hook/useAuthorization";
import { useLocation } from 'react-router-dom'  // Importing the hook to access the current route's location object

// Importing CSS styles specific to the account and sign-up pages, and animations
import '../styles/myaccount.css'
import '../styles/signup.css'
import 'animate.css';  // Importing a library for CSS animations

// Importing icon components from React icons library
import * as IoIcons from "react-icons/io";  // Importing all icons from IoIcons
import { MdEdit } from "react-icons/md";  // Importing the edit icon from material design icons
import { FaAngleDown } from "react-icons/fa";  // Importing the angle down icon for dropdowns

// Importing a placeholder image for profiles without a photo
import no_photo_icon from './Images/Profile/no-profile-img.png'

// Importing date utility function and moment for date manipulations
import { formatDistanceToNow } from "date-fns";  // Function to format the distance to now in words
import moment from 'moment';  // Library for parsing, validating, and displaying dates

// Importing shared React components
import NavMenu from "./SharedComponents/navMenu";  // Navigation menu component

// Importing SweetAlert for better alerts
import Swal from "sweetalert2";  // A promise-based alert system

// Importing and initializing tooltips
import 'react-tooltip/dist/react-tooltip.css';  // CSS for tooltips
import { Tooltip } from 'react-tooltip';  // Tooltip component for showing contextual information

// Functional component definition for Record
const Record = (props) => {
    // Using the useNavigate hook to get the navigation function
    const Navigate = useNavigate();
    const handleRecordNavigate = () => {
        Navigate('/record-manage');  // Function to navigate to the record management page
    }

    try {
        const location = useLocation();  // Accessing the location object from the router context
        var { email : employeeEmail } = location.state;  // Extracting the email passed via the location state
    } catch (error) {
        // Handling errors, e.g., no email in location state
        Swal.fire({
            icon: "warning",  // Setting the icon of the modal to warning
            title: "Please choose a User!",  // Modal title
            confirmButtonColor: "#1d578a",  // Customizing the button color
        }).then(function () {
            handleRecordNavigate();  // Navigating to the record manage page on confirmation
        });
    }

    
    // Retrieving the userAccount object from the authorization context
    // This object typically includes properties such as email, occupation, and JWT for the currently logged-in user.
    const {userAccount} = useAuthorize();

    // Defining state variables to store the user's account information
    // These useState hooks initialize states for various user details with empty strings as default values.
    const [photo, setPhoto] = useState('');  // State for storing user's profile photo
    const [email, setEmail] = useState('');  // State for storing user's email
    const [fname, setFName] = useState('');  // State for storing user's first name
    const [lname, setLName] = useState('');  // State for storing user's last name
    const [dob, setDob] = useState('');  // State for storing user's date of birth
    const [gender, setGender] = useState('');  // State for storing user's gender

    // State variables for storing current salary and department of the user
    const [salary, setSalary] = useState('');  // State for storing user's current salary
    const [department, setDepartment] = useState('');  // State for storing user's current department

    // State variables for managing updates to salary and department
    const [salaryNew, setSalaryNew] = useState('');  // State for storing new salary value during update
    const [departmentNew, setDepartmentNew] = useState('');  // State for storing new department value during update

    // State variables for error handling during updates
    const [salaryNewError, setSalaryNewError] = useState('');  // State for storing salary update error message
    const [departmentNewError, setDepartmentNewError] = useState('');  // State for storing department update error message
    const [error, setError] = useState('');  // General state for storing error messages related to the form

    // State for controlling the display of update options in the UI
    const [updateOptions, setUpdateOptions] = useState(false);  // Boolean state that controls visibility of update options
    const [dropValue, setDropValue] = useState('');  // State for handling the selected value in dropdown
    const [updateOptionDisable, setupdateOptionDisable] = useState('option-disable');  // State to manage the enable/disable status of update options
    const [isUpdating, setUpdating] = useState(false);  // Boolean state to indicate whether an update operation is in progress

    // Function to enable the update options
    // This function removes any disable status and shows the update options UI.
    const handleUpdateOptions = () => {
        setupdateOptionDisable('');  // Enabling the option by setting disable status to empty
        setUpdateOptions(true);  // Showing the update options
    }

    // Array of options for department dropdown, each option is an object with label, value, and key
    const options = [
        {label: 'Marketing', value: 'Marketing', key: 1},  // Option for Marketing department
        {label: 'Finance', value: 'Finance', key: 2},  // Option for Finance department
        {label: 'Design', value: 'Design', key: 3},  // Option for Design department
        {label: 'Sales', value: 'Sales', key: 4},  // Option for Sales department
        {label: 'Other', value: 'Other', key: 5}  // Option for other departments
    ]

    // Function to handle the change event for the department dropdown
    // Updates the state variables with the new value selected by the user
    const handleDepartmentNew = (e) => {
        setDropValue(e.target.value);  // Updating the dropdown value state
        setDepartmentNew(e.target.value);  // Updating the department state with the new value
    }

    // Function to reset all form inputs and error states
    // Resets the update form to its initial state
    const resetForm = () => {
        setSalaryNew('');  // Clearing the new salary input state
        setDepartmentNew('');  // Clearing the new department input state

        setSalaryNewError('');  // Clearing any salary error messages
        setDepartmentNewError('');  // Clearing any department error messages

        setupdateOptionDisable('option-disable');  // Disabling update options again

        setUpdateOptions(false);  // Hiding update options in the UI
        setError('');  // Clearing any general error messages
    }

    // Function to handle the cancellation of updates
    // Sets up the component for a reset after setting it in a transient updating state
    const handleUpdateCancel = () => {
        setUpdating(true);  // Indicate that an update process is starting (locking the UI)
        resetForm();  // Resetting all form states and errors
        setUpdating(false);  // Indicate that the update process is complete (unlocking the UI)
    }

    // Asynchronous function to submit the updated information
    // Handles the logic for updating user information via a server-side API
    const UpdateInfo = async (e) => {
        e.preventDefault();  // Preventing the default form submission action which refreshes the page

        // Checking if the user is logged in and authorized to make changes
        if(!userAccount) {
            setError('You are not logged in');  // Setting an error message if no user account is found
            return;
        }
        else if(userAccount.occupation !== 'admin')
            return;  // Exiting the function if the user is not an admin, with no further action

        setUpdating(true);  // Setting the updating state to true to lock the UI

        setSalaryNewError('');  // Clearing any previous salary update errors
        setDepartmentNewError('');  // Clearing any previous department update errors

        // Building an object with the email and any new values provided for salary or department
        let updateList = {email: employeeEmail};
        if(salaryNew){updateList.salary = salaryNew}  // Adding salary to update list if it has a new value
        if(departmentNew){updateList.department = departmentNew}  // Adding department if it has a new value

        // Checking if there are no new values provided to update
        if(!salaryNew && !departmentNew){
            setError('No fields to update');  // Setting an error message if no update values are provided
            setUpdating(false);  // Resetting the updating state
            return;
        }

        // Sending a PATCH request to the server to update the account details
        const result = await fetch('/api/account/sensitive', {
            method: 'PATCH',  // Using PATCH method to update part of the resource
            body: JSON.stringify({...updateList}),  // Sending the update list as JSON in the request body
            headers: {
                'Content-Type': 'application/json',  // Setting content type as JSON
                'Authorization': `Bearer ${userAccount.userToken}`  // Including the authorization token
            }
        })

        // Parsing the JSON response from the fetch request
        const resultJson = await result.json();
        // Checking if the HTTP request was successful (status code in the range 200-299)
        if (result.ok)
        {
            // If there is a new salary to update, update the state variable
            if(salaryNew)
                setSalary(salaryNew); // Updating the salary state with the new value
            if(departmentNew)
                setDepartment(departmentNew);

            // Resetting the form to clear inputs and close the update section
            resetForm();

            // Displaying a success message to the user using SweetAlert
            Swal.fire({
                icon: "success",
                title: "User Info Updated!",
                confirmButtonColor: "#1d578a",
            });

            // Setting the updating state to false, indicating the update process is complete
            setUpdating(false);
        }
        else
        {
            // If the request was not successful, set the error state to the error message from the server
            setError(resultJson.error);

            // Checking if there are specific errors for individual form fields returned from the server
            if(resultJson.errorList)
            {
                // If there's an error specific to the salary field
                if (resultJson.errorList.salary)
                    setSalaryNewError(resultJson.errorList.salary);

                if (resultJson.errorList.department)
                    setDepartmentNewError(resultJson.errorList.department);
            }
            // Setting the updating state to false, indicating the update attempt has ended (regardless of success)
            setUpdating(false);
        }
    }
    // useEffect hook to run only once or when userAccount or employeeEmail changes.
    // It fetches the user profile from the server using the provided email and authorization token.
    useEffect(() => {
        // Defining an asynchronous function to fetch the user's profile data from the server.
        const fetchProfile = async () => {
            // Sending a POST request to the server with the employee's email to retrieve their profile data.
            const result = await fetch('/api/account/profile', {
                method: 'POST', // Method type POST to submit data to the server.
                body: JSON.stringify({email: employeeEmail}), // Including the employeeEmail in the request body.
                headers: {
                    'Content-Type': 'application/json', // Specifying the content type as JSON.
                    'Authorization': `Bearer ${userAccount.userToken}` // Including the authorization token to validate the request.
                }
            });

            // Parsing the JSON response to extract the profile data.
            const resultJson = await result.json();

            // Checking if the server response is successful.
            if (result.ok) {
                // Setting the user's photo if it exists in the response.
                if (resultJson.photo) {
                    setPhoto(resultJson.photo);
                }
                // Updating the state variables with the received profile data.
                setEmail(resultJson.email); // Sets the email from the profile data.
                setFName(resultJson.fname); // Sets the first name from the profile data.
                setLName(resultJson.lname); // Sets the last name from the profile data.
                setDob(moment(resultJson.dob).format('YYYY/MM/DD')); // Formats and sets the date of birth.
                setGender(resultJson.gender); // Sets the gender from the profile data.
                setSalary(resultJson.salary); // Sets the salary from the profile data.
                setDepartment(resultJson.department); // Sets the department from the profile data.
            }

            // Logging the received JSON to the console for debugging purposes.
            console.log(resultJson);
        }

        // Conditionally running the fetchProfile function if the userAccount object exists.
        // This prevents the function from running if there is no logged-in user.
        if(userAccount)
            fetchProfile();

    }, [userAccount, employeeEmail]); // The hook will rerun if userAccount or employeeEmail changes.


    // Tooltip style
    const style = { backgroundColor: "#cbd6e2", color: "#222", fontSize: "13px", fontWeight: "normal" };

    return (   
        <div className="recordpage">

            {/* Main Nav Bar */}
            <NavMenu isAdmin={true} breadcrum="Employee Account" pagePath="/employee-account"/>

            <div className="account-wrapper animate__animated animate__fadeInUp">
                {/* Account Details */}
                <span className="account-summary">
                    {photo && <img src={photo} alt="Profile" />}
                    {!photo && <img src={no_photo_icon} alt="No Profile" />}
                    <span className="account-summary-profile">
                        <p className="account-profile-name">{fname + ' ' + lname}</p>
                        <p>{email}</p>
                        <p className="employee-p-wrapper">
                            {gender === 'male' ? <IoIcons.IoIosMale className="employee-gender-icon"/> : <IoIcons.IoIosFemale className="employee-gender-icon"/>}
                            {dob && formatDistanceToNow(new Date(dob), {addSuffix : false})} old
                        </p>
                    </span>
                    <span className="account-summary-work">
                        <div className="account-work-unit work-unit-top">Department:<span>{department}</span></div>
                        <div className="account-work-unit work-unit-bottom">salary:<span>{salary}</span></div>
                    </span>
                </span>

                {/* Update Form */}
                <form className="employee-record-form" onSubmit={UpdateInfo}>
                    <h1 className="employee-record-heading">
                        User Info
                        {!updateOptions && <MdEdit data-tooltip-id="edit" data-tooltip-content="Edit info" onClick={handleUpdateOptions} className="form-edit-icon"/>}
                        <Tooltip id="edit" place="left" style={style}/>
                    </h1>
                    <div className="signup-form-unit employee-form-unit">
                        <label>Department</label>
                        <span className="absolute-icon-wrapper">
                            <select 
                                disabled={!updateOptions} 
                                className={departmentNewError ? 'field-error dep-drop employee-form-unit' : updateOptionDisable + ' dep-drop employee-form-unit'} 
                                onChange={handleDepartmentNew}
                                value={dropValue}
                            >
                                <option hidden className='default-dep-drop'>{department}</option>
                                {options.map(option => (
                                    <option key={option.key} value={option.value}>
                                    {option.label}
                                    </option>
                                ))}
                            </select>
                                {updateOptions && <FaAngleDown className="drop-icon" />}
                            </span>
                        {departmentNewError && <div className="error-text">{departmentNewError}</div>}
                    </div>
                    <div className="signup-form-unit employee-form-unit">
                            <label>Salary</label>
                            <input
                                type="number"
                                placeholder={salary} 
                                min="0"
                                onChange={(e) => setSalaryNew(e.target.value)} 
                                value={salaryNew} 
                                disabled={!updateOptions} 
                                className={salaryNewError ? 'field-error' : updateOptionDisable} 
                            />
                            {salaryNewError && <div className="error-text">{salaryNewError}</div>}
                        </div>

                    {updateOptions && <div className="info-btn-update signup-btn update-btn-margin">
                        <button disabled={isUpdating} className="password-btn-update">Save</button>
                        <button type="button" disabled={isUpdating} onClick={handleUpdateCancel} className="password-btn-cancel">Cancel</button>
                    </div>}
                    {error && <div className="signup-error error-update-margin">{error}</div>}
                </form>
            </div>

        </div>


    )
}

export default Record
