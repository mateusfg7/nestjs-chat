CREATE TYPE "public"."conversations_type_enum" AS ENUM('DIRECT');--> statement-breakpoint
CREATE TYPE "public"."messages_type_enum" AS ENUM('TEXT');--> statement-breakpoint
CREATE TYPE "public"."users_role_enum" AS ENUM('USER');--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"identifier" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversation_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"last_seen_message_id" uuid,
	"last_message_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"last_message" uuid,
	CONSTRAINT "REL_ae81cc388649f0c1348c155c82" UNIQUE("last_seen_message_id"),
	CONSTRAINT "REL_9efa90fa4b17f5d32d0ed1466f" UNIQUE("last_message")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar,
	"picture" varchar,
	"identifier" varchar,
	"type" "conversations_type_enum" DEFAULT 'DIRECT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "deleted_messages" (
	"user_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_291432ce5670ad7a99d1ec20818" PRIMARY KEY("user_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"type" "messages_type_enum" DEFAULT 'TEXT' NOT NULL,
	"sender_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"blocker_id" uuid NOT NULL,
	"blocked_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "PK_48667515438e7d0f0fed998b193" PRIMARY KEY("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"username" varchar(40) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"role" "users_role_enum" DEFAULT 'USER' NOT NULL,
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "FK_36340a1704b039608e34244511f" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "FK_ae81cc388649f0c1348c155c828" FOREIGN KEY ("last_seen_message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "FK_9efa90fa4b17f5d32d0ed1466fc" FOREIGN KEY ("last_message") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "deleted_messages" ADD CONSTRAINT "FK_af4864dee9672d02ce3d5ecdfa6" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."conversation_members"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "FK_dfcd8a81016d1de587fbd2d70bf" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "FK_7a0806a54f0ad9ced3e247cacd1" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_identifier_uniq" ON "refresh_tokens" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_identifier_uniq" ON "conversations" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uniq" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_uniq" ON "users" USING btree ("username" text_ops);