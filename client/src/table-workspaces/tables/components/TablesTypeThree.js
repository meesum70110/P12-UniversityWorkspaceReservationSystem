// Importing React library and the TypeThreeTable component
import React from 'react';
import TypeThreeTable from './TypeThreeTable';

// Defining the TablesTypeThree component
const TablesTypeThree = (props) => {
    // Destructuring the props for clarity and ease of use
    const { x, ids, handleHovering, handlePopUp, dimReserved } = props;

    // Constants for positioning the tables
    const yStart = 50; // Initial Y-coordinate for the first table
    const yDistance = 275; // Vertical spacing between each table
    const width = 80; // Width of each table
    const height = 120; // Height of each table

    // Ensuring `ids` is an array and providing a fallback if not
    const tableIds = Array.isArray(ids) ? ids : [];

    // Debugging: Logging the type and content of `ids` for verification
    console.log("TablesTypeThree received IDs:", tableIds);

    // Function to calculate the Y-coordinate for each table based on its index
    const getTableYDistance = (index) => {
        return yStart + index * yDistance; // Adding the base Y-position to the distance
    };

    // Rendering the tables as a list of TypeThreeTable components
    return (
        <>
            {tableIds.map((id, index) => (
                <TypeThreeTable
                    key={id[0]} // Setting a unique key for each table using its ID
                    id={id[0]} // Passing the table's ID as a prop
                    booked={dimReserved(id[0])} // Passing the table's booking status dynamically
                    x={x} // Setting the X-coordinate from the parent component
                    y={getTableYDistance(index)} // Calculating the Y-coordinate dynamically based on index
                    width={width} // Setting the table width
                    height={height} // Setting the table height
                    handleHovering={handleHovering} // Passing the hover handler to the table
                    handlePopUp={handlePopUp} // Passing the pop-up handler to the table
                />
            ))}
        </>
    );
};

// Exporting the TablesTypeThree component as the default export
export default TablesTypeThree;
