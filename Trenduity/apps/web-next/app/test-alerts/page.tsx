'use client';

import { useState } from 'react';

/**
 * 간단한 테스트 페이지
 * BFF API 직접 테스트
 */

export default function TestAlertsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = 'http://localhost:8000/v1/alerts?family_id=test&unread_only=false&limit=5';
      console.log('Fetching:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Alerts API 테스트</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#ccc' : '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        {loading ? '로딩 중...' : 'API 호출 테스트'}
      </button>

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>응답 결과:</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '500px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', color: '#666' }}>
        <h3>직접 확인:</h3>
        <a 
          href="http://localhost:8000/v1/alerts?family_id=test&unread_only=false&limit=5"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#007AFF' }}
        >
          http://localhost:8000/v1/alerts?family_id=test&unread_only=false&limit=5
        </a>
      </div>

      <div style={{ marginTop: '10px', color: '#666' }}>
        <a 
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#007AFF' }}
        >
          BFF API 문서 (Swagger)
        </a>
      </div>
    </div>
  );
}
