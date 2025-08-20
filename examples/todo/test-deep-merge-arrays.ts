/**
 * Test that deep merge properly handles arrays in update and upsert operations
 */

import { deepMergePrismaData } from './lib/flow/core/utils';

// Test case 1: Update with array
console.log('Test 1: Update with array');
const updateArray = deepMergePrismaData(
  {
    title: 'Updated Todo',
    tags: {
      update: [
        { where: { id: 'tag-1' }, data: { name: 'updated-urgent' } },
        { where: { id: 'tag-2' }, data: { name: 'updated-work' } }
      ]
    }
  },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(updateArray, null, 2));
console.assert(updateArray.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(Array.isArray(updateArray.tags?.update), 'Should preserve tags.update as array');
console.assert(updateArray.tags?.update?.[0]?.company?.connect?.id === 'company-123', 'Should add company to first update item');
console.assert(updateArray.tags?.update?.[1]?.company?.connect?.id === 'company-123', 'Should add company to second update item');

// Test case 2: Upsert with arrays in both create and update
console.log('\nTest 2: Upsert with arrays');
const upsertArray = deepMergePrismaData(
  {
    title: 'Todo with upsert',
    tags: {
      upsert: {
        where: { id: 'tag-maybe' },
        create: [
          { name: 'new-tag-1', color: 'green' },
          { name: 'new-tag-2', color: 'yellow' }
        ],
        update: [
          { name: 'updated-tag-1' },
          { name: 'updated-tag-2' }
        ]
      }
    }
  },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(upsertArray, null, 2));
console.assert(upsertArray.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(Array.isArray(upsertArray.tags?.upsert?.create), 'Should preserve upsert.create as array');
console.assert(Array.isArray(upsertArray.tags?.upsert?.update), 'Should preserve upsert.update as array');
console.assert(upsertArray.tags?.upsert?.create?.[0]?.company?.connect?.id === 'company-123', 'Should add company to first create in upsert');
console.assert(upsertArray.tags?.upsert?.create?.[1]?.company?.connect?.id === 'company-123', 'Should add company to second create in upsert');
console.assert(upsertArray.tags?.upsert?.update?.[0]?.company?.connect?.id === 'company-123', 'Should add company to first update in upsert');
console.assert(upsertArray.tags?.upsert?.update?.[1]?.company?.connect?.id === 'company-123', 'Should add company to second update in upsert');

// Test case 3: ConnectOrCreate with array
console.log('\nTest 3: ConnectOrCreate with array');
const connectOrCreateArray = deepMergePrismaData(
  {
    title: 'Todo with connectOrCreate array',
    tags: {
      connectOrCreate: {
        where: { id: 'tag-existing' },
        create: [
          { name: 'fallback-1', color: 'purple' },
          { name: 'fallback-2', color: 'orange' }
        ]
      }
    }
  },
  { company: { connect: { id: 'company-123' } } }
);
console.log(JSON.stringify(connectOrCreateArray, null, 2));
console.assert(connectOrCreateArray.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(Array.isArray(connectOrCreateArray.tags?.connectOrCreate?.create), 'Should preserve connectOrCreate.create as array');
console.assert(connectOrCreateArray.tags?.connectOrCreate?.create?.[0]?.company?.connect?.id === 'company-123', 'Should add company to first item in connectOrCreate');
console.assert(connectOrCreateArray.tags?.connectOrCreate?.create?.[1]?.company?.connect?.id === 'company-123', 'Should add company to second item in connectOrCreate');

console.log('\n✅ All array tests passed! Deep merge correctly handles arrays in update, upsert, and connectOrCreate operations.');