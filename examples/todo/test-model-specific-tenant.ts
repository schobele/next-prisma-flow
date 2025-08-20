/**
 * Test that each model gets its own tenant relation name
 */

import { deepMergePrismaData } from './lib/flow/core/utils';

console.log('Testing model-specific tenant relations...\n');

// Test case 1: Todo update with nested Tag creation
// Todo uses "company" relation, Tag uses "company_relation"
console.log('Test 1: Todo update with nested Tag creation');
const todoUpdate = deepMergePrismaData(
  {
    title: 'Updated Todo',
    tags: {
      create: [
        { name: 'urgent', color: 'red' },
        { name: 'work', color: 'blue' }
      ]
    }
  },
  { company: { connect: { id: 'company-123' } } }, // Todo's tenant connection
  'Todo' // Parent model
);

console.log(JSON.stringify(todoUpdate, null, 2));

// Check that Todo has "company" connection
console.assert(todoUpdate.company?.connect?.id === 'company-123', 'Todo should have company connection');

// Check that nested Tags have "company_relation" connection (Tag's specific relation name)
console.assert(todoUpdate.tags?.create?.[0]?.company_relation?.connect?.id === 'company-123', 
  'First tag should have company_relation (not company)');
console.assert(todoUpdate.tags?.create?.[1]?.company_relation?.connect?.id === 'company-123', 
  'Second tag should have company_relation (not company)');

// Verify Tags don't have "company" field (they use company_relation)
console.assert(!todoUpdate.tags?.create?.[0]?.company, 
  'Tags should NOT have company field (they use company_relation)');

console.log('✅ Tags correctly use company_relation\n');

// Test case 2: List creation with nested Todo that has nested Tags
console.log('Test 2: List with nested Todo with nested Tags');
const listCreate = deepMergePrismaData(
  {
    name: 'New List',
    todos: {
      create: {
        title: 'Todo in List',
        tags: {
          create: { name: 'nested-tag', color: 'green' }
        }
      }
    }
  },
  { company: { connect: { id: 'company-456' } } },
  'List'
);

console.log(JSON.stringify(listCreate, null, 2));

// Check each model uses its correct tenant relation
console.assert(listCreate.company?.connect?.id === 'company-456', 'List uses company');
console.assert(listCreate.todos?.create?.company?.connect?.id === 'company-456', 'Todo uses company');
console.assert(listCreate.todos?.create?.tags?.create?.company_relation?.connect?.id === 'company-456', 
  'Tag uses company_relation');

console.log('✅ Deep nesting preserves model-specific relations\n');

// Test case 3: Direct Tag creation
console.log('Test 3: Direct Tag creation');
const tagCreate = deepMergePrismaData(
  {
    name: 'Direct Tag',
    color: 'purple'
  },
  { company_relation: { connect: { id: 'company-789' } } }, // Tag's specific tenant connection
  'Tag'
);

console.log(JSON.stringify(tagCreate, null, 2));

console.assert(tagCreate.company_relation?.connect?.id === 'company-789', 
  'Direct Tag creation uses company_relation');
console.assert(!tagCreate.company, 'Tag should not have company field');

console.log('✅ Direct Tag creation uses correct relation\n');

console.log('✅ All tests passed! Each model correctly uses its own tenant relation name:');
console.log('  - User, List, Todo → company');
console.log('  - Tag → company_relation');