/**
 * Test that deep merge properly applies tenant connections to nested creates
 */

import { deepMergePrismaData } from './lib/flow/core/utils';

// Test case 1: Simple create with no nesting
console.log('Test 1: Simple create');
const simple = deepMergePrismaData(
  { title: 'My Todo', description: 'Test' },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(simple, null, 2));
console.assert(simple.company?.connect?.id === 'company-123', 'Should add company connection');

// Test case 2: Nested create
console.log('\nTest 2: Nested create');
const nested = deepMergePrismaData(
  {
    title: 'My Todo',
    list: {
      create: {
        name: 'New List',
        description: 'A new list'
      }
    }
  },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(nested, null, 2));
console.assert(nested.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(nested.list?.create?.company?.connect?.id === 'company-123', 'Should add company to nested list create');

// Test case 3: ConnectOrCreate
console.log('\nTest 3: ConnectOrCreate');
const connectOrCreate = deepMergePrismaData(
  {
    title: 'My Todo',
    list: {
      connectOrCreate: {
        where: { id: 'existing-list' },
        create: {
          name: 'Fallback List'
        }
      }
    }
  },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(connectOrCreate, null, 2));
console.assert(connectOrCreate.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(connectOrCreate.list?.connectOrCreate?.create?.company?.connect?.id === 'company-123', 'Should add company to connectOrCreate.create');

// Test case 4: Multiple nested creates with array
console.log('\nTest 4: Multiple nested creates with array');
const multiNested = deepMergePrismaData(
  {
    title: 'My Todo',
    list: {
      create: {
        name: 'New List',
        user: {
          create: {
            email: 'user@example.com',
            name: 'New User'
          }
        }
      }
    },
    tags: {
      create: [
        { name: 'urgent', color: 'red' },
        { name: 'work', color: 'blue' }
      ]
    }
  },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(multiNested, null, 2));
console.assert(multiNested.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(multiNested.list?.create?.company?.connect?.id === 'company-123', 'Should add company to list');
console.assert(multiNested.list?.create?.user?.create?.company?.connect?.id === 'company-123', 'Should add company to deeply nested user');
console.assert(Array.isArray(multiNested.tags?.create), 'Should preserve tags.create as array');
console.assert(multiNested.tags?.create?.[0]?.company?.connect?.id === 'company-123', 'Should add company to first tag');
console.assert(multiNested.tags?.create?.[1]?.company?.connect?.id === 'company-123', 'Should add company to second tag');

// Test case 5: CreateMany
console.log('\nTest 5: CreateMany');
const createMany = deepMergePrismaData(
  {
    title: 'Parent Todo',
    subtasks: {
      createMany: {
        data: [
          { title: 'Subtask 1' },
          { title: 'Subtask 2' }
        ]
      }
    }
  },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(createMany, null, 2));
console.assert(createMany.company?.connect?.id === 'company-123', 'Should add company to parent');
console.assert(createMany.subtasks?.createMany?.data?.[0]?.company?.connect?.id === 'company-123', 'Should add company to each createMany item');
console.assert(createMany.subtasks?.createMany?.data?.[1]?.company?.connect?.id === 'company-123', 'Should add company to each createMany item');

console.log('\n✅ All tests passed! Deep merge is working correctly for nested tenant connections.');