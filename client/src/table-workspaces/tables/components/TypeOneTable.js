// Importing necessary components from react-konva to render shapes on canvas
import React from 'react'; // Importing React for component functionality
import { Rect, Text, Circle } from 'react-konva'; // Importing shapes for table (rectangle, text, and circle)

const TypeOneTable = (props) => {
    const { id, x, y, width, height, handlePopUp, handleHovering, booked } = props; // Destructuring props passed to the component

    // Defining the handleClick function to open the popup if the table is not booked
    const handleClick = (e) => {
        !booked && handlePopUp(true, id); // If table is not booked, open the popup and pass the table ID
    };

    // Defining the handleHover function to change the cursor style based on booking status
    const handleHover = (e) => {
        if (e.type === 'mouseenter') {
            booked ? handleHovering('not-allowed') : handleHovering('pointer'); // If booked, set cursor to 'not-allowed', otherwise 'pointer'
        } else if (e.type === 'mouseleave') {
            handleHovering('default'); // Reset cursor to default on mouse leave
        }
    };

    /** RECTANGLES */

    // Defining properties for the main table rectangle with conditional color based on booking status
    const tableRectProps = {
        x: x, // X-coordinate for positioning
        y: y, // Y-coordinate for positioning
        width: width, // Table width
        height: height, // Table height
        fill: booked ? "rgb(164, 54, 4, .2)" : "#228B22", // Green if available, semi-transparent red if booked
        shadowColor: 'black', // Shadow color for the rectangle
        shadowOffsetX: 2, // Horizontal offset for the shadow
        shadowOffsetY: 2, // Vertical offset for the shadow
        shadowOpacity: 0.5, // Shadow opacity
        shadowBlur: 4, // Shadow blur intensity
    };

    /** SEAT CIRCLES */

    // Defining seat circles with conditional color based on booking status
    const seatCircleProps = (offsetX, offsetY) => ({
        x: x + offsetX, // Calculating X position based on offset
        y: y + offsetY, // Calculating Y position based on offset
        width: 30, // Circle width (seat size)
        height: 30, // Circle height (seat size)
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)", // Seat color changes based on booking status
    });

    /** TEXTS */

    // Defining properties for the table number text, centered in the table
    const textSeatsProps = {
        text: "6", // Example table number or seat count
        fontSize: 40, // Font size for the table number
        x: x + width / 2 - 20, // Horizontally centering the text
        y: y + height / 2 - 20, // Vertically centering the text
        fill: booked ? "rgb(255, 255, 255, .2)" : "#FFF", // Text color changes based on booking status
        fontFamily: "'Poppins', sans-serif", // Font family for the text
    };

    // Returning JSX to render the table components
    return (
        <>
            {/* Main table rectangle */}
            <Rect 
                {...tableRectProps} // Spreading the rectangle properties
                onClick={handleClick} // Trigger handleClick on click
                onMouseEnter={handleHover} // Trigger handleHover on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover on mouse leave
            />

            {/* Seat circles around the table */}
            <Circle {...seatCircleProps(20, -18)} /> {/* Left seat */}
            <Circle {...seatCircleProps(80, -18)} /> {/* Center-left seat */}
            <Circle {...seatCircleProps(140, -18)} /> {/* Center-right seat */}
            <Circle {...seatCircleProps(20, 113)} /> {/* Left bottom seat */}
            <Circle {...seatCircleProps(80, 113)} /> {/* Center-left bottom seat */}
            <Circle {...seatCircleProps(140, 113)} /> {/* Center-right bottom seat */}

            {/* Table number text */}
            <Text
                {...textSeatsProps} // Spreading the text properties
                onClick={handleClick} // Trigger handleClick on click
                onMouseEnter={handleHover} // Trigger handleHover on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover on mouse leave
            />
        </>
    );
};

export default TypeOneTable; // Exporting the component for use in other parts of the application
