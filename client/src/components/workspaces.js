// Importing necessary libraries, styles, and components
import React, { useCallback, useEffect, useState, useContext } from "react"; // Providing React hooks and context functionality
import { useAuthorize } from "../context/hook/useAuthorization"; // Accessing user authorization details
import "../styles/formCards.css"; // Importing styles for form cards
import "../styles/workspaces.css"; // Importing styles for workspaces
import "animate.css"; // Enabling animations for UI
import no_record_icon from "./Images/Record/no-record-img.png"; // Placeholder image for no records
import NavMenu from "./SharedComponents/navMenu"; // Navigation menu component
import LoadingIcon from "./SharedComponents/loading"; // Loading spinner component
import { SocketContext } from "../context/socket"; // Socket context for real-time updates
import TablesPage from "../table-workspaces/tables/page/booking/TablesPage; // Page for workspace table details
import RoomBookingsPage from "../table-workspaces/tables/page/booking/RoomBookingsPage"; // Page for room booking details
import DatePicker from "react-datepicker"; // Component for date selection
import "react-datepicker/dist/react-datepicker.css"; // Styles for date picker
import moment from "moment"; // Library for handling dates and times

// Component to manage workspace availability and bookings
const Surveys = () => {
  const { userAccount } = useAuthorize(); // Retrieving user account information from authorization context
  const socket = useContext(SocketContext); // Accessing WebSocket context for real-time updates
  const [surveys, setSurveys] = useState(null); // State for storing fetched workspace data
  const [surveysExist, setExist] = useState(true); // State for tracking whether workspaces exist
  const [selectedRoom, setSelectedRoom] = useState("Room # 01"); // State for managing the selected room
  const [date, setDate] = useState(new Date()); // State for selected date, defaulting to today
  const [time, setTime] = useState(""); // State for selected time slot
  const [isFetching, setFetching] = useState(true); // State for tracking fetch operation status
  const [isBookingPage, setIsBookingPage] = useState(false); // State for managing booking page visibility
  const [viewAllBookings, setViewAllBookings] = useState(false); // State for toggling between all and personal bookings

  const timeOptions = [ // Array defining available time slots
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  ];

  // Setting default date and time based on current time
  useEffect(() => {
    const now = moment(); // Getting the current moment
    const cutoffHour = 17; // Defining cutoff time for same-day bookings
  
    if (now.hour() >= cutoffHour) { setDate(moment().add(1, "day").toDate()); setTime("09:00"); } // Setting next day default time
    else { 
      const nextAvailableTime = timeOptions.find((timeOption) => moment(timeOption, "HH:mm").isAfter(now)); // Finding next available time
      setTime(nextAvailableTime || "09:00"); // Defaulting to 09:00 if no time slot is available
    }
  }, []); // Running only on component mount

  // Function for fetching workspace data from the API
  const fetchSurveys = useCallback(async () => {
    if (!userAccount?.userToken) { console.error("User is not authenticated."); setFetching(false); return; } // Ensuring user is authenticated

    setFetching(true); // Indicating fetch operation has started
    const formattedDate = date ? date.toISOString().split("T")[0] : ""; // Formatting date for API query
    const queryParams = new URLSearchParams({ room: selectedRoom, date: formattedDate, time: time || "" }).toString(); // Building query parameters

    try {
      const result = await fetch(`https://workspacereservation-backend.onrender.com/api/survey/?${queryParams}`, { headers: { Authorization: `Bearer ${userAccount.userToken}` } }); // Fetching workspace data
      const resultJson = await result.json(); // Parsing JSON response

      if (result.status === 200) { setSurveys(resultJson); setExist(resultJson.length > 0); } // Updating state with workspace data
      else { setExist(false); } // Indicating no workspaces found
    } catch (error) { console.error("Error fetching surveys:", error); } // Handling fetch errors
    finally { setFetching(false); } // Marking fetch operation as completed
  }, [selectedRoom, date, time, userAccount?.userToken]); // Dependencies for fetching workspaces

  // Function for deleting past workspace bookings
  const deletePastBookings = useCallback(async () => {
    try {
      const endpoint = "https://workspacereservation-backend.onrender.com/api/survey/bookings/all"; // API endpoint for fetching all bookings
      const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${userAccount.userToken}` } }); // Fetching bookings

      if (response.ok) {
        const bookings = await response.json(); // Parsing bookings
        const currentDateTime = moment(); // Capturing the current time

        const pastBookings = bookings.filter((booking) => { // Filtering bookings that have passed
          const bookingDateTime = moment(`${booking.date}T${booking.timeSlot.split(" - ")[0]}`, "YYYY-MM-DDTHH:mm");
          return bookingDateTime.isBefore(currentDateTime);
        });

        for (const pastBooking of pastBookings) { // Iterating through past bookings
          await fetch(`https://workspacereservation-backend.onrender.com/api/survey/bookings/${pastBooking._id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${userAccount.userToken}` },
          }); // Deleting each past booking
        }

        console.log("Past bookings deleted successfully."); // Logging successful deletion
      }
    } catch (error) { console.error("Error deleting past bookings:", error); } // Logging deletion errors
  }, [userAccount?.userToken]); // Dependency for deleting bookings

  // Fetching workspaces and deleting past bookings on component load
  useEffect(() => {
    if (userAccount) { 
      deletePastBookings(); // Removing outdated bookings
      fetchSurveys(); // Fetching available workspaces
      socket.emit("content-cards", socket.id); // Emitting event to socket for workspace updates
    }
  }, [userAccount, socket, fetchSurveys, deletePastBookings]); // Dependencies for this effect

  // Listening for real-time updates to workspace visibility
  useEffect(() => {
    socket.on("surveys", (newSurveyAll) => {
      const visibleSurveys = newSurveyAll.filter((survey) => survey.visibility === "true"); // Filtering visible workspaces
      setSurveys(visibleSurveys); setExist(visibleSurveys.length > 0); // Updating state with real-time data
    });
    return () => socket.off("surveys"); // Cleaning up socket listener
  }, [socket, userAccount]); // Dependencies for real-time updates

  const handleViewMyBookings = () => { setViewAllBookings(false); setIsBookingPage(true); }; // Toggling to "My Bookings" page
  const handleViewAllBookings = () => { setViewAllBookings(true); setIsBookingPage(true); }; // Toggling to "All Bookings" page
  const handleBackToTables = () => { setIsBookingPage(false); }; // Returning to workspace tables view


  return (
    <div className="contentpage"> {/* Wrapper div for the entire page content */}
      <NavMenu
        isAdmin={userAccount?.occupation === "admin"} // Passing admin status for conditional menu rendering
        breadcrum="Workspaces" // Setting breadcrumb text to "Workspaces"
        pagePath="/workspaces" // Specifying the navigation path for the breadcrumb
      />

      {isBookingPage ? ( // Checking if the booking page should be displayed
        <RoomBookingsPage
          userAccount={userAccount} // Passing user account details to the RoomBookingsPage component
          onBack={handleBackToTables} // Setting the function to return to the main page
          viewAll={viewAllBookings} // Indicating whether to display all bookings
        />
      ) : ( // If not on the booking page, render the main workspace view
        <>
          {userAccount && ( // Ensuring the user is logged in before showing the workspace filters
            <div className="search-filters"> {/* Div for search filters */}
              <div className="room-buttons"> {/* Div for displaying room selection buttons */}
                {["Room # 01", "Room # 02", "Room # 03", "Room # 04"].map(
                  (room) => ( // Iterating through room options
                    <button
                      key={room} // Using room name as a unique key
                      onClick={() => setSelectedRoom(room)} // Setting the selected room when clicked
                      className={`room-button ${
                        selectedRoom === room ? "active" : "" // Adding "active" class for the selected room
                      }`}
                    >
                      {room} {/* Displaying the room name */}
                    </button>
                  )
                )}
              </div>

              <DatePicker
                selected={date} // Setting the currently selected date
                onChange={(date) => setDate(date)} // Updating the state with the new selected date
                dateFormat="MM/dd/yyyy" // Specifying the display format for the date
                minDate={new Date()} // Restricting selection to today or later
                maxDate={moment().add(7, "days").toDate()} // Restricting selection to the next 7 days
              />

              <select onChange={(e) => setTime(e.target.value)} value={time}> {/* Dropdown for selecting time */}
                {timeOptions.map((timeOption) => { // Iterating through available time options
                  const isDisabled =
                    date &&
                    moment(date).isSame(moment(), "day") && // Checking if the selected date is today
                    moment(timeOption, "HH:mm").isBefore(moment()); // Disabling past times for today
                  return (
                    <option key={timeOption} value={timeOption} disabled={isDisabled}>
                      {timeOption} {/* Displaying the time option */}
                    </option>
                  );
                })}
              </select>

              <button onClick={fetchSurveys}>Search</button> {/* Button to fetch available workspaces */}
            </div>
          )}

          <div className="view-bookings-container"> {/* Div for booking view buttons */}
            <button
              onClick={handleViewMyBookings} // Setting the function to show "My Bookings"
              className="view-bookings-button" // Styling the button
            >
              View My Upcoming Bookings
            </button>
            {userAccount?.occupation === "admin" && ( // Showing admin-specific "All Bookings" button
              <button
                onClick={handleViewAllBookings} // Setting the function to show "All Bookings"
                className="view-bookings-button" // Styling the button
              >
                View All Upcoming Bookings
              </button>
            )}
          </div>

          <div className="content-cards-horizontal"> {/* Div for workspace cards or loading state */}
            {isFetching && <LoadingIcon />} {/* Displaying loading spinner while fetching */}
            {!isFetching && !surveysExist && ( // Showing message if no workspaces are available
              <div className="no-items animate__animated animate__fadeInUp">
                <img src={no_record_icon} alt="Record None" /> {/* Placeholder image */}
                <h2>No Workspace Available</h2> {/* Message for no available workspaces */}
              </div>
            )}
            {!isFetching && surveysExist && surveys && selectedRoom && ( // Showing workspaces if they exist
              <div className="room-group-horizontal"> {/* Div for displaying workspaces of the selected room */}
                <h2
                  style={{
                    fontSize: "22px", // Setting font size
                    fontWeight: "bold", // Making the text bold
                    margin: "20px 0", // Adding vertical margin
                  }}
                >
                  {selectedRoom} {/* Displaying the selected room */}
                </h2>
                <TablesPage
                  room={selectedRoom} // Passing the selected room to TablesPage
                  surveys={surveys.filter(
                    (survey) => survey.room === selectedRoom // Filtering workspaces by the selected room
                  )}
                  selectedDate={date} // Passing the selected date to TablesPage
                  selectedTime={time} // Passing the selected time to TablesPage
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Surveys; // Exporting the Surveys component
