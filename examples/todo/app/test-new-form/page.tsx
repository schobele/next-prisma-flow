"use client";

import { FlowTodoForm, TodoFormField, FlowTodoFormSubmit, FlowTodoFormState } from "@/lib/flow/todo/client";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TestNewFormPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">New Streamlined Form System</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Create Form Example */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Create Todo</h2>
          <FlowTodoForm 
            mode="create"
            defaultValues={{
              status: "TODO",
              priority: "MEDIUM"
            }}
            onSuccess={(todo) => {
              toast.success(`Todo "${todo.title}" created successfully!`);
              console.log("Created todo:", todo);
            }}
            onError={(error) => {
              toast.error(`Error: ${error.message}`);
            }}
            features={{
              autosave: false,
              fieldValidation: {
                onChange: true,
                onBlur: true
              }
            }}
            className="space-y-6"
          >
            <TodoFormField
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter todo title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief title for your todo item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <TodoFormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional detailed description
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <TodoFormField
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TODO">Todo</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <TodoFormField
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Hidden fields with default values for demo */}
            <TodoFormField
              name="listId"
              render={({ field }) => (
                <input type="hidden" {...field} value="clwhjkxyz0000user12345678" />
              )}
            />
            
            <TodoFormField
              name="userId"
              render={({ field }) => (
                <input type="hidden" {...field} value="clwhjkxyz0001user12345678" />
              )}
            />
            
            <TodoFormField
              name="companyId"
              render={({ field }) => (
                <input type="hidden" {...field} value="clwhjkxyz0002comp12345678" />
              )}
            />
            
            <div className="flex gap-4">
              <FlowTodoFormSubmit className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                Create Todo
              </FlowTodoFormSubmit>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
            
            <FlowTodoFormState className="text-sm text-muted-foreground" />
          </FlowTodoForm>
        </div>
        
        {/* Update Form Example with Autosave */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Update Todo (with Autosave)</h2>
          <p className="text-sm text-muted-foreground">
            This form demonstrates autosave functionality. Changes are saved automatically after 1 second.
          </p>
          
          {/* We'll use a hardcoded ID for demo - in real app, this would come from props/params */}
          <FlowTodoForm 
            mode="update"
            id="clwhjkxyz0003todo12345678" // This should be a real todo ID
            onSuccess={(todo) => {
              console.log("Updated todo:", todo);
            }}
            features={{
              autosave: {
                enabled: true,
                debounceMs: 1000,
                onError: (error) => {
                  toast.error(`Autosave failed: ${error.message}`);
                }
              }
            }}
            className="space-y-6"
          >
            <TodoFormField
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <TodoFormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <TodoFormField
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TODO">Todo</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center gap-4">
              <FlowTodoFormSubmit className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                Save Changes
              </FlowTodoFormSubmit>
              <FlowTodoFormState className="text-sm text-muted-foreground" />
            </div>
          </FlowTodoForm>
        </div>
      </div>
      
      {/* Code Example */}
      <div className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <div className="bg-muted p-6 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            <code>{`// Clean, type-safe form with shadcn/ui integration
<FlowTodoForm mode="create" onSuccess={handleSuccess}>
  <TodoFormField
    name="title"  // Type-safe with autocomplete!
    render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  
  <Button type="submit">Submit</Button>
</FlowTodoForm>`}</code>
          </pre>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">✨ Type Safety</h3>
            <p className="text-sm text-muted-foreground">
              Full TypeScript support with autocomplete for field names and values
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🎨 shadcn/ui Compatible</h3>
            <p className="text-sm text-muted-foreground">
              Works seamlessly with all shadcn/ui form components
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">⚡ Powerful Features</h3>
            <p className="text-sm text-muted-foreground">
              Autosave, validation, transforms, and optimistic updates built-in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}