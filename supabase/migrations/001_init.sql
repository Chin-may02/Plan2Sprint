-- Create conversions table
create table if not exists conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  prd_text text not null,
  output jsonb not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table conversions enable row level security;

-- Policy: users can only read their own conversions
create policy "Users can read own conversions"
  on conversions
  for select
  using (auth.uid() = user_id);

-- Policy: users can only insert their own conversions
create policy "Users can insert own conversions"
  on conversions
  for insert
  with check (auth.uid() = user_id);

-- Policy: users can delete their own conversions
create policy "Users can delete own conversions"
  on conversions
  for delete
  using (auth.uid() = user_id);

-- Index for performance
create index if not exists conversions_user_id_idx on conversions(user_id);
create index if not exists conversions_created_at_idx on conversions(created_at desc);
