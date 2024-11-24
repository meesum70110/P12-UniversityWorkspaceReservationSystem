import React from 'react';
import TypeThreeTable from './TypeThreeTable';

const TablesTypeThree = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    const yStart = 50; // Initial Y position
    const yDistance = 275; // Distance between tables vertically
    const width = 80; // Table width
    const height = 120; // Table height

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
                    id={id[0]} 
                    booked={dimReserved(id[0])} // Dynamically calculating the booking status
                    x={x} 
                    y={getTableYDistance(index)} // Dynamic Y-coordinate based on index
                    width={width} // Table width
                    height={height} // Table height
                    handleHovering={handleHovering} // Handling hovering events
                    handlePopUp={handlePopUp} // Handling popup events
                />
            ))}
        </>
    );
};

export default TablesTypeThree;
