-- This migration adds a character_id column to the user_items table
-- and sets up a foreign key constraint to the characters table.

-- up
alter table "public"."user_items" add column "character_id" uuid;

alter table "public"."user_items" add constraint "user_items_character_id_fkey" foreign key (character_id) references characters(id) on update cascade on delete cascade;

-- down
alter table "public"."user_items" drop constraint "user_items_character_id_fkey";

alter table "public"."user_items" drop column "character_id";
