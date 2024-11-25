// Importing necessary components from react-konva to render shapes on canvas
import React from 'react'; // Importing React to handle component rendering
import { Rect, Text, Circle } from 'react-konva'; // Importing Rect, Text, and Circle from react-konva to draw shapes

const TypeTwoTable = (props) => {
    // Destructuring props to extract necessary data like coordinates, size, and status of the table
    const { id, x, y, width, height, handlePopUp, handleHovering, booked } = props;

    // Defining the handleClick function that opens the popup if the table is not booked
    const handleClick = (e) => {
        !booked && handlePopUp(true, id); // Open the popup if the table is available (not booked)
    };

    // Defining the handleHover function to set the cursor style based on booking status
    const handleHover = (e) => {
        if (e.type === 'mouseenter') {
            booked ? handleHovering('not-allowed') : handleHovering('pointer'); // Set cursor to 'pointer' if available, 'not-allowed' if booked
        } else if (e.type === 'mouseleave') {
            handleHovering('default'); // Reset cursor to default when mouse leaves the area
        }
    };

    /** RECTANGLES */

    // Defining properties for the main table rectangle, with a conditional color based on booking status
    const tableRectProps = {
        x: x, // Setting the x-position of the rectangle
        y: y, // Setting the y-position of the rectangle
        width: width, // Setting the width of the rectangle
        height: height, // Setting the height of the rectangle
        fill: booked ? "#8B0000" : "#228B22", // Red if booked, green if available
        shadowColor: 'black', // Shadow color for the rectangle
        shadowOffsetX: 2, // Horizontal offset for the shadow
        shadowOffsetY: 2, // Vertical offset for the shadow
        shadowOpacity: 0.5, // Shadow opacity
        shadowBlur: 4, // Shadow blur intensity
    };

    /** ADDITIONAL RECTANGLE AND CIRCLES FOR SEATS */

    // Defining properties for a rectangle that represents the selected area of the table
    const selectRectProps = {
        x: (tableRectProps.x + tableRectProps.width) - (tableRectProps.width / 3), // Adjusted position for selection rectangle
        y: (tableRectProps.y + tableRectProps.height) - (tableRectProps.height / 2), // Adjusted vertical position for selection rectangle
        width: tableRectProps.width / 3, // Reducing width for the selection rectangle
        height: tableRectProps.height / 2, // Reducing height for the selection rectangle
        fill: booked ? "rgb(81, 202, 81, .2)" : "#51CA47", // Green if available, semi-transparent green if booked
        stroke: booked ? "rgb(78, 89, 224, .2)" : "#4E59E0" // Blue border for available tables, dimmed for booked ones
    };

    // Defining properties for seat circles around the table with conditional color based on booking status
    const seatCircleProps = {
        x: tableRectProps.x + 70, // Horizontal position of seat circle
        y: tableRectProps.y - 20, // Vertical position of seat circle
        width: 30, // Width of the seat circle
        height: 30, // Height of the seat circle
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)", // Color changes based on booking status
    };

    // Defining additional seat circles on the other sides of the table
    const seatCircleProps2 = {
        x: tableRectProps.x + 160, // Adjusted horizontal position
        y: tableRectProps.y + 38, // Adjusted vertical position
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)", // Conditional color
    };

    const seatCircleProps3 = {
        x: tableRectProps.x - 20, // Adjusted horizontal position
        y: tableRectProps.y + 38, // Adjusted vertical position
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)", // Conditional color
    };

    const seatCircleProps4 = {
        x: tableRectProps.x + 70, // Horizontal position
        y: tableRectProps.y + 90, // Vertical position
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)", // Conditional color
    };

    /** TEXT PROPERTIES */

    // Defining text offsets for seat and table number display
    const numberXoffset = -35;
    const numberYoffset = -15;

    // Defining properties for displaying the "SELECT" text above the table
    const textSeatsProps = {
        text: "4", // Example number representing table or seat count
        fontSize: 40, // Font size for the table/seat number
        x: selectRectProps.x + numberXoffset, // Adjusted horizontal position
        y: selectRectProps.y + numberYoffset, // Adjusted vertical position
        fill: "#FFF", // Text color
        fontFamily: "'Poppins', sans-serif", // Font family
    };

    // Returning JSX to render the table component with interactive features
    return (
        <>
            {/* Rendering the main table rectangle */}
            <Rect 
                {...tableRectProps}
                onClick={handleClick} // Trigger handleClick function on click
                onMouseEnter={handleHover} // Trigger handleHover function on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover function on mouse leave
            />
            {/* Rendering the seat circles around the table */}
            <Circle {...seatCircleProps} />
            <Circle {...seatCircleProps2} />
            <Circle {...seatCircleProps3} />
            <Circle {...seatCircleProps4} />
            {/* Rendering the table/seat number text */}
            <Text
                {...textSeatsProps}
                onClick={handleClick} // Trigger handleClick function on click
                onMouseEnter={handleHover} // Trigger handleHover function on mouse enter
                onMouseLeave={handleHover} // Trigger handleHover function on mouse leave
            />
        </>
    );
};

export default TypeTwoTable; // Exporting the TypeTwoTable component for use in other parts of the application
