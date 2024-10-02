import React, { useState } from "react";
import { useAuthorize } from "../context/hook/useAuthorization"; 
import '../styles/login.css'; 
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from './Images/Nav/Lums_Logo.png';
import { BarLoader } from "react-spinners"; 

const Login = () => {
    const { dispatch } = useAuthorize();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [typePassword, setTypePassword] = useState('password');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Perform the login operation
        const response = await fetch('https://workspacereservation-backend.onrender.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Assuming you save user's data and token to context or local storage
            localStorage.setItem('userDetails', JSON.stringify(result));
            dispatch({ type: 'LOGIN', payload: result });

            // Redirect or perform additional actions on successful login
            console.log('Login successful:', result);
        } else {
            setError(result.error || 'Failed to login');
        }
        setIsLoading(false);
    };

    const togglePasswordVisibility = () => {
        setTypePassword(prevType => prevType === 'password' ? 'text' : 'password');
    };

    return (
        <div className="login-view-wrapper">
            <div className="login-form-wrapper">
                <div className="top-bar-login">
                    <img src={logo} alt="Logo" className="bar-logo-login"/>
                </div>
                <form className="login-form" onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <div className="login-form-unit">
                        <label>Email<span className="form-required">*</span></label>
                        <input 
                            type="email" 
                            onChange={(e) => setEmail(e.target.value)} 
                            value={email} 
                            className={error ? 'empty-error' : ''} 
                        />
                    </div>
                    <div className="login-form-unit">
                        <label>Password<span className="form-required">*</span></label>
                        <div className="password-wrapper">
                            <input 
                                type={typePassword} 
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                className={error ? 'empty-error' : ''} 
                            />
                            <button type="button" className="show-password" onClick={togglePasswordVisibility}>
                                {typePassword === 'password' ? <FiEye /> : <FiEyeOff />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="login-btn-submit">
                        {!isLoading ? 'Login' : <BarLoader size={20} color="white" />}
                    </button>
                    {error && <div className="login-error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default Login;
