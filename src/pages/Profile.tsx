import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Card, Input } from 'pixel-retroui';
import { TextArea } from 'pixel-retroui';
import { motion } from 'framer-motion';
import { Outcome } from '../types/contract';

const Profile = () => {
  const { wallet, isConnected, user, userAddress, contractAddress, connectWallet, refreshData, markets } = useWallet();
  const [bio, setBio] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [activeTab, setActiveTab] = useState<'participated' | 'created'>('participated');
  const [resolvingMarket, setResolvingMarket] = useState<string | null>(null);

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
      
      console.log('Get user result:', userResult);
      
      // Handle Result<User, Error> response from contract
      let user = null;
      if (userResult && typeof userResult === 'object') {
        // Check if txn_result exists (Weil Wallet response format)
        let resultData = userResult;
        if ('txn_result' in userResult && typeof userResult.txn_result === 'string') {
          resultData = JSON.parse(userResult.txn_result);
        }
        
        if ('Ok' in resultData) {
          // Parse the JSON string inside Ok
          const userData = typeof resultData.Ok === 'string' 
            ? JSON.parse(resultData.Ok) 
            : resultData.Ok;
          user = userData;
        } else if ('id' in resultData) {
          // Direct user object (fallback)
          user = resultData;
        }
      }
      
      if (user && user.id) {
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
      const result = await wallet.contracts.execute(
        contractAddress,
        'register_user',
        { bio: bio.trim() }
      );
      
      console.log('Register result:', result);
      
      // Handle potential Result type response
      let resultData = result;
      if (result && typeof result === 'object' && 'txn_result' in result && typeof result.txn_result === 'string') {
        resultData = JSON.parse(result.txn_result);
      }
      
      if (resultData && typeof resultData === 'object' && 'Err' in resultData) {
        const errorMsg = typeof resultData.Err === 'string' ? resultData.Err : JSON.stringify(resultData.Err);
        alert(`Registration failed: ${errorMsg}`);
        return;
      }
      
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

  const handleDeposit = async () => {
    if (!wallet || !contractAddress) {
      alert('Wallet not connected');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setDepositing(true);
    try {
      const result = await wallet.contracts.execute(
        contractAddress,
        'deposit',
        { amount: amount }
      );
      
      console.log('Deposit result:', result);
      
      // Handle potential Result type response
      let resultData = result;
      if (result && typeof result === 'object' && 'txn_result' in result && typeof result.txn_result === 'string') {
        resultData = JSON.parse(result.txn_result);
      }
      
      if (resultData && typeof resultData === 'object' && 'Err' in resultData) {
        const errorMsg = typeof resultData.Err === 'string' ? resultData.Err : JSON.stringify(resultData.Err);
        alert(`Deposit failed: ${errorMsg}`);
        return;
      }
      
      alert('Deposit successful!');
      setDepositAmount('');
      await refreshData();
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to deposit. Please try again.');
    } finally {
      setDepositing(false);
    }
  };

  const handleResolve = async (marketId: string, outcome: Outcome) => {
    if (!wallet || !contractAddress) {
      alert('Wallet not connected');
      return;
    }

    const confirmMsg = `Are you sure you want to resolve this market as ${outcome}? This action cannot be undone.`;
    if (!confirm(confirmMsg)) {
      return;
    }

    setResolvingMarket(marketId);
    try {
      const result = await wallet.contracts.execute(
        contractAddress,
        'resolve',
        { market_id: marketId }
      );
      
      console.log('Resolve result:', result);
      
      // Handle Result<null, String> response from contract
      let resultData = result;
      if (result && typeof result === 'object' && 'txn_result' in result && typeof result.txn_result === 'string') {
        resultData = JSON.parse(result.txn_result);
      }
      
      if (resultData && typeof resultData === 'object' && 'Err' in resultData) {
        const errorMsg = typeof resultData.Err === 'string' ? resultData.Err : JSON.stringify(resultData.Err);
        alert(`Resolve failed: ${errorMsg}`);
        return;
      }
      
      alert('Market resolved successfully!');
      await refreshData();
    } catch (error) {
      console.error('Resolve error:', error);
      alert('Failed to resolve market. Please try again.');
    } finally {
      setResolvingMarket(null);
    }
  };

  // Filter markets
  const participatedMarkets = user ? markets.filter(market => user.history.includes(market.id)) : [];
  const createdMarkets = userAddress ? markets.filter(market => market.creator === userAddress) : [];

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

        {user && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card 
                className="p-8 border-2 mb-6"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <h2 className="text-xl mb-4">DEPOSIT FUNDS</h2>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Add funds to your account to participate in prediction markets.
                </p>
                
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex-1 text-xs"
                    step="0.01"
                    min="0"
                  />
                  <motion.div
                    whileHover={{ scale: depositing || !depositAmount ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleDeposit}
                      disabled={depositing || !depositAmount}
                      className="text-xs"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                      }}
                    >
                      {depositing ? 'DEPOSITING...' : 'DEPOSIT'}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card 
                className="p-8 border-2"
                style={{ 
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <h2 className="text-xl mb-6">MY MARKETS</h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b-2" style={{ borderColor: 'var(--border)' }}>
                  <motion.button
                    onClick={() => setActiveTab('participated')}
                    className="pb-3 px-4 text-xs relative"
                    style={{
                      color: activeTab === 'participated' ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    PARTICIPATED ({participatedMarkets.length})
                    {activeTab === 'participated' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: 'var(--primary)' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab('created')}
                    className="pb-3 px-4 text-xs relative"
                    style={{
                      color: activeTab === 'created' ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    CREATED ({createdMarkets.length})
                    {activeTab === 'created' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: 'var(--primary)' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'participated' ? (
                    participatedMarkets.length > 0 ? (
                      <div className="space-y-4">
                        {participatedMarkets.map((market) => (
                          <motion.div
                            key={market.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 border-2"
                            style={{
                              backgroundColor: 'var(--accent)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <h3 className="text-sm mb-3">{market.question}</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>YOUR VOTE</p>
                                <p className="text-xs" style={{ 
                                  color: market.voters[userAddress!]?.side === Outcome.YES ? 'var(--secondary)' : 'var(--primary)' 
                                }}>
                                  {market.voters[userAddress!]?.side || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>STATUS</p>
                                <p className="text-xs">
                                  {market.resolved ? (
                                    <span style={{ color: 'var(--primary)' }}>
                                      RESOLVED: {market.outcome}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--muted-foreground)' }}>ACTIVE</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              <span>YES: {market.num_yes}</span>
                              <span>NO: {market.num_no}</span>
                              <span>LIQUIDITY: {market.liquidity.toFixed(2)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.p 
                        className="text-xs text-center py-8"
                        style={{ color: 'var(--muted-foreground)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        YOU HAVEN'T PARTICIPATED IN ANY MARKETS YET.
                      </motion.p>
                    )
                  ) : (
                    createdMarkets.length > 0 ? (
                      <div className="space-y-4">
                        {createdMarkets.map((market) => (
                          <motion.div
                            key={market.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 border-2"
                            style={{
                              backgroundColor: 'var(--accent)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <h3 className="text-sm mb-3">{market.question}</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>VOTES</p>
                                <p className="text-xs">YES: {market.num_yes} | NO: {market.num_no}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>STATUS</p>
                                <p className="text-xs">
                                  {market.resolved ? (
                                    <span style={{ color: 'var(--primary)' }}>
                                      RESOLVED: {market.outcome}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--muted-foreground)' }}>ACTIVE</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                <span>LIQUIDITY: {market.liquidity.toFixed(2)}</span>
                                <span>VOTERS: {Object.keys(market.voters).length}</span>
                              </div>
                              
                              {!market.resolved && (
                                <div className="flex gap-2">
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      onClick={() => handleResolve(market.id, Outcome.YES)}
                                      disabled={resolvingMarket === market.id}
                                      className="text-xs px-3 py-1"
                                      style={{
                                        backgroundColor: 'var(--secondary)',
                                        color: 'var(--secondary-foreground)',
                                      }}
                                    >
                                      RESOLVE YES
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      onClick={() => handleResolve(market.id, Outcome.NO)}
                                      disabled={resolvingMarket === market.id}
                                      className="text-xs px-3 py-1"
                                      style={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'var(--primary-foreground)',
                                      }}
                                    >
                                      RESOLVE NO
                                    </Button>
                                  </motion.div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.p 
                        className="text-xs text-center py-8"
                        style={{ color: 'var(--muted-foreground)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        YOU HAVEN'T CREATED ANY MARKETS YET.
                      </motion.p>
                    )
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
