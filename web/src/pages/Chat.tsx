import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f0f9ff, #ffffff, #f0f9ff)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '20px 30px',
          borderRadius: '15px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#0f172a',
              margin: 0
            }}>
              Chat Room
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' }}>
              Space ID: {id}
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>💬</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '15px'
          }}>
            Chat Coming Soon
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            maxWidth: '500px'
          }}>
            This is where your encrypted messages will appear. Replace this with your actual Chat component.
          </p>
        </div>
      </div>
    </div>
  );
}