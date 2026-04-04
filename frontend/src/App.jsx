import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Chat />
          </MainLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <MainLayout>
            <Settings />
          </MainLayout>
        }
      />
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
}
