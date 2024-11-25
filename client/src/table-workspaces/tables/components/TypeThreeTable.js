// Importing necessary React and Konva components
import React from 'react';
import { Rect, Text, Circle } from 'react-konva';

// Defining the TypeThreeTable component
const TypeThreeTable = (props) => {
    // Destructuring props for clarity and direct usage
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
        fill: booked ? "rgb(164, 54, 4, .2)" : "#228B22", // Red tint for booked, green otherwise
        shadowColor: 'black', // Shadow color
        shadowOffsetX: 2, // Horizontal shadow offset
        shadowOffsetY: 2, // Vertical shadow offset
        shadowOpacity: 0.5, // Shadow transparency
        shadowBlur: 4 // Blur radius for shadow
    };

    // Properties for the select area rectangle
    const selectRectProps = {
        x: tableRectProps.x, // Aligning with the main rectangle
        y: tableRectProps.y + tableRectProps.height - tableRectProps.height / 4, // Positioned at the bottom
        width: tableRectProps.width, // Matching the width of the main rectangle
        height: tableRectProps.height / 4, // Taking 1/4th height of the main rectangle
        fill: booked ? "rgb(81, 202, 81, .2)" : "#51CA47", // Green for available, light tint for booked
        stroke: booked ? "rgb(78, 89, 224, .2)" : "#4E59E0" // Outline changes based on booking status
    };

    /** SEAT CIRCLE PROPERTIES */

    // Properties for the top seat circle
    const seatCircleProps = {
        x: tableRectProps.x + 42, // Centering horizontally
        y: tableRectProps.y - 23, // Positioned slightly above the main rectangle
        width: 30, // Width of the circle
        height: 30, // Height of the circle
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)" // Light tint for booked, dim for available
    };

    // Properties for the bottom seat circle
    const seatCircleProps2 = {
        x: tableRectProps.x + 42, // Centering horizontally
        y: tableRectProps.y + 143, // Positioned slightly below the main rectangle
        width: 30, // Width of the circle
        height: 30, // Height of the circle
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)" // Light tint for booked, dim for available
    };

    /** TEXT PROPERTIES */

    // Text alignment offsets
    const textXoffset = 22; // Horizontal offset for text alignment
    const textYoffset = 5; // Vertical offset for text alignment
    const numberXoffset = 30; // Horizontal offset for table number
    const numberYoffset = -50; // Vertical offset for table number

    // Properties for the "SELECT" text
    const textSelectProps = {
        text: "SELECT", // Displaying the word "SELECT"
        fontSize: 10, // Font size
        x: selectRectProps.x + textXoffset, // X-coordinate with offset
        y: selectRectProps.y + textYoffset, // Y-coordinate with offset
        fill: booked ? "rgb(255, 255, 255, .2)" : "#FFF", // White for available, light tint for booked
        fontFamily: "'Poppins', sans-serif" // Font family
    };

    // Properties for the "TABLE" text
    const textTableProps = {
        text: "TABLE", // Displaying the word "TABLE"
        fontSize: 10, // Font size
        x: selectRectProps.x + textXoffset + 2, // X-coordinate with additional offset
        y: selectRectProps.y + 12 + textYoffset, // Y-coordinate with additional offset
        fill: booked ? "rgb(255, 255, 255, .2)" : "#FFF", // White for available, light tint for booked
        fontFamily: "'Poppins', sans-serif" // Font family
    };

    // Properties for the table number text
    const textSeatsProps = {
        text: "2", // Table number
        fontSize: 40, // Font size
        x: selectRectProps.x + numberXoffset, // X-coordinate with offset
        y: selectRectProps.y + numberYoffset, // Y-coordinate with offset
        fill: "#FFF", // White text
        fontFamily: "'Poppins', sans-serif" // Font family
    };

    // Returning the JSX to render the table with its components
    return (
        <>
            {/* Main table rectangle */}
            <Rect 
                {...tableRectProps} // Spread rectangle properties
                onClick={handleClick} // Attach click handler
                onMouseEnter={handleHover} // Attach hover handler for mouse enter
                onMouseLeave={handleHover} // Attach hover handler for mouse leave
            />

            {/* Top seat circle */}
            <Circle {...seatCircleProps} />

            {/* Bottom seat circle */}
            <Circle {...seatCircleProps2} />

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

// Exporting the TypeThreeTable component as the default export
export default TypeThreeTable;
