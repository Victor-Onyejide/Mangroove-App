import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Hydrate persisted user info (basic session persistence for page refresh)
const persistedUserInfo = (() => {
    try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
})();

const initialState = {
    isLoggedIn: !!persistedUserInfo,
    userType: persistedUserInfo ? 'user' : '',
    sessionId: null,
    userInfo: persistedUserInfo,
    shareLink: false,
    // Tracks an explicit logout event so UI can distinguish "logged out via action"
    isLoggedOut: false,
    loading: false,
    error: null,
};

export const signUpUser = createAsyncThunk(
    'user/signUpUser',
        async ({ username, email, aka,role, password, affiliation, publisher }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/user/signup', {
                username,
                email,
                aka,
                role,
                password,
                affiliation,
                publisher,
            }, { withCredentials: true });
            return data; // Return the user data from the backend
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/api/user/login', { email, password }, {withCredentials: true});
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

//Async thunk for logout
export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await axios.post('/api/user/logout', {}, { withCredentials: true });
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

export const getCurrentUser = createAsyncThunk('user/getCurrentUser',
    async (_, {rejectWithValue}) => {
        try{
            const {data} = await axios.get('/api/user/profile', { withCredentials: true });
            return data;
        }
        catch (error) {
            console.error("Error fetching user profile:", error);
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    });

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
            state.isLoggedOut = true;
            state.userInfo = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Sign Up Thunk
            .addCase(signUpUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUpUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.isLoggedOut = false;
                state.userInfo = action.payload; // Populate userInfo with the signed-up user data
                try { localStorage.setItem('userInfo', JSON.stringify(action.payload)); } catch (_) {}
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store the error message
            })
            // Login Thunk
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.isLoggedOut = false;
                state.userType = 'user';
                state.userInfo = action.payload;
                try { localStorage.setItem('userInfo', JSON.stringify(action.payload)); } catch (_) {}
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.isLoggedOut = false;
                state.userInfo = action.payload;
                try { localStorage.setItem('userInfo', JSON.stringify(action.payload)); } catch (_) {}
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                // If fetching the profile failed, treat the session as unauthenticated.
                // Clear persisted user info so UI won't remain "optimistically" logged in
                state.isLoggedIn = false;
                state.userInfo = null;
                try { localStorage.removeItem('userInfo'); } catch (_) {}
                state.error = action.payload;
            })

            // Logout Thunk
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.isLoggedIn = false;
                state.userType = '';
                state.sessionId = null;
                state.shareLink = false;
                state.userInfo = null; // Clear userInfo on logout
                state.isLoggedOut = true;
                // Clear local storage, including Initials
                localStorage.removeItem('Initials');
                localStorage.removeItem('userInfo');
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store the error message
            });

    },
});

export const { setSessionId, setShareLink, logout } = userSlice.actions;

export default userSlice.reducer;