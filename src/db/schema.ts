import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    boolean,
    varchar,
    pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum= pgEnum("role", ["admin","subAdmin","user"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique(),
    password: text("password").notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    role: roleEnum("role").notNull().default("user"),
    createdBy: uuid("created_by"), // self reference later
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),});