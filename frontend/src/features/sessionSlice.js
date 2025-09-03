import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

export const fetchSession = createAsyncThunk(
    'sessions/fetchSession',
    async (sessionId, { getState, rejectWithValue }) => {
        const token = getState().user.userInfo?.token; // Extract token from userInfo
        try {
            const { data } = await axios.get(`/api/user/session/${sessionId}`, {
                withCredentials: true,
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const joinSession = createAsyncThunk(
    'sessions/joinSession',
    async (sessionId, { getState, rejectWithValue }) => {
        const token = getState().user.userInfo?.token; // Extract token from userInfo
        try {
            const { data } = await axios.post(
                `/api/user/session/${sessionId}/join`,
                {},
                {
                    withCredentials: true,
                }
            );
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateOwnership = createAsyncThunk(
    'session/updateOwnership',
    async ({ sessionId, ownership }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/user/session/${sessionId}/ownership`, { ownership });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const sessionSlice = createSlice({
    name:'sessions',
    initialState:{
        current:null,
        loading:false,
        error:null
    },
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSession.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.current = payload;
            })
            .addCase(fetchSession.rejected, (state, {payload}) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(joinSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinSession.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.current = payload;
            })
            .addCase(joinSession.rejected, (state, {payload}) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(updateOwnership.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOwnership.fulfilled, (state, action) => {
                state.loading = false;
                const updatedSession = action.payload.session;
                if (state.current?._id === updatedSession._id) {
                    state.current = updatedSession;
                }
            })
            .addCase(updateOwnership.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            });
    }

})
export default sessionSlice.reducer;