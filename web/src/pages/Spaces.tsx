import React from 'react';
import { useAuthStore } from '../store/authStore';

export function Spaces() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f0f9ff, #ffffff, #f0f9ff)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '20px 30px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #0ea5e9, #0369a1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            4Space
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '2px solid #0ea5e9',
            color: '#0ea5e9',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '15px'
          }}>
            Welcome to 4Space!
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto 30px'
          }}>
            You're successfully logged in! This is your home page where your spaces will appear.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '40px'
          }}>
            {/* Sample cards */}
            <div style={{
              padding: '30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>💼</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Work Space
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>
                Coming soon - Your professional workspace
              </p>
            </div>

            <div style={{
              padding: '30px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>❤️</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Personal
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>
                Coming soon - Your private sanctuary
              </p>
            </div>

            <div style={{
              padding: '30px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '15px',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎨</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Creative
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>
                Coming soon - Your creative hub
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: '#f0f9ff',
            borderRadius: '10px',
            border: '2px dashed #0ea5e9'
          }}>
            <p style={{ color: '#0369a1', fontWeight: 600, margin: 0 }}>
              ✨ Your authentication is working perfectly! Replace this with your actual Spaces component.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}