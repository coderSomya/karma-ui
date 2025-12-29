import { Card, Button } from 'pixel-retroui';
import type { Market } from '../types/contract';
import { Outcome } from '../types/contract';
import { motion } from 'framer-motion';

interface MarketCardProps {
  market: Market;
  onVote: (marketId: string, side: Outcome, quantity: number) => void;
  selectedOutcome?: Outcome;
  userAddress?: string | null;
}

const MarketCard = ({ market, onVote, selectedOutcome, userAddress }: MarketCardProps) => {
  const totalVotes = market.num_yes + market.num_no;
  const yesPercentage = totalVotes > 0 ? (market.num_yes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (market.num_no / totalVotes) * 100 : 0;

  const isResolved = market.resolved;
  // Check if the CURRENT user has voted by looking up their address in the voters map
  const userVote = userAddress && market.voters && market.voters[userAddress]
    ? market.voters[userAddress].side
    : selectedOutcome;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className="p-6 border-2 h-full"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mb-4">
          <h3 className="text-sm mb-2 leading-tight">{market.question}</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            CREATED BY: {market.creator.slice(0, 8)}...
          </p>
        </div>

      {isResolved ? (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="p-3 border-2"
            style={{ 
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--primary)' }}>
              RESOLVED: {market.outcome === Outcome.YES ? 'YES' : 'NO'}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="mb-4 space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs">YES</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {market.num_yes} ({yesPercentage.toFixed(1)}%)
              </span>
            </div>
            <div 
              className="w-full h-4 border-2"
              style={{ 
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
              }}
            >
              <motion.div
                className="h-full border-r-2"
                style={{ 
                  backgroundColor: 'var(--secondary)',
                  borderColor: 'var(--border)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${yesPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs">NO</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {market.num_no} ({noPercentage.toFixed(1)}%)
              </span>
            </div>
            <div 
              className="w-full h-4 border-2"
              style={{ 
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
              }}
            >
              <motion.div
                className="h-full border-r-2"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  borderColor: 'var(--border)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${noPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      )}

      {!isResolved && (
        <div className="flex gap-2">
          <motion.div
            className="flex-1"
            whileHover={{ scale: userVote !== Outcome.YES ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => onVote(market.id, Outcome.YES, 1)}
              className="w-full text-xs"
              disabled={userVote === Outcome.YES}
              style={{
                backgroundColor: userVote === Outcome.YES 
                  ? 'var(--secondary)' 
                  : 'var(--accent)',
                color: userVote === Outcome.YES 
                  ? 'var(--secondary-foreground)' 
                  : 'var(--accent-foreground)',
                opacity: userVote === Outcome.YES ? 0.7 : 1,
              }}
            >
              {userVote === Outcome.YES ? '✓ VOTED YES' : 'VOTE YES'}
            </Button>
          </motion.div>
          <motion.div
            className="flex-1"
            whileHover={{ scale: userVote !== Outcome.NO ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => onVote(market.id, Outcome.NO, 1)}
              className="w-full text-xs"
              disabled={userVote === Outcome.NO}
              style={{
                backgroundColor: userVote === Outcome.NO 
                  ? 'var(--primary)' 
                  : 'var(--accent)',
                color: userVote === Outcome.NO 
                  ? 'var(--primary-foreground)' 
                  : 'var(--accent-foreground)',
                opacity: userVote === Outcome.NO ? 0.7 : 1,
              }}
            >
              {userVote === Outcome.NO ? '✓ VOTED NO' : 'VOTE NO'}
            </Button>
          </motion.div>
        </div>
      )}

      <div 
        className="mt-4 pt-4 border-t-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          LIQUIDITY: {market.liquidity.toFixed(2)} | TOTAL: {totalVotes}
        </p>
      </div>
      </Card>
    </motion.div>
  );
};

export default MarketCard;
