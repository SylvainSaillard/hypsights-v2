-- Trigger function to handle new user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users_metadata (user_id, email, role, fast_searches_quota)
  values (
    new.id, 
    new.email, 
    'user', -- Explicitly set default role
    3       -- Default quota
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on every new insert in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
