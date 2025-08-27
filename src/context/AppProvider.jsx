import { DataProvider } from './DataContext';
import { GitHubProvider } from './GitHubContext';
import { UIProvider } from './UIContext';

/**
 * Combined context provider that wraps all app contexts
 * Order matters: UI → GitHub → Data (Data depends on GitHub, GitHub is independent, UI is base layer)
 */
function AppProvider({ children }) {
  return (
    <UIProvider>
      <GitHubProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </GitHubProvider>
    </UIProvider>
  );
}

export default AppProvider;