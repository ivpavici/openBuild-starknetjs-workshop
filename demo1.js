import { RpcProvider, BlockTag, shortString } from "starknet";

async function main() {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-testnet.public.blastapi.io",
  });

  const id = await provider.getChainId();
  const blockNum = await provider.getBlockWithTxHashes(BlockTag.latest);
  console.log("chain =", id, "\nBlock# =", blockNum.block_number);
  console.log("chain =", shortString.decodeShortString(id));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
