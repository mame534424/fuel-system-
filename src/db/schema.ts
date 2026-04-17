import { unique } from "drizzle-orm/gel-core";

import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    boolean,
    varchar,
    pgEnum,
    serial,
    doublePrecision,
} from "drizzle-orm/pg-core";
import { create } from "node:domain";

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


export const stations= pgTable("stations", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    latitude:doublePrecision("latitude").notNull(),
    longitude:doublePrecision("longitude").notNull(),
    isActive: boolean("is_active").default(true),
    ownerId: uuid("owner_id"),// sub admin
    createdAt: timestamp("created_at").defaultNow(),
});

export const fuelTypes=pgTable("fuel_types",{
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull().unique()
});

export const stationFuel=pgTable("station_fuel",{
    id: uuid("id").primaryKey().defaultRandom(),
    stationId: uuid("station_id").notNull(),
    fuelTypeId: integer("fuel_type_id").notNull(),
    quantity: doublePrecision("quantity").notNull(),
    isAvailable: boolean("is_available").default(true),
    updatedAt: timestamp("updated_at").defaultNow(),
});
