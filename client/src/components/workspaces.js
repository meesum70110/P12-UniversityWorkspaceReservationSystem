// Importing the necessary modules and hooks for the component
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import { useCallback, useEffect, useState, useContext } from "react"; // React hooks for state and effects
import React from "react";
import { useAuthorize } from "../context/hook/useAuthorization"; // Hook to access the user's authorization context
import '../styles/formCards.css'; // Styling for form cards
import '../styles/workspaces.css'; // Styling specific to workspace components
import 'animate.css'; // Library for animations

// Importing a placeholder image for scenarios with no records
import no_record_icon from './Images/Record/no-record-img.png'; 

// Importing shared components
import NavMenu from "./SharedComponents/navMenu"; // Navigation menu component
import LoadingIcon from "./SharedComponents/loading"; // Loading spinner component

// Importing the socket context for real-time data updates
import { SocketContext } from "../context/socket"; 

// Importing the TablesPage component for rendering workspace tables
import TablesPage from "../table-workspaces/tables/page/booking/TablesPage"; 

// Importing the date picker component and its styles
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Importing moment.js for date-time manipulations
import moment from 'moment';

const Surveys = () => {
    // Extracting user account details from the authorization context
    const { userAccount } = useAuthorize();

    // Accessing the socket instance from the socket context
    const socket = useContext(SocketContext);

    // State variables for managing surveys and UI filters
    const [surveys, setSurveys] = useState(null); // State for storing fetched surveys
    const [surveysExist, setExist] = useState(true); // State to track if surveys exist
    const [room, setRoom] = useState(''); // State for the selected room filter
    const [date, setDate] = useState(new Date()); // State for the selected date
    const [time, setTime] = useState(''); // State for the selected time
    const [isFetching, setFetching] = useState(true); // State for tracking data fetching

    // Predefined options for time selection
    const timeOptions = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    // Automatically sets the initial date and time when the component mounts
    useEffect(() => {
        const now = moment(); // Getting the current time
        const cutoffHour = 17; // Defining the cutoff hour for the current day

        if (now.hour() >= cutoffHour) {
            // If the current time is past the cutoff hour, set the date to tomorrow at 09:00
            setDate(moment().add(1, 'day').toDate());
            setTime("09:00");
        } else {
            // Otherwise, set the time to the next hour
            setTime(now.add(1, 'hour').startOf('hour').format("HH:00"));
        }
    }, []);

    // Function to fetch surveys based on filters, memoized using useCallback
    const fetchSurveys = useCallback(async () => {
        setFetching(true); // Indicating that data fetching is in progress

        // Formatting the date and constructing query parameters for the API request
        const formattedDate = date ? date.toISOString().split('T')[0] : ''; // Formatting date as YYYY-MM-DD
        const queryParams = new URLSearchParams({
            room: room && room !== 'All' ? room : '', // Adding room filter if not 'All'
            date: formattedDate, // Adding date filter
            time: time || '' // Adding time filter if selected
        }).toString();

        try {
            // Sending a GET request to fetch surveys
            const result = await fetch(`https://workspacereservation-backend.onrender.com/api/survey/?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${userAccount.userToken}` } // Including the authorization token
            });
            const resultJson = await result.json(); // Parsing the response JSON

            if (result.status === 200) {
                // Filtering the surveys based on room selection
                const filteredSurveys = room && room !== 'All' 
                    ? resultJson.filter(survey => survey.room === room)
                    : resultJson;

                setSurveys(filteredSurveys); // Updating the surveys state
                setExist(filteredSurveys.length > 0); // Updating the existence state
            } else {
                setExist(false); // Setting no surveys if the status is not 200
            }
        } catch (error) {
            console.error("Error fetching surveys:", error); // Logging any errors
        } finally {
            setFetching(false); // Indicating that data fetching is complete
        }
    }, [room, date, time, userAccount.userToken]);

    // Effect to fetch surveys and set up socket communication on component mount
    useEffect(() => {
        if (userAccount) {
            fetchSurveys(); // Fetching surveys initially
            socket.emit('content-cards', socket.id); // Emitting an event to the socket server
        }
    }, [userAccount, socket, fetchSurveys]);

    // Effect to listen for real-time survey updates from the socket
    useEffect(() => {
        socket.on('surveys', (newSurveyAll) => {
            // Filtering surveys to include only those marked as visible
            const visibleSurveys = newSurveyAll.filter(survey => survey.visibility === 'true');
            setSurveys(visibleSurveys); // Updating the surveys state
            setExist(visibleSurveys.length > 0); // Updating the existence state
        });
        return () => socket.off('surveys'); // Cleaning up the socket listener
    }, [socket, userAccount]);

    const now = moment(); // Getting the current time for disabling past times

    // Returning the JSX for the component
    return (
        <div className="contentpage">
            {/* Navigation menu for the admin panel */}
            <NavMenu isAdmin={userAccount.occupation === 'admin'} breadcrum="Workspaces" pagePath="/workspaces" />
    
            {userAccount && (
                <div className="search-filters">
                    {/* Dropdown to select a room */}
                    <select onChange={(e) => setRoom(e.target.value)} value={room}>
                        <option value="All">All Rooms</option>
                        <option value="Room # 01">Room # 01</option>
                        <option value="Room # 02">Room # 02</option>
                        <option value="Room # 03">Room # 03</option>
                        <option value="Room # 04">Room # 04</option>
                    </select>
    
                    {/* Date picker for selecting a date */}
                    <DatePicker 
                        selected={date} 
                        onChange={(date) => setDate(date)} 
                        dateFormat="MM/dd/yyyy" 
                        minDate={new Date()} // Restricts selection to today and future dates
                        maxDate={new Date(new Date().setDate(new Date().getDate() + 7))} // Restricts selection to 7 days from today
                    />

                    {/* Dropdown to select a time */}
                    <select onChange={(e) => setTime(e.target.value)} value={time}>
                        <option value="">Select Time</option>
                        {timeOptions.map((timeOption) => {
                            const isDisabled = date && moment(date).isSame(now, 'day') && moment(timeOption, 'HH:mm').isBefore(now);
                            return (
                                <option key={timeOption} value={timeOption} disabled={isDisabled}>
                                    {timeOption}
                                </option>
                            );
                        })}
                    </select>
    
                    <button onClick={fetchSurveys}>Search</button>
                </div>
            )}
    
            <div className="content-cards-horizontal">
                {isFetching && <LoadingIcon />}
                {!isFetching && !surveysExist && (
                    <div className="no-items animate__animated animate__fadeInUp">
                        <img src={no_record_icon} alt="Record None" />
                        <h2>No Workspace Available</h2>
                    </div>
                )}
                {!isFetching && surveysExist && surveys && Object.entries(
                    surveys.reduce((acc, survey) => {
                        acc[survey.room] = acc[survey.room] || [];
                        acc[survey.room].push(survey);
                        return acc;
                    }, {})
                ).map(([room, roomSurveys]) => (
                    <div key={room} className="room-group-horizontal">
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '20px 0' }}>{room}</h2>
                        <TablesPage 
                            room={room} 
                            surveys={roomSurveys} 
                            selectedDate={date} 
                            selectedTime={time} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );    
};

export default Surveys;
