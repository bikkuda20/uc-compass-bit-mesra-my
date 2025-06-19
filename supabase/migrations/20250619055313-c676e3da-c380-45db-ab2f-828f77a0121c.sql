
-- Add the uc_entry_no column to the uc_entries table
ALTER TABLE uc_entries 
ADD COLUMN uc_entry_no TEXT;

-- Create an index for better search performance on uc_entry_no
CREATE INDEX idx_uc_entries_uc_entry_no ON uc_entries(uc_entry_no);
