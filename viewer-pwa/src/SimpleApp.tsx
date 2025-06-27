import { useEffect, useState } from 'react';

// Simple test data
const testBoxes = [
  {
    set_id: "test-box-1",
    title: "Test Box 1",
    description: "A simple test box to verify the viewer works",
    card_count: 3
  },
  {
    set_id: "test-box-2", 
    title: "Test Box 2",
    description: "Another test box",
    card_count: 2
  }
];

function SimpleApp() {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setBoxes(testBoxes);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Boxiii Viewer</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>Boxiii Viewer - Simple Test</h1>
      <p>Found {boxes.length} boxes</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {boxes.map(box => (
          <div 
            key={box.set_id}
            style={{ 
              border: '1px solid #333', 
              borderRadius: '8px', 
              padding: '15px',
              backgroundColor: '#2a2a2a'
            }}
          >
            <h3>{box.title}</h3>
            <p>{box.description}</p>
            <p>Cards: {box.card_count}</p>
            <button 
              style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => alert(`Opening ${box.title}`)}
            >
              Open Box
            </button>
          </div>
        ))}
      </div>

      <hr style={{ margin: '40px 0' }} />

      <h2>Debug Info:</h2>
      <pre style={{ backgroundColor: '#333', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
        {JSON.stringify({
          boxCount: boxes.length,
          currentUrl: window.location.href,
          userAgent: navigator.userAgent.substring(0, 50) + '...'
        }, null, 2)}
      </pre>
    </div>
  );
}

export default SimpleApp;