// Importing necessary libraries and hooks
import React, { useState, useEffect, useContext } from "react";

// Importing the authorization hook to manage global state for logged-in users
import { useAuthorize } from "../context/hook/useAuthorization";

// Importing styles for forms and FAQs
import '../styles/formCards.css';
import '../styles/faqs.css';

// Importing animation library for visual effects
import 'animate.css';

// Placeholder image for no records
import no_record_icon from './Images/Record/no-record-img.png';

// Importing date formatting utility
import { format } from "date-fns";

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation menu component
import LoadingIcon from "./SharedComponents/loading"; // Loading spinner

// Importing socket context for real-time updates
import { SocketContext } from "../context/socket";

// Functional component definition for FAQ Board
const FaqsBoard = (prop) => {
    // Extracting user account data from the authorization context
    const { userAccount } = useAuthorize();

    // Accessing the socket context for real-time data updates
    const socket = useContext(SocketContext);

    // State variables for FAQ data
    const [faqs, setFaqs] = useState(null); // Array of FAQs
    const [faqsExist, setExist] = useState(true); // Boolean to track if FAQs exist

    // State variable to track loading spinner for fetching FAQs
    const [isFetching, setFetching] = useState(true);

    // useEffect hook to fetch FAQs when the component mounts
    useEffect(() => {
        setFetching(true); // Enabling the fetching spinner

        // Asynchronous function to fetch FAQs from the server
        const fetchFaqs = async () => {
            const result = await fetch('https://workspacereservation-backend.onrender.com/api/faqs/', {
                headers: {
                    'Authorization': `Bearer ${userAccount.userToken}` // Including user token for authentication
                }
            });

            const resultJson = await result.json(); // Parsing the JSON response

            if (result.ok) {
                // Updating the FAQs state and whether FAQs exist
                setFaqs(resultJson);
                setExist(resultJson.length !== 0);
            }

            setFetching(false); // Disabling the fetching spinner
        };

        if (userAccount && userAccount.occupation === 'employee') {
            // Fetching FAQs and notifying the socket server if the user is an employee
            fetchFaqs();
            socket.emit('faqs', socket.id);
        }
    }, [userAccount, socket]); // Dependency array to refetch FAQs when userAccount or socket changes

    // useEffect hook to handle real-time updates for FAQs
    useEffect(() => {
        socket.on('faqs', (newFaqsAll) => {
            setFaqs(newFaqsAll); // Updating FAQs state with real-time data
            setExist(newFaqsAll.length > 0); // Updating whether FAQs exist
        });
    }, [socket]); // Dependency array to listen to socket events

    return (
        <div className="faqspage">
            {/* Main Navigation Bar */}
            <NavMenu breadcrum="FAQS" pagePath="/faqs" />

            {/* FAQ Management Section */}
            <div className="faq-management faq-access">
                <div className="faqs">
                    {/* Loading spinner while fetching FAQs */}
                    {isFetching && <div className="loading-spinner-wrapper-faqs-view"><LoadingIcon /></div>}

                    {/* Message when no FAQs are available */}
                    {!isFetching && !faqsExist && 
                        <div className="no-faqs no-faqs-view animate__animated animate__fadeInUp">
                            <img src={no_record_icon} alt="Record None" />
                            <h2>No Questions Available</h2>
                        </div>
                    }

                    {/* Displaying FAQ cards if FAQs exist */}
                    {!isFetching && faqsExist && faqs && faqs.map((faq) => (
                        <div key={faq._id} className="faq-card animate__animated animate__fadeInUp">
                            <div className="faq-card-content-wrapper">
                                <h2>{faq.question}</h2> {/* Displaying the question */}
                                <p>{faq.answer}</p> {/* Displaying the answer */}
                            </div>
                            <div className="faq-card-date-wrapper">
                                <div className="faq-card-date">
                                    {/* Formatting and displaying the created date */}
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

// Exporting the FaqsBoard component
export default FaqsBoard;
