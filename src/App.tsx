import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Markets from './pages/Markets';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
