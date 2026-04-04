import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
