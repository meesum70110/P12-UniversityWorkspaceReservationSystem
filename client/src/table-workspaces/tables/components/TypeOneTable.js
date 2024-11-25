// Importing necessary React and Konva components
import React from 'react';
import { Rect, Text, Circle } from 'react-konva';

// Defining the TypeOneTable component
const TypeOneTable = (props) => {
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

    /** SEAT CIRCLE PROPERTIES */

    // Function to define properties for seat circles around the table
    const seatCircleProps = (offsetX, offsetY) => ({
        x: x + offsetX, // X-coordinate adjusted by offset
        y: y + offsetY, // Y-coordinate adjusted by offset
        width: 30, // Width of the circle
        height: 30, // Height of the circle
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)" // Light tint for unbooked, dim for booked
    });

    /** TEXT PROPERTIES */

    // Properties for the centered table text (e.g., table number)
    const textSeatsProps = {
        text: "6", // Table number displayed as text
        fontSize: 40, // Font size for the table number
        x: x + width / 2 - 20, // Centering the text horizontally
        y: y + height / 2 - 20, // Centering the text vertically
        fill: booked ? "rgb(255, 255, 255, .2)" : "#FFF", // Text color changes based on booking status
        fontFamily: "'Poppins', sans-serif" // Font family for consistent styling
    };

    // Returning the JSX to render the table with a rectangle, seat circles, and text
    return (
        <>
            {/* Main table rectangle */}
            <Rect 
                {...tableRectProps} // Spread rectangle properties
                onClick={handleClick} // Attach click handler
                onMouseEnter={handleHover} // Attach hover handler for mouse enter
                onMouseLeave={handleHover} // Attach hover handler for mouse leave
            />

            {/* Seat circles around the table */}
            <Circle {...seatCircleProps(20, -18)} /> {/* Top-left seat */}
            <Circle {...seatCircleProps(80, -18)} /> {/* Top-center seat */}
            <Circle {...seatCircleProps(140, -18)} /> {/* Top-right seat */}
            <Circle {...seatCircleProps(20, 113)} /> {/* Bottom-left seat */}
            <Circle {...seatCircleProps(80, 113)} /> {/* Bottom-center seat */}
            <Circle {...seatCircleProps(140, 113)} /> {/* Bottom-right seat */}

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

// Exporting the TypeOneTable component as the default export
export default TypeOneTable;
