// Importing necessary components from react-konva to render shapes on canvas
import React from 'react'; // Importing React for component functionality
import { Rect, Text, Circle } from 'react-konva'; // Importing shapes for the table (rectangle, text, and circle)

const TypeFourTable = (props) => {
    const { id, x, y, width, height, handlePopUp, handleHovering, booked } = props; // Destructuring the props passed to the component

    // Defining the handleClick function to open the popup if the table is not booked
    const handleClick = (e) => {
        !booked && handlePopUp(true, id); // If not booked, open the popup and pass the table ID
    };

    // Defining the handleHover function to change the cursor style based on booking status
    const handleHover = (e) => {
        if (e.type === 'mouseenter') {
            booked ? handleHovering('not-allowed') : handleHovering('pointer'); // If booked, set cursor to 'not-allowed', otherwise 'pointer'
        } else if (e.type === 'mouseleave') {
            handleHovering('default'); // Revert cursor back to default on mouse leave
        }
    };

    /** RECTANGLES */

    // Defining properties for the main table rectangle with conditional color based on booking status
    const tableRectProps = {
        x: x, // X-coordinate for positioning
        y: y, // Y-coordinate for positioning
        width: width, // Width of the table
        height: height / 1.8, // Height of the table, scaled by 1.8 for visual effect
        fill: booked ? "rgb(164, 54, 4, .2)" : "#228B22", // Green if available, semi-transparent red if booked
        shadowColor: 'black', // Adding shadow effect to the rectangle
        shadowOffsetX: 2, // Horizontal shadow offset
        shadowOffsetY: 2, // Vertical shadow offset
        shadowOpacity: 0.5, // Shadow opacity
        shadowBlur: 4 // Shadow blur intensity
    };

    // Defining properties for the seat circle on the right side of the table
    const seatCircleProps = {
        x: tableRectProps.x + 102, // X-position offset from the table rectangle
        y: tableRectProps.y + 34, // Y-position offset from the table rectangle
        width: 30, // Width of the seat circle
        height: 30, // Height of the seat circle
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)" // Light/dark fill based on booking status
    };

    // Defining properties for the table number text, centered in the table
    const textSeatsProps = {
        text: "1", // Displaying table number as '1'
        fontSize: 40, // Font size for the table number
        x: tableRectProps.x + tableRectProps.width / 2, // Horizontally centering the text
        y: tableRectProps.y + tableRectProps.height / 2, // Vertically centering the text
        offsetX: 10, // Offsetting the text horizontally by 10px for better alignment
        offsetY: 20, // Offsetting the text vertically by 20px for better alignment
        fill: "#FFF", // White color for the text
        fontFamily: "'Poppins', sans-serif" // Setting the font to 'Poppins'
    };

    // Returning JSX to render the table components
    return (
        <>
            {/* Rendering the main table rectangle with click and hover interactions */}
            <Rect 
                {...tableRectProps} // Spreading the rectangle properties
                onClick={handleClick}  // Trigger handleClick on click
                onMouseEnter={handleHover} // Trigger handleHover on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover on mouse leave
            />
            {/* Rendering the seat circle on the right side of the table */}
            <Circle
                {...seatCircleProps} // Spreading the seat circle properties
            />
            {/* Rendering the table number text in the center of the table */}
            <Text
                {...textSeatsProps} // Spreading the text properties
                onClick={handleClick} // Trigger handleClick on click
                onMouseEnter={handleHover} // Trigger handleHover on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover on mouse leave
            />
        </>
    );
}

// Exporting the TypeFourTable component for use in other parts of the application
export default TypeFourTable;
