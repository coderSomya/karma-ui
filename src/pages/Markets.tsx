import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Card } from 'pixel-retroui';
import { Outcome } from '../types/contract';
import type { Market } from '../types/contract';
import MarketCard from '../components/MarketCard';
import CreateMarketForm from '../components/CreateMarketForm';
import BetModal from '../components/BetModal';
import { motion } from 'framer-motion';

const Markets = () => {
  const { wallet, isConnected, markets, contractAddress, connectWallet, refreshData, userAddress } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedSide, setSelectedSide] = useState<Outcome | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<Record<string, Outcome>>({});

  const handleVoteClick = (marketId: string, side: Outcome, quantity: number) => {
    const market = markets.find(m => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
      setSelectedSide(side);
      setShowBetModal(true);
    }
  };

  const handleVote = async (quantity: number) => {
    if (!selectedMarket || !selectedSide) return;
    
    const marketId = selectedMarket.id;
    const side = selectedSide;
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
          quantity: quantity,
        }
      );

      console.log('Bet result:', result);

      // Handle Result<null, String> response from contract
      let resultData = result;
      if (result && typeof result === 'object' && 'txn_result' in result && typeof result.txn_result === 'string') {
        resultData = JSON.parse(result.txn_result);
      }
      
      if (resultData && typeof resultData === 'object' && 'Err' in resultData) {
        const errorMsg = typeof resultData.Err === 'string' ? resultData.Err : JSON.stringify(resultData.Err);
        alert(`Error: ${errorMsg}`);
      } else if (resultData && typeof resultData === 'object' && 'Ok' in resultData) {
        alert('Vote submitted successfully!');
        setSelectedOutcome({ ...selectedOutcome, [marketId]: side });
        setShowBetModal(false);
        await refreshData();
      } else {
        // Fallback for direct success
        alert('Vote submitted successfully!');
        setSelectedOutcome({ ...selectedOutcome, [marketId]: side });
        setShowBetModal(false);
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
                  onVote={handleVoteClick}
                  selectedOutcome={selectedOutcome[market.id]}
                  userAddress={userAddress}
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

        {showBetModal && selectedMarket && selectedSide && (
          <BetModal
            isOpen={showBetModal}
            onClose={() => setShowBetModal(false)}
            onSubmit={handleVote}
            marketId={selectedMarket.id}
            marketQuestion={selectedMarket.question}
            side={selectedSide}
          />
        )}
      </div>
    </div>
  );
};

export default Markets;
