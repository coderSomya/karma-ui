import { Link } from 'react-router-dom';
import { Card, Button } from 'pixel-retroui';
import { motion } from 'framer-motion';

const Home = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-12 md:pt-20">
        <motion.div 
          className="w-full text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-[10rem] md:text-[14rem] lg:text-[18rem] leading-none"
              style={{ 
                fontSize: '120px',
                color: 'var(--primary)',
                fontWeight: 'bold',
                textShadow: '6px 6px 0px var(--border)',
                transform: 'rotate(3deg)',
              }}
              variants={itemVariants}
            >
              कर्म
            </motion.h1>
            <motion.img
              src="/balance.png"
              alt="Balance scale"
              className="w-20 h-20 md:w-22 md:h-22 lg:w-25 lg:h-25 object-contain"
              style={{
                transform: 'rotate(-3deg)',
              }}
              variants={itemVariants}
            />
          </motion.div>
          <motion.p 
            className="text-sm md:text-base"
            style={{ color: 'var(--muted-foreground)' }}
            variants={itemVariants}
          >
            DECENTRALIZED PREDICTION MARKETS
          </motion.p>
        </motion.div>

        <motion.div 
          className="max-w-4xl w-full"
          variants={containerVariants}
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            variants={itemVariants}
          >
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
              <h2 className="text-lg mb-4">VIEW MARKETS</h2>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Browse all available prediction markets and place your bets
              </p>
              <Link to="/markets">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="w-full text-xs"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    EXPLORE MARKETS
                  </Button>
                </motion.div>
              </Link>
            </Card>
          </motion.div>

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
              <h2 className="text-lg mb-4">YOUR PROFILE</h2>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                View your performance, balance, and betting history
              </p>
              <Link to="/profile">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="w-full text-xs"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      color: 'var(--secondary-foreground)',
                    }}
                  >
                    VIEW PROFILE
                  </Button>
                </motion.div>
              </Link>
            </Card>
          </motion.div>
        </motion.div>


        </motion.div>
      </div>
    </div>
  );
};

export default Home;
