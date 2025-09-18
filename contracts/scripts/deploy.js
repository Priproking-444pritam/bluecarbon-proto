const hre=require("hardhat");
async function main(){
  const Token=await hre.ethers.getContractFactory("CarbonToken");
  const token=await Token.deploy();
  await token.deployed();
  console.log("CarbonToken deployed:",token.address);
}
main().catch((e)=>{console.error(e);process.exit(1);});