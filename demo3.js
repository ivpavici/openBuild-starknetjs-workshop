import { RpcProvider, json, Account, ec, hash, CallData } from "starknet";
import fs from "fs";
import axios from "axios";

async function main() {
  const provider = new RpcProvider({
    nodeUrl: "http://127.0.0.1:5050/rpc",
  });

  const compiledOZAccount = json.parse(
    fs.readFileSync("./openzeppelin070Account.sierra.json").toString("ascii")
  );

  const casmOZAccount = json.parse(
    fs.readFileSync("./openzeppelin070Account.casm.json").toString("ascii")
  );

  const predeployedAccountAddress =
    "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
  const predeployedAccountPriKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";

  const predeployedAccount = new Account(
    provider,
    predeployedAccountAddress,
    predeployedAccountPriKey
  );

  console.log(predeployedAccount);

  // NEW account

  const privateKey = "0xb20a02f0ac53692d144b21cb371a60d7";
  const publicKey = ec.starkCurve.getStarkKey(privateKey);
  console.log("publicKey: ", publicKey);

  // DECLARE
  const { transaction_hash: declareTxHash, class_hash: declareClassHash } =
    await predeployedAccount.declare({
      contract: compiledOZAccount,
      casm: casmOZAccount,
    });

  console.log("OpenZeppelin account class hash =", declareClassHash);
  await provider.waitForTransaction(declareTxHash);

  // Calculate future address of the account
  const OZaccountConstructorCallData = CallData.compile({
    publicKey: publicKey,
  });
  const OZcontractAddress = hash.calculateContractAddressFromHash(
    publicKey,
    declareClassHash,
    OZaccountConstructorCallData,
    0
  );
  console.log("Precalculated account address: ", OZcontractAddress);

  // fund account address before account creation
  const { data: response } = await axios.post(
    "http://127.0.0.1:5050/mint",
    {
      address: OZcontractAddress,
      amount: 10_000_000_000_000_000_000, // 10 ETH
      lite: true,
    },
    { headers: { "Content-Type": "application/json" } }
  );
  console.log("Mint response: ", response);

  // deploy account
  const OZaccount = new Account(provider, OZcontractAddress, privateKey);

  const { transaction_hash, contract_address } = await OZaccount.deployAccount({
    classHash: declareClassHash,
    constructorCalldata: OZaccountConstructorCallData,
    addressSalt: publicKey,
  });

  console.log(
    "✅ New OpenZeppelin account created.\n Final address: ",
    contract_address
  );
  await provider.waitForTransaction(transaction_hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
