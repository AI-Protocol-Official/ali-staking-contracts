// deploy: npx hardhat deploy --network rinkeby --tags v1_deploy
// verify: npx hardhat etherscan-verify --network rinkeby

// script is built for hardhat-deploy plugin:
// A Hardhat Plugin For Replicable Deployments And Easy Testing
// https://www.npmjs.com/package/hardhat-deploy

// BN utils
const { print_amt } = require("../scripts/include/bn_utils");

// to be picked up and executed by hardhat-deploy plugin
module.exports = async function ({ deployments, getChainId, getNamedAccounts, getUnnamedAccounts }) {
	// print some useful info on the account we're using for the deployment
	const chainId = await getChainId();
	const [A0] = await web3.eth.getAccounts();
	let nonce = await web3.eth.getTransactionCount(A0);
	let balance = await web3.eth.getBalance(A0);

	// print initial debug information
	console.log("network %o %o", chainId, network.name);
	console.log("service account %o, nonce: %o, balance: %o ETH", A0, nonce, print_amt(balance));

	// read token addresses from named accounts
	let { ali_token: ali_address } = await getNamedAccounts();
	// for the hardhat network we deploy mocks for the token
	// (for mainnet these entities are already maintained separately)
	if (chainId == 0xeeeb04de) {
		// deploy ALI token Mock (if required)
		if (!ali_address) {
			await deployments.deploy("ALI_Mock", {
				from: A0,
				contract: "TokenMock",
				args: ["ALI", "ALI ERC20 Mock", "10000000000000000000000000000"],
				skipIfAlreadyDeployed: true,
				log: true,
			});
			ali_address = (await deployments.get("ALI_Mock")).address;
		}
	}



	// for the hardhat network we deploy mock of the Staking
	const staking_impl_name = "StakingImpl";

	// deploy Staking implementation v2 if required
	await deployments.deploy("Staking", {
		// address (or private key) that will perform the transaction.
		// you can use `getNamedAccounts` to retrieve the address you want by name.
		from: A0,
		contract: staking_impl_name,
		// the list of argument for the constructor (or the upgrade function in case of proxy)
		// args: [],
		// if set it to true, will not attempt to deploy even if the contract deployed under the same name is different
		skipIfAlreadyDeployed: true,
		// if true, it will log the result of the deployment (tx hash, address and gas used)
		log: true,
	});
	// get Staking implementation v1 deployment details
	const staking_v1_deployment = await deployments.get("Staking");
	const staking_v1_contract = new web3.eth.Contract(
		staking_v1_deployment.abi,
		staking_v1_deployment.address
	);

	const lockupDays = 40;
	// convert to seconds
	const lockupDaysInSeconds = (lockupDays * 86400)
	// prepare the initialization call bytes
	const staking_proxy_init_data = staking_v1_contract.methods
		.postConstruct(ali_address, lockupDaysInSeconds)
		.encodeABI();

	// deploy Staking_Proxy Proxy
	await deployments.deploy("Staking_Proxy", {
		// address (or private key) that will perform the transaction.
		// you can use `getNamedAccounts` to retrieve the address you want by name.
		from: A0,
		contract: "ERC1967Proxy",
		// the list of argument for the constructor (or the upgrade function in case of proxy)
		args: [staking_v1_deployment.address, staking_proxy_init_data],
		// if set it to true, will not attempt to deploy even if the contract deployed under the same name is different
		skipIfAlreadyDeployed: true,
		// if true, it will log the result of the deployment (tx hash, address and gas used)
		log: true,
	});
	// get Staking_Proxy proxy deployment details
	const staking_proxy_deployment = await deployments.get("Staking_Proxy");
	// print Staking_Proxy proxy deployment details
	await print_staking_acl_details(A0, staking_v1_deployment.abi, staking_proxy_deployment.address);

};

// prints generic Staking/Pair info + Ownable (owner)
async function print_staking_acl_details(a0, abi, address) {
	const web3_contract = new web3.eth.Contract(abi, address);
	const owner = await web3_contract.methods.owner().call();
	const tokenAddr = web3_contract.methods.token ? await web3_contract.methods.token().call() : null;
	const unlockTime = await web3_contract.methods.getUnlockTime().call();
	const totalSupply = await web3_contract.methods.totalSupply().call();

	console.log("successfully connected to Staking at %o", address);
	console.table([
		{ key: "Owner", value: owner }, // 16
		{ key: "Token Address", value: tokenAddr },
		{ key: "Unlock Time", value: unlockTime.toString(10) },
		{ key: "Total Supply", value: totalSupply.toString(10) },
	]);
	return { owner, tokenAddr };
}

// Tags represent what the deployment script acts on. In general, it will be a single string value,
// the name of the contract it deploys or modifies.
// Then if another deploy script has such tag as a dependency, then when the latter deploy script has a specific tag
// and that tag is requested, the dependency will be executed first.
// https://www.npmjs.com/package/hardhat-deploy#deploy-scripts-tags-and-dependencies
module.exports.tags = ["v2_deploy", "deploy", "v2"];
