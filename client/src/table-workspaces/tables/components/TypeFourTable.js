import React from 'react';
import { Rect, Text, Circle } from 'react-konva';

const TypeFourTable = (props) => {
    const { id, x, y, width, height, handlePopUp, handleHovering, booked } = props;

    // Defining the handleClick function that opens the popup if the table is not booked
    const handleClick = (e) => {
        !booked && handlePopUp(true, id);
    };

    // Defining the handleHover function to set the cursor style based on the booking status
    const handleHover = (e) => {
        if (e.type === 'mouseenter') {
            booked ? handleHovering('not-allowed') : handleHovering('pointer');
        } else if (e.type === 'mouseleave') {
            handleHovering('default');
        }
    };


    /** RECTANGLES */

    // Main table rect
    const tableRectProps = {
        x: x,
        y: y,
        width: width,
        height: height / 1.8,
        fill: booked ? "rgb(164, 54, 4, .2)" : "#228B22",
        shadowColor: 'black',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowOpacity: 0.5,
        shadowBlur: 4
    };

    // Table seat circle (right side)
    const seatCircleProps = {
        x: tableRectProps.x + 102,
        y: tableRectProps.y + 34,
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)"
    };

    // Centered text for table number
    const textSeatsProps = {
        text: "1",
        fontSize: 40,
        x: tableRectProps.x + tableRectProps.width / 2, // Centering horizontally
        y: tableRectProps.y + tableRectProps.height / 2, // Centering vertically
        offsetX: 10, 
        offsetY: 20, 
        fill: "#FFF",
        fontFamily: "'Poppins', sans-serif"
    };

    return (
        <>
            <Rect 
                {...tableRectProps}
                onClick={handleClick} 
                onMouseEnter={handleHover} 
                onMouseLeave={handleHover}
            />
            <Circle
                {...seatCircleProps}
            />
            <Text
                {...textSeatsProps}
                onClick={handleClick} 
                onMouseEnter={handleHover} 
                onMouseLeave={handleHover}
            />
        </>
    );
}

export default TypeFourTable;
