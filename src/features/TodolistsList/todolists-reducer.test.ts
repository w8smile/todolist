
import {v1} from 'uuid'
import {TodolistType} from '../../api/todolists-api'
import {RequestStatusType} from '../../app/app-reducer'
import {FilterValuesType, todolistActions, TodolistDomainType, todolistReducer} from "./todolistsSlice";

let todolistId1: string
let todolistId2: string
let startState: Array<TodolistDomainType> = []

beforeEach(() => {
  todolistId1 = v1()
  todolistId2 = v1()
  startState = [
    {id: todolistId1, title: 'What to learn', filter: 'all', entityStatus: 'idle', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', entityStatus: 'idle', addedDate: '', order: 0}
  ]
})

test('correct todolist should be removed', () => {
  const endState = todolistReducer(startState, todolistActions.removeTodolist({id: todolistId1}))

  expect(endState.length).toBe(1)
  expect(endState[0].id).toBe(todolistId2)
})

test('correct todolist should be added', () => {
  let todolist: TodolistType = {
    title: 'New Todolist',
    id: 'any id',
    addedDate: '',
    order: 0
  }


  const endState = todolistReducer(startState, todolistActions.addTodolist({todolist}))

  expect(endState.length).toBe(3)
  expect(endState[0].title).toBe(todolist.title)
  expect(endState[0].filter).toBe('all')
})

test('correct todolist should change its name', () => {
  let newTodolistTitle = 'New Todolist'

  const action = todolistActions.changeTodolistTitle({id: todolistId2, title: newTodolistTitle})

  const endState = todolistReducer(startState, action)

  expect(endState[0].title).toBe('What to learn')
  expect(endState[1].title).toBe(newTodolistTitle)
})

test('correct filter of todolist should be changed', () => {
  let newFilter: FilterValuesType = 'completed'

  const action = todolistActions.changeTodolistFilter({id: todolistId2, filter: newFilter})

  const endState = todolistReducer(startState, action)

  expect(endState[0].filter).toBe('all')
  expect(endState[1].filter).toBe(newFilter)
})
test('todolists should be added', () => {

  const action = todolistActions.setTodolists({todolists: startState})

  const endState = todolistReducer([], action)

  expect(endState.length).toBe(2)
})
test('correct entity status of todolist should be changed', () => {
  let newStatus: RequestStatusType = 'loading'

  const action = todolistActions.changeTodolistEntityStatus({id: todolistId2, status: newStatus})

  const endState = todolistReducer(startState, action)

  expect(endState[0].entityStatus).toBe('idle')
  expect(endState[1].entityStatus).toBe(newStatus)
})



