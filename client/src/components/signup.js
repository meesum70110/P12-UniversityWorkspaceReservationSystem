// Importing React hooks and libraries
import { useState } from "react"; // Hook for managing component state

// Importing authorization hook to access global state for logged-in users
import { useAuthorize } from "../context/hook/useAuthorization";

// Importing CSS styles for the signup and profile components
import '../styles/signup.css';
import '../styles/profile.css';

// Importing animation library for transitions
import 'animate.css';

// Importing icons for the signup form
import * as BsTcons from "react-icons/bs"; // Icon library for question icon
import { FaAngleDown } from "react-icons/fa6"; // Icon for dropdown menu

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation menu component

// Importing SweetAlert for user-friendly alerts
import Swal from "sweetalert2";

// Importing a loading spinner for the create button
import { BarLoader } from "react-spinners";

const SignUp = (prop) => {
    // Destructuring userAccount object from the authorization context
    const { userAccount } = useAuthorize();

    // Defining state variables for form fields and error messages
    const [email, setEmail] = useState(''); // State for user email
    const [salary, setSalary] = useState(''); // State for user salary
    const [occupation, setOccupation] = useState(''); // State for user occupation (admin or employee)
    const [department, setDepartment] = useState(''); // State for user department
    const [dropValue, setDropValue] = useState(''); // State for dropdown value

    const [error, setError] = useState(''); // General error state
    const [emailError, setEmailError] = useState(''); // Email-specific error state
    const [salaryError, setSalaryError] = useState(''); // Salary-specific error state
    const [occupationError, setOccupationError] = useState(''); // Occupation-specific error state
    const [departmentError, setDepartmentError] = useState(''); // Department-specific error state

    // State for changing the radio button class for error highlighting
    const [occupationErrorClass, setOccupationErrorClass] = useState('radio-option');

    const [isLoading, setIsLoading] = useState(null); // State to indicate if the form is submitting

    // Options for the department dropdown menu
    const options = [
        { label: 'Marketing', value: 'Marketing', key: 1 },
        { label: 'Finance', value: 'Finance', key: 2 },
        { label: 'Design', value: 'Design', key: 3 },
        { label: 'Sales', value: 'Sales', key: 4 },
        { label: 'Other', value: 'Other', key: 5 }
    ];

    // Function to show informational alert about the form
    const showPageInfo = () => {
        Swal.fire({
            text: "For account creation complete the following fields. Login credentials including password will be emailed automatically.",
            confirmButtonColor: "#1d578a",
        });
    };

    // Function to toggle occupation to admin
    const setOccupationAdmin = () => {
        if (occupation === 'admin') setOccupation('');
        else setOccupation('admin');
    };

    // Function to toggle occupation to employee
    const setOccupationEmployee = () => {
        if (occupation === 'employee') setOccupation('');
        else setOccupation('employee');
    };

    // Function to handle department selection from dropdown
    const handleDepartment = (e) => {
        setDropValue(e.target.value); // Updating the dropdown value
        setDepartment(e.target.value); // Updating the department state
    };

    // Function to handle account creation form submission
    const handleAccountCreation = async (e) => {
        e.preventDefault(); // Preventing the default form submission behavior

        // Validating user authorization and role
        if (!userAccount) {
            setError('You are not logged in');
            return;
        } else if (userAccount.occupation !== 'admin') {
            setError('You are not an admin');
            return;
        }

        // Resetting error messages and starting the loading spinner
        setIsLoading(true);
        setEmailError('');
        setSalaryError('');
        setOccupationError('');
        setOccupationErrorClass('radio-option');
        setDepartmentError('');

        // Sending account creation data to the backend
        const result = await fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify({ email, salary, occupation, department }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}` // Adding the authorization token
            }
        });

        const resultJson = await result.json(); // Parsing the JSON response

        if (result.ok) {
            // Resetting form fields and showing success alert
            setError('');
            setEmail('');
            setSalary('');
            setOccupation('');
            setDepartment('');
            setDropValue('');

            Swal.fire({
                icon: "success",
                title: "Account Created!",
                text: "User has been emailed the account credentials.",
                confirmButtonColor: "#1d578a",
            });

            console.log(resultJson); // Logging the result for debugging
            setIsLoading(false);
        } else {
            // Handling errors and displaying appropriate error messages
            setError(resultJson.error);

            if (resultJson.errorList) {
                if (resultJson.errorList.email) setEmailError(resultJson.errorList.email);
                if (resultJson.errorList.salary) setSalaryError(resultJson.errorList.salary);
                if (resultJson.errorList.occupation) {
                    setOccupationError(resultJson.errorList.occupation);
                    setOccupationErrorClass('radio-option-error');
                }
                if (resultJson.errorList.department) setDepartmentError(resultJson.errorList.department);
            }

            setIsLoading(false); // Stopping the loading spinner
        }
    };

    // JSX for rendering the SignUp component
    return (
        <div className="signup">

            {/* Main Navigation Menu */}
            <NavMenu isAdmin={true} breadcrum="Add Employee" pagePath="/create-account" />

            <div className="signup-form-wrapper">
                {/* Form for creating a new account */}
                <form className="signup-form animate__animated animate__fadeInUp" onSubmit={handleAccountCreation}>
                    <h1 className="signup-heading">
                        Create Account 
                        <BsTcons.BsQuestionCircleFill className="question-icon" onClick={showPageInfo} />
                    </h1>

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
                            <label>Department<span className="form-required">*</span></label>
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

                        {/* Salary input field */}
                        <div className="signup-form-unit signup-salary">
                            <label>Salary<span className="form-required">*</span></label>
                            <input 
                                type="number"
                                min="0"
                                onChange={(e) => setSalary(e.target.value)} 
                                value={salary} 
                                className={salaryError ? 'field-error' : ''} 
                            />
                            {salaryError && <div className="error-text">{salaryError}</div>}
                        </div>

                        {/* Occupation radio buttons */}
                        <div className="signup-form-unit signup-occupation">
                            <label>Rank<span className="form-required">*</span></label>
                            <div className="radio-wrapper"> 
                                <button 
                                    type="button" 
                                    className={occupation === 'admin' ? 'radio-option-selected' : occupationErrorClass} 
                                    onClick={setOccupationAdmin}>
                                    Admin
                                </button>
                                <button 
                                    type="button"
                                    className={occupation === 'employee' ? 'radio-option-selected' : occupationErrorClass} 
                                    onClick={setOccupationEmployee}>
                                    Employee
                                </button>
                            </div>
                            {occupationError && <div className="error-text">{occupationError}</div>}
                        </div>
                    </div>

                    {/* Submit button with loading spinner */}
                    <button disabled={isLoading} className="signup-btn-submit">
                        {!isLoading ? 'Create' : <BarLoader size={20} color="white" />}
                    </button>

                    {/* General error message */}
                    {error && <div className="signup-error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default SignUp;
