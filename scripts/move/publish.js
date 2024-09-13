require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress = config["profiles"][`${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`]["account"];

async function publish() {

  const aptosConfig = new aptosSDK.AptosConfig({network:process.env.NEXT_PUBLIC_APP_NETWORK})
  const aptos = new aptosSDK.Aptos(aptosConfig)

  // Make sure NEXT_PUBLIC_ADMIN_ADDR is set
  if (!process.env.NEXT_PUBLIC_ADMIN_ADDR) {
    throw new Error("Please set the NEXT_PUBLIC_ADMIN_ADDR in the .env file");
  }

  // Make sure NEXT_PUBLIC_ADMIN_ADDR exists
  try {
    await aptos.getAccountInfo({ accountAddress: process.env.NEXT_PUBLIC_ADMIN_ADDR });
  } catch (error) {
    throw new Error(
      "Account does not exist. Make sure you have set up the correct address as the NEXT_PUBLIC_ADMIN_ADDR in the .env file",
    );
  }

  const move = new cli.Move();

  move
    .createObjectAndPublishPackage({
      packageDirectoryPath: "contract",
      addressName: "launchpad_addr",
      namedAddresses: {
        // Publish module to account address
        launchpad_addr: accountAddress,
        // This is the address you want to use to create fungible asset with, e.g. an address in Petra so you can create fungible asset in UI using Petra
        initial_creator_addr: process.env.NEXT_PUBLIC_ADMIN_ADDR,
      },
      profile: `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`,
    })
    .then((response) => {
      const filePath = ".env.local";
      let envContent = "";

      // Check .env file exists and read it
      if (fs.existsSync(filePath)) {
        envContent = fs.readFileSync(filePath, "utf8");
      }

      // Regular expression to match the NEXT_PUBLIC_MODULE_ADDRESS variable
      const regex = /^NEXT_PUBLIC_MODULE_ADDRESS=.*$/m;
      const newEntry = `NEXT_PUBLIC_MODULE_ADDRESS=${response.objectAddress}`;

      // Check if NEXT_PUBLIC_MODULE_ADDRESS is already defined
      if (envContent.match(regex)) {
        // If the variable exists, replace it with the new value
        envContent = envContent.replace(regex, newEntry);
      } else {
        // If the variable does not exist, append it
        envContent += `\n${newEntry}`;
      }

      // Write the updated content back to the .env file
      fs.writeFileSync(filePath, envContent, "utf8");
    });
}
publish();
