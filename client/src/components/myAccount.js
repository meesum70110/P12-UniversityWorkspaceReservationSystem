import React, { useState, useEffect} from "react";

// For accessing global state for logged in users
import { useAuthorize } from "../context/hook/useAuthorization";

import '../styles/myaccount.css'
import '../styles/signup.css'
import 'animate.css';


// Importing icons
import { IoCamera } from "react-icons/io5";
import { IoIosRemoveCircle } from "react-icons/io";
import * as FiIcons from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";
import no_photo_icon from './Images/Profile/no-profile-img.png'

// Antd components
import {DatePicker} from "antd";
import moment from 'moment';

//Importing Shared Components
import NavMenu from "./SharedComponents/navMenu";
import {convertToBase64, validateImage} from "./SharedComponents/base64"

// Importing Alerts
import Swal from "sweetalert2";

// Importing Tooltips
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

const MyAccount = (prop)=>{
    
    // userAccount object stores the current state including email, occupation, jwt
    const {userAccount} = useAuthorize();

    // Account summary states
    const [photo, setPhoto] = useState('');
    const [email, setEmail] = useState('');
    const [fname, setFName] = useState('');
    const [lname, setLName] = useState('')
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');

    const [salary, setSalary] = useState('');
    const [department, setDepartment] = useState('');
    const [residence, setResidence] = useState('');
    const [rank, setRank] = useState('');

    // Photo states
    const [isPhotoUploading, setPhotoUploading] = useState(false);

    // Basic info states
    const [fnameNew, setFNameNew] = useState('');
    const [lnameNew, setLNameNew] = useState('');
    const [dobNew, setDobNew] = useState('');
    const [genderNew, setGenderNew] = useState('');
    const [residenceNew, setResidenceNew] = useState('');

    const [fnameNewError, setFNameNewError] = useState('');
    const [lnameNewError, setLNameNewError] = useState('');
    const [dobNewError, setDobNewError] = useState('');
    const [genderNewError, setGenderNewError] = useState('');
    const [residenceNewError, setResidenceNewError] = useState('');
    const [basicInfoError, setBasicInfoError] = useState('');

    const [basicOptions, setBasicOptions] = useState(false);
    const [dropValue, setDropValue] = useState('');
    const [datePickerValue, setDatePickerValue] = useState('');
    const [basicOptionDisable, setbasicOptionDisable] = useState('option-disable');
    const [isUpdatingBasicInfo, setUpdatingBasicInfo] = useState(false);

    const handleBasicOptions = () => {
        setbasicOptionDisable('');
        setBasicOptions(true);
    }

    const options = [
        {label: 'Punjab', value:'Punjab', key: 1},
        {label: 'Sindh', value:'Sindh', key: 2},
        {label: 'Balochistan', value:'Balochistan', key: 3},
        {label: 'Khyber Pakhtunkhwa', value:'Khyber Pakhtunkhwa', key: 4},
        {label: 'Kashmir', value:'Kashmir', key: 5}
    ]

    const setGenderNewMale = () => {
        setGenderNew('male')
    }

    const setGenderNewFemale = () => {
        setGenderNew('female')
    }

    const handleResidenceNew = (e) => {
        setDropValue(e.target.value);
        setResidenceNew(e.target.value);
    }

    const handleDobNew = async (date, dateString) => {
        setDatePickerValue(date);
        if(date)
        {
            const sDate = moment(dateString).format('YYYY/MM/DD');
            setDobNew(sDate);
        }
        else
        {
            setDobNew('');
        }
    }

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
    }

    const handleBasicCancel = () => {
        setUpdatingBasicInfo(true);
        resetBasicForm();
        setUpdatingBasicInfo(false);
    }

    const UpdateBasicInfo = async (e) => {

        // Prevents default action of page refresh on form submission
        e.preventDefault();

        if(!userAccount)
        {
            setBasicInfoError('You are not logged in');
            return;
        }

        setUpdatingBasicInfo(true);

        setFNameNewError('');
        setLNameNewError('');
        setDobNewError('');
        setGenderNewError('');
        setResidenceNewError('')

        let updateList = {}
        if(fnameNew && fnameNew.toLowerCase() !== fname.toLowerCase()){updateList.fname=fnameNew}
        if(lnameNew && lnameNew.toLowerCase() !== lname.toLowerCase()){updateList.lname=lnameNew}
        if(dobNew && dobNew !== dob){updateList.dob=dobNew}
        if(genderNew && genderNew !== gender){updateList.gender=genderNew}
        if(residenceNew && residenceNew !== residence){updateList.residence=residenceNew}

        if(Object.keys(updateList).length === 0)
        {
            setBasicInfoError('No fields to update');
            setUpdatingBasicInfo(false);
            return;
        }

        const result = await fetch('/api/account/info', {
            method: 'PATCH',
            body: JSON.stringify({...updateList}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        })

        const resultJson = await result.json();

        if (result.ok)
        {
            if(fnameNew)
                setFName(fnameNew.toLowerCase());
            if(lnameNew)
                setLName(lnameNew.toLowerCase());
            if(dobNew)
                setDob(dobNew);
            setGender(genderNew);
            if(residenceNew)
                setResidence(residenceNew);

            resetBasicForm();
            setGenderNew(genderNew);

            Swal.fire({
                icon: "success",
                title: "Basic Info Updated!",
                confirmButtonColor: "#1d578a",
            });

            setUpdatingBasicInfo(false);
        }
        else
        {
            setBasicInfoError(resultJson.error);

            if(resultJson.errorList)
            {
                if (resultJson.errorList.fname)
                    setFNameNewError(resultJson.errorList.fname);

                if (resultJson.errorList.lname)
                    setLNameNewError(resultJson.errorList.lname);

                if (resultJson.errorList.dob)
                    setDobNewError(resultJson.errorList.dob);

                if (resultJson.errorList.gender)
                {
                    setGenderNewError(resultJson.errorList.gender);
                }

                if (resultJson.errorList.residence)
                    setResidenceNewError(resultJson.errorList.residence);
            }
            setUpdatingBasicInfo(false);
        }

    }

    // Password form states
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');

    const [oldPasswordShow, setOldPasswordShow] = useState('password');
    const [newPassword1Show, setNewPassword1Show] = useState('password');
    const [newPassword2Show, setNewPassword2Show] = useState('password');

    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPassword1Error, setNewPassword1Error] = useState('');
    const [newPassword2Error, setNewPassword2Error] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [passwordOptions, setPasswordOptions] = useState(false);
    const [passwordOptionDisable, setpasswordOptionDisable] = useState('option-disable');
    const [isUpdatingPassword, setUpdatingPassword] = useState(false);

    const handlePasswordOptions = () => {
        setpasswordOptionDisable('');
        setPasswordOptions(true);
    }

    const rules = [
        {id: 1, condition:'Minimum of 8 characters'},
        {id: 2, condition:'At least one number'},
        {id: 3, condition:'At least one special character'},
        {id: 4, condition:'At least one uppercase letter'},
        {id: 5, condition:'At least one lowercase letter'},
    ]

    const showOldPassword = () => {
        if(oldPasswordShow === 'password')
            setOldPasswordShow('text');
        else
            setOldPasswordShow('password');
    }

    const showNewPassword1 = () => {
        if(newPassword1Show === 'password')
            setNewPassword1Show('text');
        else
            setNewPassword1Show('password');
    }

    const showNewPassword2 = () => {
        if(newPassword2Show === 'password')
            setNewPassword2Show('text');
        else
            setNewPassword2Show('password');
    }

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
    }

    const handlePasswordCancel = () => {
        setUpdatingPassword(true);
        resetPasswordForm();
        setUpdatingPassword(false);
    }

    const updatePassword = async (e) => {

        // Prevents default action of page refresh on form submission
        e.preventDefault();

        if(!userAccount)
        {
            setPasswordError('You are not logged in');
            return;
        }

        setUpdatingPassword(true);

        setOldPasswordError('');
        setNewPassword1Error('');
        setNewPassword2Error('');

        const result = await fetch('/api/account/password', {
            method: 'PATCH',
            body: JSON.stringify({oldPassword, newPassword1, newPassword2}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        })

        const resultJson = await result.json();

        if (result.ok)
        {
            resetPasswordForm();

            Swal.fire({
                icon: "success",
                title: "Password Updated!",
                confirmButtonColor: "#1d578a",
            });
            setUpdatingPassword(false);
        }
        else
        {
            setPasswordError(resultJson.error);

            if(resultJson.errorList)
            {
                if (resultJson.errorList.oldPassword)
                    setOldPasswordError(resultJson.errorList.oldPassword);

                if (resultJson.errorList.newPassword1)
                    setNewPassword1Error(resultJson.errorList.newPassword1);

                if (resultJson.errorList.newPassword2)
                {
                    setNewPassword2Error(resultJson.errorList.newPassword2);
                }
            }
            setUpdatingPassword(false);
        }

    }
 
    // Use effect hook only run once initially when the page in rendered.
    useEffect(() => {
        const fetchProfile = async () => {
            const result = await fetch('/api/account/', {
                headers: {
                    'Authorization': `Bearer ${userAccount.userToken}`
                }
            });
    
            // Parsing json results as array of objects.
            const resultJson = await result.json();
    
            if (result.ok)
            {
                if (resultJson.photo){
                    setPhoto(resultJson.photo);
                }
                setEmail(resultJson.email);
                setFName(resultJson.fname);
                setLName(resultJson.lname);
                setDob(moment(resultJson.dob).format('YYYY/MM/DD'))
                setGender(resultJson.gender);
                setGenderNew(resultJson.gender)
                setSalary(resultJson.salary);
                setDepartment(resultJson.department);
                setResidence(resultJson.residence);
                setRank(resultJson.occupation);
            }

            console.log(resultJson);
        }
           
        if(userAccount)
            fetchProfile();
            
    }, [userAccount]);


    const handlePhotoRemove = async (e) => {
        if(!userAccount)
            return;

        let cancelOperation = false;
        await Swal.fire({
            title: "Are you sure?",
            text: "Remove profile picture?",
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

        setPhotoUploading(true);

        const result = await fetch('/api/account/photo', {
            method: 'PATCH',
            body: JSON.stringify({photo : ''}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        })

        await result.json();
        if (result.ok){
            setPhoto('');
            Swal.fire({
                icon: "success",
                title: "Profile Photo Removed!",
                confirmButtonColor: "#1d578a",
            });
        }
            
        else{
            Swal.fire({
                icon: "error",
                title: "Unable To Remove Profile Photo",
                confirmButtonColor: "#1d578a",
            });
        }
        
        setPhotoUploading(false);
    }


    const handlePhotoUpload = async (e) => {
        if(!userAccount)
            return;
        setPhotoUploading(true);
        try{
            const fileValidity = validateImage(e.target.files[0]);
            if(fileValidity !== 'Accepted')
            {
                if(fileValidity === "File is not an image")
                {
                    Swal.fire({
                        icon: "error",
                        title: "File is not an image!",
                        confirmButtonColor: "#1d578a",
                    });
                }
                else if(fileValidity === "File too large (Max limit: 40 MB)")
                {
                    Swal.fire({
                        icon: "error",
                        title: "File too large (Max limit: 40 MB)",
                        confirmButtonColor: "#1d578a",
                    });
                }
            }
            else
            {
                const base64 = await convertToBase64(e.target.files[0]);
                const result = await fetch('/api/account/photo', {
                    method: 'PATCH',
                    body: JSON.stringify({photo : base64}),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userAccount.userToken}`
                    }
                })

                await result.json();
                if (result.ok){
                    setPhoto(base64);
                    Swal.fire({
                        icon: "success",
                        title: "Profile Photo Updated!",
                        confirmButtonColor: "#1d578a",
                    });
                }
                else{
                    Swal.fire({
                        icon: "error",
                        title: "Unable To Update Profile Photo",
                        confirmButtonColor: "#1d578a",
                    });
                }
            }
            setPhotoUploading(false);

        }
        catch (error){
            setPhotoUploading(false);
        }
    }

    // Tooltip style
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