import { useState, useEffect, useRef } from 'react'
import { makeId } from '../services/util.service.js'

export function Checklist({ todos, task, checklist, setTask }) {

    const { id: checklistId, title } = checklist
    const [isAddingTodo, setIsAddingTodo] = useState(false)
    const [checklistIdToEdit, setChecklistIdToEdit] = useState('')
    const [newTodoValue, setNewTodoValue] = useState('')


    function onUpdateTodo(todoId, task, checklistId, method) {
        const updatedChecklists = task.checklists.map(checklist => {
            if (checklist.id === checklistId) {
                let updatedTodos = []
                if (method === 'isDone') {
                    updatedTodos = checklist.todos.map(todo =>
                        todo.id === todoId ? { ...todo, isDone: !todo.isDone } : todo)
                }
                if (method === 'removeTodo') {
                    updatedTodos = checklist.todos.filter(todo => todo.id !== todoId)
                }
                const doneTodosPercent = getDoneTodosPercent(checklistId, updatedTodos)
                return { ...checklist, todos: updatedTodos, doneTodosPercent }
            }
            return checklist
        })
        const updatedTask = { ...task, checklists: updatedChecklists }
        setTask(updatedTask)
    }

    function getDoneTodosPercent(checklistId, updatedTodos) {
        // const checklist = task.checklists.find(checklist => checklist.id === checklistId)
        const doneTodosCount = updatedTodos.reduce((acc, todo) => {
            if (todo.isDone) acc++
            return acc
        }, 0)

        return (doneTodosCount / updatedTodos.length) * 100 || 0
    }

    function handleNewTodoChange({ target }) {
        setNewTodoValue(target.value)
    }

    function onAddTodo(checklistId, newTodoValue) {
        const newTodo = {
            id: makeId(),
            title: newTodoValue,
            isDone: false
        }

        const updatedChecklists = task.checklists.map(checklist => {
            if (checklist.id === checklistId) {
                return { ...checklist, todos: [newTodo, ...checklist.todos] }
            }
            return checklist
        })
        const updatedTask = { ...task, checklists: updatedChecklists }
        setTask(updatedTask)
    }

    function onRemoveChecklist(checklistId) {
        const updatedChecklists = task.checklists.filter(checklist => checklist.id !== checklistId)
        setTask(prevTask => ({ ...prevTask, checklists: updatedChecklists }))
    }

    return (
        <div className="todo-list-preview edit">
            <div className="checklist-header">
                <h3>{title}</h3>
                <button className="btn btn-remove-checklist" onClick={() => onRemoveChecklist(checklistId)}>Delete checklist</button>
            </div>

            <div className="progress-bar-container">
                <div className="checklist-progress-bar">
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${checklist.doneTodosPercent || 0}%` }}></div>
                    </div>
                    <span>{Math.round(checklist.doneTodosPercent || 0)}%</span>
                </div>
            </div>


            {todos.map((item, i) =>
                item &&
                <div className="todo-item">
                    <label className="checkbox-todo edit" key={item.id} >
                        <input
                            type="checkbox"
                            checked={item.isDone || false}
                            value={item.title}
                            onChange={() => onUpdateTodo(item.id, task, checklistId, 'isDone')} />
                        <span className="todo-text">{item.title}</span>
                    </label>
                    <button className="btn btn-remove-todo" onClick={() => onUpdateTodo(item.id, task, checklistId, 'removeTodo')}>
                        Delete
                    </button>
                </div>)}
            {(checklistIdToEdit === checklistId) && isAddingTodo ? (
                <>
                    <input
                        type="text"
                        placeholder="Add an item"
                        value={newTodoValue}
                        onChange={handleNewTodoChange}
                    />
                    <button className="btn btn-add-todo"
                        onClick={() => { onAddTodo(checklistId, newTodoValue); setIsAddingTodo(false); setNewTodoValue('') }}>
                        Add
                    </button>
                    <button onClick={() => { setIsAddingTodo(false); setNewTodoValue('') }}>Cancel</button>
                </>
            ) : (
                <button className="btn btn-open-todo" onClick={() => { setChecklistIdToEdit(checklistId); setIsAddingTodo(true) }}>
                    Add an item
                </button>
            )}
        </div>
    )
}