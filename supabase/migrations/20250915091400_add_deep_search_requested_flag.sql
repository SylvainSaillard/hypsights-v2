-- Add deep search request tracking to briefs table
ALTER TABLE public.briefs 
ADD COLUMN deep_search_requested boolean NOT NULL DEFAULT false,
ADD COLUMN deep_search_requested_at timestamp with time zone;

-- Add comment to explain the columns
COMMENT ON COLUMN public.briefs.deep_search_requested IS 'Flag indicating if a deep search request has been submitted for this brief';
COMMENT ON COLUMN public.briefs.deep_search_requested_at IS 'Timestamp when the deep search request was submitted';

-- Create index for efficient querying of deep search requests
CREATE INDEX idx_briefs_deep_search_requested ON public.briefs(deep_search_requested, deep_search_requested_at);
