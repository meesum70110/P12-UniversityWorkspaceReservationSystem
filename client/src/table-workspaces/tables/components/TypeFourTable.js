// Importing necessary React and Konva components
import React from 'react';
import { Rect, Text, Circle } from 'react-konva';

// Defining the TypeFourTable component
const TypeFourTable = (props) => {
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

    /** Rectangle Properties */

    // Main table rectangle properties
    const tableRectProps = {
        x: x, // X-coordinate for rectangle positioning
        y: y, // Y-coordinate for rectangle positioning
        width: width, // Width of the rectangle
        height: height / 1.8, // Adjusted height for table proportions
        fill: booked ? "rgb(164, 54, 4, .2)" : "#228B22", // Red tint for booked, green otherwise
        shadowColor: 'black', // Shadow color
        shadowOffsetX: 2, // Horizontal shadow offset
        shadowOffsetY: 2, // Vertical shadow offset
        shadowOpacity: 0.5, // Shadow transparency
        shadowBlur: 4 // Blur radius for shadow
    };

    // Right-side seat circle properties
    const seatCircleProps = {
        x: tableRectProps.x + 102, // Positioning relative to the table
        y: tableRectProps.y + 34, // Adjusted for vertical alignment
        width: 30, // Seat circle width
        height: 30, // Seat circle height
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)" // Darker tint for unbooked seats
    };

    // Properties for centered table text (e.g., table number)
    const textSeatsProps = {
        text: "1", // Text content for table (hardcoded here)
        fontSize: 40, // Font size for table number
        x: tableRectProps.x + tableRectProps.width / 2, // Center horizontally
        y: tableRectProps.y + tableRectProps.height / 2, // Center vertically
        offsetX: 10, // Horizontal offset for better alignment
        offsetY: 20, // Vertical offset for centering
        fill: "#FFF", // Text color (white)
        fontFamily: "'Poppins', sans-serif" // Font family for consistency
    };

    // Returning the JSX to render the table with a rectangle, seat, and text
    return (
        <>
            <Rect 
                {...tableRectProps} // Spread rectangle properties
                onClick={handleClick} // Attach click handler
                onMouseEnter={handleHover} // Attach hover handler for mouse enter
                onMouseLeave={handleHover} // Attach hover handler for mouse leave
            />
            <Circle
                {...seatCircleProps} // Spread circle properties
            />
            <Text
                {...textSeatsProps} // Spread text properties
                onClick={handleClick} // Attach click handler
                onMouseEnter={handleHover} // Attach hover handler for mouse enter
                onMouseLeave={handleHover} // Attach hover handler for mouse leave
            />
        </>
    );
}

// Exporting the TypeFourTable component as the default export
export default TypeFourTable;
