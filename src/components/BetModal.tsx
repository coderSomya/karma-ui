import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Input } from 'pixel-retroui';
import Modal from './Modal';
import { motion } from 'framer-motion';
import type { Outcome } from '../types/contract';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
  marketId: string;
  marketQuestion: string;
  side: Outcome;
}

const BetModal = ({ isOpen, onClose, onSubmit, marketId, marketQuestion, side }: BetModalProps) => {
  const { wallet, contractAddress } = useWallet();
  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState<{ yes: number; no: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCost, setLoadingCost] = useState(false);

  useEffect(() => {
    if (isOpen && wallet && contractAddress && marketId) {
      fetchCost();
    }
  }, [isOpen, wallet, contractAddress, marketId]);

  const fetchCost = async () => {
    if (!wallet || !contractAddress) return;

    setLoadingCost(true);
    try {
      const result = await wallet.contracts.execute(
        contractAddress,
        'get_cost',
        { market_id: marketId }
      );

      console.log('Get cost result:', result);

      // Handle Result response
      let costData = result;
      if (result && typeof result === 'object' && 'txn_result' in result && typeof result.txn_result === 'string') {
        costData = JSON.parse(result.txn_result);
      }

      if (costData && typeof costData === 'object' && 'Ok' in costData) {
        const costs = typeof costData.Ok === 'string' ? JSON.parse(costData.Ok) : costData.Ok;
        // Tuple format [yes_cost, no_cost]
        if (Array.isArray(costs) && costs.length === 2) {
          setCost({ yes: costs[0], no: costs[1] });
        }
      }
    } catch (error) {
      console.error('Failed to fetch cost:', error);
    } finally {
      setLoadingCost(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantityValue = parseInt(quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    onSubmit(quantityValue);
    setTimeout(() => setLoading(false), 1000); // Reset after a delay
  };

  const currentCost = side === 'YES' ? cost?.yes : cost?.no;
  const totalCost = currentCost ? (currentCost * parseInt(quantity || '0')).toFixed(2) : '...';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div 
        className="p-6 border-2 max-w-md w-full"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-lg mb-4">PLACE BET</h2>
        
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
            MARKET
          </p>
          <p className="text-sm mb-4">{marketQuestion}</p>
          
          <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
            VOTING FOR
          </p>
          <div 
            className="inline-block px-3 py-1 border-2 mb-4"
            style={{
              backgroundColor: side === 'YES' ? 'var(--secondary)' : 'var(--primary)',
              borderColor: 'var(--border)',
              color: side === 'YES' ? 'var(--secondary-foreground)' : 'var(--primary-foreground)',
            }}
          >
            <span className="text-xs font-bold">{side}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-2">QUANTITY (SHARES)</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter number of shares"
              className="w-full text-xs"
              min="1"
              step="1"
              required
            />
          </div>

          {cost && (
            <div 
              className="p-3 border-2"
              style={{ 
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex justify-between mb-1">
                <span className="text-xs">COST PER SHARE:</span>
                <span className="text-xs font-bold">{currentCost?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">TOTAL COST:</span>
                <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  {totalCost}
                </span>
              </div>
            </div>
          )}

          {loadingCost && (
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Loading cost...
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="button" 
                onClick={onClose}
                className="text-xs"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                }}
              >
                CANCEL
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit" 
                disabled={loading}
                className="text-xs"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                {loading ? 'PLACING BET...' : 'PLACE BET'}
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default BetModal;

