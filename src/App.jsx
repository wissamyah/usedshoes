import AppProvider from './context/AppProvider';
import Layout from './components/Layout/Layout';
import DataSync from './components/DataSync';
import ErrorBoundary from './components/UI/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ErrorBoundary>
          <DataSync />
        </ErrorBoundary>
        <ErrorBoundary>
          <Layout />
        </ErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App
