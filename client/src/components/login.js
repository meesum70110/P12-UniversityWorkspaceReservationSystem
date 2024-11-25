// Importing React and the useState hook
import React, { useState } from "react";

// Importing the authorization context for managing user state
import { useAuthorize } from "../context/hook/useAuthorization"; 

// Importing styles for the login page
import '../styles/login.css'; 

// Importing icons for toggling password visibility
import { FiEye, FiEyeOff } from "react-icons/fi";

// Importing the logo image for the login page
import logo from './Images/Nav/Lums_Logo.png';

// Importing a loading spinner component for the login button
import { BarLoader } from "react-spinners"; 

// Functional component definition for the Login page
const Login = () => {
    // Destructuring the dispatch function from the authorization context
    const { dispatch } = useAuthorize();

    // State variables for email and password inputs
    const [email, setEmail] = useState(''); // State for the email input field
    const [password, setPassword] = useState(''); // State for the password input field

    // State variable to toggle password visibility
    const [typePassword, setTypePassword] = useState('password'); // Default type is "password"

    // State variables for managing error messages and the loading spinner
    const [error, setError] = useState(''); // State for storing error messages
    const [isLoading, setIsLoading] = useState(false); // State to indicate if login is in progress

    // Function to handle the login process
    const handleLogin = async (e) => {
        e.preventDefault(); // Preventing the default form submission behavior
        setIsLoading(true); // Enabling the loading spinner
        setError(''); // Clearing any previous error messages

        // Sending login request to the server
        const response = await fetch('https://workspacereservation-backend.onrender.com/api/login', {
            method: 'POST', // Using POST method for authentication
            headers: {
                'Content-Type': 'application/json', // Setting the content type to JSON
            },
            body: JSON.stringify({ email, password }), // Sending email and password as JSON
        });

        const result = await response.json(); // Parsing the JSON response from the server

        if (response.ok) {
            // If login is successful, save user details in local storage and update the context
            localStorage.setItem('userDetails', JSON.stringify(result)); // Storing user details in local storage
            dispatch({ type: 'LOGIN', payload: result }); // Dispatching login action to update the state

            // Additional actions can be performed here, such as redirecting the user
            console.log('Login successful:', result); // Logging the result for debugging purposes
        } else {
            // If login fails, display the error message
            setError(result.error || 'Failed to login'); // Setting the error message
        }
        setIsLoading(false); // Disabling the loading spinner
    };

    // Function to toggle the visibility of the password
    const togglePasswordVisibility = () => {
        setTypePassword(prevType => prevType === 'password' ? 'text' : 'password'); // Switching between "password" and "text"
    };

    // JSX for rendering the Login component
    return (
        <div className="login-view-wrapper">
            {/* Wrapper for the login form */}
            <div className="login-form-wrapper">
                {/* Top bar with the logo */}
                <div className="top-bar-login">
                    <img src={logo} alt="Logo" className="bar-logo-login" /> {/* Displaying the logo */}
                </div>
                {/* Login form */}
                <form className="login-form" onSubmit={handleLogin}>
                    <h1>Login</h1> {/* Form heading */}
                    
                    {/* Email input field */}
                    <div className="login-form-unit">
                        <label>Email<span className="form-required">*</span></label> {/* Label for the email field */}
                        <input 
                            type="email" // Email input type
                            onChange={(e) => setEmail(e.target.value)} // Updating the email state on change
                            value={email} // Binding the email state to the input field
                            className={error ? 'empty-error' : ''} // Applying an error class if there's an error
                        />
                    </div>

                    {/* Password input field */}
                    <div className="login-form-unit">
                        <label>Password<span className="form-required">*</span></label> {/* Label for the password field */}
                        <div className="password-wrapper">
                            <input 
                                type={typePassword} // Dynamically setting the input type for password visibility
                                onChange={(e) => setPassword(e.target.value)} // Updating the password state on change
                                value={password} // Binding the password state to the input field
                                className={error ? 'empty-error' : ''} // Applying an error class if there's an error
                            />
                            <button type="button" className="show-password" onClick={togglePasswordVisibility}>
                                {/* Toggling the password visibility icon */}
                                {typePassword === 'password' ? <FiEye /> : <FiEyeOff />}
                            </button>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button type="submit" disabled={isLoading} className="login-btn-submit">
                        {/* Displaying either "Login" text or a loading spinner based on isLoading state */}
                        {!isLoading ? 'Login' : <BarLoader size={20} color="white" />}
                    </button>

                    {/* Error message display */}
                    {error && <div className="login-error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

// Exporting the Login component as the default export
export default Login;
