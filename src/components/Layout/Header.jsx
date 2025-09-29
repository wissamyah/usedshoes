import GitHubDropdown from './GitHubDropdown';

function Header({ onSyncData, syncStatus, lastSyncTime, onTitleClick }) {

  return (
    <header style={{
      backgroundColor: '#2a2a2a',
      borderBottom: '1px solid #404040',
      backdropFilter: 'blur(10px)',
      background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(28, 28, 28, 0.95) 100%)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={onTitleClick}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#ebebeb',
                  transition: 'color 0.2s',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                onMouseLeave={(e) => e.target.style.color = '#ebebeb'}
                onFocus={(e) => e.target.style.color = '#60a5fa'}
                onBlur={(e) => e.target.style.color = '#ebebeb'}
              >
                Friperie
              </button>
            </div>
          </div>

          {/* GitHub Dropdown with Sync */}
          <GitHubDropdown
            onSyncData={onSyncData}
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;