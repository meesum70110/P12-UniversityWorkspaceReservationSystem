// Importing necessary libraries and components
import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import styles from './css/TablesPage.module.css';
import { Stage, Layer } from 'react-konva';
import moment from 'moment';
import TablesTypeOne from '../../components/TablesTypeOne';
import TablesTypeTwo from '../../components/TablesTypeTwo';
import TablesTypeThree from '../../components/TablesTypeThree';
import TablesTypeTFour from '../../components/TablesTypeFour';
import PopUp from '../../components/PopUp';
import axios from 'axios';
import { useAuthorize } from '../../../../context/hook/useAuthorization';

// Defining the TablesPage component
const TablesPage = ({ room, surveys, selectedDate, selectedTime }) => {
    const { userAccount } = useAuthorize(); // Accessing the user's authorization data from context
    const [userData, setUserData] = useState(null); // Storing user data in the state
    const [hovering, setHovering] = useState('default'); // Setting the cursor style while hovering
    const [openPopUp, setOpenPopUp] = useState(false); // Controlling the visibility of the pop-up
    const [tableIdPicked, setTableIdPicked] = useState(undefined); // Storing the selected table ID
    const [tablesIds, setTablesIds] = useState(new Map()); // Storing table statuses (available or booked)
    const [displayDate, setDisplayDate] = useState(''); // Displaying the selected date
    const [displayTime, setDisplayTime] = useState(''); // Displaying the selected time
    const [errorMessage, setErrorMessage] = useState(''); // Storing any error messages
    const [myBookings, setMyBookings] = useState([]); // Storing the user's bookings
    const [showBookings, setShowBookings] = useState(false); // Toggling visibility of the bookings list
    const [localUpdates, setLocalUpdates] = useState(new Map()); // Storing local booking status updates

    const userFirstName = userData?.fname || 'N/A'; // Getting the user's first name
    const userLastName = userData?.lname || 'N/A'; // Getting the user's last name
    const userEmail = userData?.email || 'N/A'; // Getting the user's email

    // Function to slice the table status map for rendering
    const sliceMap = (map, start, end) => {
        const slicedArray = [];
        for (let i = start; i <= end; i++) {
            slicedArray.push([i, map.get(i.toString()) || false]); // Creating a slice of the map for table status
        }
        return slicedArray; // Returning the sliced array
    };

    // Synchronizing displayDate and displayTime with selectedDate and selectedTime props
    useEffect(() => {
        if (!selectedDate || !selectedTime) {
            const currentHour = moment().hour();
            const isPast5PM = currentHour >= 17;
            const fallbackDate = isPast5PM ? moment().add(1, 'day').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
            const fallbackTime = '09:00'; // Default time if no time is selected

            setDisplayDate(fallbackDate); // Setting fallback date
            setDisplayTime(fallbackTime); // Setting fallback time
        }
    }, []); // Runs only once during the initial render

    // Synchronizing `displayDate` and `displayTime` with `selectedDate` and `selectedTime` props
    useEffect(() => {
        if (selectedDate) {
            setDisplayDate(moment(selectedDate).format('YYYY-MM-DD')); // Setting the date
        }
        if (selectedTime) {
            setDisplayTime(selectedTime); // Setting the time
        }
    }, [selectedDate, selectedTime]); // Runs whenever props are updated

    // Constructing the combined `toDateTime` string for the time slot
    const toDateTime = useMemo(() => {
        return moment(`${displayDate}T${displayTime}`)
            .add(1, 'hour')
            .format('YYYY-MM-DD HH:mm:ss'); // Calculating the end time for the booking
    }, [displayDate, displayTime]); // Dependency on `displayDate` and `displayTime`

    // Fetching the user data when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            if (userAccount && userAccount.userToken) {
                try {
                    setErrorMessage(''); // Clearing previous error messages
                    const response = await axios.get('https://workspacereservation-backend.onrender.com/api/account/', {
                        headers: { Authorization: `Bearer ${userAccount.userToken}` } // Sending authorization token
                    });
                    setUserData(response.data); // Storing user data in the state
                } catch (error) {
                    const errorMsg = error.response?.data?.error || "Could not fetch user data. Please check your account information."; // Handling API errors
                    setErrorMessage(errorMsg); // Setting error message
                    console.error("Error fetching user data:", errorMsg); // Logging error to the console
                }
            }
        };
        fetchUserData(); // Calling the fetch function to retrieve user data
    }, [userAccount]); // Dependency on `userAccount` to fetch data on login

    // Setting up the table status map when surveys change
    useEffect(() => {
        const tableStatusMap = new Map(); // Creating a new map to store table statuses
        surveys.forEach((survey) => {
            const isBooked = survey.status === 'unavailable'; // Checking if the table is booked
            tableStatusMap.set(survey._id, isBooked); // Setting table status in the map
        });
        setTablesIds(tableStatusMap); // Updating the table statuses state
    }, [surveys]); // Running when surveys data changes

    // Handling hovering effect to change cursor style
    const handleHovering = (hoverStatus) => setHovering(hoverStatus);

    // Function to handle opening and closing the pop-up for table booking
    const handlePopUp = (shouldOpen, tableId) => {
        setTableIdPicked(tableId); // Setting the selected table ID
        setOpenPopUp(shouldOpen); // Opening or closing the pop-up based on the action
    };

    // Function to fetch the status of all tables from the server
    const fetchAllTablesStatus = useCallback(async () => {
        if (!displayDate || !displayTime) {
            console.error("fetchAllTablesStatus: Date or time is not defined.");
            setErrorMessage("Date and time are required."); // Displaying error if date or time is missing
            return;
        }
    
        try {
            const response = await axios.get('https://workspacereservation-backend.onrender.com/api/survey/tables', {
                params: {
                    date: displayDate, // Passing the selected date as a query parameter
                    time: displayTime, // Passing the selected time as a query parameter
                },
                headers: { Authorization: `Bearer ${userAccount.userToken}` } // Sending the user's token for authorization
            });
    
            if (response.status === 200 && response.data.length > 0) {
                const updatedTablesIds = new Map(); // Creating a new map for updated table statuses
                response.data.forEach((table) => {
                    updatedTablesIds.set(table.tableNumber, table.availability === 'booked'); // Updating the table status in the map
                });
                setTablesIds(updatedTablesIds); // Setting the updated table statuses in state
            } else {
                setErrorMessage("No table data found."); // Displaying error if no table data is found
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Could not fetch tables. Please try again later."; // Handling API errors
            setErrorMessage(errorMsg); // Setting error message
            console.error("Error fetching tables:", errorMsg); // Logging the error to the console
        }
    }, [userAccount?.userToken, displayDate, displayTime]); // Dependencies: userToken, displayDate, displayTime

    // Triggering table status fetch when date or time changes
    useEffect(() => {
        if (displayDate && displayTime) {
            fetchAllTablesStatus(); // Fetching table status based on the selected date and time
        }
    }, [fetchAllTablesStatus, displayDate, displayTime]); // Dependency array to rerun fetch when relevant data changes

    // Defining a function to handle table reservation.
    const handleReservation = async () => {
        handlePopUp(false); // Closing the pop-up once reservation starts.
    
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
        <div className={styles.TablesPage} style={{ cursor: hovering }}> {/* Main wrapper for the TablesPage component */}
            {errorMessage && ( /* Displaying an error message if it exists */
                <div className={styles.ErrorMessage}>
                    {errorMessage} {/* Showing the error message */}
                </div>
            )}

            {/* Button to toggle visibility of user's bookings */}
            <button onClick={fetchMyBookings} className={styles.ViewBookingsButton}>
                {showBookings ? "Hide My Bookings" : "View My Bookings"} {/* Changing button text based on `showBookings` state */}
            </button>

            {/* Top bar displaying selected date and time slot */}
            <div className={styles.TopBar}>
                <div className={styles.Info}>
                    <p>{`${moment(displayDate).format('LL')} , Time Slot: ${displayTime} - ${moment(displayTime, 'HH:mm').add(1, 'hour').format('HH:mm')}`}</p> {/* Formatting the date and time to display */}
                </div>
            </div>

            {/* Conditionally rendering bookings list if `showBookings` is true */}
            {showBookings && (
                <div className={styles.BookingsList}>
                    <h3>My Bookings</h3> {/* Heading for the bookings list */}
                    {/* Checking if bookings exist */}
                    {myBookings && myBookings.length > 0 ? (
                        myBookings.map((booking, index) => (
                            <div key={index} className={styles.BookingItem}>
                                <p><strong>Room:</strong> {booking.room || "Room info unavailable"}</p>
                                <p><strong>Table:</strong> {booking.tableNumber}</p>
                                <p><strong>Date:</strong> {moment(booking.date).format('LL')}</p>
                                <p><strong>Time:</strong> {booking.timeSlot}</p>
                                <button onClick={() => cancelBooking(booking._id)} className={styles.CancelButton}>Cancel</button> {/* Button to cancel the booking */}
                            </div>
                        ))
                    ) : (
                        <p>No bookings found.</p> {/* Message to display if no bookings are found */}
                    )}
                </div>
            )}

            {/* Wrapper for the table layout */}
            <div className={styles.Tables}>
                {/* Konva Stage for table visualization */}
                <Stage width={1520} height={850}>
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
