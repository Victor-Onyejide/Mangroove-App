import { configureStore } from "@reduxjs/toolkit";
import  useReducer  from "./features/userSlice";
import sessionsReducer from "./features/sessionSlice";
const store = configureStore({
    reducer: {
        user:useReducer,
        sessions:sessionsReducer
    }
})

export default store;