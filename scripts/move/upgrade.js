require('dotenv').config();
const cli = require('@aptos-labs/ts-sdk/dist/common/cli/index.js');
const aptosSDK = require('@aptos-labs/ts-sdk');

async function publish() {
  const aptosConfig = new aptosSDK.AptosConfig({
    network: process.env.APP_NETWORK,
  });
  const aptos = new aptosSDK.Aptos(aptosConfig);

  // Make sure ADMIN_ADDR is set
  if (!process.env.ADMIN_ADDR) {
    throw new Error('Please set the ADMIN_ADDR in the .env file');
  }

  // Make sure ADMIN_ADDR exists
  try {
    await aptos.getAccountInfo({
      accountAddress: process.env.ADMIN_ADDR,
    });
  } catch (error) {
    throw new Error(
      'Account does not exist. Make sure you have set up the correct address as the ADMIN_ADDR in the .env file'
    );
  }

  // Check MODULE_ADDRESS is set
  if (!process.env.MODULE_ADDRESS) {
    throw new Error(
      'MODULE_ADDRESS variable is not set, make sure you have published the module before upgrading it'
    );
  }

  let tokenMinterContractAddress;
  switch (process.env.APP_NETWORK) {
    case 'testnet':
      tokenMinterContractAddress =
        '0x3c41ff6b5845e0094e19888cba63773591be9de59cafa9e582386f6af15dd490';
      break;
    case 'mainnet':
      tokenMinterContractAddress =
        '0x5ca749c835f44a9a9ff3fb0bec1f8e4f25ee09b424f62058c561ca41ec6bb146';
      break;
    default:
      throw new Error(
        `Invalid network used. Make sure process.env.APP_NETWORK is either mainnet or testnet`
      );
  }
  const move = new cli.Move();

  move.upgradeObjectPackage({
    packageDirectoryPath: 'contract',
    objectAddress: process.env.MODULE_ADDRESS,
    namedAddresses: {
      aptos_social: process.env.MODULE_ADDRESS,
      minter: tokenMinterContractAddress,
      friend_addr:
        '99cabef4f4daa7af133cc7c6ed737d9c0ef0858d79f92e3a1080bd13a0e7b2f2',
    },
    profile: `${process.env.PROJECT_NAME}-${process.env.APP_NETWORK}`,
  });
}
publish();
