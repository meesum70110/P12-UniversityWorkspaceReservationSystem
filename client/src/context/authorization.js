import {createContext, useReducer, useState, useEffect} from 'react';

// The function helps maintain state of logged in user locally.
export const Authorize = createContext();

export const authorizeReducer = (state, selection) => {
    switch (selection.type) {
        case 'LOGIN':
            return {userAccount : selection.payload, loading : false};
        case 'LOGOUT':
            return {userAccount: null, loading : false};
        default:
            return state;
    }
}

export const AuthorizationProvider = ({children}) => {
    const [state, dispatch] = useReducer(authorizeReducer, {userAccount : null, loading : true});
    
    console.log('Authorization state: ', state);

    // Empty list as second argument indicates empty dependency array meaning only fire this function 
    // when the component initially renders.

    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const userExist = JSON.parse(localStorage.getItem('userAccount'));

    if(userExist) 
        dispatch({type: 'LOGIN', payload: userExist});
    else 
        dispatch({type: 'LOGOUT'});

    setLoading(false);
    },[])

    if(loading){
        return <div>loading...</div>
    }

    return (
        <Authorize.Provider value={{...state, dispatch}}>
            {children}
        </Authorize.Provider>
    )
}