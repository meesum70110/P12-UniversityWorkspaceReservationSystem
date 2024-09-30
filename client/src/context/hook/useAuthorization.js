import {Authorize} from "../authorization";
import {useContext} from "react";

export const useAuthorize = () => {
    const context = useContext(Authorize);

    if (!context) {
        throw Error('useAuthorize must be used inside an AuthorizationProvider');
    }
    return context;
}