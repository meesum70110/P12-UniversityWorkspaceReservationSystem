import React from 'react';
import { Rect, Text, Circle } from 'react-konva';

const TypeOneTable = (props) => {
    const { id, x, y, width, height, handlePopUp, handleHovering, booked } = props;

    // Define the handleClick function that opens the popup if the table is not booked
    const handleClick = (e) => {
        !booked && handlePopUp(true, id);
    };

    // Define the handleHover function to set the cursor style based on the booking status
    const handleHover = (e) => {
        if (e.type === 'mouseenter') {
            booked ? handleHovering('not-allowed') : handleHovering('pointer');
        } else if (e.type === 'mouseleave') {
            handleHovering('default');
        }
    };

    /** RECTANGLES */

    // Define properties for the main table rectangle with conditional color based on booking status
    const tableRectProps = {
        x: x,
        y: y,
        width: width,
        height: height,
        fill: booked ? "rgb(164, 54, 4, .2)" : "#228B22", // Color changes based on booking status
        shadowColor: 'black',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowOpacity: 0.5,
        shadowBlur: 4,
    };

    /** SEAT CIRCLES */
    // Define seat circles with conditional color based on booking status
    const seatCircleProps = (offsetX, offsetY) => ({
        x: x + offsetX,
        y: y + offsetY,
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)",
    });

    /** TEXTS */
    const textSeatsProps = {
        text: "6", // Example table number or seat count
        fontSize: 40,
        x: x + width / 2 - 20,
        y: y + height / 2 - 20,
        fill: booked ? "rgb(255, 255, 255, .2)" : "#FFF", // Text color changes based on booking status
        fontFamily: "'Poppins', sans-serif",
    };

    return (
        <>
            {/* Main table rectangle */}
            <Rect 
                {...tableRectProps} 
                onClick={handleClick} 
                onMouseEnter={handleHover} 
                onMouseLeave={handleHover} 
            />

            {/* Seat circles around the table */}
            <Circle {...seatCircleProps(20, -18)} />
            <Circle {...seatCircleProps(80, -18)} />
            <Circle {...seatCircleProps(140, -18)} />
            <Circle {...seatCircleProps(20, 113)} />
            <Circle {...seatCircleProps(80, 113)} />
            <Circle {...seatCircleProps(140, 113)} />

            {/* Table number text */}
            <Text
                {...textSeatsProps}
                onClick={handleClick}
                onMouseEnter={handleHover}
                onMouseLeave={handleHover}
            />
        </>
    );
};

export default TypeOneTable;
