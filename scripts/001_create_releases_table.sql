-- Create releases table for storing product release schedules
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  product_name text not null unique,
  dev_start_date date not null,
  qa_start_date date not null,
  release_date date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists releases_product_name_idx on public.releases(product_name);

-- Insert initial data for the three products
insert into public.releases (product_name, dev_start_date, qa_start_date, release_date)
values 
  ('SolidStep CCE', '2025-02-01', '2025-02-15', '2025-03-01'),
  ('SolidStep CVE', '2025-02-05', '2025-02-20', '2025-03-10'),
  ('metieye', '2025-02-10', '2025-02-25', '2025-03-15')
on conflict (product_name) do nothing;

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists update_releases_updated_at on public.releases;
create trigger update_releases_updated_at
  before update on public.releases
  for each row
  execute function public.update_updated_at_column();
