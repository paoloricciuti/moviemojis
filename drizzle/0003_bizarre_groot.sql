ALTER TABLE movies ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE sessions ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE upvotes ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE users ADD `updated_at` text;--> statement-breakpoint

create trigger movies___update_updated_at after update on movies begin
  update movies set updated_at = CURRENT_TIMESTAMP where id = new.id;
end;--> statement-breakpoint

create trigger sessions___update_updated_at after update on sessions begin
  update sessions set updated_at = CURRENT_TIMESTAMP where id = new.id;
end;--> statement-breakpoint

create trigger upvotes___update_updated_at after update on upvotes begin
  update upvotes set updated_at = CURRENT_TIMESTAMP where id = new.id;
end;--> statement-breakpoint

create trigger users___update_updated_at after update on users begin
  update users set updated_at = CURRENT_TIMESTAMP where id = new.id;
end;