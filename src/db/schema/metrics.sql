-- Métriques des services
CREATE TABLE service_metrics (
    id BIGSERIAL,
    service_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_time FLOAT,
    cpu_usage FLOAT,
    memory_usage FLOAT,
    error TEXT,
    timestamp TIMESTAMPTZ NOT NULL
);

SELECT create_hypertable('service_metrics', 'timestamp');
CREATE INDEX idx_service_metrics_service ON service_metrics (service_id, timestamp DESC);

-- Métriques de validation SSL
CREATE TABLE certificate_metrics (
    id BIGSERIAL,
    certificate_id VARCHAR(100) NOT NULL,
    validation_time FLOAT,
    validation_result BOOLEAN,
    error_type VARCHAR(50),
    error_details TEXT,
    quantum_safe_status BOOLEAN,
    blockchain_verification BOOLEAN,
    ai_confidence FLOAT,
    timestamp TIMESTAMPTZ NOT NULL
);

SELECT create_hypertable('certificate_metrics', 'timestamp');
CREATE INDEX idx_cert_metrics ON certificate_metrics (certificate_id, timestamp DESC);

-- Métriques système
CREATE TABLE system_metrics (
    id BIGSERIAL,
    host VARCHAR(100) NOT NULL,
    cpu_usage FLOAT,
    memory_used BIGINT,
    memory_total BIGINT,
    disk_used BIGINT,
    disk_total BIGINT,
    network_in BIGINT,
    network_out BIGINT,
    timestamp TIMESTAMPTZ NOT NULL
);

SELECT create_hypertable('system_metrics', 'timestamp');
CREATE INDEX idx_system_metrics ON system_metrics (host, timestamp DESC);

-- Agrégations continues
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', timestamp) AS bucket,
    service_id,
    COUNT(*) as total_requests,
    AVG(response_time) as avg_response_time,
    MIN(response_time) as min_response_time,
    MAX(response_time) as max_response_time,
    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
FROM service_metrics
GROUP BY bucket, service_id;

-- Politique de rétention
SELECT add_retention_policy('service_metrics', INTERVAL '30 days');
SELECT add_retention_policy('certificate_metrics', INTERVAL '90 days');
SELECT add_retention_policy('system_metrics', INTERVAL '30 days');