-- Enable Realtime for the releases table
ALTER PUBLICATION supabase_realtime ADD TABLE releases;

-- Verify the publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
