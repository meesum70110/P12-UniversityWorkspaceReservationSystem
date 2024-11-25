// Importing necessary components from react-konva to render shapes on canvas
import React from 'react'; // Importing React for component functionality
import { Rect, Text, Circle } from 'react-konva'; // Importing Rect, Text, and Circle from react-konva to draw shapes

const TypeThreeTable = (props) => {
    const { id, x, y, width, height, handlePopUp, handleHovering, booked } = props; // Destructuring props passed to the component

    // Defining the handleClick function that opens the popup if the table is not booked
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

    // Defining properties for the selected table rectangle with conditional color based on booking status
    const selectRectProps = {
        x: tableRectProps.x, // Using x position from table rect
        y: (tableRectProps.y + tableRectProps.height) - (tableRectProps.height / 4), // Adjusting y position
        width: tableRectProps.width, // Table width
        height: tableRectProps.height / 4, // Reducing height for selected rectangle
        fill: booked ? "rgb(81, 202, 81, .2)" : "#51CA47", // Green if available, semi-transparent green if booked
        stroke: booked ? "rgb(78, 89, 224, .2)" : "#4E59E0", // Blue border for available tables, dimmed for booked ones
    };

    /** SEAT CIRCLES */

    // Defining properties for the seat circle on top of the table
    const seatCircleProps = {
        x: tableRectProps.x + 42, // Positioning x relative to table rectangle
        y: tableRectProps.y - 23, // Positioning y relative to table rectangle
        width: 30, // Circle width
        height: 30, // Circle height
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)", // Color changes based on booking status
    };

    // Defining properties for the seat circle at the bottom of the table
    const seatCircleProps2 = {
        x: tableRectProps.x + 42, // Positioning x relative to table rectangle
        y: tableRectProps.y + 143, // Positioning y relative to table rectangle
        width: 30, // Circle width
        height: 30, // Circle height
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)", // Color changes based on booking status
    };

    /** TEXTS */

    // Defining offsets for text positioning
    const textXoffset = 22;
    const textYoffset = 5;
    const numberXoffset = 30;
    const numberYoffset = -50;

    // Defining properties for the "SELECT" text above the table
    const textSelectProps = {
        text: "SELECT", // Text to be displayed
        fontSize: 10, // Font size for the text
        x: selectRectProps.x + textXoffset, // Adjusting x position
        y: selectRectProps.y + textYoffset, // Adjusting y position
        fill: booked ? "rgb(255, 255, 255, .2)" : "#FFF", // Text color changes based on booking status
        fontFamily: "'Poppins', sans-serif", // Font family
    };

    // Defining properties for the "TABLE" text below the "SELECT" text
    const textTableProps = {
        text: "TABLE", // Text to be displayed
        fontSize: 10, // Font size for the text
        x: selectRectProps.x + textXoffset + 2, // Adjusting x position
        y: selectRectProps.y + 12 + textYoffset, // Adjusting y position
        fill: booked ? "rgb(255, 255, 255, .2)" : "#FFF", // Text color changes based on booking status
        fontFamily: "'Poppins', sans-serif", // Font family
    };

    // Defining properties for the table number text
    const textSeatsProps = {
        text: "2", // Example table number
        fontSize: 40, // Font size for the table number
        x: selectRectProps.x + numberXoffset, // Adjusting x position
        y: selectRectProps.y + numberYoffset, // Adjusting y position
        fill: "#FFF", // Text color
        fontFamily: "'Poppins', sans-serif", // Font family
    };

    // Returning JSX to render the table component
    return (
        <>
            {/* Rendering the main table rectangle */}
            <Rect
                {...tableRectProps}
                onClick={handleClick} // Trigger handleClick on click
                onMouseEnter={handleHover} // Trigger handleHover on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover on mouse leave
            />
            {/* Rendering the seat circle on top of the table */}
            <Circle {...seatCircleProps} />
            {/* Rendering the seat circle at the bottom of the table */}
            <Circle {...seatCircleProps2} />
            {/* Rendering the "SELECT" text */}
            <Text
                {...textSeatsProps}
                onClick={handleClick} // Trigger handleClick on click
                onMouseEnter={handleHover} // Trigger handleHover on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover on mouse leave
            />
        </>
    );
};

export default TypeThreeTable; // Exporting the TypeThreeTable component for use in other parts of the application
