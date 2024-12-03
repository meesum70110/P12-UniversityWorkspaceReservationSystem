import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for redirection
import styles from "./css/TablesPage.module.css"; // Importing CSS module for styling
import { Stage, Layer } from "react-konva"; // Importing Konva components for rendering interactive canvas
import moment from "moment"; // Importing Moment.js for date and time manipulation
import TablesTypeOne from "../../components/TablesTypeOne"; // Importing table layout component
import TablesTypeTwo from "../../components/TablesTypeTwo"; // Importing table layout component
import TablesTypeThree from "../../components/TablesTypeThree"; // Importing table layout component
import TablesTypeTFour from "../../components/TablesTypeFour"; // Importing table layout component
import PopUp from "../../components/PopUp"; // Importing pop-up component for reservations
import axios from "axios"; // Importing Axios for making API requests
import { useAuthorize } from "../../../../context/hook/useAuthorization"; // Importing custom authorization hook

// Main component for managing and displaying table bookings
const TablesPage = ({ room, surveys, selectedDate, selectedTime }) => {
  const { userAccount } = useAuthorize(); // Accessing user account details using custom hook
  const navigate = useNavigate(); // Initializing navigation for redirection

  // State variables for managing component behavior
  const [userData, setUserData] = useState(null); // Storing user data
  const [hovering, setHovering] = useState("default"); // Storing hover state for cursor
  const [openPopUp, setOpenPopUp] = useState(false); // Managing pop-up visibility
  const [tableIdPicked, setTableIdPicked] = useState(undefined); // Storing the selected table ID
  const [tablesIds, setTablesIds] = useState(new Map()); // Mapping table IDs to their status
  const [displayDate, setDisplayDate] = useState(""); // Displaying the selected date
  const [displayTime, setDisplayTime] = useState(""); // Displaying the selected time
  const [errorMessage, setErrorMessage] = useState(""); // Storing error messages
  const [myBookings, setMyBookings] = useState([]); // Managing user-specific bookings
  const [showBookings, setShowBookings] = useState(false); // Managing the display of bookings
  const [localUpdates, setLocalUpdates] = useState(new Map()); // Managing local updates to table states

  // Default user details if no data is available
  const userFirstName = userData?.fname || "N/A";
  const userLastName = userData?.lname || "N/A";
  const userEmail = userData?.email || "N/A";

  // Function to slice a map into a specific range of table IDs
  const sliceMap = (map, start, end) => {
    const slicedArray = [];
    for (let i = start; i <= end; i++) {
      const tableId = i.toString(); // Converting table number to string
      slicedArray.push([tableId, map.get(tableId) || false]); // Adding table status to the sliced array
    }
    return slicedArray; // Returning the sliced array
  };

  // Redirecting to login page if the user is not logged in
  useEffect(() => {
    if (!userAccount || !userAccount.userToken) {
      navigate("/login"); // Navigating to login page
    }
  }, [userAccount, navigate]); // Dependencies on user account and navigation

  // Setting fallback date and time if none is selected
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      const currentHour = moment().hour(); // Getting the current hour
      const isPast5PM = currentHour >= 17; // Checking if it's past 5 PM
      const fallbackDate = isPast5PM
        ? moment().add(1, "day").format("YYYY-MM-DD") // Setting to the next day if past 5 PM
        : moment().format("YYYY-MM-DD"); // Setting to the current day otherwise
      const fallbackTime = "09:00"; // Default fallback time

      setDisplayDate(fallbackDate); // Setting the fallback date
      setDisplayTime(fallbackTime); // Setting the fallback time
    }
  }, []); // Runs only once on component mount

  // Synchronizing displayDate and displayTime with props
  useEffect(() => {
    if (selectedDate) {
      setDisplayDate(moment(selectedDate).format("YYYY-MM-DD")); // Formatting and setting selected date
    }
    if (selectedTime) {
      setDisplayTime(selectedTime); // Setting selected time
    }
  }, [selectedDate, selectedTime]); // Runs whenever selectedDate or selectedTime changes

  // Creating a memoized string for the end of the time slot
  const toDateTime = useMemo(() => {
    return moment(`${displayDate}T${displayTime}`)
      .add(1, "hour")
      .format("YYYY-MM-DD HH:mm:ss"); // Formatting the end time string
  }, [displayDate, displayTime]); // Dependencies on displayDate and displayTime

  // Fetching user data from the server
  useEffect(() => {
    const fetchUserData = async () => {
      if (userAccount && userAccount.userToken) { // Ensuring user is logged in
        try {
          setErrorMessage(""); // Clearing any previous error messages
          const response = await axios.get("https://workspacereservation-backend.onrender.com/api/account/", {
            headers: { Authorization: `Bearer ${userAccount.userToken}` }, // Adding authentication headers
          });
          setUserData(response.data); // Setting user data on successful response
        } catch (error) {
          const errorMsg =
            error.response?.data?.error ||
            "Could not fetch user data. Please check your account information."; // Handling errors
          setErrorMessage(errorMsg); // Setting error message
        }
      }
    };
    fetchUserData(); // Fetch user data on component mount
  }, [userAccount]); // Dependency on userAccount

  // Populating table statuses based on surveys
  useEffect(() => {
    const tableStatusMap = new Map(); // Initializing a new map for table statuses
    surveys.forEach((survey) => { // Iterating over each survey
      const isBooked = survey.status === "unavailable"; // Checking if the table is unavailable
      tableStatusMap.set(survey._id, isBooked); // Updating map with table ID and status
    });
    setTablesIds(tableStatusMap); // Updating the state with the table statuses
  }, [surveys]); // Dependency on surveys

  // Handling hover status for cursor changes
  const handleHovering = (hoverStatus) => setHovering(hoverStatus);

  // Managing pop-up visibility and selected table
  const handlePopUp = (shouldOpen, tableId) => {
    setTableIdPicked(tableId); // Setting the selected table ID
    setOpenPopUp(shouldOpen); // Setting the pop-up visibility
  };

  // Fetching the status of all tables based on date, time, and room
  const fetchAllTablesStatus = useCallback(async () => {
    if (!displayDate || !displayTime) { // Ensuring date and time are provided
      setErrorMessage("Date and time are required."); // Setting error message if missing
      return;
    }

    if (!userAccount?.userToken) { // Ensuring user is logged in
      setErrorMessage("You are not logged in."); // Setting error message if not logged in
      return;
    }

    try {
      const params = {
        date: displayDate, // Adding selected date to request parameters
        time: displayTime, // Adding selected time to request parameters
      };

      if (room !== "All Rooms") {
        params.room = room; // Adding room filter if not "All Rooms"
      }

      const response = await axios.get("https://workspacereservation-backend.onrender.com/api/survey/tables", {
        params,
        headers: { Authorization: `Bearer ${userAccount.userToken}` }, // Adding authentication headers
      });

      if (response.status === 200 && response.data.length > 0) { // Checking if data exists
        const updatedTables = new Map(); // Initializing a new map for updated tables

        response.data.forEach((table) => {
          const tableId = table.tableNumber; // Extracting table number
          const isBooked = table.availability === "booked"; // Checking table availability
          updatedTables.set(tableId, isBooked); // Updating the map
        });

        setTablesIds(updatedTables); // Updating the state with the new table statuses
      } else {
        setErrorMessage("No table data found."); // Setting error message if no data found
      }
    } catch (error) { // Handling errors during API call
      const errorMsg =
        error.response?.data?.error ||
        "Could not fetch tables. Please try again later."; // Handling generic error message
      setErrorMessage(errorMsg); // Setting error message
    }
  }, [userAccount, displayDate, displayTime, room]); // Dependencies on userAccount, displayDate, displayTime, and room

  // Triggering table status fetch on date or time change
  useEffect(() => {
    if (displayDate && displayTime) {
      fetchAllTablesStatus(); // Fetch table statuses if date and time are available
    }
  }, [fetchAllTablesStatus, displayDate, displayTime, room]); // Dependencies on fetchAllTablesStatus, displayDate, displayTime, and room

  // Handling table reservation
  const handleReservation = async () => {
    handlePopUp(false); // Closing the pop-up after starting the reservation process

    if (!userAccount?.occupation) { // Checking if the user occupation is defined
      setErrorMessage("User occupation is not defined. Please log in again."); // Setting error message if missing
      return;
    }

    const selectedWorkspace = surveys.find((survey) => survey.room === room); // Finding the selected workspace
    const workspaceId = selectedWorkspace?._id; // Extracting the workspace ID

    // Ensuring a unique table selection
    const tableIdToBook = tableIdPicked.toString(); // Converting the table ID to string
    console.log(`Table to be booked: ${tableIdToBook}`); // Logging the selected table for debugging

    try {
      const response = await axios.post(
        `http://localhost:8000/api/survey/${workspaceId}/book`, // API endpoint for booking
        {
          tableNumber: tableIdToBook, // Selected table number
          room, // Selected room
          date: displayDate, // Selected date
          time: displayTime, // Selected time
          firstName: userFirstName, // User first name
          email: userEmail, // User email
          occupation: userAccount.occupation, // User occupation
        },
        {
          headers: { Authorization: `Bearer ${userAccount.userToken}` }, // Adding authentication headers
        }
      );

      if (response.data.booking) { // Checking if the booking was successful
        // Updating the booked table status
        setTablesIds((prev) => {
          const updatedTables = new Map(prev); // Copying previous table statuses
          updatedTables.set(tableIdToBook, true); // Setting the booked table as reserved
          return updatedTables; // Returning updated table statuses
        });

        setErrorMessage("Table booked successfully"); // Setting success message
      } else {
        setErrorMessage("Booking failed or already booked."); // Setting error message if booking failed
      }
    } catch (error) { // Handling errors during reservation
      const errorMsg = error.response?.data?.error || "Error making reservation"; // Handling generic error message
      setErrorMessage(errorMsg); // Setting error message
      console.error("Error making reservation:", errorMsg); // Logging the error for debugging
    }
  };

  

  // Function to cancel a booking
  const cancelBooking = async (bookingId) => {
    try {
      const response = await axios.delete( // Sending a DELETE request to cancel the booking
        `https://workspacereservation-backend.onrender.com/api/survey/bookings/${bookingId}`, // API endpoint with the booking ID
        {
          headers: { Authorization: `Bearer ${userAccount.userToken}` }, // Including user authorization token in headers
        }
      );

      if (response.status === 200) { // Checking if the request was successful
        setMyBookings(myBookings.filter((booking) => booking._id !== bookingId)); // Removing the cancelled booking from the state
        fetchAllTablesStatus(); // Refreshing table statuses after cancellation
      } else {
        setErrorMessage("Failed to cancel booking."); // Setting error message if cancellation failed
      }
    } catch (error) { // Handling errors during the cancellation process
      const errorMsg =
        error.response?.data?.error || "Error cancelling booking"; // Extracting error message from the response or setting a default message
      setErrorMessage(errorMsg); // Setting the error message in the state
    }
  };


  // Function to fetch user-specific bookings
  const fetchMyBookings = () => {
    if (!userAccount?.userToken) { // Checking if the user is logged in
      setErrorMessage("You are not logged in."); // Setting an error message if not logged in
      return; // Exiting the function if the user is not authenticated
    }
    navigate("/bookings"); // Redirecting to the bookings page for the user
  };

  



  return (
    <div className={styles.TablesPage} style={{ cursor: hovering }}> {/* Main container with dynamic cursor style */}
      {errorMessage && ( // Checking if there is an error message
        <div className={styles.ErrorMessage}>
          {errorMessage} {/* Displaying the error message */}
        </div>
      )}
  
      <div className={styles.TopBar}> {/* Top bar section */}
        <div className={styles.Info}> {/* Displaying selected date and time slot */}
          <p>
            {`${moment(displayDate).format('LL')} , Time Slot: ${displayTime} - ${moment(displayTime, 'HH:mm').add(1, 'hour').format('HH:mm')}`} 
            {/* Formatting and displaying the date and time slot */}
          </p>
        </div>
      </div>
  
      {showBookings && ( // Rendering the bookings list if `showBookings` is true
        <div className={styles.BookingsList}>
          <h3>My Bookings</h3> {/* Section heading for bookings */}
          {myBookings && myBookings.length > 0 ? ( // Checking if there are bookings to display
            myBookings.map((booking, index) => ( // Iterating through the bookings
              <div key={index} className={styles.BookingItem}> {/* Rendering individual booking details */}
                <p><strong>Room:</strong> {booking.room || "Room info unavailable"}</p> {/* Room information */}
                <p><strong>Table:</strong> {booking.tableNumber}</p> {/* Table number */}
                <p><strong>Date:</strong> {moment(booking.date).format('LL')}</p> {/* Formatted booking date */}
                <p><strong>Time:</strong> {booking.timeSlot}</p> {/* Booking time slot */}
                <button 
                  onClick={() => cancelBooking(booking._id)} 
                  className={styles.CancelButton}
                >
                  Cancel {/* Button to cancel the booking */}
                </button>
              </div>
            ))
          ) : (
            <p>...</p> // Placeholder for no bookings 
          )}
        </div>
      )}


      <div className={styles.Tables}>
        {/* Konva Stage is used to create a canvas where table groups will be rendered */}
        <Stage width={1520} height={850}>
          {/* Check if there are any table IDs available for rendering */}
          {tablesIds.size ? (
            <Layer>
              {/* Debugging: Logging the current state of table IDs */}
              {console.log(
                "%cRendering Layer. Current table states:",
                "color: blue; font-weight: bold;",
                tablesIds
              )}

              {/* Rendering a group of tables using TablesTypeTwo component */}
              <TablesTypeTwo
                ids={sliceMap(tablesIds, 19, 22)} // Providing table IDs 19 to 22
                handleHovering={handleHovering} // Passing hover state handler
                handlePopUp={handlePopUp} // Passing pop-up state handler
                x={970} // Positioning this group along the x-axis
                dimReserved={(id) => !!tablesIds.get(id.toString())} // Determining if a table is reserved
              />

              {/* Rendering another group of tables using TablesTypeThree component */}
              <TablesTypeThree
                ids={sliceMap(tablesIds, 11, 15)} // Table IDs 11 to 15
                handleHovering={handleHovering}
                x={370} // Adjusted x-axis position
                handlePopUp={handlePopUp}
                dimReserved={(id) => !!tablesIds.get(id.toString())}
              />

              {/* Rendering the third group of tables using TablesTypeTFour */}
              <TablesTypeTFour
                ids={sliceMap(tablesIds, 1, 10)} // Table IDs 1 to 10
                handleHovering={handleHovering}
                x={80} // Positioned towards the left
                handlePopUp={handlePopUp}
                dimReserved={(id) => !!tablesIds.get(id.toString())}
              />

              {/* Rendering additional tables with TablesTypeTwo component */}
              <TablesTypeTwo
                ids={sliceMap(tablesIds, 15, 18)} // Table IDs 15 to 18
                handleHovering={handleHovering}
                x={670} // Positioned at the center
                handlePopUp={handlePopUp}
                dimReserved={(id) => !!tablesIds.get(id.toString())}
              />

              {/* Rendering the final group of tables using TablesTypeOne */}
              <TablesTypeOne
                ids={sliceMap(tablesIds, 23, 26)} // Table IDs 23 to 26
                handleHovering={handleHovering}
                x={1220} // Positioned towards the right
                handlePopUp={handlePopUp}
                dimReserved={(id) => !!tablesIds.get(id.toString())}
              />
            </Layer>
          ) : null /* Render nothing if no table IDs are available */}
        </Stage>
      </div>

      {/* Check if the pop-up should be displayed */}
      {openPopUp && (
        <div className={styles.PopUp}>
          {/* Rendering the PopUp component for reservations */}
          <PopUp
            handlePopUp={handlePopUp} // Function to handle pop-up state
            handleReservation={handleReservation} // Function to handle reservation logic
            from={`${displayDate} ${displayTime}`} // Start time of reservation
            to={toDateTime} // End time of reservation
            first_name={userFirstName} // User's first name
            last_name={userLastName} // User's last name
          />
        </div>
      )}
    </div>
  );
};

export default TablesPage;
