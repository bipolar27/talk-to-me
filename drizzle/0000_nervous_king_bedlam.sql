CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"email" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
