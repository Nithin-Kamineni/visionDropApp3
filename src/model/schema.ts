// model/schema.js
import {appSchema, tableSchema} from '@nozbe/watermelondb';
import {schemaMigrations} from '@nozbe/watermelondb/Schema/migrations';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { migrations } from './migrations';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'posts',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'subtitle', type: 'string', isOptional: true},
        {name: 'body', type: 'string'},
        {name: 'is_pinned', type: 'boolean'},
      ],
    }),
    tableSchema({
      name: 'comments',
      columns: [
        {name: 'body', type: 'string'},
        {name: 'post_id', type: 'string', isIndexed: true},
      ],
    }),
  ],
});
