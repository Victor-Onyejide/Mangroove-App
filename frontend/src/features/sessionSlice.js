import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

export const fetchSession = createAsyncThunk(
    'sessions/fetchSession',
    async (sessionId, { getState, rejectWithValue }) => {
        const token = getState().user.userInfo?.token; // Extract token from userInfo
        try {
            const { data } = await axios.get(`/api/user/session/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` },
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
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
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
    }

})
export default sessionSlice.reducer;