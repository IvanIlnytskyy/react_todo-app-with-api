import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  todo: Todo;
  isLoading: boolean;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onUpdate: (id: number, title: string) => void;
  isTemp?: boolean;
  isDeleting: boolean;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  onDelete,
  isLoading,
  onToggle,
  isTemp = false,
  isDeleting,
  onUpdate,
}) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    setEditTitle(todo.title);
  }, [todo.title]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    } else {
      submittedRef.current = false;
    }
  }, [editing]);

  const startEditing = () => {
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditTitle(todo.title);
    setEditing(false);
  };

  const submitEdit = async () => {
    if (submittedRef.current) {
      return;
    }

    submittedRef.current = true;

    const trimmed = editTitle.trim();

    if (trimmed === '') {
      onDelete(todo.id);
      setEditing(false);

      return;
    }

    if (trimmed === todo.title) {
      submittedRef.current = false;
      setEditing(false);

      return;
    }

    try {
      await onUpdate(todo.id, trimmed);
      setEditing(false);
    } catch (error) {
      submittedRef.current = false;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      cancelEdit();
    }

    if (e.key === 'Enter') {
      submitEdit();
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: todo.completed })}
    >
      <label className="todo__status-label">
        <input
          id={`todo-${todo.id}`}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label="Toggle todo"
        />
      </label>

      {!editing ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={startEditing}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                startEditing();
              }
            }}
          >
            {todo.title}
          </span>
          {!isTemp && (
            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              disabled={isLoading}
              onClick={() => onDelete(todo.id)}
            >
              ×
            </button>
          )}
        </>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            submitEdit();
          }}
          className="todo__edit-form"
        >
          <input
            ref={inputRef}
            className="todo__edit-input"
            data-cy="TodoTitleField"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={() => {
              if (!submittedRef.current) {
                submitEdit();
              }
            }}
            onKeyUp={handleKeyUp}
            aria-label="Edit todo title"
          />
        </form>
      )}
      <div
        data-cy="TodoLoader"
        className={classNames('modal', 'overlay', {
          'is-active': isTemp || isDeleting,
        })}
        aria-hidden={!(isTemp || isDeleting)}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
