import {authAPI, LoginParamsType} from "api/todolists-api"
import {handleServerAppError, handleServerNetworkError} from "utils/error-utils"
import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import {AppThunk} from "app/store"
import {appActions} from "app/app-reducer"
import {todolistActions} from "../TodolistsList/todolistsSlice";
import {tasksActions} from "../TodolistsList/tasks-reducer";
import {clearTasksAndTodolists} from "../../common/actions/common-actions";


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
})

export const authReducer = slice.reducer
export const authAction = slice.actions


export const loginTC =
    (data: LoginParamsType): AppThunk =>
        (dispatch) => {
            authAPI
                .login(data)
                .then((res) => {
                    if (res.data.resultCode === 0) {
                        dispatch(authAction.setIsLoggedIn({isLoggedIn: true}))
                        dispatch(appActions.setAppStatus({status: "succeeded"}))
                    } else {
                        handleServerAppError(res.data, dispatch)
                    }
                })
                .catch((error) => {
                    handleServerNetworkError(error, dispatch)
                })
        }
export const logoutTC = (): AppThunk => (dispatch) => {
    authAPI
        .logout()
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(authAction.setIsLoggedIn({isLoggedIn: false}))
                dispatch(appActions.setAppStatus({status: "succeeded"}))
                dispatch(clearTasksAndTodolists())
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
