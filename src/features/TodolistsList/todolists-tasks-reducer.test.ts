import {TodolistDomainType, todolistReducer, todolistsActions} from './todolists-reducer'

import {TodolistType} from '../../api/todolists-api'
import {tasksReducer, TasksStateType} from "./tasks-reducer";

test('ids should be equals', () => {
  const startTasksState: TasksStateType = {};
  const startTodolistsState: Array<TodolistDomainType> = [];

  let todolist: TodolistType = {
    title: 'new todolist',
    id: 'any id',
    addedDate: '',
    order: 0
  }

  const action = todolistsActions.addTodolist({todolist});

  const endTasksState = tasksReducer(startTasksState, action)
  const endTodolistsState = todolistReducer(startTodolistsState, action)

  const keys = Object.keys(endTasksState);
  const idFromTasks = keys[0];
  const idFromTodolists = endTodolistsState[0].id;

  expect(idFromTasks).toBe(action.payload.todolist.id);
  expect(idFromTodolists).toBe(action.payload.todolist.id);
});
