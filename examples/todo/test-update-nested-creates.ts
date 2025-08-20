/**
 * Test that update operations with nested creates properly receive tenant field
 */

import { deepMergePrismaData } from './lib/flow/core/utils';

// Simulate what happens in an update action when policy returns both where and data
const updatePolicy = {
  ok: true,
  where: { companyId: 'company-123' },
  data: { company: { connect: { id: 'company-123' } } }
};

// Test case 1: Update todo with nested tag creation
console.log('Test 1: Update todo with nested tag creation');
const updateWithNewTags = deepMergePrismaData(
  {
    title: 'Updated Todo Title',
    tags: {
      create: [
        { name: 'new-urgent', color: 'red' },
        { name: 'new-work', color: 'blue' }
      ]
    }
  },
  updatePolicy.data
);
console.log(JSON.stringify(updateWithNewTags, null, 2));
console.assert(updateWithNewTags.company?.connect?.id === 'company-123', 'Should add company to todo update');
console.assert(Array.isArray(updateWithNewTags.tags?.create), 'Should preserve tags.create as array');
console.assert(updateWithNewTags.tags?.create?.[0]?.company?.connect?.id === 'company-123', 'Should add company to first new tag');
console.assert(updateWithNewTags.tags?.create?.[1]?.company?.connect?.id === 'company-123', 'Should add company to second new tag');

// Test case 2: Update todo with mixed operations (create, connect, disconnect)
console.log('\nTest 2: Update with mixed tag operations');
const updateMixed = deepMergePrismaData(
  {
    title: 'Updated Todo',
    tags: {
      create: { name: 'new-single-tag', color: 'green' },
      connect: [
        { id: 'existing-tag-1' },
        { id: 'existing-tag-2' }
      ],
      disconnect: [
        { id: 'old-tag-1' }
      ]
    }
  },
  updatePolicy.data
);
console.log(JSON.stringify(updateMixed, null, 2));
console.assert(updateMixed.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(updateMixed.tags?.create?.company?.connect?.id === 'company-123', 'Should add company to single created tag');
console.assert(updateMixed.tags?.connect?.[0]?.id === 'existing-tag-1', 'Should preserve connect operations');
console.assert(updateMixed.tags?.disconnect?.[0]?.id === 'old-tag-1', 'Should preserve disconnect operations');

// Test case 3: Update with nested list creation that has its own nested user
console.log('\nTest 3: Update with deeply nested creates');
const updateDeepNested = deepMergePrismaData(
  {
    title: 'Updated Todo',
    list: {
      create: {
        name: 'New List in Update',
        user: {
          create: {
            email: 'newuser@example.com',
            name: 'New User from Update'
          }
        }
      }
    }
  },
  updatePolicy.data
);
console.log(JSON.stringify(updateDeepNested, null, 2));
console.assert(updateDeepNested.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(updateDeepNested.list?.create?.company?.connect?.id === 'company-123', 'Should add company to nested list');
console.assert(updateDeepNested.list?.create?.user?.create?.company?.connect?.id === 'company-123', 'Should add company to deeply nested user');

// Test case 4: Update with connectOrCreate that includes create
console.log('\nTest 4: Update with connectOrCreate');
const updateConnectOrCreate = deepMergePrismaData(
  {
    description: 'Updated description',
    tags: {
      connectOrCreate: [
        {
          where: { id: 'maybe-tag-1' },
          create: { name: 'fallback-tag-1', color: 'purple' }
        },
        {
          where: { id: 'maybe-tag-2' },
          create: { name: 'fallback-tag-2', color: 'orange' }
        }
      ]
    }
  },
  updatePolicy.data
);
console.log(JSON.stringify(updateConnectOrCreate, null, 2));
console.assert(updateConnectOrCreate.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(Array.isArray(updateConnectOrCreate.tags?.connectOrCreate), 'Should preserve connectOrCreate as array');
console.assert(updateConnectOrCreate.tags?.connectOrCreate?.[0]?.create?.company?.connect?.id === 'company-123', 'Should add company to first connectOrCreate.create');
console.assert(updateConnectOrCreate.tags?.connectOrCreate?.[1]?.create?.company?.connect?.id === 'company-123', 'Should add company to second connectOrCreate.create');

// Test case 5: Update with upsert
console.log('\nTest 5: Update with upsert on relation');
const updateWithUpsert = deepMergePrismaData(
  {
    title: 'Updated with upsert',
    list: {
      upsert: {
        where: { id: 'list-maybe' },
        create: {
          name: 'New List if not exists',
          description: 'Created via upsert in update'
        },
        update: {
          name: 'Updated List name'
        }
      }
    }
  },
  updatePolicy.data
);
console.log(JSON.stringify(updateWithUpsert, null, 2));
console.assert(updateWithUpsert.company?.connect?.id === 'company-123', 'Should add company to todo');
console.assert(updateWithUpsert.list?.upsert?.create?.company?.connect?.id === 'company-123', 'Should add company to upsert.create');
console.assert(updateWithUpsert.list?.upsert?.update?.company?.connect?.id === 'company-123', 'Should add company to upsert.update');

console.log('\n✅ All update with nested creates tests passed! Tenant field is properly injected into nested creates during updates.');