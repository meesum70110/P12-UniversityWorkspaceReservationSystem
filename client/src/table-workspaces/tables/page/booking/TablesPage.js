// Importing React and its hooks for managing state and side effects.
import React, { useState, useEffect, useCallback } from 'react';

// Importing styles specific to this page.
import styles from './css/TablesPage.module.css';

// Importing necessary components and libraries.
import { Stage, Layer } from 'react-konva'; // Used for rendering interactive tables.
import moment from 'moment'; // Handling date and time formatting.
import TablesTypeOne from '../../components/TablesTypeOne';
import TablesTypeTwo from '../../components/TablesTypeTwo';
import TablesTypeThree from '../../components/TablesTypeThree';
import TablesTypeTFour from '../../components/TablesTypeFour';
import PopUp from '../../components/PopUp';
import axios from 'axios'; // Handling API requests.
import { useAuthorize } from '../../../../context/hook/useAuthorization'; // Accessing user authorization context.

// Defining the main component for the Tables page.
const TablesPage = ({ room, surveys, selectedDate, selectedTime }) => {
    // Accessing the current user's account information.
    const { userAccount } = useAuthorize();

    // Defining states for managing user data and UI behavior.
    const [userData, setUserData] = useState(null);
    const [hovering, setHovering] = useState('default'); // Managing cursor state during hovering.
    const [openPopUp, setOpenPopUp] = useState(false); // Managing popup visibility.
    const [tableIdPicked, setTableIdPicked] = useState(undefined); // Storing selected table ID.
    const [tablesIds, setTablesIds] = useState(new Map()); // Managing table statuses.
    const [displayDate, setDisplayDate] = useState(''); // Displaying selected date.
    const [displayTime, setDisplayTime] = useState(''); // Displaying selected time.
    const [errorMessage, setErrorMessage] = useState(''); // Storing error messages.
    const [myBookings, setMyBookings] = useState([]); // Storing user's bookings.
    const [showBookings, setShowBookings] = useState(false); // Controlling bookings display.
    const [localUpdates, setLocalUpdates] = useState(new Map()); // Managing local booking updates.

    // Extracting user details from fetched user data.
    const userFirstName = userData?.fname || 'N/A';
    const userLastName = userData?.lname || 'N/A';
    const userEmail = userData?.email || 'N/A';

    // Defining a function to slice a Map into an array of key-value pairs for a given range.
    const sliceMap = (map, start, end) => {
        const slicedArray = []; // Initializing an empty array to store the sliced data.
        for (let i = start; i <= end; i++) { // Iterating through the range from start to end.
            slicedArray.push([i, map.get(i.toString()) || false]); // Pushing key-value pairs into the array, defaulting to false if key doesn't exist.
        }
        return slicedArray; // Returning the sliced array.
    };
    
    // Synchronizing displayDate and displayTime with selectedDate and selectedTime props.
    useEffect(() => {
        if (selectedDate) { // Checking if selectedDate is provided.
            setDisplayDate(moment(selectedDate).format('YYYY-MM-DD')); // Formatting and setting the displayDate state.
        }
        if (selectedTime) { // Checking if selectedTime is provided.
            setDisplayTime(selectedTime); // Setting the displayTime state directly.
        }
    }, [selectedDate, selectedTime]); // Dependency array ensures this runs when selectedDate or selectedTime changes.
    
    // Falling back to a default date and time if selectedDate or selectedTime is undefined.
    useEffect(() => {
        if (!selectedDate || !selectedTime) { // Checking if selectedDate or selectedTime is not provided.
            const currentHour = moment().hour(); // Getting the current hour.
            const isPast5PM = currentHour >= 17; // Determining if the current time is past 5 PM.
            if (isPast5PM) {
                setDisplayDate(moment().add(1, 'day').format('YYYY-MM-DD')); // Setting the next day if it's past 5 PM.
                setDisplayTime('09:00'); // Defaulting to 9 AM for the next day.
            } else {
                setDisplayDate(moment().format('YYYY-MM-DD')); // Setting the current date if it's before 5 PM.
                setDisplayTime('09:00'); // Defaulting to 9 AM for the current day.
            }
        }
    }, []); // Empty dependency array ensures this only runs on the initial render.
    
    // Combining displayDate and displayTime into a full DateTime string and adding one hour.
    const toDateTime = moment(`${displayDate}T${displayTime}`).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
    
    // Fetching user data from the backend and updating userData state.
    useEffect(() => {
        const fetchUserData = async () => { // Defining an asynchronous function for the API call.
            if (userAccount && userAccount.userToken) { // Checking if the user is logged in and has a token.
                try {
                    setErrorMessage(''); // Clearing any previous error messages.
                    const response = await axios.get('https://workspacereservation-backend.onrender.com/api/account/', { // Sending a GET request to fetch user data.
                        headers: { Authorization: `Bearer ${userAccount.userToken}` } // Including the token in the request header.
                    });
                    setUserData(response.data); // Updating userData state with the response data.
                } catch (error) { // Catching any errors during the API call.
                    const errorMsg = error.response?.data?.error || "Could not fetch user data. Please check your account information."; // Extracting the error message.
                    setErrorMessage(errorMsg); // Setting the error message state.
                    console.error("Error fetching user data:", errorMsg); // Logging the error to the console.
                }
            }
        };
        fetchUserData(); // Calling the fetchUserData function.
    }, [userAccount]); // Dependency array ensures this runs when userAccount changes.
    
    // Populating table statuses based on the survey data.
    useEffect(() => {
        const tableStatusMap = new Map(); // Initializing a new Map to store table statuses.
        surveys.forEach((survey) => { // Iterating through each survey.
            const isBooked = survey.status === 'unavailable'; // Checking if the survey's status is 'unavailable'.
            tableStatusMap.set(survey._id, isBooked); // Setting the table's ID and its booking status in the Map.
        });
        setTablesIds(tableStatusMap); // Updating tablesIds state with the new Map.
    }, [surveys]); // Dependency array ensures this runs when surveys change.
    
    // Handling the hover state of the cursor by updating the hovering state.
    const handleHovering = (hoverStatus) => setHovering(hoverStatus);
    
    // Managing the state of the booking popup and storing the selected table ID.
    const handlePopUp = (shouldOpen, tableId) => {
        setTableIdPicked(tableId); // Setting the ID of the selected table for booking.
        setOpenPopUp(shouldOpen); // Updating the state to show or hide the popup.
    };

    // Defining a function to fetch the status of all tables from the server.
    const fetchAllTablesStatus = useCallback(async () => {
        try {
            // Making a GET request to fetch table statuses for the specified date and time.
            const response = await axios.get('https://workspacereservation-backend.onrender.com/api/survey/tables', {
                params: { // Passing query parameters for the date and time.
                    date: displayDate,
                    time: displayTime,
                },
                headers: { Authorization: `Bearer ${userAccount.userToken}` } // Including the user's token for authorization.
            });
    
            console.log("API response:", response.data); // Logging the response data for debugging purposes.
    
            // Checking if the response status is 200 and there is data.
            if (response.status === 200 && response.data.length > 0) {
                const updatedTablesIds = new Map(); // Creating a new Map to store table statuses.
                response.data.forEach((table) => {
                    // Setting table availability status: true if booked, false otherwise.
                    updatedTablesIds.set(table.tableNumber, table.availability === 'booked');
                });
    
                console.log("Updated table statuses:", updatedTablesIds); // Logging the updated table statuses for debugging.
                setTablesIds(updatedTablesIds); // Updating the tablesIds state with the new statuses.
            } else {
                setErrorMessage("No table data found."); // Setting an error message if no data is returned.
            }
        } catch (error) {
            // Handling errors during the API call.
            const errorMsg = error.response?.data?.error || ""; // Extracting the error message from the response.
            setErrorMessage(errorMsg); // Updating the error message state.
            console.error("Error fetching tables:", errorMsg); // Logging the error to the console.
        }
    }, [userAccount?.userToken, displayDate, displayTime]); // Adding dependencies to ensure the function updates when these change.
    
    // Using useEffect to call fetchAllTablesStatus whenever the dependencies change.
    useEffect(() => {
        fetchAllTablesStatus(); // Fetching all table statuses.
    }, [fetchAllTablesStatus]); // Dependency array ensures this runs when fetchAllTablesStatus changes.
    
    // Defining a function to handle table reservation.
    const handleReservation = async () => {
        handlePopUp(false); // Closing the popup once reservation starts.
    
        // Finding the workspace that matches the current room.
        const selectedWorkspace = surveys.find((survey) => survey.room === room);
        const workspaceId = selectedWorkspace?._id; // Extracting the workspace ID.
    
        try {
            // Making a POST request to book a table with the provided details.
            const response = await axios.post(`https://workspacereservation-backend.onrender.com/api/survey/${workspaceId}/book`, {
                tableNumber: tableIdPicked.toString(), // Sending the selected table ID as a string.
                room, // Room name.
                date: displayDate, // Selected date.
                time: displayTime, // Selected time.
                firstName: userFirstName, // User's first name.
                email: userEmail // User's email.
            }, {
                headers: { Authorization: `Bearer ${userAccount.userToken}` } // Including the user's token for authorization.
            });
    
            // Checking if the booking was successful.
            if (response.data.booking) {
                setTablesIds((prev) => { // Updating the state for the booked table.
                    const updatedTables = new Map(prev); // Creating a copy of the existing Map.
                    updatedTables.set(tableIdPicked, true); // Marking the table as booked.
                    return updatedTables; // Returning the updated Map.
                });
    
                setLocalUpdates(new Map()); // Clearing any local updates.
                setErrorMessage("Table booked successfully"); // Displaying a success message.
            } else {
                setErrorMessage("Booking failed or already booked."); // Displaying an error if booking fails.
            }
        } catch (error) {
            // Handling errors during the booking process.
            const errorMsg = error.response?.data?.error || "Error making reservation"; // Extracting the error message.
            setErrorMessage(errorMsg); // Updating the error message state.
            console.error("Error making reservation:", errorMsg); // Logging the error to the console.
        }
    };

    
    // Defining a function to cancel a booking by its ID.
    const cancelBooking = async (bookingId) => {
        try {
            // Sending a DELETE request to cancel the booking with the given ID.
            const response = await axios.delete(`https://workspacereservation-backend.onrender.com/api/survey/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${userAccount.userToken}` } // Including the user's token for authorization.
            });
    
            // Checking if the request was successful.
            if (response.status === 200) {
                // Removing the cancelled booking from the local state.
                setMyBookings(myBookings.filter((booking) => booking._id !== bookingId));
                setErrorMessage("Booking cancelled successfully"); // Displaying a success message.
    
                // Refreshing the table statuses to reflect the cancelled booking.
                fetchAllTablesStatus();
            } else {
                // Displaying an error message if the cancellation was unsuccessful.
                setErrorMessage("Failed to cancel booking.");
            }
        } catch (error) {
            // Handling errors during the cancellation process.
            const errorMsg = error.response?.data?.error || "Error cancelling booking"; // Extracting the error message from the response.
            setErrorMessage(errorMsg); // Updating the error message state.
            console.error("Error cancelling booking:", errorMsg); // Logging the error to the console.
        }
    };
    
    // Defining a function to fetch the user's bookings.
    const fetchMyBookings = async () => {
        setShowBookings(!showBookings); // Toggling the visibility of the bookings list.
    
        // Proceeding only if bookings are not already shown and the user is logged in.
        if (!showBookings && userAccount?.userToken) {
            try {
                // Sending a GET request to fetch the user's bookings.
                const response = await axios.get('https://workspacereservation-backend.onrender.com/api/survey/bookings', {
                    headers: { Authorization: `Bearer ${userAccount.userToken}` } // Including the user's token for authorization.
                });
    
                // Checking if the request was successful and data is returned.
                if (response.status === 200 && response.data.length > 0) {
                    // Mapping over the bookings to ensure each booking has a room property.
                    const bookingsWithRoom = response.data.map((booking) => ({
                        ...booking,
                        room: booking.room || room // Assigning the current room if none is provided.
                    }));
                    setMyBookings(bookingsWithRoom); // Updating the local bookings state.
    
                    // Updating the table statuses based on the user's bookings.
                    const updatedTablesIds = new Map(tablesIds);
                    bookingsWithRoom.forEach((booking) => {
                        updatedTablesIds.set(booking.tableNumber, booking.availability === 'booked'); // Marking booked tables.
                    });
                    setTablesIds(updatedTablesIds); // Updating the table statuses state.
                } else {
                    setErrorMessage("No bookings found for this user."); // Displaying a message if no bookings are found.
                }
            } catch (error) {
                // Handling errors during the fetching process.
                const errorMsg = error.response?.data?.error || "Could not fetch bookings. Please try again later."; // Extracting the error message.
                setErrorMessage(errorMsg); // Updating the error message state.
                console.error("Error fetching bookings:", errorMsg); // Logging the error to the console.
            }
        }
    };

    // Returning the JSX for rendering the TablesPage component.
    return (
        // Main wrapper for the TablesPage component.
        <div className={styles.TablesPage} style={{ cursor: hovering }}>
            {/* Displaying an error message if it exists */}
            {errorMessage && (
                <div className={styles.ErrorMessage}>
                    {errorMessage} {/* Showing the error message */}
                </div>
            )}
    
            {/* Button to toggle visibility of user's bookings */}
            <button onClick={fetchMyBookings} className={styles.ViewBookingsButton}>
                {/* Changing button text based on `showBookings` state */}
                {showBookings ? "Hide My Bookings" : "View My Bookings"}
            </button>
    
            {/* Top bar displaying selected date and time slot */}
            <div className={styles.TopBar}>
                <div className={styles.Info}>
                    {/* Formatting the date and time to display */}
                    <p>{`${moment(displayDate).format('LL')} , Time Slot: ${displayTime} - ${moment(displayTime, 'HH:mm').add(1, 'hour').format('HH:mm')}`}</p>
                </div>
            </div>
    
            {/* Conditionally rendering bookings list if `showBookings` is true */}
            {showBookings && (
                <div className={styles.BookingsList}>
                    <h3>My Bookings</h3> {/* Heading for the bookings list */}
                    {/* Checking if bookings exist */}
                    {myBookings && myBookings.length > 0 ? (
                        // Mapping through each booking and rendering its details.
                        myBookings.map((booking, index) => (
                            <div key={index} className={styles.BookingItem}>
                                <p><strong>Room:</strong> {booking.room || "Room info unavailable"}</p>
                                <p><strong>Table:</strong> {booking.tableNumber}</p>
                                <p><strong>Date:</strong> {moment(booking.date).format('LL')}</p>
                                <p><strong>Time:</strong> {booking.timeSlot}</p>
                                {/* Button to cancel the booking */}
                                <button onClick={() => cancelBooking(booking._id)} className={styles.CancelButton}>Cancel</button>
                            </div>
                        ))
                    ) : (
                        // Message to display if no bookings are found.
                        <p>No bookings found.</p>
                    )}
                </div>
            )}
    
            {/* Wrapper for the table layout */}
            <div className={styles.Tables}>
                {/* Konva Stage for table visualization */}
                <Stage width={1520} height={850}>
                    {/* Checking if tables data is available */}
                    {tablesIds.size ? (
                        <Layer>
                            {/* Rendering tables of different types based on IDs */}
                            <TablesTypeTwo
                                ids={sliceMap(tablesIds, 18, 22)} // Slicing IDs for this type
                                handleHovering={handleHovering} // Handling hover events
                                handlePopUp={handlePopUp} // Handling pop-up events
                                x={970} // Setting position
                                dimReserved={(id) => !!tablesIds.get(id)} // Dim reserved tables
                            />
                            <TablesTypeThree
                                ids={sliceMap(tablesIds, 11, 15)}
                                handleHovering={handleHovering}
                                x={370}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                            <TablesTypeTFour
                                ids={sliceMap(tablesIds, 1, 11)}
                                handleHovering={handleHovering}
                                x={80}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                            <TablesTypeTwo
                                ids={sliceMap(tablesIds, 15, 18)}
                                handleHovering={handleHovering}
                                x={670}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                            <TablesTypeOne
                                ids={sliceMap(tablesIds, 22, 26)}
                                handleHovering={handleHovering}
                                x={1220}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                        </Layer>
                    ) : null}
                </Stage>
            </div>
    
            {/* Rendering the pop-up for booking if `openPopUp` is true */}
            {openPopUp && (
                <div className={styles.PopUp}>
                    <PopUp
                        handlePopUp={handlePopUp} // Function to close the pop-up
                        handleReservation={handleReservation} // Function to handle booking
                        from={`${displayDate} ${displayTime}`} // Start time for the booking
                        to={toDateTime} // End time for the booking
                        first_name={userFirstName} // User's first name
                        last_name={userLastName} // User's last name
                    />
                </div>
            )}
        </div>
    );
};

export default TablesPage;
