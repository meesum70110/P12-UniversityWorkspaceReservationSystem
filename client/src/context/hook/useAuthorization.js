// Importing the `Authorize` context from the authorization module.
import { Authorize } from "../authorization";
// Importing the `useContext` hook from React for consuming context.
import { useContext } from "react";

// Defining a custom hook for accessing the authorization context.
export const useAuthorize = () => {
    // Using the `useContext` hook to access the current value of the `Authorize` context.
    const context = useContext(Authorize);

    // Checking if the context is being used outside of an AuthorizationProvider.
    if (!context) {
        // Throwing an error if the context is not wrapped in an `AuthorizationProvider`.
        throw Error('useAuthorize must be used inside an AuthorizationProvider');
    }

    // Returning the context for use in other components.
    return context;
};
