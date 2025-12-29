import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Input } from 'pixel-retroui';
import Modal from './Modal';
import { motion } from 'framer-motion';

interface CreateMarketFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMarketForm = ({ onClose, onSuccess }: CreateMarketFormProps) => {
  const { wallet, contractAddress } = useWallet();
  const [question, setQuestion] = useState('');
  const [liquidity, setLiquidity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      alert('Please connect your wallet');
      return;
    }

    if (!contractAddress) {
      alert('Contract address not set');
      return;
    }

    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const liquidityValue = parseFloat(liquidity);
    if (isNaN(liquidityValue) || liquidityValue <= 0) {
      alert('Please enter a valid liquidity amount');
      return;
    }

    setLoading(true);
    try {
      const result = await wallet.contracts.execute(
        contractAddress,
        'add_market',
        {
          question: question.trim(),
          liquidity: liquidityValue,
        }
      );

      console.log('Add market result:', result);

      // Handle potential Result type response
      let resultData = result;
      if (result && typeof result === 'object' && 'txn_result' in result && typeof result.txn_result === 'string') {
        resultData = JSON.parse(result.txn_result);
      }
      
      if (resultData && typeof resultData === 'object' && 'Err' in resultData) {
        const errorMsg = typeof resultData.Err === 'string' ? resultData.Err : JSON.stringify(resultData.Err);
        alert(`Failed to create market: ${errorMsg}`);
        return;
      }

      alert('Market created successfully!');
      setQuestion('');
      setLiquidity('');
      onSuccess();
    } catch (error) {
      console.error('Create market error:', error);
      alert('Failed to create market. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <motion.div 
        className="p-6 border-2"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-lg mb-4">CREATE PREDICTION MARKET</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-2">QUESTION</label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Will Bitcoin reach $100k by 2025?"
              className="w-full text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs mb-2">INITIAL LIQUIDITY</label>
            <Input
              type="number"
              value={liquidity}
              onChange={(e) => setLiquidity(e.target.value)}
              placeholder="e.g., 1000"
              className="w-full text-xs"
              step="0.01"
              min="0"
              required
            />
          </div>

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
                {loading ? 'CREATING...' : 'CREATE MARKET'}
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default CreateMarketForm;
