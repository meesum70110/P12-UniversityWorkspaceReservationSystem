// Importing necessary modules
import React from 'react'; // Importing React for component functionality
import TypeTwoTable from './TypeTwoTable'; // Importing TypeTwoTable component to render individual tables

// Defining the TablesTypeTwo component for rendering multiple TypeTwoTable components
const TablesTypeTwo = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props; // Destructuring props passed to the component

    const yStart = 50; // Defining the initial Y-coordinate for table positioning
    const yDistance = 200; // Setting the distance between tables vertically
    const width = 140; // Defining the width of each table
    const height = 70; // Defining the height of each table

    // Ensuring ids is an array and handling fallback if ids is not an array
    const tableIds = Array.isArray(ids) ? ids : []; // Using Array.isArray to confirm ids is an array, else fallback to an empty array

    // Returning JSX to render the tables based on the tableIds
    return (
        <>
            {tableIds.map((id, index) => (
                // Mapping over tableIds array to render a TypeTwoTable for each entry
                <TypeTwoTable
                    key={id[0]} // Ensuring a unique key for each table based on its ID
                    id={id[0]} // Passing the ID of the table to TypeTwoTable
                    booked={dimReserved(id[0])} // Dynamically calculating the booking status of the table
                    x={x} // Passing the X-coordinate for table positioning
                    y={yStart + index * yDistance} // Calculating the Y-coordinate dynamically based on the index
                    width={width} // Passing the width of the table
                    height={height} // Passing the height of the table
                    handleHovering={handleHovering} // Passing the handleHovering function to TypeTwoTable
                    handlePopUp={handlePopUp} // Passing the handlePopUp function to TypeTwoTable
                />
            ))}
        </>
    );
};

// Exporting the TablesTypeTwo component for use in other parts of the application
export default TablesTypeTwo;
