import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const OriginalMultiSig = buildModule("OriginalMultiSig", (m) => {

  const quorum = 3
  

  const originalMultiSig = m.contract("OriginalMultiSig", [
    quorum, 
    [
      "0x05412df193632324e877f5ac2216423E89c11F37", 
      "0x15BaDaC14f51f38C206FA52c3433845e82Bd66Bf", 
      "0xb21DA16B54B88834a51fCAF602A49bc9d1E4D2D7", 
      "0x61d1cbcec7DF9DC14Aa80A086AFd440E9202B433"
  ]]);

  return { originalMultiSig };
});

export default OriginalMultiSig;
