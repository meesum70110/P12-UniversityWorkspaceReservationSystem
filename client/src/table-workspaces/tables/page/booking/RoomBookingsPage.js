import React, { useEffect, useState } from "react"; // Importing React hooks for state and side-effects
import axios from "axios"; // Importing axios for HTTP requests
import moment from "moment"; // Importing moment for date and time management
import { useNavigate } from "react-router-dom"; // Importing navigation hook for redirecting
import styles from "./css/BookingPage.module.css"; // Importing CSS module for styling

// Component for managing and displaying room bookings
const RoomBookingsPage = ({ userAccount, onBack, viewAll }) => {
  const navigate = useNavigate(); // Initializing navigation function
  const [bookings, setBookings] = useState([]); // State to store bookings
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [successMessage, setSuccessMessage] = useState(""); // State for success messages

  // Fetching bookings on component mount and when dependencies change
  useEffect(() => {
    const fetchBookings = async () => {
      if (!userAccount?.userToken) { // Checking if user is authenticated
        setErrorMessage("You are not logged in."); // Setting error message for unauthenticated users
        navigate("/login"); // Redirecting to login page
        return;
      }

      try {
        const endpoint = viewAll // Determining API endpoint based on view type
          ? "https://workspacereservation-backend.onrender.com/api/survey/bookings/all" // Admin endpoint for all bookings
          : "https://workspacereservation-backend.onrender.com/api/survey/bookings"; // User endpoint for personal bookings

        const response = await axios.get(endpoint, { // Fetching bookings data
          headers: { Authorization: `Bearer ${userAccount.userToken}` }, // Adding authorization header
        });

        if (response.status === 200 && response.data.length > 0) { // Checking if bookings data exists
          const currentDateTime = moment(); // Capturing current time

          const upcomingBookings = response.data.filter((booking) => { // Filtering only future bookings
            const bookingDateTime = moment(
              `${booking.date}T${booking.timeSlot.split(" - ")[0]}`,
              "YYYY-MM-DDTHH:mm"
            );
            return bookingDateTime.isAfter(currentDateTime); // Keeping bookings in the future
          });

          const sortedBookings = upcomingBookings.sort((a, b) => { // Sorting bookings in descending order of creation
            const bookingTimeA = moment(a.createdAt); // Parsing booking creation time
            const bookingTimeB = moment(b.createdAt); // Parsing booking creation time
            return bookingTimeB - bookingTimeA; // Sorting by most recently created first
          });

          setBookings(sortedBookings); // Updating state with sorted bookings
        } else {
          setErrorMessage( // Setting error message if no bookings are found
            viewAll ? "No bookings found." : "No bookings found for this user."
          );
        }
      } catch (error) { // Handling errors during fetching
        const errorMsg =
          error.response?.data?.error || // Extracting error from response if available
          "Could not fetch bookings. Please try again later."; // Fallback error message
        setErrorMessage(errorMsg); // Setting error message
      }
    };

    fetchBookings(); // Calling the function to fetch bookings
  }, [userAccount, navigate, viewAll]); // Dependencies for re-fetching bookings

  // Function for cancelling a booking
  const cancelBooking = async (bookingId) => {
    try {
      const response = await axios.delete( // Sending delete request to cancel booking
        `https://workspacereservation-backend.onrender.com/api/survey/bookings/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${userAccount.userToken}` }, // Adding authorization header
        }
      );

      if (response.status === 200) { // Checking if the cancellation was successful
        setBookings((prevBookings) => // Removing the cancelled booking from state
          prevBookings.filter((booking) => booking._id !== bookingId)
        );
        setSuccessMessage("Booking cancelled successfully."); // Setting success message
        setTimeout(() => setSuccessMessage(""), 3000); // Clearing success message after 3 seconds
      } else {
        setErrorMessage("Failed to cancel booking."); // Setting error message for failed cancellation
      }
    } catch (error) { // Handling errors during cancellation
      const errorMsg =
        error.response?.data?.error || "Error cancelling booking."; // Extracting or defaulting error message
      setErrorMessage(errorMsg); // Setting error message
    }
  };

  // Returning JSX for rendering the component
  return (
    <div className={styles.BookingsPage}> {/* Main container for bookings page */}
      <button onClick={onBack} className={styles.BackButton}> {/* Back button */}
        Back to Tables
      </button>
      <h3>
        {viewAll // Dynamically setting the heading based on view type
          ? "All Room Bookings (Admin can delete any booking)"
          : "My Bookings"}
      </h3>
      {errorMessage && <p className={styles.ErrorMessage}>{errorMessage}</p>} {/* Displaying error messages */}
      {successMessage && ( // Displaying success messages
        <p className={styles.SuccessMessage}>{successMessage}</p>
      )}
      {bookings.length > 0 ? ( // Rendering booking details if available
        bookings.map((booking) => (
          <div key={booking._id} className={styles.BookingItem}> {/* Booking item container */}
            <p><strong>Room:</strong> {booking.room}</p> {/* Displaying room name */}
            <p><strong>Table:</strong> {booking.tableNumber}</p> {/* Displaying table number */}
            <p><strong>Date:</strong> {moment(booking.date).format("LL")}</p> {/* Formatting and displaying date */}
            <p><strong>Time:</strong> {booking.timeSlot}</p> {/* Displaying time slot */}
            <p><strong>Name:</strong> {booking.firstName}</p> {/* Displaying user's name */}
            <p><strong>Email:</strong> {booking.email}</p> {/* Displaying user's email */}
            <button
              onClick={() => cancelBooking(booking._id)} // Attaching cancel function to button
              className={styles.CancelButton} // Styling cancel button
            >
              Cancel
            </button>
          </div>
        ))
      ) : (
        <p>No upcoming bookings available.</p> // Displaying message if no bookings are found
      )}
    </div>
  );
};

export default RoomBookingsPage; // Exporting the component
