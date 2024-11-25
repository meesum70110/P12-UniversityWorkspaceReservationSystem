import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import styles from './css/TablesPage.module.css'; // Importing styles for the page
import { Stage, Layer } from 'react-konva'; // Importing Konva components for canvas-based rendering
import moment from 'moment'; // Importing Moment.js for handling date and time
import TablesTypeOne from '../../components/TablesTypeOne'; // Importing table components
import TablesTypeTwo from '../../components/TablesTypeTwo';
import TablesTypeThree from '../../components/TablesTypeThree';
import TablesTypeTFour from '../../components/TablesTypeFour';
import PopUp from '../../components/PopUp'; // Importing PopUp component for reservation confirmation
import axios from 'axios'; // Importing axios for making API requests
import { useAuthorize } from '../../../../context/hook/useAuthorization'; // Custom hook for managing user authentication

const TablesPage = ({ room, surveys, selectedDate, selectedTime }) => {
    const { userAccount } = useAuthorize(); // Fetching user account details from context
    const [userData, setUserData] = useState(null); // State to store user data
    const [hovering, setHovering] = useState('default'); // State to manage hovering cursor style
    const [openPopUp, setOpenPopUp] = useState(false); // State to handle PopUp visibility
    const [tableIdPicked, setTableIdPicked] = useState(undefined); // State to track the selected table ID
    const [tablesIds, setTablesIds] = useState(new Map()); // State to store table IDs and their availability status
    const [displayDate, setDisplayDate] = useState(''); // State to manage the date to display
    const [displayTime, setDisplayTime] = useState(''); // State to manage the time to display
    const [errorMessage, setErrorMessage] = useState(''); // State to manage error messages
    const [myBookings, setMyBookings] = useState([]); // State to store the user's bookings
    const [showBookings, setShowBookings] = useState(false); // State to toggle visibility of bookings list
    const [localUpdates, setLocalUpdates] = useState(new Map()); // Holds local booking status updates

    const userFirstName = userData?.fname || 'N/A'; // User's first name, default to 'N/A' if not available
    const userLastName = userData?.lname || 'N/A'; // User's last name, default to 'N/A' if not available
    const userEmail = userData?.email || 'N/A'; // User's email, default to 'N/A' if not available

    const sliceMap = (map, start, end) => { // Function to slice the table map based on start and end indices
        const slicedArray = [];
        for (let i = start; i <= end; i++) {
            slicedArray.push([i, map.get(i.toString()) || false]); // Push each table's availability status to the array
        }
        return slicedArray;
    };

    // Sync `displayDate` and `displayTime` with `selectedDate` and `selectedTime` props
    // Fallback for initial date and time if not provided
    useEffect(() => {
        if (!selectedDate || !selectedTime) {
            const currentHour = moment().hour(); // Getting the current hour using Moment.js
            const isPast5PM = currentHour >= 17; // Checking if it's past 5 PM
            const fallbackDate = isPast5PM ? moment().add(1, 'day').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'); // Setting the fallback date
            const fallbackTime = '09:00'; // Setting the fallback time to 9:00 AM

            setDisplayDate(fallbackDate); // Setting fallback date
            setDisplayTime(fallbackTime); // Setting fallback time
        }
    }, []); // Runs only once during the initial render

    // Sync `displayDate` and `displayTime` with the `selectedDate` and `selectedTime` props
    useEffect(() => {
        if (selectedDate) {
            setDisplayDate(moment(selectedDate).format('YYYY-MM-DD')); // Updating the date when props change
        }
        if (selectedTime) {
            setDisplayTime(selectedTime); // Updating the time when props change
        }
    }, [selectedDate, selectedTime]); // Runs whenever the props change

    // Constructing the combined `toDateTime` string for the time slot using useMemo to optimize performance
    const toDateTime = useMemo(() => {
        return moment(`${displayDate}T${displayTime}`)
            .add(1, 'hour')
            .format('YYYY-MM-DD HH:mm:ss'); // Combining the date and time and add one hour to get the time slot's end time
    }, [displayDate, displayTime]); // Only recalculates when `displayDate` or `displayTime` changes

    useEffect(() => {
        const fetchUserData = async () => { // Fetching user data when userToken is available
            if (userAccount && userAccount.userToken) {
                try {
                    setErrorMessage(''); // Clearing any previous error message
                    const response = await axios.get('https://workspacereservation-backend.onrender.com/api/account/', {
                        headers: { Authorization: `Bearer ${userAccount.userToken}` }
                    });
                    setUserData(response.data); // Setting user data received from API
                } catch (error) {
                    const errorMsg = error.response?.data?.error || "Could not fetch user data. Please check your account information."; // Handle API errors
                    setErrorMessage(errorMsg); // Setting error message to state
                    console.error("Error fetching user data:", errorMsg); // Log error
                }
            }
        };
        fetchUserData(); // Calling the function to fetch user data
    }, [userAccount]); // Dependency on `userAccount`, so it runs again if userAccount changes

    useEffect(() => {
        const tableStatusMap = new Map(); // Map to store table IDs and their booking status
        surveys.forEach((survey) => { // Iterating through all surveys to check table statuses
            const isBooked = survey.status === 'unavailable'; // Checks if the table is unavailable
            tableStatusMap.set(survey._id, isBooked); // Sets the table's status in the map
        });
        setTablesIds(tableStatusMap); // Updating the state with the new table statuses
    }, [surveys]); // Runs when `surveys` data changes

    const handleHovering = (hoverStatus) => setHovering(hoverStatus); // Updating hovering state for the cursor

    const handlePopUp = (shouldOpen, tableId) => { // Handling opening and closing of PopUp
        setTableIdPicked(tableId); // Setting the selected table ID
        setOpenPopUp(shouldOpen); // Opening or closing the PopUp
    };

    // Function to fetch the status of all tables from the server
    const fetchAllTablesStatus = useCallback(async () => {
        if (!displayDate || !displayTime) {
            console.error("fetchAllTablesStatus: Date or time is not defined.");
            setErrorMessage("Date and time are required."); // Error handling if date or time are not defined
            return;
        }
    
        try {
            const response = await axios.get('https://workspacereservation-backend.onrender.com/api/survey/tables', {
                params: {
                    date: displayDate,
                    time: displayTime,
                },
                headers: { Authorization: `Bearer ${userAccount.userToken}` }
            });
    
            if (response.status === 200 && response.data.length > 0) {
                const updatedTablesIds = new Map();
                response.data.forEach((table) => {
                    updatedTablesIds.set(table.tableNumber, table.availability === 'booked'); // Update table availability in the map
                });
                setTablesIds(updatedTablesIds); // Set the updated table statuses
            } else {
                setErrorMessage("No table data found."); // Handle case where no tables are found
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Could not fetch tables. Please try again later."; // Handle API errors
            setErrorMessage(errorMsg); // Set error message to state
            console.error("Error fetching tables:", errorMsg); // Log error
        }
    }, [userAccount?.userToken, displayDate, displayTime]); // Dependencies: userToken, displayDate, displayTime

    // Trigger table status fetch when date or time changes
    useEffect(() => {
        if (displayDate && displayTime) {
            fetchAllTablesStatus(); // Fetch tables status based on the date and time
        }
    }, [fetchAllTablesStatus, displayDate, displayTime]); // Dependency array to rerun fetch when relevant data changes

    
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
