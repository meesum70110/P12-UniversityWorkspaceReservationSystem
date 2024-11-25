// Importing necessary hooks and methods from React to manage state and effects.
import { createContext, useReducer, useState, useEffect } from 'react';

// Creating a Context for managing the authorization state of the logged-in user.
export const Authorize = createContext();

// Defining the reducer function for updating authorization states based on dispatched actions.
export const authorizeReducer = (state, selection) => {
    switch (selection.type) {
        case 'LOGIN':
            // Handling the user login and updating the state with the user's data.
            return { userAccount: selection.payload, loading: false };
        case 'LOGOUT':
            // Handling the user logout and resetting the state to null.
            return { userAccount: null, loading: false };
        default:
            // Returning the current state if no matching action is found.
            return state;
    }
};

// Creating a provider component for managing and sharing the authorization state.
export const AuthorizationProvider = ({ children }) => {
    // Initializing the reducer with a default state.
    const [state, dispatch] = useReducer(authorizeReducer, { userAccount: null, loading: true });

    // Logging the current authorization state to the console for debugging purposes.
    console.log('Authorization state: ', state);

    // Managing the loading state to handle asynchronous operations.
    const [loading, setLoading] = useState(true);

    // Using `useEffect` to check for a stored user when the component first mounts.
    useEffect(() => {
        // Retrieving the logged-in user data from localStorage.
        const userExist = JSON.parse(localStorage.getItem('userAccount'));

        // Dispatching a login action if user data is found, otherwise logging out.
        if (userExist) 
            dispatch({ type: 'LOGIN', payload: userExist });
        else 
            dispatch({ type: 'LOGOUT' });

        // Setting the loading state to false after checking for the user.
        setLoading(false);
    }, []); // Empty dependency array ensures this runs only once on initial render.

    // Displaying a loading message while the state is being initialized.
    if (loading) {
        return <div>loading...</div>;
    }

    // Providing the authorization state and dispatch function to child components.
    return (
        <Authorize.Provider value={{ ...state, dispatch }}>
            {children}
        </Authorize.Provider>
    );
};
