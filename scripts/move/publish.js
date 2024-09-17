require('dotenv').config()
const fs = require('node:fs')
const yaml = require('js-yaml')
const cli = require('@aptos-labs/ts-sdk/dist/common/cli/index.js')
const aptosSDK = require('@aptos-labs/ts-sdk')

const config = yaml.load(fs.readFileSync('./.aptos/config.yaml', 'utf8'))
const accountAddress =
    config['profiles'][
        `${process.env.PROJECT_NAME}-${process.env.APP_NETWORK}`
    ]['account']

async function publish() {
    const aptosConfig = new aptosSDK.AptosConfig({
        network: process.env.APP_NETWORK,
    })
    const aptos = new aptosSDK.Aptos(aptosConfig)

    // Make sure ADMIN_ADDR is set
    if (!process.env.ADMIN_ADDR) {
        throw new Error(
            'Please set the ADMIN_ADDR in the .env file'
        )
    }

    // Make sure ADMIN_ADDR exists
    try {
        await aptos.getAccountInfo({
            accountAddress: process.env.ADMIN_ADDR,
        })
    } catch (error) {
        throw new Error(
            'Account does not exist. Make sure you have set up the correct address as the ADMIN_ADDR in the .env file'
        )
    }

    let tokenMinterContractAddress
    switch (process.env.APP_NETWORK) {
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
                `Invalid network used. Make sure process.env.APP_NETWORK is either mainnet or testnet`
            )
    }

    const move = new cli.Move()

    move.createObjectAndPublishPackage({
        packageDirectoryPath: 'contract',
        addressName: 'aptos_social_host',
        namedAddresses: {
            // Publish module to account address
            aptos_social_host: accountAddress,
            // This is the address you want to use to create fungible asset with, e.g. an address in Petra so you can create fungible asset in UI using Petra
            initial_creator_addr: process.env.ADMIN_ADDR,
            minter: tokenMinterContractAddress,
            friend_addr:
                '99cabef4f4daa7af133cc7c6ed737d9c0ef0858d79f92e3a1080bd13a0e7b2f2',
        },
        profile: `${process.env.PROJECT_NAME}-${process.env.APP_NETWORK}`,
    }).then((response) => {
        console.log('response', response)

        const filePath = '.env.local'
        let envContent = ''

        // Check .env file exists and read it
        if (fs.existsSync(filePath)) {
            envContent = fs.readFileSync(filePath, 'utf8')
        }

        // Regular expression to match the MODULE_ADDRESS variable
        const regex = /^MODULE_ADDRESS=.*$/m
        const newEntry = `MODULE_ADDRESS=${response.objectAddress}`

        // Check if MODULE_ADDRESS is already defined
        if (envContent.match(regex)) {
            // If the variable exists, replace it with the new value
            envContent = envContent.replace(regex, newEntry)
        } else {
            // If the variable does not exist, append it
            envContent += `\n${newEntry}`
        }

        // Write the updated content back to the .env file
        fs.writeFileSync(filePath, envContent, 'utf8')
    })
}
publish()
