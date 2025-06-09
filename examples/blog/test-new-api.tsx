// Test file to demonstrate the new React Hook Form integration
// This replaces the previous custom form hooks with a clean react-hook-form wrapper

import React from 'react';
import { todos } from './generated/flow';

function TestNewTodoForm() {
  // New API: Simple react-hook-form wrapper with Flow integration
  const createForm = todos.hooks.useForm('create', {
    defaultValues: {
      title: '',
      description: '',
      userId: '',
    }
  }, {
    onSuccess: (todo) => {
      console.log('Todo created:', todo);
    },
    onError: (error) => {
      console.error('Failed to create todo:', error);
    }
  });

  const updateForm = todos.hooks.useForm('update', {
    defaultValues: {
      id: 'todo-123',
      title: 'Updated title',
    }
  });

  if (createForm.loading) {
    return <div>Loading react-hook-form...</div>;
  }

  return (
    <div>
      <h2>Create Todo (New API)</h2>
      <form onSubmit={createForm.handleSubmit(createForm.submitWithFlow)}>
        <input
          {...createForm.register('title', { required: 'Title is required' })}
          placeholder="Todo title"
        />
        {createForm.formState.errors.title && (
          <span>Title is required</span>
        )}
        
        <textarea
          {...createForm.register('description')}
          placeholder="Description"
        />
        
        <input
          {...createForm.register('userId', { required: 'User ID is required' })}
          placeholder="User ID"
        />
        
        <button 
          type="submit" 
          disabled={createForm.loading || !createForm.formState.isValid}
        >
          {createForm.loading ? 'Creating...' : 'Create Todo'}
        </button>
      </form>

      <h2>Update Todo (New API)</h2>
      <form onSubmit={updateForm.handleSubmit(updateForm.submitWithFlow)}>
        <input
          {...updateForm.register('title')}
          placeholder="Updated title"
        />
        
        <button 
          type="submit" 
          disabled={updateForm.loading}
        >
          {updateForm.loading ? 'Updating...' : 'Update Todo'}
        </button>
      </form>
    </div>
  );
}

export default TestNewTodoForm;