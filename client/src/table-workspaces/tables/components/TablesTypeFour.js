import React from 'react';
import TypeFourTable from './TypeFourTable';

const TablesTypeFour = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    const yStart = 50;
    const yDistance = 66;
    const tableDistanceFromWalls = 40;
    const width = 80;
    const height = 120;

    // Ensuring ids is an array and handle fallback if it’s not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Logging the type and content of ids
    console.log("TypeFourTable IDs:", tableIds);

    // Function to calculate the y-coordinate for each table based on the index and adding offset from the wall
    const getTableYDistance = (index) => {
        return (yDistance * index) + yStart + tableDistanceFromWalls;
    };

    return (
        <>
            {tableIds.map((id, index) => (
                <TypeFourTable
                    key={id[0]} // Unique key for each table based on ID
                    id={id[0]} 
                    booked={dimReserved(id[0])} // Passing booking status dynamically
                    x={x} // Keeping x constant for this row
                    y={getTableYDistance(index)} // Dynamically calculating y based on the index
                    width={width}
                    height={height}
                    handleHovering={handleHovering}
                    handlePopUp={handlePopUp}
                />
            ))}
        </>
    );
};

export default TablesTypeFour;
