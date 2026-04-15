CREATE TYPE "public"."role" AS ENUM('admin', 'subAdmin', 'user');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"password" text NOT NULL,
	"username" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_by" uuid,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
