"use client";

import { TodoFormProvider, TodoField, TodoSubmit } from "@/lib/flow/todo/client";
import { useRouter } from "next/navigation";

export default function TestFormPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test New Form System</h1>
      
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Create Todo Form</h2>
        
        <TodoFormProvider 
          mode="create"
          onSuccess={(todo) => {
            console.log("Created todo:", todo);
            alert(`Todo "${todo.title}" created successfully!`);
          }}
          onError={(error) => {
            console.error("Error creating todo:", error);
            alert(`Error: ${error.message}`);
          }}
        >
          <div className="space-y-4">
            <TodoField 
              name="title" 
              label="Title" 
              placeholder="Enter todo title"
              required
              className="form-field"
            />
            
            <TodoField 
              name="description" 
              label="Description" 
              placeholder="Enter description"
              className="form-field"
            />
            
            <TodoField 
              name="status" 
              label="Status"
              className="form-field"
            />
            
            <TodoField 
              name="priority" 
              label="Priority"
              className="form-field"
            />
            
            <TodoField 
              name="listId" 
              label="List ID"
              placeholder="Enter list ID"
              required
              className="form-field"
            />
            
            <TodoField 
              name="userId" 
              label="User ID"
              placeholder="Enter user ID"  
              required
              className="form-field"
            />
            
            <TodoField 
              name="companyId" 
              label="Company ID"
              placeholder="Enter company ID"
              required
              className="form-field"
            />
            
            <TodoSubmit className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
              Create Todo
            </TodoSubmit>
          </div>
        </TodoFormProvider>
      </div>
      
      <style jsx>{`
        :global(.form-field) {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        :global(.form-field label) {
          font-weight: 500;
        }
        
        :global(.form-field input),
        :global(.form-field textarea),
        :global(.form-field select) {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 0.25rem;
        }
        
        :global(.form-field input:focus),
        :global(.form-field textarea:focus),
        :global(.form-field select:focus) {
          outline: none;
          border-color: #3b82f6;
        }
        
        :global(.form-field span[role="alert"]) {
          color: #ef4444;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}