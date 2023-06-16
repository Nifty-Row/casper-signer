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
const NODE_URL = "http://3.136.227.9:7777/rpc";
const client = new CasperClient(NODE_URL);

export function truncateKey(key) {
  return key ? `${key.slice(0, 5)}...${key.slice(key.length - 5)}` : "";
}


export async function deploySigned(signedDeployJSON) {
  // return await DeployUtil.deployToJson(signedDeployJSON);
  try {
    // const signedDeployJSON = signedDeployJSON;

    const deploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();
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

export function encodeSpecialCharacters(text) {
  return text.replace(/[^\w\s]/gi, function(match) {
    return `&#${match.charCodeAt(0)};`;
  });
}

export function decodeSpecialCharacters(encodedText) {
  const doc = new DOMParser().parseFromString(encodedText, "text/html");
  return doc.documentElement.textContent;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  return date.toLocaleString('en-US', options);
}
