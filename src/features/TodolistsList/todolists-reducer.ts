import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {appActions, RequestStatusType} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {AppThunk} from '../../app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "../../common/actions/common-actions";
import {createAppAsyncThunk} from "../../utils/create-app-async-thunk";


const slice = createSlice({
    name: 'todolist',
    initialState: [] as TodolistDomainType[],
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'});
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id);
            if (index !== -1) state[index].title = action.payload.title;
        },
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
            .addCase(removeTodolist.fulfilled, (state,action)=>{
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
            .addCase(clearTasksAndTodolists.type, () => {
                return [];
            });
    }
});

export const removeTodolist = createAppAsyncThunk<{ todolistId: string }, string >(`${slice.name}/removeTodolist`, async (todolistId, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId , status: 'loading'}))
        const res = await todolistsAPI.deleteTodolist(todolistId)
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return {todolistId}
    } catch (error) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null)
    }
})
// export const _todolistsSlice = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
//     switch (action.type) {
//         case 'REMOVE-TODOLIST':
//             return state.filter(tl => tl.id != action.id)
//         case 'ADD-TODOLIST':
//             return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
//
//         case 'CHANGE-TODOLIST-TITLE':
//             return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
//         case 'CHANGE-TODOLIST-FILTER':
//             return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
//         case 'CHANGE-TODOLIST-ENTITY-STATUS':
//             return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
//         case 'SET-TODOLISTS':
//             return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
//         default:
//             return state
//     }
// }

// actions

export const fetchTodos = createAppAsyncThunk<{
    todolists: Array<TodolistType>
}>(`${slice.name}/fetchTodos`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.getTodolists()
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return {todolists: res.data}
    } catch (error) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null)
    }
})
// thunks
// export const fetchTodolistsTC = (): AppThunk => {
//     return (dispatch) => {
//         dispatch(appActions.setAppStatus({status: 'loading'}))
//         todolistsAPI.getTodolists()
//             .then((res) => {
//                 dispatch(todolistsActions.setTodolists({todolists: res.data}))
//                 dispatch(appActions.setAppStatus({status: 'succeeded'}))
//             })
//             .catch(error => {
//                 handleServerNetworkError(error, dispatch);
//             })
//     }
// }

// export const removeTodolistTC = (todolistId: string): AppThunk => {
//     return (dispatch) => {
//         //изменим глобальный статус приложения, чтобы вверху полоса побежала
//         dispatch(appActions.setAppStatus({status: 'loading'}))
//         //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
//         dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, status: 'loading'}))
//         todolistsAPI.deleteTodolist(todolistId)
//             .then((res) => {
//                 dispatch(todolistsActions.removeTodolist({id: todolistId}))
//                 //скажем глобально приложению, что асинхронная операция завершена
//                 dispatch(appActions.setAppStatus({status: 'succeeded'}))
//             })
//     }
// }
export const addTodolistTC = (title: string): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}))
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
    return (dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(todolistsActions.changeTodolistTitle({id, title}))
            })
    }
}

// types

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

export const todolistReducer = slice.reducer
export const todolistsActions = slice.actions
