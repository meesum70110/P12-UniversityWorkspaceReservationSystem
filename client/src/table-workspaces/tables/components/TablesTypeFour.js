// Importing necessary libraries and components
import React from 'react';
import TypeFourTable from './TypeFourTable'; // Importing the TypeFourTable component

// Defining the TablesTypeFour component
const TablesTypeFour = (props) => {
    // Destructuring props for better readability
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    // Defining constants for table positioning
    const yStart = 50; // Initial Y-coordinate for the first table
    const yDistance = 66; // Vertical distance between consecutive tables
    const tableDistanceFromWalls = 40; // Offset distance from the walls
    const width = 80; // Width of each table
    const height = 120; // Height of each table

    // Ensuring ids is an array, providing a fallback if it’s not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Logging the content and type of table IDs
    console.log("TypeFourTable IDs:", tableIds);

    // Function to calculate the Y-coordinate for each table
    // It considers the index, vertical distance, and wall offset
    const getTableYDistance = (index) => {
        return (yDistance * index) + yStart + tableDistanceFromWalls;
    };

    // Rendering the list of tables using the map method
    return (
        <>
            {tableIds.map((id, index) => (
                <TypeFourTable
                    key={id[0]} // Setting a unique key for each table based on its ID
                    id={id[0]} // Passing the table's ID to the component
                    booked={dimReserved(id[0])} // Dynamically passing the booking status
                    x={x} // Keeping the X-coordinate constant for all tables in this row
                    y={getTableYDistance(index)} // Dynamically calculating the Y-coordinate
                    width={width} // Passing the predefined width
                    height={height} // Passing the predefined height
                    handleHovering={handleHovering} // Passing the hover handler
                    handlePopUp={handlePopUp} // Passing the pop-up handler
                />
            ))}
        </>
    );
};

// Exporting the TablesTypeFour component as the default export
export default TablesTypeFour;
