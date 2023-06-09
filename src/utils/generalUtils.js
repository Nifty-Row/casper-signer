const {
    DeployUtil,
    CasperClient,
    RuntimeArgs,
    CLValueBuilder,
    CLMap,
    CLList,
    CLKey,
    CLPublicKey,
    CLAccountHash,
    CLString,
    CLOption,
  } = require("casper-js-sdk");

  // Initialize Casper client
const NODE_URL = "http://76.91.193.251:7777/rpc";
const client = new CasperClient(NODE_URL);

export function truncateKey(key) {
    const beginOfKey = key.slice(0, 5);
    const endOfKey = key.slice(key.length - 5);

    return `${beginOfKey}...${endOfKey}`;
}

export async function deploySigned(signedDeployJSON) {
    try {
      const signedDeployJSON = signedDeployJSON;
  
      const deploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();
      const deployHash = await client.putDeploy(deploy); //
      const result = await confirmDeploy(deployHash);
      return deployHash;
    } catch (error) {
      console.error(error);
  
      return "Error deploying on-chain";
    }
  }