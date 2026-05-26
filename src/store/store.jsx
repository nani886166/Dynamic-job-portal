import { configureStore } from "@reduxjs/toolkit";
import authReducers from "../features/AuthSlice";

export let store = configureStore({
    reducer : {
        isAuth : authReducers
    },
});
