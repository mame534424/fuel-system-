CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'COMPLETED', 'CALLED', 'EXPIRED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_number" varchar(30) NOT NULL,
	"station_id" uuid NOT NULL,
	"fuel_type_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"guest_email" varchar(255),
	"plate_number" varchar(30) NOT NULL,
	"queue_number" integer NOT NULL,
	"status" "booking_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
