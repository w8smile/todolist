import {
    CreateTaskArgs,
    DeleteTaskArgs,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType,
    UpdateTasksArgs
} from './todolists-api'
import {appActions} from "app/app-reducer";
import {createSlice} from "@reduxjs/toolkit";
import {addTodolist, fetchTodos, removeTodolist} from "./todolists-reducer";
import {createAppAsyncThunk} from "common/utils/createAppAsyncThunk";
import {ResultCode, TaskPriorities, TaskStatuses} from "common/enums";
import {handleServerAppError, handleServerNetworkError} from "common/utils";
import {clearTasksAndTodolists} from "common/actions";


const slice = createSlice({
    name: 'tasks',
    initialState: {} as TasksStateType,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(removeTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex((t) => t.id === action.payload.taskId)
                if (index !== -1) {
                    tasks.splice(index, 1)
                }
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex((t) => t.id === action.payload.taskId)
                if (index !== -1) {
                    tasks[index] = {...tasks[index], ...action.payload.domainModel}
                }
            })
            .addCase(addTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.task.todoListId]
                tasks.unshift(action.payload.task)
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = []
                })
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                delete state[action.payload.todolistId]
            })
            .addCase(addTodolist.fulfilled, (state,action)=>{
                state[action.payload.todolist.id ] = []
            })
            .addCase(clearTasksAndTodolists.type, () => {
                return {}
            })
    },
});

export const fetchTasks = createAppAsyncThunk<{tasks: TaskType[], todolistId: string}, string, {
    rejectValue: null
}>(`${slice.name}/fetchTasks`, async (todolistId, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.getTasks(todolistId)
        const tasks = res.data.items
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return {tasks, todolistId}
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    }
})


export const addTask = createAppAsyncThunk<{
    task: TaskType
}, CreateTaskArgs>(`${slice.name}/addTask`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.createTask(arg)
        if (res.data.resultCode === ResultCode.success) {
            const task = res.data.data.item
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {task}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    }
})


export const updateTask = createAppAsyncThunk<UpdateTasksArgs, UpdateTasksArgs>(
    `${slice.name}/updateTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue, getState} = thunkAPI;
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}))
            const state = getState();
            const task = state.tasks[arg.todolistId].find(t => t.id === arg.taskId);
            if (!task) {
                //throw new Error("task not found in the state");
                console.warn('task not found in the state');
                return rejectWithValue(null);
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...arg.domainModel
            };
            const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel);
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            if (res.data.resultCode === ResultCode.success) {
                return ({taskId: arg.taskId, todolistId: arg.todolistId, domainModel: arg.domainModel})
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null);
            }

        } catch (e) {
            console.error("Error updating task:", e);
            return rejectWithValue(null);
        }

    }
);

export const removeTask = createAppAsyncThunk<DeleteTaskArgs, DeleteTaskArgs>(`${slice.name}/removeTask`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
        if (res.data.resultCode === ResultCode.success) {
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {taskId: arg.taskId, todolistId: arg.todolistId}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    }
})


// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}


export const tasksReducer = slice.reducer
export const tasksActions = slice.actions