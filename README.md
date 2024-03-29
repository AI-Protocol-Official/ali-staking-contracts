# AI Protocol Staking Contracts #

This repo contains AIProtocol Staking contracts, scripts, and tests enabling the staking functionality support for the
Artificial Liquid Intelligence Token (ALI ERC20 – AliERC20v2).

The project is built using
* [Hardhat](https://hardhat.org/), a popular Ethereum development environment,
* [Web3.js](https://web3js.readthedocs.io/), a collection of libraries that allows interacting with
local or remote Ethereum node using HTTP, IPC or WebSocket, and
* [Truffle](https://www.trufflesuite.com/truffle), a popular development framework for Ethereum.

Smart contracts deployment is configured to use [Infura](https://infura.io/)
and [HD Wallet](https://www.npmjs.com/package/@truffle/hdwallet-provider)

## Repository Description ##
What's inside?

* Smart Contract(s):
    * [StakingImpl](contracts/StakingImpl.sol) – Staking implementation

## Installation ##

Following steps were tested to work in macOS Catalina

1. Clone the repository  
   ```git clone git@github.com:AI-Protocol-Official/ali-staking-contracts.git```
2. Navigate into the cloned repository  
   ```cd ali-staking-contracts```
3. Install [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) – latest  
   ```brew install nvm```
4. Install [Node package manager (npm)](https://www.npmjs.com/) and [Node.js](https://nodejs.org/) – version 16.4.0  
   ```nvm install v16.4.0```
5. Activate node version installed  
   ```nvm use v16.4.0```
6. Install project dependencies  
   ```npm install```

#### Troubleshooting ####
* After executing ```nvm use v16.4.0``` I get  
   ```
   nvm is not compatible with the npm config "prefix" option: currently set to "/usr/local/Cellar/nvm/0.37.2/versions/node/v16.4.0"
   Run `npm config delete prefix` or `nvm use --delete-prefix v16.4.0` to unset it.
   ```
   Fix:  
   ```
   nvm use --delete-prefix v16.4.0
   npm config delete prefix
   npm config set prefix "/usr/local/Cellar/nvm/0.37.2/versions/node/v16.4.0"
   ```
* After executing ```npm install``` I get
    ```
    npm ERR! code 127
    npm ERR! path ./ALI-staking/node_modules/utf-8-validate
    npm ERR! command failed
    npm ERR! command sh -c node-gyp-build
    npm ERR! sh: node-gyp-build: command not found
    
    npm ERR! A complete log of this run can be found in:
    npm ERR!     ~/.npm/_logs/2021-08-30T07_10_23_362Z-debug.log
    ```
    Fix:  
    ```
    npm install -g node-gyp
    npm install -g node-gyp-build
    ```

## Configuration ##
1. Create or import 12-word mnemonics for
   1. Mainnet
   2. Ropsten
   3. Rinkeby
   4. Kovan

   You can use metamask to create mnemonics: https://metamask.io/

   Note: you can use same mnemonic for test networks (ropsten, rinkeby and kovan).
   Always use a separate one for mainnet, keep it secure.

   Note: you can add more configurations to connect to the networks not listed above.
   Check and add configurations required into the [hardhat.config.js](hardhat.config.js).

2. Create an infura access key at https://infura.io/

3. Create etherscan API key at https://etherscan.io/

4. Export mnemonics, infura access key, and etherscan API key as system environment variables
   (they should be available for hardhat):

   | Name         | Value             |
   |--------------|-------------------|
   | MNEMONIC1    | Mainnet mnemonic  |
   | MNEMONIC3    | Ropsten mnemonic  |
   | MNEMONIC4    | Rinkeby mnemonic  |
   | MNEMONIC42   | Kovan mnemonic    |
   | INFURA_KEY   | Infura access key |
   | ETHERSCAN_KEY| Etherscan API key |

Note:  
Read [How do I set an environment variable?](https://www.schrodinger.com/kb/1842) article for more info on how to
set up environment variables in Linux, Windows and macOS.

### Example Script: macOS Catalina ###
```
export MNEMONIC1="slush oyster cash hotel choice universe puzzle slot reflect sword intact fat"
export MNEMONIC3="result mom hard lend adapt where result mule address ivory excuse embody"
export MNEMONIC4="result mom hard lend adapt where result mule address ivory excuse embody"
export MNEMONIC42="result mom hard lend adapt where result mule address ivory excuse embody"
export INFURA_KEY="000ba27dfb1b3663aadfc74c3ab092ae"
export ETHERSCAN_KEY="9GEEN6VPKUR7O6ZFBJEKCWSK49YGMPUBBG"
```

## Alternative Configuration: Using Private Keys instead of Mnemonics ##
[hardhat.config-p_key.js](hardhat.config-p_key.js) contains an alternative Hardhat configuration using private keys
instead of mnemonics

1. Create or import private keys of the accounts for
   1. Mainnet
   2. Ropsten
   3. Rinkeby
   4. Kovan

   You can use metamask to export private keys: https://metamask.io/

   Note: you can use the same private key for test networks (ropsten, rinkeby and kovan).
   Always use a separate one for mainnet, keep it secure.

2. Create an infura access key at https://infura.io/

3. Create etherscan API key at https://etherscan.io/

4. Export private keys, infura access key, and etherscan API key as system environment variables
   (they should be available for hardhat):

   | Name         | Value               |
   |--------------|---------------------|
   | P_KEY1       | Mainnet private key |
   | P_KEY3       | Ropsten private key |
   | P_KEY4       | Rinkeby private key |
   | P_KEY42      | Kovan private key   |
   | INFURA_KEY   | Infura access key   |
   | ETHERSCAN_KEY| Etherscan API key   |

Notes:
* private keys should start with ```0x```
* use ```--config hardhat.config-p_key.js``` command line option to run hardhat using an alternative configuration

### Example Script: macOS Catalina ###
```
export P_KEY1="0x5ed21858f273023c7fc0683a1e853ec38636553203e531a79d677cb39b3d85ad"
export P_KEY3="0xfb84b845b8ea672939f5f6c9a43b2ae53b3ee5eb8480a4bfc5ceeefa459bf20c"
export P_KEY4="0xfb84b845b8ea672939f5f6c9a43b2ae53b3ee5eb8480a4bfc5ceeefa459bf20c"
export P_KEY42="0xfb84b845b8ea672939f5f6c9a43b2ae53b3ee5eb8480a4bfc5ceeefa459bf20c"
export INFURA_KEY="000ba27dfb1b3663aadfc74c3ab092ae"
export ETHERSCAN_KEY="9GEEN6VPKUR7O6ZFBJEKCWSK49YGMPUBBG"
```

## Compilation ##
Execute ```npx hardhat compile``` command to compile smart contracts.

Compilation settings are defined in [hardhat.config.js](./hardhat.config.js) ```solidity``` section.

Note: Solidity files *.sol use strict compiler version, you need to change all the headers when upgrading the
compiler to a newer version 

## Testing ##
Smart contract tests are built with Truffle – in JavaScript (ES6) and [web3.js](https://web3js.readthedocs.io/)

The tests are located in [test](./test) folder. 
They can be run with built-in [Hardhat Network](https://hardhat.org/hardhat-network/).

Run ```npx hardhat test``` to run all the tests or ```.npx hardhat test <test_file>``` to run individual test file.
Example: ```npx hardhat test ./test/inft/inft.test.js```

## Deployment ##
Deployments are implemented via [hardhat-deploy plugin](https://github.com/wighawag/hardhat-deploy) by Ronan Sandford.

Deployment scripts perform smart contracts deployment itself and their setup configuration.
Executing a script may require several transactions to complete, which may fail. To help troubleshoot
partially finished deployment, the scripts are designed to be rerunnable and execute only the transactions
which were not executed in previous run(s).

Deployment scripts are located under [deploy](./deploy) folder.
Deployment execution state is saved under [deployments](./deployments) folder.

To run fresh deployment (rinkeby):

1. Delete [deployments/rinkeby](./deployments/rinkeby) folder contents.

2. Run the deployment of interest with the ```npx hardhat deploy``` command
   ```
   npx hardhat deploy --network rinkeby --tags v1_deploy
   ```
   where ```v1_deploy``` specifies the deployment script tag to run,
   and ```--network rinkeby``` specifies the network to run script for
   (see [hardhat.config.js](./hardhat.config.js) for network definitions).

3. Verify source code on Etherscan with the ```npx hardhat etherscan-verify``` command
   ```
   npx hardhat etherscan-verify --network rinkeby
   ```

4. Enable the roles (see Access Control) required by the protocol
   ```
   npx hardhat deploy --network rinkeby --tags v1_roles
   ```
   Note: this step can be done via Etherscan UI manually

5. Enable the features (see Access Control) required by the protocol
   ```
   npx hardhat deploy --network rinkeby --tags v1_features
   ```
   Note: this step can be done via Etherscan UI manually

To rerun the deployment script and continue partially completed script skip the first step
(do not cleanup the [deployments](./deployments) folder).

(c) 2021–2024 [AI Protocol](https://aiprotocol.info/)
