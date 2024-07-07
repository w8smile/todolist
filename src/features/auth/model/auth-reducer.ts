import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import {appActions} from "app/app-reducer"
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from "common/utils";
import {authAPI, LoginParamsType} from "../api/authApi";
import {clearTasksAndTodolists} from "common/actions";
import {ResultCode} from "../../../common/enums";


const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
    },
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
            state.isLoggedIn = action.payload.isLoggedIn
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(logout.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isInitialized
            })
    }
})


export const login = createAppAsyncThunk<{
    isLoggedIn: boolean
}, LoginParamsType>(`${slice.name}/login`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: "loading"}))
        const res = await authAPI.login(arg)
        if (res.data.resultCode === ResultCode.success) {
            dispatch(appActions.setAppStatus({status: "succeeded"}))
            return {isLoggedIn: true}
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(res.data)
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    }
})
export const logout = createAppAsyncThunk<{
    isLoggedIn: boolean
}, void>(`${slice.name}/logout`, async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: "loading"}))
        const res = await authAPI.logout()
        if (res.data.resultCode === ResultCode.success) {
            dispatch(appActions.setAppStatus({status: "succeeded"}))
            dispatch(clearTasksAndTodolists())
            return {isLoggedIn: false}
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    }
})

export const initializeApp = createAppAsyncThunk<{
    isInitialized: boolean
}, void>(`${slice.name}/initialize`, async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        const res = await authAPI.me()
        if (res.data.resultCode === ResultCode.success) {
            return {isInitialized: true}
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    } finally {
        dispatch(appActions.setAppInitialized({isInitialized: true}))
    }
})

export const authReducer = slice.reducer
export const authAction = slice.actions
export const authThunks = {login, logout}
