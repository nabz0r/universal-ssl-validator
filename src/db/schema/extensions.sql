-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Configuration TimescaleDB
SELECT add_job('policy_job', '24h');