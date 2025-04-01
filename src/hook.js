import { useSelector, useDispatch } from "react-redux";
import { loginAsGuest, loginAsUser, logout } from "./features/userSlice";


export const useUser = () => {
    const dispatch = useDispatch();

    const {isLoggedIn, userType, sessionId} = useSelector((state) => state.user);

    const loginAsGuest = (sessionId) => {
        dispatch(loginAsGuest(sessionId));
    }

    const loginAsUser = (sessionId) => {
        dispatch(loginAsUser(sessionId));
    }

    const logOut = () => {
        dispatch(logOut());
    }

    return{
        isLoggedIn,
        userType,
        sessionId,
        loginAsGuest,
        loginAsUser,
        logOut
    }
}