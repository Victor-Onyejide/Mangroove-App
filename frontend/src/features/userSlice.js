import { createSlice }  from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn:false,
    userType: '',
    sessionId: null,
    user: null,
    shareLink: false
};

const userSlice = createSlice({
    name:'user',
    initialState,
    reducers: {
        setShareLink: (state, action) => {
            state.shareLink = action.payload;
        },
        setSessionId: (state, action) => {
            state.sessionId = action.payload;
        },

        loginAsGuest: (state, action) => {
            state.isLoggedIn = true;
            state.useratype = 'guest';
        },
        loginAsUser: (state,action) => {
            state.isLoggedIn = true;
            state.userType = 'user';
            state.user = action.payload
        },
        logout:(state) => {
            state.isLoggedIn = false;
            state.userType = '';
            state.sessionId = null
            state.shareLink = false;
        }
    }
});

export const {loginAsGuest, 
              loginAsUser, 
              logout, 
              setSessionId,
              setShareLink
            } = userSlice.actions;

export default userSlice.reducer;