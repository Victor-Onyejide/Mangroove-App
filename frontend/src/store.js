import { configureStore } from "@reduxjs/toolkit";
import  useReducer  from "./features/userSlice";

const store = configureStore({
    reducer: {
        user:useReducer
    }
})

export default store;