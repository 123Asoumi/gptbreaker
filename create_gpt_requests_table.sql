create table public.gpt_requests (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  request text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.gpt_requests enable row level security;

-- Create policy to allow anyone to insert a request (anonymous lead collection)
create policy "Allow anonymous inserts"
  on public.gpt_requests for insert
  with check (true);

-- Create policy to restrict reads (only authenticated users or admins can read)
-- For now we just deny all public reads for security
create policy "Deny public reads"
  on public.gpt_requests for select
  using (false);
