// exporting default TablesPage;
import React, { useState, useEffect, useCallback } from 'react';
import styles from './css/TablesPage.module.css';
import { Stage, Layer } from 'react-konva';
import moment from 'moment';
import TablesTypeOne from '../../components/TablesTypeOne';
import TablesTypeTwo from '../../components/TablesTypeTwo';
import TablesTypeThree from '../../components/TablesTypeThree';
import TablesTypeTFour from '../../components/TablesTypeFour';
import PopUp from '../../components/PopUp';
import axios from 'axios';
import { useAuthorize } from '../../../../context/hook/useAuthorization';

const TablesPage = ({ room, surveys, selectedDate, selectedTime }) => {
    const { userAccount } = useAuthorize();
    const [userData, setUserData] = useState(null);
    const [hovering, setHovering] = useState('default');
    const [openPopUp, setOpenPopUp] = useState(false);
    const [tableIdPicked, setTableIdPicked] = useState(undefined);
    const [tablesIds, setTablesIds] = useState(new Map());
    const [displayDate, setDisplayDate] = useState('');
    const [displayTime, setDisplayTime] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [myBookings, setMyBookings] = useState([]);
    const [showBookings, setShowBookings] = useState(false);
    const [localUpdates, setLocalUpdates] = useState(new Map()); // Holds local booking status

    const userFirstName = userData?.fname || 'N/A';
    const userLastName = userData?.lname || 'N/A';
    const userEmail = userData?.email || 'N/A';

    const sliceMap = (map, start, end) => {
        const slicedArray = [];
        for (let i = start; i <= end; i++) {
            slicedArray.push([i, map.get(i.toString()) || false]);
        }
        return slicedArray;
    };

    // Sync displayDate and displayTime with selectedDate and selectedTime props
    useEffect(() => {
        if (selectedDate) {
            setDisplayDate(moment(selectedDate).format('YYYY-MM-DD'));
        }
        if (selectedTime) {
            setDisplayTime(selectedTime);
        }
    }, [selectedDate, selectedTime]);

    // Fallback for initial date and time in case selectedDate or selectedTime are undefined
    useEffect(() => {
        if (!selectedDate || !selectedTime) {
            const currentHour = moment().hour();
            const isPast5PM = currentHour >= 17;
            if (isPast5PM) {
                setDisplayDate(moment().add(1, 'day').format('YYYY-MM-DD'));
                setDisplayTime('09:00');
            } else {
                setDisplayDate(moment().format('YYYY-MM-DD'));
                setDisplayTime('09:00');
            }
        }
    }, []);
    
    const toDateTime = moment(`${displayDate}T${displayTime}`).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

    useEffect(() => {
        const fetchUserData = async () => {
            if (userAccount && userAccount.userToken) {
                try {
                    setErrorMessage('');
                    const response = await axios.get('https://workspacereservation-backend.onrender.com/api/account/', {
                        headers: { Authorization: `Bearer ${userAccount.userToken}` }
                    });
                    setUserData(response.data);
                } catch (error) {
                    const errorMsg = error.response?.data?.error || "Could not fetch user data. Please check your account information.";
                    setErrorMessage(errorMsg);
                    console.error("Error fetching user data:", errorMsg);
                }
            }
        };
        fetchUserData();
    }, [userAccount]);

    useEffect(() => {
        const tableStatusMap = new Map();
        surveys.forEach((survey) => {
            const isBooked = survey.status === 'unavailable';
            tableStatusMap.set(survey._id, isBooked);
        });
        setTablesIds(tableStatusMap);
    }, [surveys]);

    const handleHovering = (hoverStatus) => setHovering(hoverStatus);

    const handlePopUp = (shouldOpen, tableId) => {
        setTableIdPicked(tableId);
        setOpenPopUp(shouldOpen);
    };

    // Function to fetch the status of all tables from the server
    const fetchAllTablesStatus = useCallback(async () => {
        try {
            const response = await axios.get('https://workspacereservation-backend.onrender.com/api/survey/tables', {
                params: {
                    date: displayDate,
                    time: displayTime,
                },
                headers: { Authorization: `Bearer ${userAccount.userToken}` }
            });
    
            console.log("API response:", response.data); // Debug response
    
            if (response.status === 200 && response.data.length > 0) {
                const updatedTablesIds = new Map();
                response.data.forEach((table) => {
                    updatedTablesIds.set(table.tableNumber, table.availability === 'booked');
                });
    
                console.log("Updated table statuses:", updatedTablesIds); // Debug updated tables
                setTablesIds(updatedTablesIds); // Update state
            } else {
                setErrorMessage("No table data found.");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Could not fetch tables. Please try again later.";
            setErrorMessage(errorMsg);
            console.error("Error fetching tables:", errorMsg);
        }
    }, [userAccount?.userToken, displayDate, displayTime]);    
    

    useEffect(() => {
        fetchAllTablesStatus();
    }, [fetchAllTablesStatus]);

    const handleReservation = async () => {
        handlePopUp(false);
    
        const selectedWorkspace = surveys.find((survey) => survey.room === room);
        const workspaceId = selectedWorkspace?._id;
    
        try {
            const response = await axios.post(`https://workspacereservation-backend.onrender.com/api/survey/${workspaceId}/book`, {
                tableNumber: tableIdPicked.toString(),
                room,
                date: displayDate,
                time: displayTime,
                firstName: userFirstName,
                email: userEmail
            }, {
                headers: { Authorization: `Bearer ${userAccount.userToken}` }
            });
    
            if (response.data.booking) {
                setTablesIds((prev) => {
                    const updatedTables = new Map(prev);
                    updatedTables.set(tableIdPicked, true);
                    return updatedTables;
                });
    
                setLocalUpdates(new Map()); // Clear local updates
                setErrorMessage("Table booked successfully");
            } else {
                setErrorMessage("Booking failed or already booked.");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Error making reservation";
            setErrorMessage(errorMsg);
            console.error("Error making reservation:", errorMsg);
        }
    };
    

    const cancelBooking = async (bookingId) => {
        try {
            const response = await axios.delete(`https://workspacereservation-backend.onrender.com/api/survey/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${userAccount.userToken}` }
            });
            if (response.status === 200) {
                setMyBookings(myBookings.filter((booking) => booking._id !== bookingId));
                setErrorMessage("Booking cancelled successfully");
                fetchAllTablesStatus();
            } else {
                setErrorMessage("Failed to cancel booking.");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Error cancelling booking";
            setErrorMessage(errorMsg);
            console.error("Error cancelling booking:", errorMsg);
        }
    };

    const fetchMyBookings = async () => {
        setShowBookings(!showBookings);

        if (!showBookings && userAccount?.userToken) {
            try {
                const response = await axios.get('https://workspacereservation-backend.onrender.com/api/survey/bookings', {
                    headers: { Authorization: `Bearer ${userAccount.userToken}` }
                });

                if (response.status === 200 && response.data.length > 0) {
                    const bookingsWithRoom = response.data.map((booking) => ({
                        ...booking,
                        room: booking.room || room
                    }));
                    setMyBookings(bookingsWithRoom);

                    const updatedTablesIds = new Map(tablesIds);
                    bookingsWithRoom.forEach((booking) => {
                        updatedTablesIds.set(booking.tableNumber, booking.availability === 'booked');
                    });
                    setTablesIds(updatedTablesIds);
                } else {
                    setErrorMessage("No bookings found for this user.");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.error || "Could not fetch bookings. Please try again later.";
                setErrorMessage(errorMsg);
                console.error("Error fetching bookings:", errorMsg);
            }
        }
    };

    return (
        <div className={styles.TablesPage} style={{ cursor: hovering }}>
            {errorMessage && (
                <div className={styles.ErrorMessage}>
                    {errorMessage}
                </div>
            )}

            <button onClick={fetchMyBookings} className={styles.ViewBookingsButton}>
                {showBookings ? "Hide My Bookings" : "View My Bookings"}
            </button>

            <div className={styles.TopBar}>
                <div className={styles.Info}>
                    <p>{`${moment(displayDate).format('LL')} , Time Slot: ${displayTime} - ${moment(displayTime, 'HH:mm').add(1, 'hour').format('HH:mm')}`}</p>
                </div>
            </div>

            {showBookings && (
                <div className={styles.BookingsList}>
                    <h3>My Bookings</h3>
                    {myBookings && myBookings.length > 0 ? (
                        myBookings.map((booking, index) => (
                            <div key={index} className={styles.BookingItem}>
                                <p><strong>Room:</strong> {booking.room || "Room info unavailable"}</p>
                                <p><strong>Table:</strong> {booking.tableNumber}</p>
                                <p><strong>Date:</strong> {moment(booking.date).format('LL')}</p>
                                <p><strong>Time:</strong> {booking.timeSlot}</p>
                                <button onClick={() => cancelBooking(booking._id)} className={styles.CancelButton}>Cancel</button>
                            </div>
                        ))
                    ) : (
                        <p>No bookings found.</p>
                    )}
                </div>
            )}

            <div className={styles.Tables}>
                <Stage width={1520} height={850}>
                    {tablesIds.size ? (
                        <Layer>
                            <TablesTypeTwo
                                ids={sliceMap(tablesIds, 18, 22)}
                                handleHovering={handleHovering}
                                handlePopUp={handlePopUp}
                                x={970}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                            <TablesTypeThree
                                ids={sliceMap(tablesIds, 11, 15)}
                                handleHovering={handleHovering}
                                x={370}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                            <TablesTypeTFour
                                ids={sliceMap(tablesIds, 1, 11)}
                                handleHovering={handleHovering}
                                x={80}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                            <TablesTypeTwo
                                ids={sliceMap(tablesIds, 15, 18)}
                                handleHovering={handleHovering}
                                x={670}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                            <TablesTypeOne
                                ids={sliceMap(tablesIds, 22, 26)}
                                handleHovering={handleHovering}
                                x={1220}
                                handlePopUp={handlePopUp}
                                dimReserved={(id) => !!tablesIds.get(id)}
                            />
                        </Layer>
                    ) : null}
                </Stage>
            </div>

            {openPopUp && (
                <div className={styles.PopUp}>
                    <PopUp
                        handlePopUp={handlePopUp}
                        handleReservation={handleReservation}
                        from={`${displayDate} ${displayTime}`}
                        to={toDateTime}
                        first_name={userFirstName}
                        last_name={userLastName}
                    />
                </div>
            )}
        </div>
    );
};

export default TablesPage;
