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
  // return await DeployUtil.deployToJson(signedDeployJSON);
  try {
    // const signedDeployJSON = signedDeployJSON;

    const deploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();
    return deploy;
    const deployHash = await client.putDeploy(deploy); //
    return deployHash;
    // const result = await confirmDeploy(deployHash);
    return deployHash;
  } catch (error) {
    console.error(error);

    return "Error deploying on-chain";
  }
}

export function toHex(object){
  const bytes = new Uint8Array(Object.values(object));
  // Create an ArrayBuffer from the Uint8Array
  const arrayBuffer = bytes.buffer;
  // Convert the ArrayBuffer to a Buffer
  const buffer = Buffer.from(arrayBuffer);

  // Convert the Buffer to a hex string
  const hexString = buffer.toString('hex');
  return hexString;

}