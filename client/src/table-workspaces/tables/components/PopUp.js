// Importing necessary modules for the component
import React from 'react'; 
import moment from 'moment'; 
import styles from './css/PopUp.module.css'; // Importing CSS styles for the PopUp component

// Defining the PopUp component to handle table reservation confirmation
const PopUp = ({ handlePopUp, handleReservation, from, to, first_name, last_name }) => {

    // Defining the handleClick function that handles the button click for confirmation
    const handleClick = (confirmation) => {
        if (confirmation) {
            handleReservation();  // Proceeding with reservation if confirmed
        } else {
            handlePopUp(false);  // Closing the popup if not confirmed
        }
    };

    // Returning JSX to render the PopUp component
    return (
        <div className={styles.PopUpBackground}> {/* Creating a background for the popup */}
            <div className={styles.PopUp}> {/* Main container for the popup */}
                <div className={styles.Title}> {/* Section for the title of the popup */}
                    <h4>CONFIRM TABLE RESERVATION?</h4> {/* Displaying the confirmation question */}
                </div>
                <div className={styles.ConfirmationInfo}> {/* Section for displaying reservation details */}
                    <p>FROM: <span>{moment(from).format('MMMM Do YYYY, h:mm:ss a')}</span></p> {/* Showing the start date/time of the reservation */}
                    <p>TO: <span>{moment(to).format('MMMM Do YYYY, h:mm:ss a')}</span></p> {/* Showing the end date/time of the reservation */}
                    <p>FIRST NAME: <span>{first_name}</span></p> {/* Displaying the user's first name */}
                    <p>LAST NAME: <span>{last_name}</span></p> {/* Displaying the user's last name */}
                </div>
                <div className={styles.Buttons}> {/* Container for the Yes/No buttons */}
                    <div className={styles.Button} id={styles.ButtonGreen} onClick={() => handleClick(true)}> {/* Green button for confirming the reservation */}
                        <h4>YES</h4> {/* Displaying "YES" text on the button */}
                    </div>
                    <div className={styles.Button} id={styles.ButtonRed} onClick={() => handleClick(false)}> {/* Red button for cancelling the reservation */}
                        <h4>NO</h4> {/* Displaying "NO" text on the button */}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Exporting the PopUp component for use in other parts of the application
export default PopUp;
