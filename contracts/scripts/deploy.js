/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const hre = require('hardhat');

async function main() {
  const initialGreeting = process.env.INIT_GREETING || 'Hello, Hyperquest!';
  const HelloWorld = await hre.ethers.getContractFactory('HelloWorld');
  const hello = await HelloWorld.deploy(initialGreeting);
  await hello.deployed();

  console.log('HelloWorld deployed to:', hello.address);

  // Write minimal frontend artifacts if frontend exists
  const frontendDir = path.resolve(__dirname, '../../frontend/src/contracts');
  try {
    if (fs.existsSync(path.dirname(frontendDir))) {
      fs.mkdirSync(frontendDir, { recursive: true });
      const artifact = await hre.artifacts.readArtifact('HelloWorld');
      fs.writeFileSync(
        path.join(frontendDir, 'HelloWorld.json'),
        JSON.stringify({ address: hello.address, abi: artifact.abi }, null, 2)
      );
      console.log('Wrote frontend contract artifact to src/contracts/HelloWorld.json');
    }
  } catch (err) {
    console.warn('Could not write frontend artifacts:', err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

