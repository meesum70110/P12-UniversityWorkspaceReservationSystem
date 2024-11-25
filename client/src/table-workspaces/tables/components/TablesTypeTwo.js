// Importing React library and the TypeTwoTable component
import React from 'react';
import TypeTwoTable from './TypeTwoTable';

// Defining the TablesTypeTwo component
const TablesTypeTwo = (props) => {
    // Destructuring props for clarity and direct access
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    // Constants for defining table dimensions and positioning
    const yStart = 50; // Initial Y-coordinate for the first table
    const yDistance = 200; // Vertical distance between each table
    const width = 140; // Width of each table
    const height = 70; // Height of each table

    // Ensuring `ids` is an array; provide a fallback in case it’s not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Log the type and content of `ids` for development purposes
    console.log("TablesTypeTwo received IDs:", tableIds);

    // Rendering the tables as a list of TypeTwoTable components
    return (
        <>
            {tableIds.map((id, index) => (
                <TypeTwoTable
                    key={id[0]} // Assigning a unique key to each table using its ID
                    id={id[0]} // Passing the table ID as a prop
                    booked={dimReserved(id[0])} // Dynamically determining booking status using the provided function
                    x={x} // X-coordinate for horizontal positioning
                    y={yStart + index * yDistance} // Calculating the Y-coordinate based on index
                    width={width} // Setting the width of each table
                    height={height} // Setting the height of each table
                    handleHovering={handleHovering} // Propagating the hover event handler
                    handlePopUp={handlePopUp} // Propagating the popup event handler
                />
            ))}
        </>
    );
};

// Exporting the TablesTypeTwo component as the default export
export default TablesTypeTwo;
