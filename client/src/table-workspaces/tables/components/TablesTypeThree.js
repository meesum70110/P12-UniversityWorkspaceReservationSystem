import React from 'react';
import TypeThreeTable from './TypeThreeTable';

const TablesTypeThree = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    const yStart = 50; // Initial Y position
    const yDistance = 275; // Distance between tables vertically
    const width = 80; // Table width
    const height = 120; // Table height

    // Ensure ids is an array and handle fallback if it’s not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Log the type and content of ids
    console.log("TablesTypeThree received IDs:", tableIds);

    // Function to calculate the y-coordinate for each table based on the index
    const getTableYDistance = (index) => {
        return yStart + index * yDistance;
    };

    return (
        <>
            {tableIds.map((id, index) => (
                <TypeThreeTable
                    key={id[0]} // Unique key for each table
                    id={id[0]} // Pass only the table ID
                    booked={dimReserved(id[0])} // Dynamically calculate the booking status
                    x={x} // X-coordinate position
                    y={getTableYDistance(index)} // Dynamic Y-coordinate based on index
                    width={width} // Table width
                    height={height} // Table height
                    handleHovering={handleHovering} // Handle hovering events
                    handlePopUp={handlePopUp} // Handle popup events
                />
            ))}
        </>
    );
};

export default TablesTypeThree;
