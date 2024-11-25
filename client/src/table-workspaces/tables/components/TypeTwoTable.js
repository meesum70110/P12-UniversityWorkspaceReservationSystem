// Importing necessary React and Konva components
import React from 'react';
import { Rect, Text, Circle } from 'react-konva';

// Defining the TypeTwoTable component
const TypeTwoTable = (props) => {
    // Destructuring props for better readability
    const { id, x, y, width, height, handlePopUp, handleHovering, booked } = props;

    /**
     * Function to handle table click events.
     * Opens the popup only if the table is not booked.
     */
    const handleClick = (e) => {
        !booked && handlePopUp(true, id); // Triggering popup if the table is available
    };

    /**
     * Function to handle hover events.
     * Dynamically changes the cursor style based on the booking status.
     */
    const handleHover = (e) => {
        if (e.type === 'mouseenter') {
            // Setting cursor to 'not-allowed' for booked tables, 'pointer' otherwise
            booked ? handleHovering('not-allowed') : handleHovering('pointer');
        } else if (e.type === 'mouseleave') {
            // Reverting cursor to default on hover out
            handleHovering('default');
        }
    };

    /** RECTANGLE PROPERTIES */

    // Properties for the main table rectangle
    const tableRectProps = {
        x: x, // X-coordinate for rectangle positioning
        y: y, // Y-coordinate for rectangle positioning
        width: width, // Width of the rectangle
        height: height, // Height of the rectangle
        fill: booked ? "#8B0000" : "#228B22", // Red if booked, green if available
        shadowColor: 'black', // Shadow color
        shadowOffsetX: 2, // Horizontal shadow offset
        shadowOffsetY: 2, // Vertical shadow offset
        shadowOpacity: 0.5, // Shadow transparency
        shadowBlur: 4 // Blur radius for shadow
    };

    // Properties for the additional rectangle to indicate selection area
    const selectRectProps = {
        x: tableRectProps.x + tableRectProps.width - tableRectProps.width / 3, // Aligned to the right of the table
        y: tableRectProps.y + tableRectProps.height - tableRectProps.height / 2, // Positioned halfway down the table
        width: tableRectProps.width / 3, // Width of the selection area
        height: tableRectProps.height / 2, // Height of the selection area
        fill: booked ? "rgb(81, 202, 81, .2)" : "#51CA47", // Light green if booked, dark green if available
        stroke: booked ? "rgb(78, 89, 224, .2)" : "#4E59E0" // Blue outline
    };

    /** CIRCLE PROPERTIES */

    // Properties for each seat circle
    const seatCircleProps = {
        x: tableRectProps.x + 70, // Positioning the seat horizontally
        y: tableRectProps.y - 20, // Positioning the seat slightly above the table
        width: 30, // Width of the seat
        height: 30, // Height of the seat
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)" // Light or dim color based on booking status
    };

    const seatCircleProps2 = {
        x: tableRectProps.x + 160, // Positioning this seat further to the right
        y: tableRectProps.y + 38, // Aligning with the middle of the table vertically
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)"
    };

    const seatCircleProps3 = {
        x: tableRectProps.x - 20, // Positioning this seat to the left of the table
        y: tableRectProps.y + 38, // Aligning with the middle of the table vertically
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)"
    };

    const seatCircleProps4 = {
        x: tableRectProps.x + 70, // Aligning horizontally with the first seat
        y: tableRectProps.y + 90, // Positioning this seat below the table
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)"
    };

    /** TEXT PROPERTIES */

    // Offsets for the table number text
    const numberXoffset = -35; // Horizontal offset for positioning
    const numberYoffset = -15; // Vertical offset for positioning

    // Properties for the table number text
    const textSeatsProps = {
        text: "4", // Table number
        fontSize: 40, // Font size for visibility
        x: selectRectProps.x + numberXoffset, // X-coordinate with offset
        y: selectRectProps.y + numberYoffset, // Y-coordinate with offset
        fill: "#FFF", // White text color
        fontFamily: "'Poppins', sans-serif" // Font family
    };

    // Returning the JSX to render the table along with its seats and table number
    return (
        <>
            {/* Main table rectangle */}
            <Rect 
                {...tableRectProps} // Spread rectangle properties
                onClick={handleClick} // Attach click handler
                onMouseEnter={handleHover} // Attach hover handler for mouse enter
                onMouseLeave={handleHover} // Attach hover handler for mouse leave
            />

            {/* Seat circles */}
            <Circle {...seatCircleProps} />
            <Circle {...seatCircleProps2} />
            <Circle {...seatCircleProps3} />
            <Circle {...seatCircleProps4} />

            {/* Table number text */}
            <Text
                {...textSeatsProps} // Spread text properties
                onClick={handleClick} // Attach click handler
                onMouseEnter={handleHover} // Attach hover handler for mouse enter
                onMouseLeave={handleHover} // Attach hover handler for mouse leave
            />
        </>
    );
};

// Exporting the TypeTwoTable component
export default TypeTwoTable;
