require('dotenv').config()
const fs = require('node:fs')
const yaml = require('js-yaml')
const cli = require('@aptos-labs/ts-sdk/dist/common/cli/index.js')
const aptosSDK = require('@aptos-labs/ts-sdk')

const config = yaml.load(fs.readFileSync('./.aptos/config.yaml', 'utf8'))
const accountAddress =
    config['profiles'][
        `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`
    ]['account']

async function compile() {
    const aptosConfig = new aptosSDK.AptosConfig({
        network: process.env.NEXT_PUBLIC_APP_NETWORK,
    })
    const aptos = new aptosSDK.Aptos(aptosConfig)

    // Make sure NEXT_PUBLIC_ADMIN_ADDR is set
    if (!process.env.NEXT_PUBLIC_ADMIN_ADDR) {
        throw new Error(
            'Please set the NEXT_PUBLIC_ADMIN_ADDR in the .env file'
        )
    }

    // Make sure NEXT_PUBLIC_ADMIN_ADDR exists
    try {
        await aptos.getAccountInfo({
            accountAddress: process.env.NEXT_PUBLIC_ADMIN_ADDR,
        })
    } catch (error) {
        throw new Error(
            'Account does not exist. Make sure you have set up the correct address as the NEXT_PUBLIC_ADMIN_ADDR in the .env file'
        )
    }

    let tokenMinterContractAddress
    switch (process.env.NEXT_PUBLIC_APP_NETWORK) {
        case 'testnet':
            tokenMinterContractAddress =
                '0x3c41ff6b5845e0094e19888cba63773591be9de59cafa9e582386f6af15dd490'
            break
        case 'mainnet':
            tokenMinterContractAddress =
                '0x5ca749c835f44a9a9ff3fb0bec1f8e4f25ee09b424f62058c561ca41ec6bb146'
            break
        default:
            throw new Error(
                `Invalid network used. Make sure process.env.NEXT_PUBLIC_APP_NETWORK is either mainnet or testnet`
            )
    }
    const move = new cli.Move()

    await move.compile({
        packageDirectoryPath: 'contract',
        namedAddresses: {
            // Publish module to account address
            aptos_social_host: accountAddress,
            minter: tokenMinterContractAddress,
            friend_addr:
                '99cabef4f4daa7af133cc7c6ed737d9c0ef0858d79f92e3a1080bd13a0e7b2f2',
        },
    })
}
compile()
