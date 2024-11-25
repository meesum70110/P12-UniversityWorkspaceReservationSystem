// Importing necessary libraries and hooks
import React, { useState, useEffect, useContext } from "react";

// Importing the authorization hook to manage global state for logged-in users
import { useAuthorize } from "../context/hook/useAuthorization";

// Importing CSS styles for forms and FAQs
import '../styles/formCards.css';
import '../styles/faqs.css';

// Importing animation library
import 'animate.css';

// Importing icons for delete actions
import * as MdIcons from "react-icons/md";

// Placeholder image for no records
import no_record_icon from './Images/Record/no-record-img.png';

// Importing date formatting utility
import { format } from "date-fns";

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation menu component
import LoadingIcon from "./SharedComponents/loading"; // Loading spinner

// Importing SweetAlert for better alerts
import Swal from "sweetalert2";

// Importing socket context for real-time updates
import { SocketContext } from "../context/socket";

// Importing and styling tooltips
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// Functional component definition for FAQ management
const FaqsManage = (prop) => {
    // Extracting user account data from the authorization context
    const { userAccount } = useAuthorize();

    // Accessing the socket context for real-time data updates
    const socket = useContext(SocketContext);

    // State variables for FAQ data
    const [faqs, setFaqs] = useState(null); // Array of FAQs
    const [faqsExist, setExist] = useState(true); // Boolean to track if FAQs exist

    // State variables for new FAQ form
    const [question, setQuestion] = useState(''); // Question input
    const [answer, setAnswer] = useState(''); // Answer input
    const [error, setError] = useState(''); // Error message
    const [isLoading, setIsLoading] = useState(null); // Loading spinner for the form
    const [isFetching, setFetching] = useState(true); // Loading spinner for fetching FAQs

    // State variable to track blank fields
    const [blankFields, setBlankFields] = useState([]); // Tracks which fields are blank

    // useEffect hook to fetch FAQs when the component mounts
    useEffect(() => {
        const fetchFaqs = async () => {
            setFetching(true); // Enabling the fetching spinner

            // Fetching FAQs from the server
            const result = await fetch('https://workspacereservation-backend.onrender.com/api/faqs/', {
                headers: {
                    'Authorization': `Bearer ${userAccount.userToken}` // Including user token for authentication
                }
            });

            const resultJson = await result.json(); // Parsing the response

            if (result.ok) {
                setFaqs(resultJson); // Updating the FAQs state
                setExist(resultJson.length !== 0); // Updating whether FAQs exist
            }

            setFetching(false); // Disabling the fetching spinner
        };

        if (userAccount && userAccount.occupation === 'admin') {
            // Fetching FAQs and notifying the socket server
            fetchFaqs();
            socket.emit('faqs', socket.id);
        }
    }, [userAccount, socket]);

    // useEffect hook to handle real-time updates for FAQs
    useEffect(() => {
        socket.on('faqs', (newFaqsAll) => {
            setFaqs(newFaqsAll); // Updating FAQs state with real-time data
            setExist(newFaqsAll.length > 0); // Updating whether FAQs exist
        });
    }, [socket]);

    // Function to handle adding a new FAQ
    const handleNewFaq = async (e) => {
        e.preventDefault(); // Preventing default form submission

        if (!userAccount) {
            setError('You are not logged in'); // Showing an error if the user is not logged in
            return;
        } else if (userAccount.occupation !== 'admin') {
            setError('You are not an admin'); // Showing an error if the user is not an admin
            return;
        }

        setIsLoading(true); // Enabling the loading spinner

        // Checking for blank fields
        if ((!question || question.trim().length === 0) || (!answer || answer.trim().length === 0)) {
            setBlankFields([]); // Resetting blank fields
            setError('Please fill out all the fields'); // Showing an error message
            let emptyFields = [];
            if (!question || question.trim().length === 0) emptyFields.push('Question');
            if (!answer || answer.trim().length === 0) emptyFields.push('Answer');
            setBlankFields(emptyFields); // Highlighting blank fields
            setIsLoading(false); // Disabling the loading spinner
            return;
        }

        // Creating a new FAQ object
        const newFaq = { question, answer };

        // Sending the new FAQ to the server
        const result = await fetch('https://workspacereservation-backend.onrender.com/api/faqs/', {
            method: 'POST', // Using POST to add a new FAQ
            body: JSON.stringify(newFaq), // Sending FAQ data as JSON
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}` // Including user token for authentication
            }
        });

        const resultJson = await result.json(); // Parsing the server response

        if (result.ok) {
            // Clearing form fields and showing a success message
            setError(null);
            setBlankFields([]);
            setQuestion('');
            setAnswer('');
            console.log("New FAQ added: ", resultJson);
            Swal.fire({
                icon: "success",
                title: "New FAQ Added!",
                confirmButtonColor: "#1d578a",
            });
        } else {
            // Handling errors if the FAQ creation fails
            setError(resultJson.error);
            setBlankFields(resultJson.errorFields || []);
        }

        setIsLoading(false); // Disabling the loading spinner
    };

    // Function to handle deleting an FAQ
    const handleDeleteFaq = async (id) => {
        if (!userAccount || userAccount.occupation !== 'admin') return; // Ensuring the user is an admin

        let cancelOperation = false; // Variable to track if the operation is canceled

        await Swal.fire({
            title: "Are you sure?",
            text: "Delete this FAQ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes",
        }).then((result) => {
            if (!result.isConfirmed) cancelOperation = true; // Canceling the operation if not confirmed
        });

        if (cancelOperation) return; // Exiting if the operation is canceled

        // Sending a delete request to the server
        const result = await fetch('https://workspacereservation-backend.onrender.com/api/faqs/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userAccount.userToken}` // Including user token for authentication
            }
        });

        const resultJson = await result.json(); // Parsing the server response

        if (result.ok) {
            // Showing a success message if the FAQ is deleted
            console.log("FAQ deleted: ", resultJson);
            Swal.fire({
                icon: "success",
                title: "FAQ deleted!",
                confirmButtonColor: "#1d578a",
            });
        } else {
            console.error(resultJson.error); // Logging any errors
        }
    };

    // Tooltip style configuration
    const style = { backgroundColor: "#cbd6e2", color: "#222", fontSize: "13px", fontWeight: "normal" };

    return (
        <div className="faqspage">
            {/* Main Navigation Bar */}
            <NavMenu isAdmin={true} breadcrum="FAQS" pagePath="/faqs-manage" />
            
            {/* FAQ Management Section */}
            <div className="faq-management">
                {/* Add FAQ Form */}
                <div className="faq-add-form">
                    <form onSubmit={handleNewFaq}>
                        <h1>Add A New Question</h1>
                        <div className="faq-form-unit">
                            <label>Question<span className="form-required">*</span></label>
                            <input 
                                type="text" 
                                onChange={(e) => setQuestion(e.target.value)} 
                                value={question} 
                                className={blankFields.includes('Question') ? 'empty-error' : ''} 
                            />
                        </div>
                        <div className="faq-form-unit">
                            <label>Answer<span className="form-required">*</span></label>
                            <input 
                                type="text" 
                                onChange={(e) => setAnswer(e.target.value)} 
                                value={answer} 
                                className={blankFields.includes('Answer') ? 'empty-error' : ''} 
                            />
                        </div>
                        <button disabled={isLoading}>Add Question</button>
                        {error && <div className="error">{error}</div>}
                    </form>
                </div>

                {/* FAQ Cards */}
                <div className="faqs">
                    {isFetching && <div className="loading-spinner-wrapper-faqs"><LoadingIcon /></div>}
                    {!isFetching && !faqsExist && 
                        <div className="no-faqs animate__animated animate__fadeInUp">
                            <img src={no_record_icon} alt="Record None" />
                            <h2>No Questions Added</h2>
                        </div>
                    }
                    {!isFetching && faqsExist && faqs && faqs.map((faq) => (
                        <div key={faq._id} className="faq-card animate__animated animate__fadeInUp">
                            <div className="faq-card-delete-wrapper">
                                <MdIcons.MdDelete data-tooltip-id="delete" data-tooltip-content="Delete faq" className="faq-card-delete-icon" onClick={() => handleDeleteFaq(faq._id)} />
                                <Tooltip id="delete" place="left" style={style} />
                            </div>
                            <div className="faq-card-content-wrapper">
                                <h2>{faq.question}</h2>
                                <p>{faq.answer}</p>
                            </div>
                            <div className="faq-card-date-wrapper">
                                <div className="faq-card-date">
                                    {faq.createdAt && !isNaN(new Date(faq.createdAt)) ? format(new Date(faq.createdAt), "dd/MM/yyyy") : 'Invalid Date'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Exporting the FaqsManage component
export default FaqsManage;
