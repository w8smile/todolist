import axios from "axios"
import {UpdateDomainTaskModelType} from "./tasks-reducer";
import {instance} from "../../common/instance/instance";
import {BaseResponse} from "../../common/types";
import {TaskPriorities, TaskStatuses} from "../../common/enums";


// api
export const todolistsAPI = {
    getTodolists() {
        return instance.get<TodolistType[]>("todo-lists")

    },
    createTodolist(title: string) {
        return instance.post<BaseResponse<{ item: TodolistType }>>("todo-lists", {title: title})

    },
    deleteTodolist(id: string) {
        return instance.delete<BaseResponse>(`todo-lists/${id}`)

    },
    updateTodolist(id: string, title: string) {
        return instance.put<BaseResponse>(`todo-lists/${id}`, {title: title})

    },
    getTasks(todolistId: string) {
        return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`)
    },
    deleteTask(todolistId: string, taskId: string) {
        return instance.delete<BaseResponse>(`todo-lists/${todolistId}/tasks/${taskId}`)
    },
    createTask(arg: CreateTaskArgs) {
        const {title, todolistId} = arg
        return instance.post<BaseResponse<{ item: TaskType }>>(`todo-lists/${todolistId}/tasks`, {title})
    },
    updateTask(todolistId: string, taskId: string, domainModel: UpdateTaskModelType) {
        return instance.put<BaseResponse<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, domainModel)
    },
}



// types
export type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}
export type TaskType = {
    description: string
    title: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
    id: string
    todoListId: string
    order: number
    addedDate: string
}
export type UpdateTaskModelType = {
    title: string
    description: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
}

type GetTasksResponse = {
    error: string | null
    totalCount: number
    items: TaskType[]
}

export type CreateTaskArgs = {
    title: string,
    todolistId: string
}
export type UpdateTasksArgs = {
    taskId: string,
    domainModel: UpdateDomainTaskModelType,
    todolistId: string
}
export type DeleteTaskArgs = {
    taskId: string,
    todolistId: string,
}
