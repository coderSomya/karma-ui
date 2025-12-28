import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Card } from 'pixel-retroui';
import { TextArea } from 'pixel-retroui';
import { motion } from 'framer-motion';

const Profile = () => {
  const { wallet, isConnected, user, userAddress, contractAddress, connectWallet, refreshData } = useWallet();
  const [bio, setBio] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && contractAddress && wallet && userAddress) {
      checkUserRegistration();
    }
  }, [isConnected, contractAddress, wallet, userAddress]);

  const checkUserRegistration = async () => {
    if (!wallet || !contractAddress || !userAddress) return;

    try {
      const userResult = await wallet.contracts.execute(
        contractAddress,
        'get_user',
        { id: userAddress }
      );
      
      if (userResult && typeof userResult === 'object' && 'id' in userResult) {
        setIsRegistering(false);
      } else {
        setIsRegistering(true);
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      setIsRegistering(true);
    }
  };

  const handleRegister = async () => {
    if (!wallet || !contractAddress || !bio.trim()) {
      alert('Please fill in your bio');
      return;
    }

    setLoading(true);
    try {
      await wallet.contracts.execute(
        contractAddress,
        'register_user',
        { bio: bio.trim() }
      );
      
      alert('Registration successful!');
      setIsRegistering(false);
      await refreshData();
      setBio('');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className="p-8 max-w-md w-full border-2"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h1 className="text-xl mb-4">CONNECT YOUR WALLET</h1>
            <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Please connect your Weil Wallet to view your profile.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={connectWallet} 
                className="w-full text-xs"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                CONNECT WALLET
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className="p-8 max-w-md w-full border-2"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h1 className="text-xl mb-4">REGISTER</h1>
            <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Create your profile to start participating in prediction markets.
            </p>
            
            <div className="mb-4">
              <label className="block mb-2 text-xs">BIO</label>
              <TextArea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full text-xs"
              />
            </div>

            <motion.div
              whileHover={{ scale: loading || !bio.trim() ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleRegister}
                disabled={loading || !bio.trim()}
                className="w-full text-xs"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                {loading ? 'REGISTERING...' : 'REGISTER'}
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className="p-8 mb-6 border-2"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h1 className="text-xl md:text-2xl mb-6">PROFILE</h1>
            
            {user ? (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <label className="block text-xs mb-2">USER ID</label>
                  <p className="text-xs break-all" style={{ color: 'var(--muted-foreground)' }}>{user.id}</p>
                </div>
                
                <div>
                  <label className="block text-xs mb-2">BIO</label>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{user.bio}</p>
                </div>
                
                <div>
                  <label className="block text-xs mb-2">BALANCE</label>
                  <motion.p 
                    className="text-xl"
                    style={{ color: 'var(--secondary)' }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {user.balance.toFixed(2)}
                  </motion.p>
                </div>
                
                <div>
                  <label className="block text-xs mb-2">MARKETS PARTICIPATED</label>
                  <motion.p 
                    className="text-lg"
                    style={{ color: 'var(--primary)' }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    {user.history.length}
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <motion.p 
                className="text-xs"
                style={{ color: 'var(--muted-foreground)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                LOADING PROFILE...
              </motion.p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
