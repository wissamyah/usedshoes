import AppProvider from './context/AppProvider';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App
