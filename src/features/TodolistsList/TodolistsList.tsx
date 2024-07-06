import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {
  addTodolist, changeTodolistTitle,
  fetchTodos,
  FilterValuesType, removeTodolist,
  todolistsActions
} from './todolists-reducer'

import {TaskStatuses} from './todolists-api'
import {Grid, Paper} from '@mui/material'
import {AddItemForm} from '../../common/components/AddItemForm/AddItemForm'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from '../../common/hooks/useAppDispatch';
import {addTask, removeTask, updateTask} from "./tasks-reducer";
import {selectTodolists} from "./todolist-select";
import {selectIsLoggedIn} from "../auth/model/auth-selectors";
import {selectTasks} from "./tasks-select";

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
  const todolists = useSelector(selectTodolists)
  const tasks = useSelector(selectTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    const thunk = fetchTodos()
    dispatch(thunk)
  }, [])

  const removeTaskCallback = useCallback(function (taskId: string, todolistId: string) {
    const thunk = removeTask({taskId, todolistId})
    dispatch(thunk)
  }, [])

  const addTaskCallBack = useCallback(function (title: string, todolistId: string) {
    dispatch(addTask({todolistId, title}))
  }, [])

  const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
    const thunk = updateTask({taskId: id, domainModel: {status}, todolistId})
    dispatch(thunk)
  }, [])

  const changeTaskTitle = useCallback(function (id: string, title: string, todolistId: string) {
    const thunk = updateTask({taskId: id, domainModel: {title}, todolistId})
    dispatch(thunk)
  }, [])

  const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
    dispatch(todolistsActions.changeTodolistFilter({id, filter}))
  }, [])

  const removeTodolistCallback = useCallback(function (id: string) {
    const thunk = removeTodolist(id)
    dispatch(thunk)
  }, [])

  const changeTodolistTitleCallback = useCallback(function (id: string, title: string) {
    const thunk = changeTodolistTitle({id, title})
    dispatch(thunk)
  }, [])

  const addTodolistCallback = useCallback((title: string) => {
    const thunk = addTodolist(title)
    dispatch(thunk)
  }, [dispatch])

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />
  }

  return <>
    <Grid container style={{padding: '20px'}}>
      <AddItemForm addItem={addTodolistCallback}/>
    </Grid>
    <Grid container spacing={3}>
      {
        todolists.map(tl => {
          let allTodolistTasks = tasks[tl.id]

          return <Grid item key={tl.id}>
            <Paper style={{padding: '10px'}}>
              <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTaskCallback}
                  changeFilter={changeFilter}
                  addTask={addTaskCallBack}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolistCallback}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitleCallback}
                  demo={demo}
              />
            </Paper>
          </Grid>
        })
      }
    </Grid>
  </>
}
