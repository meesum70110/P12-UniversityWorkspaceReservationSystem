// Importing necessary modules
import React from 'react';
import TypeThreeTable from './TypeThreeTable'; // Importing the TypeThreeTable component to render individual tables

// Defining the TablesTypeThree component to render multiple TypeThreeTable components
const TablesTypeThree = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props; // Destructuring props passed to the component

    const yStart = 50; // Setting the starting Y-coordinate for table positioning
    const yDistance = 275; // Defining the vertical distance between tables
    const width = 80; // Defining the width of each table
    const height = 120; // Defining the height of each table

    // Ensuring ids is an array and handling fallback if it’s not an array
    const tableIds = Array.isArray(ids) ? ids : []; // Fallback to empty array if ids is not an array

    // Defining a function to calculate the y-coordinate for each table based on the index
    const getTableYDistance = (index) => {
        return yStart + index * yDistance; // Calculating the Y distance dynamically based on index
    };

    // Returning JSX to render the tables based on the tableIds
    return (
        <>
            {tableIds.map((id, index) => (
                // Mapping over tableIds array and rendering a TypeThreeTable for each entry
                <TypeThreeTable
                    key={id[0]} // Setting a unique key for each table based on its ID
                    id={id[0]} // Passing only the ID for each table to TypeThreeTable
                    booked={dimReserved(id[0])} // Passing the booking status of the table
                    x={x} // Passing the X-coordinate for table positioning
                    y={getTableYDistance(index)} // Calculating the Y-coordinate dynamically based on the index
                    width={width} // Passing the width of the table to TypeThreeTable
                    height={height} // Passing the height of the table to TypeThreeTable
                    handleHovering={handleHovering} // Passing the handleHovering function to TypeThreeTable
                    handlePopUp={handlePopUp} // Passing the handlePopUp function to TypeThreeTable
                />
            ))}
        </>
    );
};

// Exporting the TablesTypeThree component for use in other parts of the application
export default TablesTypeThree;
