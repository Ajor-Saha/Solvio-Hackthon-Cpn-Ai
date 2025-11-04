-- SQL script to update existing draft/proposed posts to visible statuses
-- Run this in your PostgreSQL database to make existing posts visible in StarterFeed

-- Update Jobs from 'draft' to 'active'
UPDATE tbl_job_posting
SET status = 'active'
WHERE status = 'draft' AND deleted_at IS NULL;

-- Update Competitions from 'draft' to 'active'
UPDATE tbl_competition
SET status = 'active'
WHERE status = 'draft' AND deleted_at IS NULL;

-- Update Achievements from 'draft' to 'published'
UPDATE tbl_achievement
SET status = 'published'
WHERE status = 'draft' AND deleted_at IS NULL;

-- Update Higher Studies from 'draft' to 'active'
UPDATE tbl_higher_study
SET status = 'active'
WHERE status = 'draft' AND deleted_at IS NULL;

-- Update Research from 'proposed' to 'published'
UPDATE tbl_research
SET status = 'published'
WHERE status = 'proposed' AND deleted_at IS NULL;

-- Check the results - count posts by status after update
SELECT 'Jobs' as type, status, COUNT(*) as count
FROM tbl_job_posting
WHERE deleted_at IS NULL
GROUP BY status
UNION ALL
SELECT 'Competitions' as type, status, COUNT(*) as count
FROM tbl_competition
WHERE deleted_at IS NULL
GROUP BY status
UNION ALL
SELECT 'Achievements' as type, status, COUNT(*) as count
FROM tbl_achievement
WHERE deleted_at IS NULL
GROUP BY status
UNION ALL
SELECT 'Higher Studies' as type, status, COUNT(*) as count
FROM tbl_higher_study
WHERE deleted_at IS NULL
GROUP BY status
UNION ALL
SELECT 'Research' as type, status, COUNT(*) as count
FROM tbl_research
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY type, status;
