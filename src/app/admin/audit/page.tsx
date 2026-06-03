'use client';

import { useState, useEffect } from 'react';

interface AuditEntry {
  id: string;
  actorName: string;
  actorEmail: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
  beforeState: string | null;
  afterState: string | null;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit')
      .then(res => res.json())
      .then(json => {
        if (json.success) setLogs(json.data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.02em' }}>Audit Log</h1>

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(null).map((_, i) => (
                <tr key={i}>
                  {Array(5).fill(null).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: '16px', width: '80%' }} /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="mono" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{log.actorName || 'System'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{log.actorEmail}</div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: 'var(--color-surface-raised)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}>{log.action}</span>
                  </td>
                  <td>
                    <div style={{ textTransform: 'capitalize', fontWeight: 500 }}>{log.entityType}</div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{log.entityId}</div>
                  </td>
                  <td>
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 500 }}>View State</summary>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '16px', background: 'var(--color-bg)', padding: '12px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                        {log.beforeState && (
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Before</div>
                            <pre className="mono" style={{ fontSize: '10px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                              {JSON.stringify(JSON.parse(log.beforeState), null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.afterState && (
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>After</div>
                            <pre className="mono" style={{ fontSize: '10px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--color-accent)' }}>
                              {JSON.stringify(JSON.parse(log.afterState), null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
