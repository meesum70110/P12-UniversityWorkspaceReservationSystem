import React from 'react';
import TypeTwoTable from './TypeTwoTable';

const TablesTypeTwo = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    const yStart = 50; // Initial Y position
    const yDistance = 200; // Distance between tables vertically
    const width = 140; // Table width
    const height = 70; // Table height

    // Ensure ids is an array and handle fallback if it’s not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Log the type and content of ids
    console.log("TablesTypeTwo received IDs:", tableIds);

    return (
        <>
            {tableIds.map((id, index) => (
                <TypeTwoTable
                    key={id[0]} // Ensure a unique key for each table
                    id={id[0]} // Pass only the table ID
                    booked={dimReserved(id[0])} // Dynamically calculate the booking status
                    x={x} // X-coordinate position
                    y={yStart + index * yDistance} // Dynamic Y-coordinate based on index
                    width={width} // Table width
                    height={height} // Table height
                    handleHovering={handleHovering} // Handle hovering events
                    handlePopUp={handlePopUp} // Handle popup events
                />
            ))}
        </>
    );
};

export default TablesTypeTwo;
