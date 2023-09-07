const {
  DeployUtil,
  CasperClient,
} = require("casper-js-sdk");

const NODE_URL = "http://178.63.75.44:7777/rpc";
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

export function toHex(object) {
  const bytes = new Uint8Array(Object.values(object));
  // Create an ArrayBuffer from the Uint8Array
  const arrayBuffer = bytes.buffer;
  // Convert the ArrayBuffer to a Buffer
  const buffer = Buffer.from(arrayBuffer);

  // Convert the Buffer to a hex string
  const hexString = buffer.toString("hex");
  return hexString;
}

export function encodeSpecialCharacters(text) {
  return text.replace(/[^\w\s]/gi, function (match) {
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
     hour: "numeric", 
     minute: "numeric", 
     hour12: true, 
     day: "numeric", 
     month: "long", 
     year: "numeric", 
   }; 
  
   return date.toLocaleString("en-US", options); 
}

export async function getDeploy(deployHash) {
  if (!deployHash) return;
  let result = await client.getDeploy(deployHash);
  return result;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export async function getDeployedHashes(deployHash) {
  try {
    let contractHash;
    let packageHash;
    const client = new CasperClient(NODE_URL);
    const [deploy, raw] = await client.getDeploy(deployHash);
    return raw;
    if (raw.execution_results.length !== 0) {
      if (raw.execution_results[0].result.Success) {
        const execResultArray =
          raw.execution_results[0].result.Success.effect.transforms;
        execResultArray.forEach(function (item) {
          if (isObject(item)) {
            if (item.transform == "WriteContract") {
              contractHash = item.key;
            }
            if (item.transform == "WriteContractPackage") {
              packageHash = item.key;
            }
          }
        });
        if (contractHash == undefined || packageHash == undefined) {
          return "";
        }

        return { contractHash, packageHash };
      } else {
        throw Error(
          "Contract execution: " +
            raw.execution_results[0].result.Failure.error_message
        );
      }
    } else {
      return "";
    }
  } catch (error) {
    console.error("getDeployedHashes: ", error);
    return "";
  }
}

export function totesToCSPR(totes) {
  const totesPerCSPR = 1000000000; // 1 CSPR = 1,000,000,000 totes
  return totes / totesPerCSPR;
}

export async function getWalletBalance(key) {
  if (key) {
    try {
      const response = await fetch(`/api/walletUtils?publicKey=${key}`);
      const data = await response.json();

      // alert(data.returnValue);
      return data.returnValue;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      return false;
    }
  }
}

export function handleRefresh() {
  window.location.reload(); // Refresh the page
}

export function convertToLocalUTC(localDate) {
  // Get the local time zone offset in minutes
  const localOffset = localDate.getTimezoneOffset();

  // Create a new Date object with the UTC time adjusted using the offset
  const utcDate = new Date(localDate.getTime() + localOffset * 60 * 1000);

  return utcDate;
}
