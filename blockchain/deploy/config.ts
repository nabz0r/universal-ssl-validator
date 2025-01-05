export default {
  // Configuration réseau
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 'auto'
    },
    testnet: {
      url: process.env.TESTNET_RPC_URL || 'https://goerli.infura.io/v3/your-project-id',
      chainId: 5,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 'auto'
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    }
  },

  // Configuration du contrat
  contract: {
    name: 'CertificateAudit',
    symbol: 'CERT',
    version: '1.0.0',
    initialAdmins: process.env.INITIAL_ADMINS ? process.env.INITIAL_ADMINS.split(',') : []
  },

  // Configuration de sécurité
  security: {
    multisigThreshold: 2,
    timelock: 24 * 60 * 60, // 24 heures en secondes
    upgradeDelay: 48 * 60 * 60 // 48 heures en secondes
  },

  // Configuration vérification
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY
    }
  }
};