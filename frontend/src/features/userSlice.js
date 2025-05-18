import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const userFromStorage = localStorage.getItem('userInfo')
const initialState = {
    isLoggedIn: false,
    userType: '',
    sessionId: null,
    userInfo: userFromStorage ? JSON.parse(userFromStorage) : null,
    shareLink: false,
    loading: false,
    error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/user/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setSessionId: (state, action) => {
            state.sessionId = action.payload;
        },
        setShareLink: (state, action) => {
            state.shareLink = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.userType = '';
            state.sessionId = null;
            state.shareLink = false;
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.userType = 'user';
                state.userInfo = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setSessionId, setShareLink, logout } = userSlice.actions;

export default userSlice.reducer;