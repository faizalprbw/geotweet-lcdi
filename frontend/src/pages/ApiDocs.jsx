import React from 'react'
export default function ApiDocs() {
    return (
        <div className="card">
            <h3>API Documentation</h3>
            <iframe src="/api/docs/" style={{ width: '100%', height: '75vh', border: '1px solid #eee', borderRadius: '12px' }} title="swagger" />
        </div>
    )
}