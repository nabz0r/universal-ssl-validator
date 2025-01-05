-- Logs détaillés
CREATE TABLE service_logs (
    id BIGSERIAL,
    service_id VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    trace_id VARCHAR(100),
    timestamp TIMESTAMPTZ NOT NULL
);

SELECT create_hypertable('service_logs', 'timestamp');
CREATE INDEX idx_service_logs ON service_logs (service_id, timestamp DESC);
CREATE INDEX idx_service_logs_level ON service_logs (level, timestamp DESC);
CREATE INDEX idx_service_logs_trace ON service_logs (trace_id);

-- Alertes
CREATE TABLE alerts (
    id BIGSERIAL,
    severity VARCHAR(20) NOT NULL,
    service_id VARCHAR(50),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    metadata JSONB
);

CREATE INDEX idx_alerts_status ON alerts (status, created_at DESC);
CREATE INDEX idx_alerts_service ON alerts (service_id, created_at DESC);

-- Audit Trail
CREATE TABLE audit_logs (
    id BIGSERIAL,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    changes JSONB,
    timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_audit_logs ON audit_logs (resource_type, resource_id, timestamp DESC);