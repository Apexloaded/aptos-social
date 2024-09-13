require("dotenv").config();

const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

async function test() {
  const move = new cli.Move();

  await move.test({
    packageDirectoryPath: "contract",
    namedAddresses: {
      aptos_social_host:
        "9f748a2c5655bc67455a926de6566ffa0560c521eba098a529ada10d3d5a5910",
      friend_addr:
        "99cabef4f4daa7af133cc7c6ed737d9c0ef0858d79f92e3a1080bd13a0e7b2f2",
      minter: "0x102",
    },
  });
}
test();
