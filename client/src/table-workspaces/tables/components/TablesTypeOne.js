// Importing necessary libraries and components
import React from 'react';
import { Line } from 'react-konva'; // Importing Konva's Line component for potential line drawing
import TypeOneTable from './TypeOneTable'; // Importing the TypeOneTable component

// Defining the TablesTypeOne component
const TablesTypeOne = (props) => {
    // Destructuring props for better readability and usage
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    // Defining constants for table positioning
    const yStart = 50; // Initial Y-coordinate for the first table
    const yDistance = 200; // Vertical spacing between consecutive tables
    const tableDistanceFromWalls = 40; // Offset distance from the walls
    const width = 160; // Width of each table
    const height = 95; // Height of each table

    // Ensuring `ids` is an array and providing a fallback if it is not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Logging the type and content of `ids` to verify its structure
    console.log("Type of ids:", typeof ids); // Logs the type of `ids`
    console.log("Content of ids:", ids); // Logs the content of `ids`

    // Function to calculate the Y-coordinate for each table
    // It factors in the index, vertical distance, and offset from the wall
    const getTableYDistance = (index) => {
        return (yDistance * index) + yStart + tableDistanceFromWalls;
    };

    // Rendering a list of TypeOneTable components using the map method
    return (
        <>
            {tableIds.map((id, index) => (
                <TypeOneTable 
                    key={id[0]} // Setting a unique key for each table based on its ID
                    id={id[0]} // Passing the table's ID to the component
                    booked={dimReserved(id[0])} // Dynamically passing the booking status
                    x={x + width - (width / 2)} // Centering the table horizontally within its space
                    y={getTableYDistance(index)} // Calculating the Y-coordinate dynamically
                    width={width} // Setting the table width
                    height={height} // Setting the table height
                    handleHovering={handleHovering} // Passing the hover handler function
                    handlePopUp={handlePopUp} // Passing the pop-up handler function
                />
            ))}
        </>
    );
};

// Exporting the TablesTypeOne component as the default export
export default TablesTypeOne;
