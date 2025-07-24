import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";

export function toHex(bigint) {
  return "0x" + bigint.toString(16);
}

export function generateSalt() {
  return ethers.hexlify(ethers.randomBytes(32));
}

export async function generateZkpFields(secret, salt, nullifier) {
  const secretHash = ethers.keccak256(ethers.toUtf8Bytes(secret));
  const secretBigInt = BigInt(secretHash);

  let saltHex = generateSalt();
  let nullifierHex = generateSalt(); 
  
  if(salt){
    saltHex = salt;
  }

  if(nullifier){
    nullifierHex = nullifier;
  }
  
  const saltBigInt = BigInt(saltHex);
  const nullifierBigInt = BigInt(nullifierHex);

  const poseidon = await buildPoseidon();

  const commitmentBigInt = poseidon.F.toObject(
    poseidon([secretBigInt, saltBigInt])
  );

  const nullifierHashBigInt = poseidon.F.toObject(
    poseidon([secretBigInt, nullifierBigInt])
  );

  return {
    secret_int: secretBigInt.toString(),
    salt: saltHex,
    nullifier: nullifierHex,
    zkp_commitment: commitmentBigInt.toString(),
    zkp_nullifier: nullifierHashBigInt.toString(),
    zkp_salt: saltBigInt.toString()
  };
}
