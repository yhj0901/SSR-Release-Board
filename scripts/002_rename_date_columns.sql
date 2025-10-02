-- Rename columns to reflect end dates instead of start dates
alter table public.releases 
  rename column dev_start_date to dev_end_date;

alter table public.releases 
  rename column qa_start_date to qa_end_date;
