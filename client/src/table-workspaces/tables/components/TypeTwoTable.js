import React from 'react';
import { Rect, Text, Circle } from 'react-konva';

const TypeTwoTable = (props) => {
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
    const tableRectProps = {
        x: x,
        y: y,
        width: width,
        height: height,
        fill: booked ? "#8B0000" : "#228B22", // Red if booked, green if available
        shadowColor: 'black',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowOpacity: 0.5,
        shadowBlur: 4
    };

    /** ADDITIONAL RECT AND CIRCLES FOR SEATS */
    const selectRectProps = {
        x: (tableRectProps.x + tableRectProps.width) - (tableRectProps.width / 3),
        y: (tableRectProps.y + tableRectProps.height) - (tableRectProps.height / 2),
        width: tableRectProps.width / 3,
        height: tableRectProps.height / 2,
        fill: booked ? "rgb(81, 202, 81, .2)" : "#51CA47",
        stroke: booked ? "rgb(78, 89, 224, .2)" : "#4E59E0"
    };

    const seatCircleProps = {
        x: tableRectProps.x + 70,
        y: tableRectProps.y - 20,
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)",
    };

    const seatCircleProps2 = {
        x: tableRectProps.x + 160,
        y: tableRectProps.y + 38,
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)",
    };

    const seatCircleProps3 = {
        x: tableRectProps.x - 20,
        y: tableRectProps.y + 38,
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)",
    };

    const seatCircleProps4 = {
        x: tableRectProps.x + 70,
        y: tableRectProps.y + 90,
        width: 30,
        height: 30,
        fill: booked ? "rgb(22, 31, 33, 0.2)" : "rgb(22, 31, 33, 0.5)",
    };

    /** TEXT PROPERTIES */
    const numberXoffset = -35;
    const numberYoffset = -15;

    const textSeatsProps = {
        text: "4",
        fontSize: 40,
        x: selectRectProps.x + numberXoffset,
        y: selectRectProps.y + numberYoffset,
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
            <Circle {...seatCircleProps} />
            <Circle {...seatCircleProps2} />
            <Circle {...seatCircleProps3} />
            <Circle {...seatCircleProps4} />
            <Text
                {...textSeatsProps}
                onClick={handleClick} 
                onMouseEnter={handleHover} 
                onMouseLeave={handleHover}
            />
        </>
    );
};

export default TypeTwoTable;
