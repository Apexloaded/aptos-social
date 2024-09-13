require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][
    `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`
  ]["account"];

async function compile() {
  const aptosConfig = new aptosSDK.AptosConfig({
    network: process.env.NEXT_PUBLIC_APP_NETWORK,
  });
  const aptos = new aptosSDK.Aptos(aptosConfig);

  // Make sure NEXT_PUBLIC_ADMIN_ADDR is set
  if (!process.env.NEXT_PUBLIC_ADMIN_ADDR) {
    throw new Error("Please set the NEXT_PUBLIC_ADMIN_ADDR in the .env file");
  }

  // Make sure NEXT_PUBLIC_ADMIN_ADDR exists
  try {
    await aptos.getAccountInfo({
      accountAddress: process.env.NEXT_PUBLIC_ADMIN_ADDR,
    });
  } catch (error) {
    throw new Error(
      "Account does not exist. Make sure you have set up the correct address as the NEXT_PUBLIC_ADMIN_ADDR in the .env file"
    );
  }
  const move = new cli.Move();

  await move.compile({
    packageDirectoryPath: "contract",
    namedAddresses: {
      // Publish module to account address
      aptos_social_host: accountAddress,
      // aptos_social_utils: accountAddress,
    },
  });
}
compile();
