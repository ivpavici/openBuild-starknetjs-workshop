import { RpcProvider, BlockTag, shortString } from "starknet";

async function main() {
  const provider = new RpcProvider({
    nodeUrl: "http://127.0.0.1:5050/rpc",
  });
  const id = await provider.getChainId();
  const blockNum = await provider.getBlockWithTxHashes(BlockTag.latest); // error when starting a fresh devnet - there are no blocks
  console.log("chain =", id, "\nBlock# =", blockNum.block_number);
  console.log("chain =", shortString.decodeShortString(id));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
