// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const storage = require('electron-json-storage');


const list = document.getElementById('list')

// Id Generator for the todos
const nextId = (() => {
  let id = 0
  return () => id++
})()

let todos

// Die ToDo Einträge sind Objekte mit Text, Id und Done
storage.get('todos',  function(error, data) {
  if (error) {throw error;}
  console.log(data)
  // @ts-ignore
  todos = data.todos || [{
    text:'',
    id:nextId(),
    done:false
  }]
  renderTodos()

});



let lastTodoInput

function saveTodos(){
  storage.set('todos', {todos}, function(error) {
    if (error) {
      throw error;
    }
  });
}

function appendTodo(todo) {
  const todoHtml = `
    <li class="item ${todo.done ? 'done' : ''}" id="todo-${todo.id}">
      <div class="checkbox__wrapper">
        <div class="checkbox">
          <div class="checkbox__circle checkbox__circle--outer"></div>
          <div class="checkbox__circle checkbox__circle--inner">#</div>
        </div>
      </div>
      <div class="input__wrapper">
        <input type="text" value="${todo.text}">
      </div>
     <div class="priority">
       <select name="priority" class="semi-square styled-select">
          <option value="none"></option>
          <option value="high">!!!</option>
          <option value="medium">&nbsp;!!</option>
          <option value="low">&nbsp;!&nbsp;</option>
        </select>
     </div>
    </li>`
  list.insertAdjacentHTML('beforeend', todoHtml)
}

function addEventListeners(todo) {
  const todoElement = document.getElementById(`todo-${todo.id}`)
  const checkBoxElement = todoElement.querySelector('.checkbox')
  const inputElement = todoElement.querySelector('input')

  checkBoxElement.addEventListener('click', () => {
    todoElement.classList.toggle('done')
    todo.done = !todo.done
  })

  inputElement.addEventListener('input', () => {
    todo.text = inputElement.value
    saveTodos();
  })
}

function appendEmptyTodo() {
  const newTodo = {
    text: '',
    id: nextId(),
    done: false,
  }
  todos.push(newTodo)
  appendTodo(newTodo)
  addEventListeners(newTodo)
  updateLastTodo()
}

function updateLastTodo() {
  if (lastTodoInput) {
    lastTodoInput.removeEventListener('click', appendEmptyTodo)
  }
  lastTodoInput = document.querySelector('.item:last-of-type input')
  lastTodoInput.addEventListener('click', appendEmptyTodo)
}

// Einträge rendern
function renderTodos() {
  for (const todo of todos) {
    appendTodo(todo)
    addEventListeners(todo)
  }
  updateLastTodo()
}

function removeTodos(todos) {
  for (const todo of todos) {
    const todoElement = document.getElementById(`todo-${todo.id}`)
    todoElement.parentNode.removeChild(todoElement)
  }
}

const deleteButton = document.getElementById('delete')
deleteButton.addEventListener('click', () => {
  const finishedTodos = todos.filter(todo => todo.done)
  const unFinishedTodos = todos.filter(todo => !todo.done)
  removeTodos(finishedTodos)
  todos = unFinishedTodos

  if (unFinishedTodos.length === 0) {
    appendEmptyTodo()
  }
  updateLastTodo()
  saveTodos()
})
