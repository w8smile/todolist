import {AppDispatch, AppRootStateType} from "../../app/store";
import {BaseThunkAPI} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {BaseResponse} from "../types";
import {appActions} from "../../app/app-reducer";
import {handleServerNetworkError} from "./handleServerNetworkError";


export const thunkTryCatch = async <T>(
    thunkAPI: BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponse>,
    logic: () => Promise<T>
): Promise<T | ReturnType<typeof thunkAPI.rejectWithValue>> => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(appActions.setAppStatus({ status: "loading" }));
    try {
        return await logic();
    } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null);
    } finally {
        dispatch(appActions.setAppStatus({ status: "idle" }));
    }
};