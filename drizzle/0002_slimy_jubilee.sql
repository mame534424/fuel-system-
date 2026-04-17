CREATE TABLE "fuel_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "fuel_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "station_fuel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"fuel_type_id" integer NOT NULL,
	"quantity" double precision NOT NULL,
	"is_available" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
