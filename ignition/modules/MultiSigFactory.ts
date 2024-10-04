import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MultiSigFactory = buildModule("MultiSigFactory", (m) => {

  const quorum = 3
  

  const multiSigFactory = m.contract("MultiSigFactory");

  return { multiSigFactory };
});

export default MultiSigFactory;
