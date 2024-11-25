// Importing necessary libraries and CSS
import React from 'react'; // Importing React library
import moment from 'moment'; // Importing moment for date/time formatting
import styles from './css/PopUp.module.css'; // Importing custom CSS module for styling

// Defining the PopUp component
const PopUp = ({ handlePopUp, handleReservation, from, to, first_name, last_name }) => {

    // Function to handle user confirmation actions
    const handleClick = (confirmation) => {
        if (confirmation) { // If the user confirms the reservation
            handleReservation(); // Call the reservation handler
        } else { // If the user declines
            handlePopUp(false); // Close the popup
        }
    };

    // Returning the JSX structure for the popup
    return (
        <div className={styles.PopUpBackground}> {/* Background overlay for the popup */}
            <div className={styles.PopUp}> {/* Main popup container */}
                <div className={styles.Title}> {/* Section for the popup title */}
                    <h4>CONFIRM TABLE RESERVATION?</h4> {/* Title message */}
                </div>
                <div className={styles.ConfirmationInfo}> {/* Section displaying reservation details */}
                    <p>
                        FROM: <span>{moment(from).format('MMMM Do YYYY, h:mm:ss a')}</span> {/* Displaying formatted start time */}
                    </p>
                    <p>
                        TO: <span>{moment(to).format('MMMM Do YYYY, h:mm:ss a')}</span> {/* Displaying formatted end time */}
                    </p>
                    <p>
                        FIRST NAME: <span>{first_name}</span> {/* Displaying user's first name */}
                    </p>
                    <p>
                        LAST NAME: <span>{last_name}</span> {/* Displaying user's last name */}
                    </p>
                </div>
                <div className={styles.Buttons}> {/* Section for action buttons */}
                    <div 
                        className={styles.Button} 
                        id={styles.ButtonGreen} 
                        onClick={() => handleClick(true)}> {/* Confirm button */}
                        <h4>YES</h4> {/* Text on the confirm button */}
                    </div>
                    <div 
                        className={styles.Button} 
                        id={styles.ButtonRed} 
                        onClick={() => handleClick(false)}> {/* Decline button */}
                        <h4>NO</h4> {/* Text on the decline button */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopUp; // Exporting the PopUp component as default
