// model/schema.js
import {appSchema, tableSchema} from '@nozbe/watermelondb';
import {schemaMigrations} from '@nozbe/watermelondb/Schema/migrations';


export const migrations = schemaMigrations({
  migrations: [
    // We'll add migration definitions here later
  ],
});