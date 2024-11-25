
import React from 'react';
import { Line } from 'react-konva';
import TypeOneTable from './TypeOneTable';

const TablesTypeOne = (props) => {
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    const yStart = 50;
    const yDistance = 200;
    const tableDistanceFromWalls = 40;
    const width = 160;
    const height = 95;

    // Ensure ids is an array and handle fallback if it’s not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Log the type and content of ids
    console.log("Type of ids:", typeof ids);
    console.log("Content of ids:", ids);

    // Function to calculate the y-coordinate for each table based on the index and adding offset from the wall
    const getTableYDistance = (index) => {
        return (yDistance * index) + yStart + tableDistanceFromWalls;
    };

    return (
        <>
            {tableIds.map((id, index) => (
                <TypeOneTable 
                    key={id[0]} // Unique key for each table based on ID
                    id={id[0]} // Pass only the ID
                    booked={dimReserved(id[0])} // Pass booking status directly
                    x={x + width - (width / 2)} // Center horizontally
                    y={getTableYDistance(index)} // Calculate vertical position based on index
                    width={width} 
                    height={height}
                    handleHovering={handleHovering} 
                    handlePopUp={handlePopUp}
                />
            ))}
        </>
    );
};

export default TablesTypeOne;
