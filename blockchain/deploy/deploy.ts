import { ethers, upgrades } from 'hardhat';
import config from './config';

async function main() {
  console.log('Déploiement du système d\'audit blockchain...');

  // Récupération du wallet déployeur
  const [deployer] = await ethers.getSigners();
  console.log('Déploiement depuis le compte:', deployer.address);

  // Vérification du solde
  const balance = await deployer.getBalance();
  console.log('Solde du compte:', ethers.utils.formatEther(balance));

  // Déploiement du contrat
  console.log('Déploiement du contrat CertificateAudit...');
  const CertificateAudit = await ethers.getContractFactory('CertificateAudit');
  
  const contract = await upgrades.deployProxy(CertificateAudit, [
    config.contract.name,
    config.contract.symbol,
    config.contract.version,
    config.security.multisigThreshold,
    config.security.timelock,
    config.contract.initialAdmins
  ]);

  await contract.deployed();
  console.log('Contrat déployé à l\'adresse:', contract.address);

  // Configuration du contrat
  console.log('Configuration du contrat...');
  const tx = await contract.initialize(
    config.security.upgradeDelay,
    { gasLimit: 500000 }
  );
  await tx.wait();

  // Vérification du contrat
  if (process.env.ETHERSCAN_API_KEY) {
    console.log('Vérification du contrat sur Etherscan...');
    await run('verify:verify', {
      address: contract.address,
      constructorArguments: []
    });
  }

  console.log('Déploiement terminé!');
  
  // Affichage des informations de déploiement
  console.log('\nInformations de déploiement:');
  console.log('- Contrat:', config.contract.name);
  console.log('- Adresse:', contract.address);
  console.log('- Version:', config.contract.version);
  console.log('- Network:', network.name);
  console.log('- Block:', await ethers.provider.getBlockNumber());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
