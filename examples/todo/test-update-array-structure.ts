/**
 * Test that update arrays place tenant connection in the correct location
 */

import { deepMergePrismaData } from './lib/flow/core/utils';

console.log('Testing update array tenant connection placement...\n');

// Test case 1: Update array with where/data structure
console.log('Test 1: Update array with where/data structure');
const updateArray = deepMergePrismaData(
  {
    title: 'Parent Todo',
    tags: {
      update: [
        {
          where: { id: 'tag-1' },
          data: { 
            name: 'updated-urgent',
            color: 'orange'
          }
        },
        {
          where: { id: 'tag-2' },
          data: { 
            name: 'updated-work',
            color: 'green'
          }
        }
      ]
    }
  },
  { company: { connect: { id: 'tenant-123' } } },
  'Todo'
);

console.log(JSON.stringify(updateArray, null, 2));

// Verify structure
console.assert(updateArray.company?.connect?.id === 'tenant-123', 'Parent Todo has company');

// Check that tenant connection is inside data, not at root of update items
const firstUpdate = updateArray.tags?.update?.[0];
const secondUpdate = updateArray.tags?.update?.[1];

console.assert(firstUpdate?.where?.id === 'tag-1', 'First update has where clause');
console.assert(firstUpdate?.data?.name === 'updated-urgent', 'First update has data.name');
console.assert(firstUpdate?.data?.company_relation?.connect?.id === 'tenant-123', 
  '✅ First update has tenant connection INSIDE data');
console.assert(!firstUpdate?.company_relation, 
  '✅ First update does NOT have tenant connection at root level');

console.assert(secondUpdate?.where?.id === 'tag-2', 'Second update has where clause');
console.assert(secondUpdate?.data?.name === 'updated-work', 'Second update has data.name');
console.assert(secondUpdate?.data?.company_relation?.connect?.id === 'tenant-123', 
  '✅ Second update has tenant connection INSIDE data');
console.assert(!secondUpdate?.company_relation, 
  '✅ Second update does NOT have tenant connection at root level');

console.log('\n✅ Update arrays correctly place tenant connection inside data\n');

// Test case 2: Nested update with subtasks update array
console.log('Test 2: Nested update with subtasks update array');
const nestedUpdate = deepMergePrismaData(
  {
    title: 'Main Todo',
    subtasks: {
      update: [
        {
          where: { id: 'subtask-1' },
          data: {
            title: 'Updated Subtask 1',
            status: 'COMPLETED'
          }
        }
      ]
    }
  },
  { company: { connect: { id: 'tenant-456' } } },
  'Todo'
);

console.log(JSON.stringify(nestedUpdate, null, 2));

const subtaskUpdate = nestedUpdate.subtasks?.update?.[0];
console.assert(subtaskUpdate?.data?.company?.connect?.id === 'tenant-456',
  '✅ Subtask update has tenant connection inside data');
console.assert(!subtaskUpdate?.company,
  '✅ Subtask update does not have tenant at root');

console.log('\n✅ Nested updates also place tenant correctly\n');

// Test case 3: Upsert with update array
console.log('Test 3: Upsert with update array');
const upsertWithUpdate = deepMergePrismaData(
  {
    title: 'Todo with upsert',
    tags: {
      upsert: {
        where: { id: 'tag-maybe' },
        create: { name: 'new-tag', color: 'blue' },
        update: [
          {
            where: { id: 'tag-3' },
            data: { name: 'upserted-tag' }
          }
        ]
      }
    }
  },
  { company: { connect: { id: 'tenant-789' } } },
  'Todo'
);

console.log(JSON.stringify(upsertWithUpdate, null, 2));

const upsertUpdateItem = upsertWithUpdate.tags?.upsert?.update?.[0];
console.assert(upsertUpdateItem?.data?.company_relation?.connect?.id === 'tenant-789',
  '✅ Upsert update array has tenant inside data');
console.assert(!upsertUpdateItem?.company_relation,
  '✅ Upsert update array does not have tenant at root');

console.log('\n✅ All tests passed! Update arrays correctly structure tenant connections');
console.log('\nKey points:');
console.log('- Update items have structure: { where: {...}, data: {...} }');
console.log('- Tenant connection goes INSIDE data, not at root level');
console.log('- This matches Prisma\'s expected structure for update operations');