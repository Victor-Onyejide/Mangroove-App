import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    isLoggedIn: false,
    userType: '',
    sessionId: null,
    userInfo: null,
    shareLink: false,
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
                state.userInfo = action.payload; // Populate userInfo with the signed-up user data
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
                state.userType = 'user';
                state.userInfo = action.payload;
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
                state.userInfo = action.payload;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.isLoggedIn = false;
                state.userInfo = null; // Clear userInfo if the user is not logged in
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
                // Clear local storage, including Initials
                localStorage.removeItem('Initials');
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store the error message
            });

    },
});

export const { setSessionId, setShareLink, logout } = userSlice.actions;

export default userSlice.reducer;