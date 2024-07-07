import {todolistsAPI, TodolistType} from './todolists-api'
import {appActions, RequestStatusType} from 'app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {createAppAsyncThunk} from "common/utils/createAppAsyncThunk";
import {handleServerAppError, handleServerNetworkError} from "common/utils";
import {ResultCode} from "common/enums";
import {clearTasksAndTodolists} from "common/actions";
import {thunkTryCatch} from "../../common/utils/thunk-try-catch";


const slice = createSlice({
    name: 'todolist',
    initialState: [] as TodolistDomainType[],
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id);
            if (index !== -1) state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id);
            if (index !== -1) state[index].entityStatus = action.payload.status;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id);
                if (index !== -1) state[index].title = action.payload.title;
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.todolistId);
                if (index !== -1) {
                    state.splice(index, 1);
                }
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                action.payload.todolists.forEach(todo => {
                    state.push({...todo, filter: 'all', entityStatus: 'idle'});
                });
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'});
            })
            .addCase(clearTasksAndTodolists.type, () => {
                return [];
            });
    }
});
export const addTodolist = createAppAsyncThunk<{
    todolist: TodolistType
}, string>(`${slice.name}/addTask`, (title, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
        const res = await todolistsAPI.createTodolist(title);
        if (res.data.resultCode === ResultCode.success) {
            return { todolist: res.data.data.item };
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null);
        }
    });
});

export const removeTodolist = createAppAsyncThunk<{
    todolistId: string
}, string>(`${slice.name}/removeTodolist`, (todolistId, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
        dispatch(todolistsActions.changeTodolistEntityStatus({ id: todolistId, status: 'loading' }));
        const res = await todolistsAPI.deleteTodolist(todolistId);
        if (res.data.resultCode === ResultCode.success) {
            return { todolistId };
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null);
        }
    });
});

export const fetchTodos = createAppAsyncThunk<{
    todolists: Array<TodolistType>
}>(`${slice.name}/fetchTodos`,  (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    return thunkTryCatch(thunkAPI, async () => {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.getTodolists()
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return {todolists: res.data}
    })
})

export const changeTodolistTitle = createAppAsyncThunk<{ id: string, title: string }, {
    id: string,
    title: string
}>(`${slice.name}/changeTodolistTitle`,  (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    return thunkTryCatch(thunkAPI, async ()=>{
        const res = await todolistsAPI.updateTodolist(arg.id, arg.title)
        if (res.data.resultCode === ResultCode.success) {
            return {id: arg.id, title: arg.title}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)}
    })
})


export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

export const todolistReducer = slice.reducer
export const todolistsActions = slice.actions
