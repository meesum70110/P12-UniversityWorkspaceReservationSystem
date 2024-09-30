import React, { useState, useEffect, useContext } from "react";
import { useAuthorize } from "../context/hook/useAuthorization"; // Hook to access user authorization context

import '../styles/formCards.css'; // FormCards-specific styles
import '../styles/workspaces.css'; // Workspace-specific styles
import 'animate.css'; // Animations for UI elements

import * as MdIcons from "react-icons/md"; // Icons for UI decoration
import { FiMinimize2 } from "react-icons/fi"; // Icon for minimizing elements
import survey_icon from './Images/Survey/survey-card-img2.jpg'; // Icon for surveys
import no_record_icon from './Images/Record/no-record-img.png'; // Icon when no records are available


import NavMenu from "./SharedComponents/navMenu"; // Shared navigation menu
import LoadingIcon from "./SharedComponents/loading"; // Loading indicator component

import Swal from "sweetalert2"; // Library for better alert dialogs

import { SocketContext } from "../context/socket"; // Context for managing real-time socket interactions
import 'react-tooltip/dist/react-tooltip.css'; // Styles for tooltips
import { Tooltip } from 'react-tooltip'; // Tooltip component for additional information display

const Surveys = (props) => {
    const { userAccount } = useAuthorize(); // Access user account details from context

    const socket = useContext(SocketContext); // Socket context for real-time data updates

    const [surveys, setSurveys] = useState(null); // State to store survey data
    const [surveysExist, setExist] = useState(true); // State to check if surveys exist

    const [title, setTitle] = useState(''); // State for new workspace Name
    const [description, setDescript] = useState(''); // State for new Workspace location
    const [status, setStatus] = useState('');  // State for new workspace status 
    const [error, setError] = useState(''); // State for managing errors
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const [isFetching, setFetching] = useState(true); // State to manage initial data fetch

    const [surveyId, setSurveyId] = useState(''); // State to manage active survey ID
    const [showResponse, setShowResponse] = useState(false); // State to toggle response visibility

    const [blankFields, setBlankFields] = useState([]); // State for highlighting empty fields on form submission
    const [commentBlank, setCommentBlank] = useState([]); // State for highlighting empty comment field

    const [comment, setComment] = useState(''); // State for storing user comments
    const [commentError, setCommentError] = useState(''); // State for managing comment errors
    // New state variables for search functionality
    const [workspaceName, setWorkspaceName] = useState('');
    const [location, setLocation] = useState('');

    // Function to fetch survey data from the backend with optional search parameters.
    const fetchSurveys = async () => {
        setFetching(true);
        const queryParams = new URLSearchParams({
            description: description !== 'All' ? description : '', // Only send if not 'All'
            status: status // Send status as is
        }).toString();
    
        const result = await fetch(`/api/survey/?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        });
    
        const resultJson = await result.json();
        if (result.status === 200) { // Use status code for checking
            setSurveys(resultJson);
            setExist(resultJson.length !== 0);
        } else {
            setExist(false);
        }
        setFetching(false);
    };
    

    // useEffect hook that runs once on component mount, or when userAccount, workspaceName, or location changes.
    useEffect(() => {
    // Only run the fetching process if there's a logged-in user.
        if (userAccount) {
            fetchSurveys();
            // Emit an event via socket to potentially trigger other real-time updates.
            socket.emit('content-cards', socket.id);
        }
    }, [workspaceName, location, userAccount, socket]); // This effect now also depends on workspaceName and location.



    // This useEffect is set up to listen for 'surveys' events from the server via WebSocket.
    useEffect(() => {
        // Setting up a listener on the socket for 'surveys' events.
        socket.on('surveys', (newSurveyAll) => {
            // Check if the current user is an admin.
            if (userAccount.occupation === 'admin') {
                // If the user is an admin, they have access to all surveys, so we set them directly.
                setSurveys(newSurveyAll);
                // Set the 'surveysExist' state based on whether there are surveys returned.
                setExist(newSurveyAll.length !== 0);
            } else {
                // For non-admin users, filter the surveys to those that are marked as visible.
                let visibleSurveys = [];
                for (let i = 0; i < newSurveyAll.length; i++) {
                    if (newSurveyAll[i].visibility === 'true') {
                        visibleSurveys.push(newSurveyAll[i]);
                    }
                }
                // Update the surveys state with only the visible surveys.
                setSurveys(visibleSurveys);
                // Update 'surveysExist' to reflect whether there are any visible surveys.
                setExist(visibleSurveys.length > 0);
            }
        });

        // Cleanup function to remove the socket listener when the component unmounts.
        return () => {
            socket.off('surveys');
        };
    }, []); // The empty dependency array means this effect will only run once when the component mounts.

    const handleNewSurvey = async (e) => {
        // Stops the default form submission behavior to prevent page reload
        e.preventDefault();
    
        // Check if there is a logged-in user
        if (!userAccount) {
            setError('You are not logged in');
            return;
        }
    
        // Check if the logged-in user is an admin; only admins can add surveys
        if (userAccount.occupation !== 'admin') {
            setError('You are not an admin');
            return;
        }
    
        // Start the loading indicator as the network request begins
        setIsLoading(true);
    
        // Check if the required fields 'title', 'status' and 'description' are not empty
        if ((!title || title.trim().length === 0) || (!description || description.trim().length === 0) || (!status || status.trim().length === 0)) {
            setError('Please fill out all the fields');
            // Determine which fields are empty to provide specific feedback to the user
            let emptyfields = [];
            if (!title || title.trim().length === 0) {
                emptyfields.push('Name');
            }
            if (!description || description.trim().length === 0) {
                emptyfields.push('Location');
            }
            if (!status || status.trim().length === 0) {
                emptyfields.push('Status');
            }
            // Update the state to highlight the empty input fields
            setBlankFields(emptyfields);
            setIsLoading(false);  // Stop loading as the form handling is complete with errors
            return;
        }
    
        // Construct the survey object to send to the server
        const newSurvey = { title, description, status };
    
        // Perform the POST request to add a new survey
        const result = await fetch('/api/survey/', {
            method: 'POST',
            body: JSON.stringify(newSurvey),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`  // Authorization header with JWT
            }
        });
        
        const resultJson = await result.json();  // Parse the JSON response from the server
    
        // Handle the response from the server
        if (result.ok) {
            // Clear error messages and reset form fields upon successful addition
            setError(null);
            setBlankFields([]);
            setTitle('');
            setDescript('');
            setStatus('');
            console.log("New Workspace added: ", resultJson);  // Log the response for debugging
            // Display a success message using a SweetAlert
            Swal.fire({
                icon: "success",
                title: "New Workspace Added!",
                confirmButtonColor: "#1d578a",
            });
        } else {
            // Handle errors from the server, such as validation errors or server issues
            setError(resultJson.error);
            if (resultJson.errorFields) {
                // If the server responds with specific fields that have errors, highlight them
                setBlankFields(resultJson.errorFields);
            } else {
                // If no specific fields are provided, clear the highlighted fields
                setBlankFields([]);
            }
        }
        // Stop the loading indicator regardless of success or failure
        setIsLoading(false);
    };
    
    // Function to handle the deletion of a survey.
    const handleDeleteSurvey = async (id) => {
        // Ensure the user is logged in and has admin privileges before proceeding.
        if (!userAccount) return;
        if (userAccount.occupation !== 'admin') return;

        let cancelOperation = false; // Flag to track if the operation should be cancelled.

        // Confirm dialog to make sure the user wants to delete the survey.
        await Swal.fire({
            title: "Are you sure?",
            text: "Delete this WorkSpace?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes",
        }).then((result) => {
            if (!result.isConfirmed) {
                cancelOperation = true; // Set flag to true if user cancels.
            }
        });

        // Exit function if operation was cancelled.
        if (cancelOperation) return;

        // Proceed with deletion if not cancelled.
        const result = await fetch('/api/survey/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userAccount.userToken}` // Use JWT for authorization.
            }
        });

        const resultJson = await result.json(); // Parse JSON response from server.

        // Handle response: notify user of success or error.
        if (result.ok) {
            console.log("WorkSpace deleted: ", resultJson); // Log deletion for debugging.
            Swal.fire({
                icon: "success",
                title: "WorkSpace deleted!",
                confirmButtonColor: "#1d578a",
            });
        } else {
            console.log(resultJson.error); // Log error if deletion fails.
        }
    };

    // Function to make a workspace visible to all users.
    const handleVisibilityTrue = async (id) => {
        // Check if the user is logged in and is an admin.
        if (!userAccount) return;
        if (userAccount.occupation !== 'admin') return;

        let cancelOperation = false; // Flag to determine if operation should proceed.

        // Confirmation dialog to ensure the user wants to change visibility.
        await Swal.fire({
            title: "Are you sure?",
            text: "Users will be able to see this WorkSpace!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes",
        }).then((result) => {
            if (!result.isConfirmed) {
                cancelOperation = true; // Cancel operation if user opts out.
            }
        });

        // Exit function if operation is cancelled.
        if (cancelOperation) return;

        // API call to update visibility status.
        const result = await fetch('/api/survey/' + id, {
            method: 'PATCH',
            body: JSON.stringify({ visibility: 'true' }), // Set visibility to true.
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}` // Authentication with JWT.
            }
        });

        const resultJson = await result.json(); // Parse response.

        // Notify user of the result.
        if (result.ok) {
            console.log("WorkSpace visible: ", resultJson); // Debugging log.
            Swal.fire({
                icon: "info",
                title: "WorkSpace is now visible to users!",
                confirmButtonColor: "#1d578a",
            });
        } else {
            console.log(resultJson.error); // Log error if operation fails.
        }
    };

    // Function to set a survey's visibility to false, making it inaccessible to regular users.
    const handleVisibilityFalse = async (id) => {
        // Verify user credentials: only admins should be able to change visibility settings.
        if (!userAccount) return;  // Exit if no user is logged in.
        if (userAccount.occupation !== 'admin') return;  // Exit if the user is not an admin.

        let cancelOperation = false;  // Flag to track if the operation should be aborted.

        // Display confirmation dialog to ensure the admin intends to hide the survey.
        await Swal.fire({
            title: "Are you sure?",
            text: "Users will not be able to see this WorkSpace!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes",
        }).then((result) => {
            if (!result.isConfirmed) {
                cancelOperation = true;  // Set the flag to true if admin cancels the operation.
            }
        });

        // Exit the function if the admin cancels the operation.
        if (cancelOperation) return;

        // Make an API request to change the visibility of the survey.
        const result = await fetch('/api/survey/' + id, {
            method: 'PATCH',
            body: JSON.stringify({ visibility: 'false' }),  // Set visibility to false.
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`  // Authenticate with JWT.
            }
        });

        const resultJson = await result.json();  // Parse the JSON response from the server.

        // Check if the API call was successful.
        if (result.ok) {
            console.log("WorkSpace visibility changed: ", resultJson);
            Swal.fire({
                icon: "info",
                title: "WorkSpace is no longer visible to the users!",
                confirmButtonColor: "#1d578a",
            });
        } else {
            // Log and display any errors that occurred during the operation.
            console.log(resultJson.error);
        }
    };

    // Utility function to extract email from a concatenated string.
    const getResponseEmail = (item) => {
        return item.split(';')[0];  // Split the string by ';' and return the first part (email).
    };

    // Utility function to extract and concatenate the comment from a concatenated string.
    const getResponseComment = (item) => {
        const components = item.split(';');  // Split the response into parts.
        let response = '';
        for (let i = 1; i < components.length; i++) {
            response += components[i] + (i < components.length - 1 ? ';' : '');  // Reassemble the parts into a full string.
        }
        return response;  // Return the assembled response.
    };

    // Function to display responses for a specific survey.
    const displayResponse = (id) => {
        setShowResponse(true);  // Enable the response display.
        setSurveyId(id);  // Set the current survey ID to the selected survey.
        setComment('');  // Reset any existing comment in the input field.
        setCommentError('');  // Clear any existing error messages.
        setCommentBlank('');  // Clear any blank field markings.
    };

    // Function to hide responses for a survey.
    const removeResponse = (id) => {
        setShowResponse(false);  // Disable the response display.
        setSurveyId(null);  // Clear the current survey ID.
        setComment('');  // Clear any comment in the input field.
        setCommentError('');  // Clear any error messages.
        setCommentBlank('');  // Clear any blank field markings.
    };

    // Function to handle adding a comment to a survey response.
    const handleAddComment = async(e) => {
        // Prevents the form from submitting in the traditional way, which would cause a page reload.
        e.preventDefault();

        // Check if there is a logged-in user account.
        if (!userAccount) {
            setError('You are not logged in'); // Set an error if no user is detected.
            return; // Exit the function to prevent further execution.
        } else if (userAccount.occupation !== 'employee') {
            setError('You are not an employee'); // Check if the user is an employee to allow commenting.
            return; // Exit the function if the user is not an employee.
        }

        // Begin a loading state, useful for showing a loading indicator in the UI.
        setIsLoading(true);

        // Validate the input to ensure a comment has been entered.
        if (!comment || (comment && !comment.trim())) {
            setCommentError('Please fill out the comment field'); // Set an error for empty comment.
            setCommentBlank(['Response']); // Highlight the comment field as needing attention.
            setIsLoading(false); // End the loading state as the operation is not proceeding.
            return; // Exit the function since the validation failed.
        }

        // Proceed to send the comment to the server via an API call.
        const result = await fetch('/api/survey/comment/' + surveyId, {
            method: 'PATCH', // Use PATCH to update part of the resource.
            body: JSON.stringify({response: comment}), // Send the comment in the request body.
            headers: {
                'Content-Type': 'application/json', // Specify JSON content type.
                'Authorization': `Bearer ${userAccount.userToken}` // Authenticate the request.
            }
        });

        const resultJson = await result.json(); // Parse the JSON response from the server.
        // Check if the request was successful.
        if (result.ok) {
            setComment(''); // Clear the comment input field.
            setCommentError(''); // Clear any error messages.
            setCommentBlank([]); // Clear any highlights on the comment field.
            setIsLoading(false); // End the loading state.
        } else {
            setCommentError(resultJson.error); // Set an error message from the response.
            // Check if there are specific fields highlighted as errors by the server.
            if (resultJson.errorFields) {
                setCommentBlank(resultJson.errorFields); // Highlight specified error fields.
            } else {
                setCommentBlank([]); // Clear highlights if no specific fields are in error.
            }
            setIsLoading(false); // Ensure loading state is ended even if there is an error.
        }
    };

    return (   
        <div className="contentpage">
    
            {/* Main Nav Bar */}
            <NavMenu isAdmin={userAccount.occupation === 'admin'} breadcrum="Workspaces" pagePath="/workspaces"/>
            
    
            {/* workspace Add Form */}
            <div className={userAccount.occupation === 'admin' ? 'content-management' : 'content-management content-access'}>
                {userAccount && userAccount.occupation === 'admin' && 
                    <div className="item-add-form survey-add-form">
                        <form onSubmit={handleNewSurvey}>
                            <h1>Add A New Workspace</h1>
                            <div className="form-unit">
                                <label>Workspace Name<span className="form-required">*</span></label>
                                <input 
                                    type="text" 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    value={title} 
                                    className={blankFields.includes('Title') ? 'empty-error' : ''} 
                                />
                            </div>
                            <div className="form-unit">
                                <label>Workspace location<span className="form-required">*</span></label>
                                <input 
                                    type="text" 
                                    onChange={(e) => setDescript(e.target.value)} 
                                    value={description} 
                                    className={blankFields.includes('Description') ? 'empty-error' : ''} 
                                />
                            </div>
                            <div className="form-unit">
                                <label>Workspace Status<span className="form-required">*</span></label>
                                <select
                                    onChange={(e) => setStatus(e.target.value)} 
                                    value={status} 
                                    className={blankFields.includes('Status') ? 'empty-error' : ''}
                                >
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>
                            <button disabled={isLoading}>Add WorkSpace</button>
                            {error && <div className="error">{error}</div>}
                        </form>
                    </div>
                }
            </div>
            {/* Search Filters for Employees */}
            {userAccount && userAccount.occupation === 'employee' && (
                        <div className="search-filters">
                            <select onChange={(e) => setDescript(e.target.value)} value={description}>
                                <option value="All">All Locations</option>
                                <option value="Basement">Basement</option>
                                <option value="Ground Floor">Ground Floor</option>
                                <option value="1st Floor">1st Floor</option>
                                <option value="2nd Floor">2nd Floor</option>
                                <option value="3rd Floor">3rd Floor</option>
                                <option value="4th Floor">4th Floor</option>
                            </select>
                            <select onChange={(e) => setStatus(e.target.value)} value={status}>
                                <option value="">All Statuses</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                            <button onClick={fetchSurveys}>Search</button>
                        </div>
            )}

            {/* Content Cards */}
            <div className="content-cards">
                {isFetching && <LoadingIcon />}
                {!isFetching && !surveysExist &&
                    <div className="no-items animate__animated animate__fadeInUp">
                        <img src={no_record_icon} alt="Record None" />
                        <h2>{userAccount.occupation === 'admin' ? 'No WorkSpace Added' : 'No WorkSpace Available'}</h2>
                    </div>
                }
                {!isFetching && surveysExist && surveys && surveys.map((survey) => (
                    <div key={survey._id} className="item-card animate__animated animate__fadeInUp">
                        {userAccount && userAccount.occupation === 'admin' && 
                            <div className="survey-card-delete-wrapper">
                                {survey.visibility === 'true' && <MdIcons.MdPauseCircleOutline className="item-card-delete-icon survey-visibility-pause" onClick={() => handleVisibilityFalse(survey._id)} />}
                                {survey.visibility === 'false' && <MdIcons.MdOutlinePlayCircleOutline className="item-card-delete-icon survey-visibility-play" onClick={() => handleVisibilityTrue(survey._id)} />}
                                <MdIcons.MdDelete className="item-card-delete-icon" onClick={() => handleDeleteSurvey(survey._id)} />
                                <Tooltip id="survey" place="left" style={{ backgroundColor: "#cbd6e2", color: "#222", fontSize: "13px", fontWeight: "normal" }}/>
                            </div>
                        }
                        <ul className="item-card-content-wrapper">
                            <li>
                                <img src={survey_icon} alt="Course"/>
                            </li>
                            <li>
                                <h2 className="make-blue">{survey.title}</h2>
                                <p>{survey.description}</p>
                                <p>Status: {survey.status}</p>
                            </li>
                        </ul>
                        {(surveyId !== survey._id || !showResponse) && <div className="item-card-link-wrapper">
                            <div className="survey-response-selector" onClick={() => displayResponse(survey._id)}>{userAccount.occupation === 'admin' ? 'View Response' : 'Comment'}</div>
                        </div>}
                        {surveyId === survey._id && showResponse &&
                            <div> 
                                <ul className="survey-response-wrapper">
                                    <div className="response-heading">Response<FiMinimize2 className="minimize" onClick={() => removeResponse(survey._id)}/></div>
                                    {survey.responses.length === 0 ? <div className="no-response-wrapper">No Response</div> :
                                        survey.responses && survey.responses.map((item, index) => (
                                            <li className="survey-response" key={index}>
                                                <div className="response-email">{getResponseEmail(item)}</div>
                                                <div className="response-comment">{getResponseComment(item)}</div>
                                            </li>
                                        ))
                                    }
                                </ul>

                                {userAccount && userAccount.occupation === 'employee' && 
                                    <form className="comment-form" onSubmit={handleAddComment}>
                                        <div className="comment-form-unit">
                                            <input 
                                                placeholder="Add Comment"
                                                type="text" 
                                                onChange={(e) => setComment(e.target.value)} 
                                                value={comment} 
                                                className={commentBlank.includes('Response') ? 'empty-error' : ''} 
                                            />
                                            <button disabled={isLoading}>Add</button>
                                        </div>
                                        {commentError && <div className="comment-error">{commentError}</div>}
                                    </form>
                                }

                            </div> 
                        }
                    </div>
                ))}
            </div>
        </div>
    )
    
}

export default Surveys