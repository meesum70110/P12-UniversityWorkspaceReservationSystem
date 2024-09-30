import React, { useState, useEffect, useContext } from "react";

// For accessing global state for logged in users
import { useAuthorize } from "../context/hook/useAuthorization";

import '../styles/formCards.css'
import '../styles/faqs.css'
import 'animate.css';

// Importing icon images to be used in course cards
import no_record_icon from './Images/Record/no-record-img.png'

// Date formatting
import {format} from "date-fns";

//Importing Shared Components
import NavMenu from "./SharedComponents/navMenu";
import LoadingIcon from "./SharedComponents/loading";

//Importing socket with shared context
import { SocketContext } from "../context/socket";

const FaqsBoard = (prop)=>{
    
    // userAccount object stores the current state including email, occupation, jwt
    const {userAccount} = useAuthorize();

    // Socket with shared context for the entire app
    const socket = useContext(SocketContext);

    const [faqs, setFaqs] = useState(null);
    const [faqsExist, setExist] = useState(true);

    const[isFetching, setFetching] = useState(true);

    // Use effect hook only run once initially when the page in rendered.
    useEffect(() => {

        setFetching(true);

        const fetchFaqs = async () => {
            const result = await fetch('/api/faqs/', {
                headers: {
                    'Authorization': `Bearer ${userAccount.userToken}`
                }
            });
    
            // Parsing json results as array of objects.
            const resultJson = await result.json();
    
            if (result.ok)
            {
                setFaqs(resultJson);
                if(resultJson.length !== 0)
                    setExist(true);
                else
                    setExist(false);

            }

            setFetching(false);
        }
           
        if(userAccount && userAccount.occupation === 'employee'){
            fetchFaqs();
            socket.emit('faqs', socket.id);

        }
            
    }, [userAccount]);

    useEffect(()=>{
        socket.on('faqs', (newFaqsAll)=>{
            setFaqs(newFaqsAll);
            if(newFaqsAll.length === 0){
                setExist(false);
            }
            else{
                setExist(true);
            }
        })

    }, []);

    return (   
        <div className="faqspage">

            {/* Main Nav Bar */}
            <NavMenu breadcrum="FAQS" pagePath="/faqs"/>
            
            {/* Faq Cards */}
            <div className="faq-management faq-access">
                <div className="faqs">
                    {isFetching && <div className="loading-spinner-wrapper-faqs-view"><LoadingIcon /></div>}
                    {!isFetching && !faqsExist && 
                        <div className="no-faqs no-faqs-view animate__animated animate__fadeInUp">
                            <img src={no_record_icon} alt="Record None" />
                            <h2>No Questions Available</h2>
                        </div>
                    }
                    {!isFetching && faqsExist && faqs && faqs.map((faq) => (
                        <div key={faq._id} className="faq-card animate__animated animate__fadeInUp">
                            <div className="faq-card-content-wrapper">
                                <h2>{faq.question}</h2>
                                <p>{faq.answer}</p>
                            </div>
                            <div className="faq-card-date-wrapper">
                                <div className="faq-card-date">
                                    {faq.createdAt && !isNaN(new Date(faq.createdAt)) ? format(new Date(faq.createdAt), "dd/MM/yyyy") : 'Invalid Date'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default FaqsBoard