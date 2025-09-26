import GitHubDropdown from './GitHubDropdown';

function Header({ onSyncData, syncStatus, lastSyncTime, onTitleClick }) {

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={onTitleClick}
                className="text-xl font-bold text-gray-900 sm:text-2xl hover:text-blue-600 transition-colors cursor-pointer focus:outline-none focus:text-blue-600"
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