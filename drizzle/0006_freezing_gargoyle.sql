CREATE TABLE "station_queue_counter" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" uuid NOT NULL,
	"date" date NOT NULL,
	"last_queue" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stations" ADD COLUMN "code" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "station_queue_counter" ADD CONSTRAINT "station_queue_counter_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_code_unique" UNIQUE("code");