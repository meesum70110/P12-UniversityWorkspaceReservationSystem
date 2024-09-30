import React, { useState, useEffect, useContext } from "react";

// For accessing global state for logged in users
import { useAuthorize } from "../context/hook/useAuthorization";

import '../styles/formCards.css'
import '../styles/faqs.css'
import 'animate.css';

// Importing icon images to be used in course cards
import * as MdIcons from "react-icons/md";
import no_record_icon from './Images/Record/no-record-img.png'

// Date formatting
import {format} from "date-fns";

//Importing Shared Components
import NavMenu from "./SharedComponents/navMenu";
import LoadingIcon from "./SharedComponents/loading";

// Importing Alerts
import Swal from "sweetalert2";

//Importing socket with shared context
import { SocketContext } from "../context/socket";

// Importing Tooltips
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

const FaqsManage = (prop)=>{
    
    // userAccount object stores the current state including email, occupation, jwt
    const {userAccount} = useAuthorize();

    // Socket with shared context for the entire app
    const socket = useContext(SocketContext);

    const [faqs, setFaqs] = useState(null);
    const [faqsExist, setExist] = useState(true);

    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(null);
    const [isFetching, setFetching] = useState(true);

    // State kept to highlight input tags incase of blank field.
    const [blankFields, setBlankFields] = useState([]);

    // Use effect hook only run once initially when the page in rendered.
    useEffect(() => {
        const fetchFaqs = async () => {
            setFetching(true);

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
           
        if(userAccount && userAccount.occupation === 'admin'){
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

    const handleNewFaq = async (e) => {

        // Prevents default action of page refresh on form submission
        e.preventDefault();

        if(!userAccount)
        {
            setError('You are not logged in');
            return;
        }
        else if(userAccount.occupation !== 'admin')
        {
            setError('You are not an admin');
            return;
        }

        setIsLoading(true);
        
        if((!question || question.trim().length === 0) || (!answer || answer.trim().length === 0)){
            setBlankFields([]);
            setError('Please fill out all the fields');
            let emptyfields = []
            if(!question || question.trim().length === 0){
                emptyfields.push('Question');
            }
            if(!answer || answer.trim().length === 0){
                emptyfields.push('Answer');
            }
            setBlankFields(emptyfields);
            setIsLoading(false);
            return;
        }

        const newFaq = {question, answer};

        const result = await fetch('/api/faqs/', {
            method: 'POST',
            body: JSON.stringify(newFaq),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        })
        const resultJson = await result.json();

        if (result.ok)
        {
            setError(null);
            setBlankFields([]);
            setQuestion('');
            setAnswer('');
            console.log("New faq added: ",resultJson);
            Swal.fire({
                icon: "success",
                title: "New Faq Added!",
                confirmButtonColor: "#1d578a",
            });
            setIsLoading(false);
        }
        else
        {
            setError(resultJson.error);
            if(resultJson.errorFields)
            {
                setBlankFields(resultJson.errorFields);
            }
            else
            {
                setBlankFields([]);
            }
            setIsLoading(false);
        }
        
    }

    const handleDeleteFaq = async (id) => {
        if(!userAccount)
            return;
        else if(userAccount.occupation !== 'admin')
            return;

        let cancelOperation = false;

        await Swal.fire({
            title: "Are you sure?",
            text: "Delete this faq?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#1d578a",
            confirmButtonText: "Yes",
            }).then((result) => {
            if (!result.isConfirmed) {
                cancelOperation = true;
            }
        });

        if (cancelOperation) {return;}

        const result = await fetch('/api/faqs/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userAccount.userToken}`
            }
        })

        const resultJson = await result.json();

        if (result.ok)
        {
            console.log("faq deleted: ",resultJson);
            Swal.fire({
                icon: "success",
                title: "Faq deleted!",
                confirmButtonColor: "#1d578a",
            });
        }
        else
        {
            console.log(resultJson.error)
        }
    }

    // Tooltip style
    const style = { backgroundColor: "#cbd6e2", color: "#222", fontSize: "13px", fontWeight: "normal" };

    return (   
        <div className="faqspage">

            {/* Main Nav Bar */}
            <NavMenu isAdmin={true} breadcrum="FAQS" pagePath="/faqs-manage"/>
            
            {/* Faq Add Form */}
            <div className="faq-management">
                <div className="faq-add-form">
                    <form onSubmit={handleNewFaq}>
                        <h1>Add A New Question</h1>
                        <div className="faq-form-unit">
                            <label>Question<span className="form-required">*</span></label>
                            <input 
                                type="text" 
                                onChange={(e) => setQuestion(e.target.value)} 
                                value={question} 
                                className={blankFields.includes('Question') ? 'empty-error' : ''} 
                            />
                        </div>
                        <div className="faq-form-unit">
                            <label>Answer<span className="form-required">*</span></label>
                            <input 
                                type="text" 
                                onChange={(e) => setAnswer(e.target.value)} 
                                value={answer} 
                                className={blankFields.includes('Answer') ? 'empty-error' : ''} 
                            />
                        </div>
                        <button disabled={isLoading}>Add Question</button>
                        {error && <div className="error">{error}</div>}
                    </form>
                </div>

                {/* Faq Cards */}
                <div className="faqs">
                    {isFetching && <div className="loading-spinner-wrapper-faqs"><LoadingIcon /></div>}
                    {!isFetching && !faqsExist && 
                        <div className="no-faqs animate__animated animate__fadeInUp">
                            <img src={no_record_icon} alt="Record None" />
                            <h2>No Questions Added</h2>
                        </div>
                    }
                    {!isFetching && faqsExist && faqs && faqs.map((faq) => (
                        <div key={faq._id} className="faq-card animate__animated animate__fadeInUp">
                            <div className="faq-card-delete-wrapper">
                                <MdIcons.MdDelete data-tooltip-id="delete" data-tooltip-content="Delete faq" className="faq-card-delete-icon" onClick={()=>handleDeleteFaq(faq._id)} />
                                <Tooltip id="delete" place="left" style={style}/>
                            </div>
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

export default FaqsManage