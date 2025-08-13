"use client";

import { useState, useEffect } from "react";
import { useTagList } from "../../generated/flow/tag/client/hooks";
import type { FlowTag } from "../../generated/flow/tag/types/schemas";

interface TagInputProps {
  value?: any; // The current tag value from the form
  onChange: (value: any) => void; // Callback to update form
  mode?: "create" | "update";
  existingTags?: FlowTag[]; // For update mode, the current tags on the post
}

export default function TagInput({ onChange, mode = "create", existingTags = [] }: TagInputProps) {
  const { data: availableTags } = useTagList();
  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsToCreate, setTagsToCreate] = useState<string[]>([]);
  const [tagsToConnect, setTagsToConnect] = useState<string[]>([]);
  const [tagsToDisconnect, setTagsToDisconnect] = useState<string[]>([]);

  // Initialize with existing tags in update mode
  useEffect(() => {
    if (mode === "update" && existingTags.length > 0) {
      setSelectedTags(existingTags.map(t => t.name));
    }
  }, [mode, existingTags]);

  // Update form value when tags change
  useEffect(() => {
    // Skip initial render and when no changes
    if (tagsToCreate.length === 0 && tagsToConnect.length === 0 && tagsToDisconnect.length === 0) {
      return;
    }
    
    const operations: any = {};
    
    if (mode === "create") {
      // For create mode, use create for new tags and connect for existing
      if (tagsToCreate.length > 0) {
        // For many-to-many relations, use create (not createMany)
        operations.create = tagsToCreate.map(name => ({ name }));
      }
      if (tagsToConnect.length > 0) {
        operations.connect = tagsToConnect.map(id => ({ id }));
      }
    } else {
      // For update mode, handle create, connect, and disconnect
      if (tagsToCreate.length > 0) {
        // For many-to-many relations, use create (not createMany)
        operations.create = tagsToCreate.map(name => ({ name }));
      }
      if (tagsToConnect.length > 0) {
        operations.connect = tagsToConnect.map(id => ({ id }));
      }
      if (tagsToDisconnect.length > 0) {
        operations.disconnect = tagsToDisconnect.map(id => ({ id }));
      }
    }

    // Only update if there are operations
    if (Object.keys(operations).length > 0) {
      console.log('[TagInput] Updating operations:', operations);
      onChange(operations);
    }
  }, [tagsToCreate, tagsToConnect, tagsToDisconnect, mode]); // Remove onChange from deps to prevent loop

  const handleAddTag = () => {
    const trimmedInput = inputValue.trim().toLowerCase();
    if (!trimmedInput || selectedTags.includes(trimmedInput)) {
      setInputValue("");
      return;
    }

    const existingTag = availableTags?.items.find(
      t => t.name.toLowerCase() === trimmedInput
    );

    setSelectedTags([...selectedTags, trimmedInput]);
    
    if (existingTag) {
      // Existing tag - connect it
      console.log('[TagInput] Connecting existing tag:', existingTag.name);
      setTagsToConnect([...tagsToConnect, existingTag.id]);
      
      // If in update mode and this tag was previously disconnected, remove from disconnect list
      if (mode === "update") {
        setTagsToDisconnect(tagsToDisconnect.filter(id => id !== existingTag.id));
      }
    } else {
      // New tag - create it
      console.log('[TagInput] Will create new tag:', trimmedInput);
      setTagsToCreate([...tagsToCreate, trimmedInput]);
    }
    
    setInputValue("");
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
    
    const existingTag = availableTags?.items.find(
      t => t.name.toLowerCase() === tagName.toLowerCase()
    );
    
    if (existingTag) {
      // Remove from connect list
      setTagsToConnect(tagsToConnect.filter(id => id !== existingTag.id));
      
      // In update mode, add to disconnect list if it was an existing tag on the post
      if (mode === "update" && existingTags.some(t => t.id === existingTag.id)) {
        console.log('[TagInput] Disconnecting tag:', existingTag.name);
        setTagsToDisconnect([...tagsToDisconnect, existingTag.id]);
      }
    } else {
      // Remove from create list
      setTagsToCreate(tagsToCreate.filter(t => t !== tagName));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isExistingTag = (tagName: string) => {
    return availableTags?.items.some(
      t => t.name.toLowerCase() === tagName.toLowerCase()
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1">Tags</label>
      
      {/* Input field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a tag and press Enter"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Add Tag
        </button>
      </div>

      {/* Available tags hint */}
      {availableTags && availableTags.items.length > 0 && (
        <div className="text-xs text-gray-500">
          Available tags: {availableTags.items.map(t => t.name).join(', ')}
        </div>
      )}

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                isExistingTag(tag)
                  ? 'bg-blue-100 text-blue-800' // Existing tag
                  : 'bg-green-100 text-green-800' // New tag
              }`}
            >
              {tag}
              {isExistingTag(tag) ? ' (existing)' : ' (new)'}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div>Mode: {mode}</div>
          <div>To Create: {tagsToCreate.join(', ') || 'none'}</div>
          <div>To Connect: {tagsToConnect.length} tag(s)</div>
          {mode === 'update' && <div>To Disconnect: {tagsToDisconnect.length} tag(s)</div>}
        </div>
      )}
    </div>
  );
}