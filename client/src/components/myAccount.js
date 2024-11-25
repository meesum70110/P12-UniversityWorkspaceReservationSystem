// Importing React and necessary hooks
import React, { useState, useEffect } from "react";

// Importing the authorization hook to access global state for logged-in users
import { useAuthorize } from "../context/hook/useAuthorization";

// Importing styles for the account and signup pages
import '../styles/myaccount.css';
import '../styles/signup.css';

// Importing animation library for transitions
import 'animate.css';

// Importing icons used in the component
import { IoCamera } from "react-icons/io5"; // Icon for uploading a photo
import { IoIosRemoveCircle } from "react-icons/io"; // Icon for removing a photo
import * as FiIcons from "react-icons/fi"; // Icon library for password visibility toggling
import { MdEdit } from "react-icons/md"; // Edit icon
import { FaAngleDown } from "react-icons/fa6"; // Dropdown arrow icon

// Placeholder image for profiles without a photo
import no_photo_icon from './Images/Profile/no-profile-img.png';

// Importing Ant Design's DatePicker component
import { DatePicker } from "antd";

// Importing moment.js for date handling
import moment from 'moment';

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation menu component
import { convertToBase64, validateImage } from "./SharedComponents/base64"; // Functions for image validation and conversion

// Importing SweetAlert for user-friendly alerts
import Swal from "sweetalert2";

// Importing and styling tooltips
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// Functional component definition for MyAccount
const MyAccount = (prop) => {
    // Extracting userAccount object from the authorization context
    const { userAccount } = useAuthorize();

    // State variables for managing account summary details
    const [photo, setPhoto] = useState(''); // User profile photo
    const [email, setEmail] = useState(''); // User email
    const [fname, setFName] = useState(''); // User first name
    const [lname, setLName] = useState(''); // User last name
    const [dob, setDob] = useState(''); // User date of birth
    const [gender, setGender] = useState(''); // User gender
    const [salary, setSalary] = useState(''); // User salary
    const [department, setDepartment] = useState(''); // User department
    const [residence, setResidence] = useState(''); // User residence
    const [rank, setRank] = useState(''); // User rank

    // State variables for photo upload and removal
    const [isPhotoUploading, setPhotoUploading] = useState(false);

    // State variables for managing basic information updates
    const [fnameNew, setFNameNew] = useState(''); // Updated first name
    const [lnameNew, setLNameNew] = useState(''); // Updated last name
    const [dobNew, setDobNew] = useState(''); // Updated date of birth
    const [genderNew, setGenderNew] = useState(''); // Updated gender
    const [residenceNew, setResidenceNew] = useState(''); // Updated residence

    const [fnameNewError, setFNameNewError] = useState(''); // Error for first name
    const [lnameNewError, setLNameNewError] = useState(''); // Error for last name
    const [dobNewError, setDobNewError] = useState(''); // Error for date of birth
    const [genderNewError, setGenderNewError] = useState(''); // Error for gender
    const [residenceNewError, setResidenceNewError] = useState(''); // Error for residence
    const [basicInfoError, setBasicInfoError] = useState(''); // General error for basic information

    const [basicOptions, setBasicOptions] = useState(false); // State to control visibility of basic info edit options
    const [dropValue, setDropValue] = useState(''); // Dropdown value for residence
    const [datePickerValue, setDatePickerValue] = useState(''); // Date picker value
    const [basicOptionDisable, setbasicOptionDisable] = useState('option-disable'); // State to enable/disable basic options
    const [isUpdatingBasicInfo, setUpdatingBasicInfo] = useState(false); // State to track if basic info is being updated

    // Function to enable basic info edit options
    const handleBasicOptions = () => {
        setbasicOptionDisable(''); // Enabling options
        setBasicOptions(true); // Showing the options
    };

    // Dropdown options for residence
    const options = [
        { label: 'Punjab', value: 'Punjab', key: 1 },
        { label: 'Sindh', value: 'Sindh', key: 2 },
        { label: 'Balochistan', value: 'Balochistan', key: 3 },
        { label: 'Khyber Pakhtunkhwa', value: 'Khyber Pakhtunkhwa', key: 4 },
        { label: 'Kashmir', value: 'Kashmir', key: 5 }
    ];

    // Function to set gender to male
    const setGenderNewMale = () => {
        setGenderNew('male');
    };

    // Function to set gender to female
    const setGenderNewFemale = () => {
        setGenderNew('female');
    };

    // Function to handle residence selection from dropdown
    const handleResidenceNew = (e) => {
        setDropValue(e.target.value); // Updating dropdown value
        setResidenceNew(e.target.value); // Updating residence state
    };

    // Function to handle date of birth selection
    const handleDobNew = async (date, dateString) => {
        setDatePickerValue(date); // Setting date picker value
        if (date) {
            const sDate = moment(dateString).format('YYYY/MM/DD'); // Formatting date
            setDobNew(sDate); // Setting formatted date
        } else {
            setDobNew(''); // Clearing the date
        }
    };

    // Function to reset the basic info form to its initial state
    const resetBasicForm = () => {
        setFNameNew('');
        setLNameNew('');
        setDobNew('');
        setGenderNew(gender);
        setResidenceNew('');
        setFNameNewError('');
        setLNameNewError('');
        setDobNewError('');
        setGenderNewError('');
        setResidenceNewError('');
        setBasicInfoError('');
        setDatePickerValue('');
        setbasicOptionDisable('option-disable');
        setBasicOptions(false);
    };

    // Function to cancel basic info update
    const handleBasicCancel = () => {
        setUpdatingBasicInfo(true); // Indicating the update process has started
        resetBasicForm(); // Resetting the form
        setUpdatingBasicInfo(false); // Indicating the update process has ended
    };

    // Function to update basic information
    const UpdateBasicInfo = async (e) => {
        e.preventDefault(); // Preventing the default form submission behavior

        if (!userAccount) {
            setBasicInfoError('You are not logged in'); // Setting an error if the user is not logged in
            return;
        }

        setUpdatingBasicInfo(true); // Indicating that the update process has started

        // Resetting error states
        setFNameNewError('');
        setLNameNewError('');
        setDobNewError('');
        setGenderNewError('');
        setResidenceNewError('');

        // Creating an object to store fields that need to be updated
        let updateList = {};
        if (fnameNew && fnameNew.toLowerCase() !== fname.toLowerCase()) {
            updateList.fname = fnameNew;
        }
        if (lnameNew && lnameNew.toLowerCase() !== lname.toLowerCase()) {
            updateList.lname = lnameNew;
        }
        if (dobNew && dobNew !== dob) {
            updateList.dob = dobNew;
        }
        if (genderNew && genderNew !== gender) {
            updateList.gender = genderNew;
        }
        if (residenceNew && residenceNew !== residence) {
            updateList.residence = residenceNew;
        }

        // If no fields are updated, show an error and stop the update process
        if (Object.keys(updateList).length === 0) {
            setBasicInfoError('No fields to update');
            setUpdatingBasicInfo(false);
            return;
        }

        // Sending the updated fields to the server
        const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/info', {
            method: 'PATCH', // Using the PATCH method for partial updates
            body: JSON.stringify({ ...updateList }), // Sending the updated fields as JSON
            headers: {
                'Content-Type': 'application/json', // Setting the content type
                'Authorization': `Bearer ${userAccount.userToken}` // Including the user's token for authentication
            }
        });

        const resultJson = await result.json(); // Parsing the server response

        if (result.ok) {
            // Updating the states with the new values if the update is successful
            if (fnameNew) setFName(fnameNew.toLowerCase());
            if (lnameNew) setLName(lnameNew.toLowerCase());
            if (dobNew) setDob(dobNew);
            setGender(genderNew);
            if (residenceNew) setResidence(residenceNew);

            // Resetting the form and showing a success alert
            resetBasicForm();
            Swal.fire({
                icon: "success",
                title: "Basic Info Updated!",
                confirmButtonColor: "#1d578a",
            });

            setUpdatingBasicInfo(false); // Indicating the update process has ended
        } else {
            // Handling errors if the update fails
            setBasicInfoError(resultJson.error);

            if (resultJson.errorList) {
                if (resultJson.errorList.fname) setFNameNewError(resultJson.errorList.fname);
                if (resultJson.errorList.lname) setLNameNewError(resultJson.errorList.lname);
                if (resultJson.errorList.dob) setDobNewError(resultJson.errorList.dob);
                if (resultJson.errorList.gender) setGenderNewError(resultJson.errorList.gender);
                if (resultJson.errorList.residence) setResidenceNewError(resultJson.errorList.residence);
            }

            setUpdatingBasicInfo(false); // Indicating the update process has ended
        }
    };

    // State variables for password form
    const [oldPassword, setOldPassword] = useState(''); // State for the old password
    const [newPassword1, setNewPassword1] = useState(''); // State for the new password
    const [newPassword2, setNewPassword2] = useState(''); // State for confirming the new password

    // States for toggling password visibility
    const [oldPasswordShow, setOldPasswordShow] = useState('password');
    const [newPassword1Show, setNewPassword1Show] = useState('password');
    const [newPassword2Show, setNewPassword2Show] = useState('password');

    // State variables for password errors
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPassword1Error, setNewPassword1Error] = useState('');
    const [newPassword2Error, setNewPassword2Error] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [passwordOptions, setPasswordOptions] = useState(false); // State to toggle password update form visibility
    const [passwordOptionDisable, setpasswordOptionDisable] = useState('option-disable'); // State to enable/disable password fields
    const [isUpdatingPassword, setUpdatingPassword] = useState(false); // State to track if the password update is in progress

    // Function to enable password update options
    const handlePasswordOptions = () => {
        setpasswordOptionDisable(''); // Enabling password fields
        setPasswordOptions(true); // Showing the options
    };

    // Rules for password validation
    const rules = [
        { id: 1, condition: 'Minimum of 8 characters' },
        { id: 2, condition: 'At least one number' },
        { id: 3, condition: 'At least one special character' },
        { id: 4, condition: 'At least one uppercase letter' },
        { id: 5, condition: 'At least one lowercase letter' },
    ];

    // Functions to toggle password visibility for each field
    const showOldPassword = () => {
        setOldPasswordShow(oldPasswordShow === 'password' ? 'text' : 'password');
    };

    const showNewPassword1 = () => {
        setNewPassword1Show(newPassword1Show === 'password' ? 'text' : 'password');
    };

    const showNewPassword2 = () => {
        setNewPassword2Show(newPassword2Show === 'password' ? 'text' : 'password');
    };

    // Function to reset the password form
    const resetPasswordForm = () => {
        setOldPassword('');
        setNewPassword1('');
        setNewPassword2('');
        setOldPasswordShow('password');
        setNewPassword1Show('password');
        setNewPassword2Show('password');
        setOldPasswordError('');
        setNewPassword1Error('');
        setNewPassword2Error('');
        setPasswordError('');
        setpasswordOptionDisable('option-disable');
        setPasswordOptions(false);
    };

    // Function to cancel the password update process
    const handlePasswordCancel = () => {
        setUpdatingPassword(true); // Indicating the update process has started
        resetPasswordForm(); // Resetting the form
        setUpdatingPassword(false); // Indicating the update process has ended
    };

    // Function to update the user's password
    const updatePassword = async (e) => {
        e.preventDefault(); // Preventing the default form submission behavior

        if (!userAccount) {
            setPasswordError('You are not logged in'); // Setting an error if the user is not logged in
            return;
        }

        setUpdatingPassword(true); // Indicating the update process has started

        // Resetting password error states
        setOldPasswordError('');
        setNewPassword1Error('');
        setNewPassword2Error('');

        // Sending the password update request to the server
        const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/password', {
            method: 'PATCH', // Using the PATCH method to update the password
            body: JSON.stringify({ oldPassword, newPassword1, newPassword2 }), // Sending the password details as JSON
            headers: {
                'Content-Type': 'application/json', // Setting the content type
                'Authorization': `Bearer ${userAccount.userToken}` // Including the user's token for authentication
            }
        });

        const resultJson = await result.json(); // Parsing the server response

        if (result.ok) {
            // If the password update is successful, reset the form and show a success alert
            resetPasswordForm();
            Swal.fire({
                icon: "success",
                title: "Password Updated!",
                confirmButtonColor: "#1d578a",
            });

            setUpdatingPassword(false); // Indicating the update process has ended
        } else {
            // Handling errors if the password update fails
            setPasswordError(resultJson.error);

            if (resultJson.errorList) {
                if (resultJson.errorList.oldPassword) setOldPasswordError(resultJson.errorList.oldPassword);
                if (resultJson.errorList.newPassword1) setNewPassword1Error(resultJson.errorList.newPassword1);
                if (resultJson.errorList.newPassword2) setNewPassword2Error(resultJson.errorList.newPassword2);
            }

            setUpdatingPassword(false); // Indicating the update process has ended
        }
    };

    // useEffect hook to fetch and populate the user's profile when the component is mounted
    useEffect(() => {
        const fetchProfile = async () => {
            const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/', {
                headers: {
                    'Authorization': `Bearer ${userAccount.userToken}` // Including the user's token for authentication
                }
            });

            const resultJson = await result.json(); // Parsing the server response

            if (result.ok) {
                // Populating the states with the fetched profile details
                if (resultJson.photo) setPhoto(resultJson.photo);
                setEmail(resultJson.email);
                setFName(resultJson.fname);
                setLName(resultJson.lname);
                setDob(moment(resultJson.dob).format('YYYY/MM/DD')); // Formatting the date of birth
                setGender(resultJson.gender);
                setGenderNew(resultJson.gender);
                setSalary(resultJson.salary);
                setDepartment(resultJson.department);
                setResidence(resultJson.residence);
                setRank(resultJson.occupation);
            }

            console.log(resultJson); // Logging the result for debugging purposes
        };

        if (userAccount) fetchProfile(); // Fetching the profile if the user is logged in
    }, [userAccount]); // Dependency array to refetch if userAccount changes

    // Function to handle removing the user's profile photo
    const handlePhotoRemove = async () => {
        if (!userAccount) return; // Preventing action if the user is not logged in

        let cancelOperation = false; // Variable to track if the operation is canceled
        await Swal.fire({
            title: "Are you sure?",
            text: "Remove profile picture?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes",
        }).then((result) => {
            if (!result.isConfirmed) cancelOperation = true; // Canceling the operation if not confirmed
        });

        if (cancelOperation) return; // Exiting if the operation is canceled

        setPhotoUploading(true); // Indicating that the photo removal process has started

        const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/photo', {
            method: 'PATCH', // Using the PATCH method to remove the photo
            body: JSON.stringify({ photo: '' }), // Sending an empty photo field
            headers: {
                'Content-Type': 'application/json', // Setting the content type
                'Authorization': `Bearer ${userAccount.userToken}` // Including the user's token for authentication
            }
        });

        await result.json(); // Parsing the server response

        if (result.ok) {
            // If the photo is successfully removed, reset the photo state and show a success alert
            setPhoto('');
            Swal.fire({
                icon: "success",
                title: "Profile Photo Removed!",
                confirmButtonColor: "#1d578a",
            });
        } else {
            // Handling errors if the photo removal fails
            Swal.fire({
                icon: "error",
                title: "Unable To Remove Profile Photo",
                confirmButtonColor: "#1d578a",
            });
        }

        setPhotoUploading(false); // Indicating that the photo removal process has ended
    };

    // Function to handle uploading a new profile photo
    const handlePhotoUpload = async (e) => {
        if (!userAccount) return; // Preventing action if the user is not logged in

        setPhotoUploading(true); // Indicating that the photo upload process has started

        try {
            const fileValidity = validateImage(e.target.files[0]); // Validating the selected file
            if (fileValidity !== 'Accepted') {
                // Handling errors based on the validation result
                const errorTitle = fileValidity === "File is not an image"
                    ? "File is not an image!"
                    : "File too large (Max limit: 40 MB)";
                Swal.fire({
                    icon: "error",
                    title: errorTitle,
                    confirmButtonColor: "#1d578a",
                });
            } else {
                // Converting the image to base64 format
                const base64 = await convertToBase64(e.target.files[0]);
                const result = await fetch('https://workspacereservation-backend.onrender.com/api/account/photo', {
                    method: 'PATCH', // Using the PATCH method to upload the photo
                    body: JSON.stringify({ photo: base64 }), // Sending the photo as base64
                    headers: {
                        'Content-Type': 'application/json', // Setting the content type
                        'Authorization': `Bearer ${userAccount.userToken}` // Including the user's token for authentication
                    }
                });

                await result.json(); // Parsing the server response

                if (result.ok) {
                    // If the photo is successfully uploaded, update the photo state and show a success alert
                    setPhoto(base64);
                    Swal.fire({
                        icon: "success",
                        title: "Profile Photo Updated!",
                        confirmButtonColor: "#1d578a",
                    });
                } else {
                    // Handling errors if the photo upload fails
                    Swal.fire({
                        icon: "error",
                        title: "Unable To Update Profile Photo",
                        confirmButtonColor: "#1d578a",
                    });
                }
            }
        } catch (error) {
            console.error("Error uploading photo:", error); // Logging the error for debugging
        } finally {
            setPhotoUploading(false); // Indicating that the photo upload process has ended
        }
    };

    // Tooltip styling configuration
    const style = { backgroundColor: "#cbd6e2", color: "#222", fontSize: "13px", fontWeight: "normal" };

    return (   
        <div className="accountpage">

            {/* Main Nav Bar */}
            <NavMenu isAdmin={userAccount.occupation === 'admin' ? true : false} breadcrum="My Account" pagePath="/account"/>

            <div className="account-wrapper animate__animated animate__fadeInUp">
                {/* Account Details */}
                <span className="account-summary">
                    {photo && <img src={photo} alt="Profile" />}
                    {!photo && <img src={no_photo_icon} alt="No Profile" />}
                    <span className="account-summary-profile">
                        <p className="account-profile-name">{fname + ' ' + lname}</p>
                        <p>{email}</p>
                    </span>
                    <span className="account-summary-work">
                        <div className="account-work-unit work-unit-top">Rank:<span>{rank}</span></div>
                        <div className="account-work-unit">Department:<span>{department}</span></div>
                        <div className="account-work-unit work-unit-bottom">salary:<span>{salary}</span></div>
                    </span>
                </span>

                {/* Profile Photo */}
                <div className="account-options-unit">
                    <div className="icon-placement-wrapper">
                        {photo && <img src={photo} alt="Profile" className="option-img" />}
                        {!photo && <img src={no_photo_icon} alt="No Profile" className="option-img" />}
                        <IoCamera disabled={isPhotoUploading} data-tooltip-id="camera" data-tooltip-content="Upload photo" className="camera-icon" onClick={() => document.querySelector(".file-upload-btn").click()} />
                        <Tooltip id="camera" place="bottom" style={style}/>
                        <input 
                            onClick={(e) => {e.target.value=null}}
                            onChange={handlePhotoUpload} 
                            type="file" 
                            accept="image/*"
                            className="file-upload-btn" 
                            hidden
                        />

                        {photo && <IoIosRemoveCircle disabled={isPhotoUploading} data-tooltip-id="remove-photo" data-tooltip-content="Remove photo" className="remove-photo-icon" onClick={handlePhotoRemove}/>}
                        <Tooltip id="remove-photo" place="top" style={style}/>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="signup-form-wrapper basic-form-wrapper ">
                <form className="signup-form animate__animated animate__fadeInUp" onSubmit={UpdateBasicInfo}>
                    <h1 className="password-heading">
                        Basic Info
                        {!basicOptions && <MdEdit data-tooltip-id="edit" data-tooltip-content="Edit basic info" onClick={handleBasicOptions} className="form-edit-icon"/>}
                        <Tooltip id="edit" place="left" style={style}/>
                    </h1>
                    <div className="signup-setup-grid">
                        <div className="signup-form-unit signup-fname update-fname">
                            <label>First Name</label>
                            <input 
                                type="text"
                                placeholder={fname}
                                disabled={!basicOptions} 
                                onChange={(e) => setFNameNew(e.target.value)} 
                                value={fnameNew} 
                                className={fnameNewError ? 'field-error' : basicOptionDisable} 
                            />
                            {fnameNewError && <div className="error-text">{fnameNewError}</div>}
                        </div>
                        <div className="signup-form-unit signup-lname">
                            <label>Last Name</label>
                            <input 
                                type="text"
                                placeholder={lname} 
                                disabled={!basicOptions} 
                                onChange={(e) => setLNameNew(e.target.value)} 
                                value={lnameNew} 
                                className={lnameNewError ? 'field-error' : basicOptionDisable} 
                            />
                            {lnameNewError && <div className="error-text">{lnameNewError}</div>}
                        </div>
                        <div className="signup-form-unit signup-age">
                            <label>Date Of Birth</label>
                            <DatePicker
                                placeholder={dob}
                                disabled={!basicOptions} 
                                disabledDate={(current) => current.isAfter(moment())}
                                value={datePickerValue}
                                className={dobNewError ? 'field-error signup-date-unit' : 'signup-date-unit'} 
                                onChange={handleDobNew}
                            />
                            {dobNewError && <div className="error-text">{dobNewError}</div>}
                        </div>
                        <div className="signup-form-unit signup-gender">
                            <label>Gender</label>
                            <div className="radio-wrapper"> 
                                <button type="button" 
                                    disabled={!basicOptions} 
                                    className={genderNew === 'male' ? 'radio-option-selected' : basicOptionDisable + ' radio-option'} 
                                    onClick={setGenderNewMale}>
                                    Male
                                </button>
                                <button type="button"
                                    disabled={!basicOptions} 
                                    className={genderNew === 'female' ? 'radio-option-selected' : basicOptionDisable + ' radio-option'} 
                                    onClick={setGenderNewFemale}>
                                    Female
                                </button>
                            </div>
                            {genderNewError && <div className="error-text">{genderNewError}</div>}
                        </div>
                        <div className="signup-form-unit signup-residence">
                            <label>Residence</label>
                            <span className="absolute-icon-wrapper">
                                <select 
                                    disabled={!basicOptions} 
                                    className={residenceNewError ? 'field-error dep-drop' : basicOptionDisable + ' dep-drop'} 
                                    onChange={handleResidenceNew}
                                    value={dropValue}
                                >
                                    <option hidden className='default-dep-drop'>{residence}</option>
                                    {options.map(option => (
                                        <option key={option.key} value={option.value}>
                                        {option.label}
                                        </option>
                                    ))}
                                </select>
                                    {basicOptions && <FaAngleDown className="drop-icon" />}
                                </span>
                            {residenceNewError && <div className="error-text">{residenceNewError}</div>}
                        </div>
                        {basicOptions && <div className="info-btn-update signup-btn">
                            <button disabled={isUpdatingBasicInfo} className="password-btn-update">Save</button>
                            <button type="button" disabled={isUpdatingBasicInfo} onClick={handleBasicCancel} className="password-btn-cancel">Cancel</button>
                        </div>}
                    </div>
                    {basicInfoError && <div className="signup-error">{basicInfoError}</div>}
                </form>
            </div>

            {/* Password Form */}
            <div className="password-form-wrapper">
                <form className="password-form animate__animated animate__fadeInUp" onSubmit={updatePassword}>
                    <h1 className="password-heading">
                        Password 
                        {!passwordOptions && <MdEdit data-tooltip-id="update-password" data-tooltip-content="Update password" onClick={handlePasswordOptions} className="form-edit-icon"/>}
                        <Tooltip id="update-password" place="left" style={style}/>
                    </h1>
                    <div className="password-form-grid">
                        <div className="password-rules-wrapper">
                            <h2>Password Rules</h2>
                            <ul>
                                {rules && rules.map((rule) =>
                                    <li key={rule.id}>
                                        {rule.condition}
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="password-form-unit old-password">
                            <label>Current Password </label>
                            <div className="password-tag-wrapper">                   
                                <input 
                                    type={oldPasswordShow} 
                                    onChange={(e) => setOldPassword(e.target.value)} 
                                    value={oldPassword}
                                    disabled={!passwordOptions}
                                    className={oldPasswordError ? 'password-error' : passwordOptionDisable}
                                />
                                <button type="button" className="show-password-btn" hidden={!passwordOptions} onClick={showOldPassword}>
                                    {oldPasswordShow === 'password' ? <FiIcons.FiEye /> : <FiIcons.FiEyeOff /> } 
                                </button>
                            </div>
                            {oldPasswordError && <div className="password-error-text">{oldPasswordError}</div>}
                        </div>  
                        <div className="password-form-unit new-password1">
                            <label>New Password</label>
                            <div className="password-tag-wrapper">                   
                                <input 
                                    type={newPassword1Show} 
                                    onChange={(e) => setNewPassword1(e.target.value)} 
                                    value={newPassword1}
                                    disabled={!passwordOptions}
                                    className={oldPasswordError ? 'password-error' : passwordOptionDisable}
                                />
                                <button type="button" className="show-password-btn" hidden={!passwordOptions} onClick={showNewPassword1}>
                                    {newPassword1Show === 'password' ? <FiIcons.FiEye /> : <FiIcons.FiEyeOff /> } 
                                </button>
                            </div>
                            {newPassword1Error && <div className="password-error-text">{newPassword1Error}</div>}
                        </div>  
                        <div className="password-form-unit new-password2">
                            <label>Confirm Password</label>
                            <div className="password-tag-wrapper">                   
                                <input 
                                    type={newPassword2Show} 
                                    onChange={(e) => setNewPassword2(e.target.value)} 
                                    value={newPassword2}
                                    disabled={!passwordOptions} 
                                    className={oldPasswordError ? 'password-error' : passwordOptionDisable}
                                />
                                <button type="button" className="show-password-btn" hidden={!passwordOptions} onClick={showNewPassword2}>
                                    {newPassword2Show === 'password' ? <FiIcons.FiEye /> : <FiIcons.FiEyeOff /> } 
                                </button>
                            </div>
                            {newPassword2Error && <div className="password-error-text">{newPassword2Error}</div>}
                        </div>
                    </div> 
                    {passwordOptions && <div className="password-btn-wrapper">
                            <button disabled={isUpdatingPassword} className="password-btn-update">Save</button>
                            <button type="button" disabled={isUpdatingPassword} onClick={handlePasswordCancel} className="password-btn-cancel">Cancel</button>
                    </div>}
                    {passwordError && <div className="password-form-error">{passwordError}</div>}
                </form>
            </div>
        </div>


    )
}

export default MyAccount
