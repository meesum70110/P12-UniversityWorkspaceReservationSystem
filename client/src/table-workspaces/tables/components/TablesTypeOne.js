// Importing necessary modules for the component
import React from 'react';
import { Line } from 'react-konva'; // Importing Line from Konva for rendering lines (if needed)
import TypeOneTable from './TypeOneTable'; // Importing the TypeOneTable component to render individual tables

// Defining the TablesTypeOne component to render multiple TypeOneTable components
const TablesTypeOne = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props; // Destructuring props passed to the component

    const yStart = 50; // Setting the starting Y-coordinate for table positioning
    const yDistance = 200; // Defining the vertical distance between tables
    const tableDistanceFromWalls = 40; // Setting the distance of the tables from the walls (offset)
    const width = 160; // Defining the width of each table
    const height = 95; // Defining the height of each table

    // Ensuring ids is an array and handling fallback if it’s not an array
    const tableIds = Array.isArray(ids) ? ids : []; // Fallback to empty array if ids is not an array

    // Function to calculate the y-coordinate for each table based on the index and adding offset from the wall
    const getTableYDistance = (index) => {
        return (yDistance * index) + yStart + tableDistanceFromWalls; // Calculating the Y distance dynamically
    };

    // Returning JSX to render the tables based on the tableIds
    return (
        <>
            {tableIds.map((id, index) => (
                // Mapping over tableIds array and rendering a TypeOneTable for each entry
                <TypeOneTable 
                    key={id[0]} // Setting a unique key for each table based on its ID
                    id={id[0]} // Passing only the ID for each table to TypeOneTable
                    booked={dimReserved(id[0])} // Passing the booking status of the table
                    x={x + width - (width / 2)} // Calculating the X-coordinate to center the table horizontally
                    y={getTableYDistance(index)} // Calculating the Y-coordinate dynamically based on the index
                    width={width} // Passing the width of the table to the TypeOneTable
                    height={height} // Passing the height of the table to the TypeOneTable
                    handleHovering={handleHovering} // Passing the handleHovering function to TypeOneTable
                    handlePopUp={handlePopUp} // Passing the handlePopUp function to TypeOneTable
                />
            ))}
        </>
    );
};

// Exporting the TablesTypeOne component for use in other parts of the application
export default TablesTypeOne;
