import React from 'react';

interface EasterEggPageProps {
    onReturn: () => void;
}

const EasterEggPage: React.FC<EasterEggPageProps> = ({ onReturn }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '2rem', fontFamily: 'monospace' }}>Easter Egg</h1>
            <button
                onClick={onReturn}
                style={{
                    padding: '10px 20px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                }}
            >
                Return
            </button>
        </div>
    );
};

export default EasterEggPage;
