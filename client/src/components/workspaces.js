import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState, useContext } from "react";
import React from "react";
import { useAuthorize } from "../context/hook/useAuthorization";
import '../styles/formCards.css';
import '../styles/workspaces.css';
import 'animate.css';
import no_record_icon from './Images/Record/no-record-img.png';
import NavMenu from "./SharedComponents/navMenu";
import LoadingIcon from "./SharedComponents/loading";
import { SocketContext } from "../context/socket";
import TablesPage from "../apps/internal-app/pages/booking/TablesPage";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment'; // Import moment for date-time handling

const Surveys = () => {
    const { userAccount } = useAuthorize();
    const socket = useContext(SocketContext);
    const [surveys, setSurveys] = useState(null);
    const [surveysExist, setExist] = useState(true);
    const [room, setRoom] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [isFetching, setFetching] = useState(true);

    const timeOptions = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    // Automatically set the initial date and time based on the current time
    useEffect(() => {
        const now = moment();
        const cutoffHour = 17;

        if (now.hour() >= cutoffHour) {
            // If the current time is past 17:00, set the date to tomorrow at 09:00
            setDate(moment().add(1, 'day').toDate());
            setTime("09:00");
        } else {
            // If the current time is before 17:00, set the time to the next hour
            setTime(now.add(1, 'hour').startOf('hour').format("HH:00"));
        }
    }, []);

    const fetchSurveys = useCallback(async () => {
        setFetching(true);

        const formattedDate = date ? date.toISOString().split('T')[0] : ''; // Format date to YYYY-MM-DD
        const queryParams = new URLSearchParams({
            room: room && room !== 'All' ? room : '',
            date: formattedDate,
            time: time || ''
        }).toString();

        try {
            const result = await fetch(`https://workspacereservation-backend.onrender.com/api/survey/?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${userAccount.userToken}` }
            });
            const resultJson = await result.json();

            if (result.status === 200) {
                const filteredSurveys = room && room !== 'All' 
                    ? resultJson.filter(survey => survey.room === room)
                    : resultJson;

                setSurveys(filteredSurveys);
                setExist(filteredSurveys.length > 0);
            } else {
                setExist(false);
            }
        } catch (error) {
            console.error("Error fetching surveys:", error);
        } finally {
            setFetching(false);
        }
    }, [room, date, time, userAccount.userToken]);

    useEffect(() => {
        if (userAccount) {
            fetchSurveys();
            socket.emit('content-cards', socket.id);
        }
    }, [userAccount, socket, fetchSurveys]);

    useEffect(() => {
        socket.on('surveys', (newSurveyAll) => {
            const visibleSurveys = newSurveyAll.filter(survey => survey.visibility === 'true');
            setSurveys(visibleSurveys);
            setExist(visibleSurveys.length > 0);
        });
        return () => socket.off('surveys');
    }, [socket, userAccount]);

    const now = moment(); // Current time for disabling past times

    return (
        <div className="contentpage">
            <NavMenu isAdmin={userAccount.occupation === 'admin'} breadcrum="Workspaces" pagePath="/workspaces" />
    
            {userAccount && (
                <div className="search-filters">
                    <select onChange={(e) => setRoom(e.target.value)} value={room}>
                        <option value="All">All Rooms</option>
                        <option value="Room # 01">Room # 01</option>
                        <option value="Room # 02">Room # 02</option>
                        <option value="Room # 03">Room # 03</option>
                        <option value="Room # 04">Room # 04</option>
                    </select>
    
                    <DatePicker 
                        selected={date} 
                        onChange={(date) => setDate(date)} 
                        dateFormat="MM/dd/yyyy" 
                        minDate={new Date()} // Restricts to today and future dates
                        maxDate={new Date(new Date().setDate(new Date().getDate() + 7))} // Restricts to 7 days from today
                    />

                    <select onChange={(e) => setTime(e.target.value)} value={time}>
                        <option value="">Select Time</option>
                        {timeOptions.map((timeOption) => {
                            const isDisabled = date && moment(date).isSame(now, 'day') && moment(timeOption, 'HH:mm').isBefore(now);
                            return (
                                <option key={timeOption} value={timeOption} disabled={isDisabled}>
                                    {timeOption}
                                </option>
                            );
                        })}
                    </select>
    
                    <button onClick={fetchSurveys}>Search</button>
                </div>
            )}
    
            <div className="content-cards-horizontal">
                {isFetching && <LoadingIcon />}
                {!isFetching && !surveysExist && (
                    <div className="no-items animate__animated animate__fadeInUp">
                        <img src={no_record_icon} alt="Record None" />
                        <h2>No Workspace Available</h2>
                    </div>
                )}
                {!isFetching && surveysExist && surveys && Object.entries(
                    surveys.reduce((acc, survey) => {
                        acc[survey.room] = acc[survey.room] || [];
                        acc[survey.room].push(survey);
                        return acc;
                    }, {})
                ).map(([room, roomSurveys]) => (
                    <div key={room} className="room-group-horizontal">
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '20px 0' }}>{room}</h2>
                        <TablesPage 
                            room={room} 
                            surveys={roomSurveys} 
                            selectedDate={date} 
                            selectedTime={time} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );    
};

export default Surveys;
