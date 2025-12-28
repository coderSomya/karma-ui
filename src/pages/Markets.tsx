import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Card } from 'pixel-retroui';
import { Outcome } from '../types/contract';
import MarketCard from '../components/MarketCard';
import CreateMarketForm from '../components/CreateMarketForm';
import { motion } from 'framer-motion';

const Markets = () => {
  const { wallet, isConnected, markets, contractAddress, connectWallet, refreshData } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<Record<string, Outcome>>({});

  const handleVote = async (marketId: string, side: Outcome) => {
    if (!wallet) {
      alert('Please connect your wallet');
      return;
    }

    if (!contractAddress) {
      alert('Contract address not set');
      return;
    }

    if (!isConnected) {
      await connectWallet();
      return;
    }

    try {
      const result = await wallet.contracts.execute(
        contractAddress,
        'bet',
        {
          market_id: marketId,
          side: side,
        }
      );

      if (result && 'Err' in result) {
        alert(`Error: ${result.Err}`);
      } else {
        alert('Vote submitted successfully!');
        setSelectedOutcome({ ...selectedOutcome, [marketId]: side });
        await refreshData();
      }
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to submit vote. Please try again.');
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
              Please connect your Weil Wallet to view and participate in markets.
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="text-xs"
              style={{
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
              }}
            >
              CREATE MARKET
            </Button>
          </motion.div>
        </motion.div>


        {markets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="p-8 text-center border-2"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                NO MARKETS AVAILABLE YET.
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {markets.map((market, index) => (
              <motion.div
                key={market.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MarketCard
                  market={market}
                  onVote={handleVote}
                  selectedOutcome={selectedOutcome[market.id]}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {showCreateModal && (
          <CreateMarketForm
            onClose={() => setShowCreateModal(false)}
            onSuccess={async () => {
              setShowCreateModal(false);
              await refreshData();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Markets;
