CREATE TABLE "collection_entry" (
	"user_id" text NOT NULL,
	"pokemon_id" integer NOT NULL,
	"caught" boolean DEFAULT false NOT NULL,
	"shiny" boolean DEFAULT false NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collection_entry_user_id_pokemon_id_pk" PRIMARY KEY("user_id","pokemon_id")
);
--> statement-breakpoint
ALTER TABLE "collection_entry" ADD CONSTRAINT "collection_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;