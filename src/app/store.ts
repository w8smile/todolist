import {todolistReducer} from "features/TodolistsList/todolists-reducer"
import {appReducer} from "./app-reducer"
import {authReducer} from "features/auth/model/auth-reducer"
import {configureStore} from "@reduxjs/toolkit"
import {tasksReducer} from "../features/TodolistsList/tasks-reducer";


export const store = configureStore({ reducer: {
    tasks: tasksReducer,
    todolists: todolistReducer,
    app: appReducer,
    auth: authReducer
  } })

export type AppRootStateType = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

// @ts-ignore
window.store = store