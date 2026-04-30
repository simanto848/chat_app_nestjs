"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.rooms = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    username: (0, pg_core_1.text)('username').notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.rooms = (0, pg_core_1.pgTable)('rooms', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    createdBy: (0, pg_core_1.text)('created_by').notNull().references(() => exports.users.username),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.messages = (0, pg_core_1.pgTable)('messages', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    roomId: (0, pg_core_1.text)('room_id').notNull().references(() => exports.rooms.id, { onDelete: 'cascade' }),
    username: (0, pg_core_1.text)('username').notNull().references(() => exports.users.username),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map