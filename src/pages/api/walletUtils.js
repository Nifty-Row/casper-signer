import { CasperServiceByJsonRPC, CLPublicKey } from 'casper-js-sdk';

const GRPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// const GRPC_URL = 'https://casper-node-proxy.dev.make.services/rpc';
const casperService = new CasperServiceByJsonRPC(GRPC_URL);

export default async function handler(req, res) {
  const { publicKey } = req.query;

  try {
    if (!publicKey) {
      return res.status(400).json({ error: 'Public key is required.' });
    }

    const toPublicKey = CLPublicKey.fromHex(publicKey);
    const stateRootHash = await casperService.getStateRootHash();

    const uref = await casperService.getAccountBalanceUrefByPublicKey(
      stateRootHash,
      toPublicKey
    );
    
    const balance = await casperService.getAccountBalance(stateRootHash, uref);
    const returnValue = balance.toString();
    return res.status(200).json({ returnValue });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return res.status(500).json({ error: 'An error occurred while fetching balance.' });
  }
}
