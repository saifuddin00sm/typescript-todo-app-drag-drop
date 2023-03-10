import React, { useContext, createContext, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type TodoProviderType = {
  children: React.ReactNode;
};

type TodoContextType = {
  deleteTodo: (id: number) => void;
  updateTodo: (id: number, value: string) => void;
  addTodo: (todo: string, id:number, type?: boolean) => void;
  completeTodo: (id: number, todo: string) => void;
  todos: TodosType[];
  completedTodo: TodosType[];
  dragStartHandler: (id: number, todo: string)=> void;
  dragOverHandler: (e: any)=> void;
  dropHandler: (type: string)=> void;
};
type TodosType = {
  id: number;
  todo: string;
};

const TodoContext = createContext({} as TodoContextType);

export const useTodo = () => {
  return useContext(TodoContext);
};

export const TodoProvider = ({ children }: TodoProviderType) => {
  const [todos, setTodos] = useLocalStorage<TodosType[]>([], 'currentTodos');
  const [completedTodo, setCompletedTodo] = useLocalStorage<TodosType[]>([], 'completedTodo');
  const [dragItem, setDragItem] = useState<TodosType | null>({} as TodosType);

  const addTodo = (value: string, id: number, type?: boolean) => {
    const newTodo = [...todos];
    if(newTodo.some((f)=> (f.id === id))) return;
    newTodo.push({ id: type ? id : newTodo.length + 1, todo: value });
    deleteTodo(id);
    setTodos(newTodo);
  };

  const updateTodo = (id: number, value: string) => {
    const updatedTodo = todos.map((task)=> (id === task.id ? {...task, todo: value}: task));
    const completedUpdatedTodo = completedTodo.map((task)=> (id === task.id ? {...task, todo: value}: task));
    setTodos(updatedTodo);
    setCompletedTodo(completedUpdatedTodo)
  };

  const deleteTodo = (id: number) => {
    const newTodo = todos.filter((task)=> (task.id !== id));
    const completedNewTodo = completedTodo.filter((task)=> (task.id !== id));
    setTodos(newTodo);
    setCompletedTodo(completedNewTodo)
  };

  const completeTodo = (id:number, todo:string) => {
    const newTodo = [...completedTodo];
    if(newTodo.some((f)=> (f.id === id))) return;

    newTodo.push({todo: todo, id: id});
    deleteTodo(id);
    setCompletedTodo(newTodo);
  };

  const dragStartHandler = (id: number, todo: string)=> {
    setDragItem({id, todo});
  }

  const dragOverHandler = (e: any)=> {e.preventDefault()};

  const dropHandler = (type: string)=> {
    if(dragItem !== null){
     if(type === 'incomplete'){
      addTodo(dragItem.todo, dragItem.id, true);
     }else{
      completeTodo(dragItem.id, dragItem.todo);
     }
    }
  }

  return (
    <TodoContext.Provider
      value={{
        todos,
        completeTodo,
        completedTodo,
        deleteTodo,
        addTodo,
        updateTodo,
        dragStartHandler,
        dragOverHandler,
        dropHandler
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
