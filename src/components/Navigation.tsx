import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Button } from 'pixel-retroui';
import { motion } from 'framer-motion';

const Navigation = () => {
  const location = useLocation();
  const { isConnected, userAddress, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav 
      className="border-b-2 sticky top-0 z-50" 
      style={{ 
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/markets"
                  className="px-4 py-2 text-xs border-2 transition-all"
                  style={{
                    backgroundColor: location.pathname === '/markets' ? 'var(--primary)' : 'transparent',
                    color: location.pathname === '/markets' ? 'var(--primary-foreground)' : 'var(--foreground)',
                    borderColor: 'var(--border)',
                  }}
                >
                  MARKETS
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/profile"
                  className="px-4 py-2 text-xs border-2 transition-all"
                  style={{
                    backgroundColor: location.pathname === '/profile' ? 'var(--primary)' : 'transparent',
                    color: location.pathname === '/profile' ? 'var(--primary-foreground)' : 'var(--foreground)',
                    borderColor: 'var(--border)',
                  }}
                >
                  PROFILE
                </Link>
              </motion.div>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && userAddress && typeof userAddress === 'string' && (
              <motion.span 
                className="text-xs px-3 py-1 border-2"
                style={{ 
                  color: 'var(--muted-foreground)',
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--muted)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </motion.span>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isConnected ? (
                <Button 
                  onClick={disconnectWallet}
                  className="text-xs"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                  }}
                >
                  DISCONNECT
                </Button>
              ) : (
                <Button 
                  onClick={connectWallet}
                  className="text-xs"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  CONNECT
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
