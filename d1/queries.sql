-- Reference queries for the pbidocs-subscribers D1 database.
-- Run via the npm scripts in package.json (d1:*), or copy a query into:
--   npx wrangler d1 execute pbidocs-subscribers --remote --command "..."

-- Total subscriber count
SELECT COUNT(*) AS total_subscribers FROM subscribers;

-- Most recent subscribers
SELECT email, created_at FROM subscribers ORDER BY created_at DESC LIMIT 20;

-- Subscriber signups per day
SELECT date(created_at) AS day, COUNT(*) AS signups
FROM subscribers
GROUP BY day
ORDER BY day DESC;

-- Feedback summary per page: helpful vs not helpful, and a helpful %
SELECT
  page,
  SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) AS helpful_votes,
  SUM(CASE WHEN helpful = 0 THEN 1 ELSE 0 END) AS not_helpful_votes,
  COUNT(*) AS total_votes,
  ROUND(100.0 * SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) AS helpful_pct
FROM page_feedback
GROUP BY page
ORDER BY total_votes DESC;

-- Pages with the most "not helpful" votes (the actionable one - fix these first)
SELECT
  page,
  SUM(CASE WHEN helpful = 0 THEN 1 ELSE 0 END) AS not_helpful_votes,
  COUNT(*) AS total_votes
FROM page_feedback
GROUP BY page
HAVING not_helpful_votes > 0
ORDER BY not_helpful_votes DESC
LIMIT 20;

-- Most recent feedback events
SELECT page, helpful, created_at FROM page_feedback ORDER BY created_at DESC LIMIT 20;
