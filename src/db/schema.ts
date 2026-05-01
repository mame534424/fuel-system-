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
    date,
} from "drizzle-orm/pg-core";
import { create } from "node:domain";
import { stat } from "node:fs";

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
    code: varchar("code", { length: 20 }).notNull().unique(),
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

export const bookingStatus=pgEnum("booking_status",["PENDING","COMPLETED",
"CALLED","EXPIRED","REJECTED",
"CANCELLED"]);

export const bookings=pgTable("bookings",{
    id: uuid("id").primaryKey().defaultRandom(),
    bookingNumber: varchar("booking_number", { length: 30 }).notNull().unique(),
    stationId: uuid("station_id").notNull(),
    fuelTypesId: integer("fuel_type_id").notNull(),
    userId: uuid("user_id"),
    guestEmail: varchar("guest_email", { length: 255 }),
    plateNumber: varchar("plate_number", { length: 30 }).notNull(),
    queueNumber: integer("queue_number").notNull(),
    status: bookingStatus("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at").defaultNow()});

export const stationQueueCounter=pgTable("station_queue_counter",{
    id:serial("id").primaryKey(),
    stationId: uuid("station_id").notNull().references(() => stations.id),
    date: date("date").notNull(),
    lastQueue: integer("last_queue").notNull().default(0)
});


