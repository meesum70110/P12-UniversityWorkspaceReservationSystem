import { useState } from "react";

// For accessing global state for logged in users
import { useAuthorize } from "../context/hook/useAuthorization";

import '../styles/signup.css'
import '../styles/profile.css'
import 'animate.css';

// Importing icons to be used in signup card
import * as BsTcons from "react-icons/bs";
import { FaAngleDown } from "react-icons/fa6";

//Importing Shared Components
import NavMenu from "./SharedComponents/navMenu";

// Importing Alerts
import Swal from "sweetalert2";

// Loading slider
import { BarLoader } from "react-spinners";

const SignUp = (prop)=>{

    // userAccount object stores the current state including email, occupation, jwt
    const {userAccount} = useAuthorize();

    const [email, setEmail] = useState('');
    const [salary, setSalary] = useState('');
    const [occupation, setOccupation] = useState('');
    const [department, setDepartment] = useState('');
    const [dropValue, setDropValue] = useState('');

    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [salaryError, setSalaryError] = useState('');
    const [occupationError, setOccupationError] = useState('');
    const [departmentError, setDepartmentError] = useState('');

    // To highlight error by changing class in case radio option not selected
    const [occupationErrorClass, setOccupationErrorClass] = useState('radio-option');

    const [isLoading, setIsLoading] = useState(null);

    const options = [
        {label: 'Marketing', value:'Marketing', key: 1},
        {label: 'Finance', value:'Finance', key: 2},
        {label: 'Design', value:'Design', key: 3},
        {label: 'Sales', value:'Sales', key: 4},
        {label: 'Other', value:'Other', key: 5}
    ]

    const showPageInfo = () => {
    Swal.fire({
        text: "For account creation complete the following fields. Login credentials including password will be emailed automatically.",
        confirmButtonColor: "#1d578a",
        });   
    }

    const setOccupationAdmin = () => {
        if(occupation === 'admin')
            setOccupation('');
        else
            setOccupation('admin')
    }

    const setOccupationEmployee = () => {
        if(occupation === 'employee')
            setOccupation('');
        else
            setOccupation('employee')
    }

    const handleDepartment = (e) => {
        setDropValue(e.target.value);
        setDepartment(e.target.value);
    }

    const handleAccountCreation = async (e) => {

        // Prevents default action of page refresh on form submission
        e.preventDefault();

        if(!userAccount)
        {
            setError('You are not logged in');
            return;
        }
        else if(userAccount.occupation !== 'admin')
        {
            setError('You are not an admin');
            return;
        }

        setIsLoading(true);
        setEmailError('');
        setSalaryError('');
        setOccupationError('');
        setOccupationErrorClass('radio-option');
        setDepartmentError('');

        const result = await fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify({email, salary, occupation, department}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        })

        const resultJson = await result.json();

        if (result.ok)
        {
            setError('');
            setEmailError('');
            setSalaryError('');
            setOccupationError('');
            setOccupationErrorClass('radio-option');
            setDepartmentError('');

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
            console.log(resultJson);
            setIsLoading(false);
        }
        else
        {
            setError(resultJson.error);

            if(resultJson.errorList)
            {
                if (resultJson.errorList.email)
                    setEmailError(resultJson.errorList.email);

                if (resultJson.errorList.salary)
                    setSalaryError(resultJson.errorList.salary);

                if (resultJson.errorList.occupation)
                {
                    setOccupationError(resultJson.errorList.occupation);
                    setOccupationErrorClass('radio-option-error');
                }

                if (resultJson.errorList.department)
                    setDepartmentError(resultJson.errorList.department);
            }
            setIsLoading(false);
        }

    }

    return (   
        <div className="signup">

            {/* Main Nav Bar */}
            <NavMenu isAdmin={true} breadcrum="Add Employee" pagePath="/create-account"/>

            <div className="signup-form-wrapper">
                <form className="signup-form animate__animated animate__fadeInUp" onSubmit={handleAccountCreation}>
                    <h1 className="signup-heading">
                        Create Account 
                        <BsTcons.BsQuestionCircleFill className="question-icon" onClick={showPageInfo} />
                    </h1>
                    <div className="signup-form-grid">
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
                                    Employee
                                </button>
                            </div>
                            {occupationError && <div className="error-text">{occupationError}</div>}
                        </div>
                    </div>
                    <button disabled={isLoading} className="signup-btn-submit">
                        {
                            !isLoading ? 'Create' : <BarLoader size={20} color="white"  />
                        }
                    </button>
                    {error && <div className="signup-error">{error}</div>}
                </form>
            </div>
        </div>
    )
}

export default SignUp

