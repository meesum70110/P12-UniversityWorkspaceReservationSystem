import { useState } from "react";

// For accessing global state for logged-in users
import { useAuthorize } from "../context/hook/useAuthorization";

// Importing styles for the signup page
import '../styles/signup.css';
import '../styles/profile.css';
import 'animate.css';

// Importing icons to be used in the signup card
import * as BsTcons from "react-icons/bs";
import { FaAngleDown } from "react-icons/fa6";

// Importing shared components like the navigation menu
import NavMenu from "./SharedComponents/navMenu";

// Importing alert library for user notifications
import Swal from "sweetalert2";

// Loading spinner for the submit button
import { BarLoader } from "react-spinners";

// Main SignUp component for creating user accounts
const SignUp = () => {
    // Destructuring the userAccount object to access user information
    const { userAccount } = useAuthorize();

    // Defining state variables for user input fields and errors
    const [email, setEmail] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [occupation, setOccupation] = useState('');
    const [department, setDepartment] = useState('');
    const [dropValue, setDropValue] = useState('');

    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [fnameError, setFnameError] = useState('');
    const [lnameError, setLnameError] = useState('');
    const [occupationError, setOccupationError] = useState('');
    const [departmentError, setDepartmentError] = useState('');

    // State for highlighting error in occupation radio buttons
    const [occupationErrorClass, setOccupationErrorClass] = useState('radio-option');

    // State to track loading status
    const [isLoading, setIsLoading] = useState(null);

    // Options for the department dropdown
    const options = [
        { label: 'admin', value: 'admin', key: 1 },
        { label: 'TA', value: 'TA', key: 2 },
    ];

    // Function to show page information using SweetAlert
    const showPageInfo = () => {
        Swal.fire({
            text: "For account creation complete the following fields. Login credentials including password will be emailed automatically.",
            confirmButtonColor: "#1d578a",
        });
    };

    // Function to toggle occupation to 'admin'
    const setOccupationAdmin = () => {
        setOccupation(occupation === 'admin' ? '' : 'admin');
    };

    // Function to toggle occupation to 'employee'
    const setOccupationEmployee = () => {
        setOccupation(occupation === 'employee' ? '' : 'employee');
    };

    // Function to handle department dropdown selection
    const handleDepartment = (e) => {
        setDropValue(e.target.value); // Setting the selected value
        setDepartment(e.target.value); // Updating the department state
    };

    // Function to handle account creation
    const handleAccountCreation = async (e) => {
        // Prevent default form submission behavior
        e.preventDefault();

        // Validation to check if the user is logged in and an admin
        if (!userAccount) {
            setError('You are not logged in');
            return;
        } else if (userAccount.occupation !== 'admin') {
            setError('You are not an admin');
            return;
        }

        // Setting loading state and clearing previous errors
        setIsLoading(true);
        setEmailError('');
        setFnameError('');
        setLnameError('');
        setOccupationError('');
        setOccupationErrorClass('radio-option');
        setDepartmentError('');

        // Sending account creation request to the server
        const result = await fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify({ email, fname, lname, occupation, department }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}` // Including the authorization token
            }
        });

        const resultJson = await result.json();

        if (result.ok) {
            // Resetting fields and showing success message on successful account creation
            setError('');
            setEmail('');
            setFname('');
            setLname('');
            setOccupation('');
            setDepartment('');
            setDropValue('');

            Swal.fire({
                icon: "success",
                title: "Account Created!",
                text: "User has been emailed the account credentials.",
                confirmButtonColor: "#1d578a",
            });
            console.log(resultJson);
            setIsLoading(false);
        } else {
            // Handling errors and updating error states
            setError(resultJson.error);

            if (resultJson.errorList) {
                if (resultJson.errorList.email)
                    setEmailError(resultJson.errorList.email);

                if (resultJson.errorList.fname)
                    setFnameError(resultJson.errorList.fname);

                if (resultJson.errorList.lname)
                    setLnameError(resultJson.errorList.lname);

                if (resultJson.errorList.occupation) {
                    setOccupationError(resultJson.errorList.occupation);
                    setOccupationErrorClass('radio-option-error');
                }

                if (resultJson.errorList.department)
                    setDepartmentError(resultJson.errorList.department);
            }
            setIsLoading(false);
        }
    };

    // Rendering the SignUp component UI
    return (
        <div className="signup">
            {/* Main navigation bar for the signup page */}
            <NavMenu isAdmin={true} breadcrum="Add User" pagePath="/create-account" />

            {/* Wrapper for the signup form */}
            <div className="signup-form-wrapper">
                <form className="signup-form animate__animated animate__fadeInUp" onSubmit={handleAccountCreation}>
                    <h1 className="signup-heading">
                        Create Account
                        <BsTcons.BsQuestionCircleFill className="question-icon" onClick={showPageInfo} />
                    </h1>

                    {/* Form fields grid */}
                    <div className="signup-form-grid">
                        {/* Email input field */}
                        <div className="signup-form-unit signup-email">
                            <label>Email<span className="form-required">*</span></label>
                            <input
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                className={emailError ? 'field-error' : ''}
                            />
                            {emailError && <div className="error-text">{emailError}</div>}
                        </div>

                        {/* Department dropdown */}
                        <div className="signup-form-unit signup-department">
                            <label>User Role<span className="form-required">*</span></label>
                            <span className="absolute-icon-wrapper">
                                <select
                                    className={departmentError ? 'field-error dep-drop' : 'dep-drop'}
                                    onChange={handleDepartment}
                                    value={dropValue}
                                >
                                    <option hidden></option>
                                    {options.map(option => (
                                        <option key={option.key} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <FaAngleDown className="drop-icon" />
                            </span>
                            {departmentError && <div className="error-text">{departmentError}</div>}
                        </div>

                        {/* First Name input field */}
                        <div className="signup-form-unit signup-salary">
                            <label>First Name<span className="form-required">*</span></label>
                            <input
                                type="text"
                                onChange={(e) => setFname(e.target.value)}
                                value={fname}
                                className={fnameError ? 'field-error' : ''}
                            />
                            {fnameError && <div className="error-text">{fnameError}</div>}
                        </div>

                        {/* Last Name input field */}
                        <div className="signup-form-unit signup-lname">
                            <label>Last Name<span className="form-required">*</span></label>
                            <input
                                type="text"
                                onChange={(e) => setLname(e.target.value)}
                                value={lname}
                                className={lnameError ? 'field-error' : ''}
                            />
                            {lnameError && <div className="error-text">{lnameError}</div>}
                        </div>

                        {/* Occupation selection radio buttons */}
                        <div className="signup-form-unit signup-occupation">
                            <label>Rank<span className="form-required">*</span></label>
                            <div className="radio-wrapper">
                                <button type="button"
                                    className={occupation === 'admin' ? 'radio-option-selected' : occupationErrorClass}
                                    onClick={setOccupationAdmin}>
                                    Admin
                                </button>
                                <button type="button"
                                    className={occupation === 'employee' ? 'radio-option-selected' : occupationErrorClass}
                                    onClick={setOccupationEmployee}>
                                    TA
                                </button>
                            </div>
                            {occupationError && <div className="error-text">{occupationError}</div>}
                        </div>
                    </div>

                    {/* Submit button for form submission */}
                    <button disabled={isLoading} className="signup-btn-submit">
                        {
                            !isLoading ? 'Create' : <BarLoader size={20} color="white" />
                        }
                    </button>

                    {/* Display general error message if any */}
                    {error && <div className="signup-error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default SignUp;
