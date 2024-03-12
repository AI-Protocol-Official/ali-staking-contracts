// using hardhat-deploy to take care about the deployment
// see https://github.com/wighawag/hardhat-deploy#testing-deployed-contracts
const { BN, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { deployments, expect } = require("hardhat");
async function getLastBlock() {
    return hre.network.provider.send("eth_getBlockByNumber", ["latest", false]);
}
contract("ALI Token Staking", function (accounts) {
    // extract accounts to be used:
    // A0 – special default zero account accounts[0] used by Truffle, reserved
    // a0 – deployment account having all the permissions, reserved
    // H0 – initial token holder account
    // a1, a2,... – working accounts to perform tests on
    const [A0, a0, H0, a1, a2, a3] = accounts;

    // deploy staking via the fixture
    let token, staking, staking_impl, receipt;
    beforeEach(async function () {
        // using hardhat-deploy to take care about the deployment
        // see https://github.com/wighawag/hardhat-deploy#testing-deployed-contracts
        await deployments.fixture(["deploy"]);
        const token_instance = await deployments.get("ALI_Mock");
        const staking_instance = await deployments.get("Staking_Proxy");
        const staking_impl_instance = await deployments.get("Staking")
        // wrap instances up as a Truffle contract
        const token_artifact = artifacts.require("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20");
        const staking_artifact = artifacts.require("StakingImpl");
        token = await token_artifact.at(token_instance.address);
        staking_impl = await staking_artifact.at(staking_impl_instance.address)
        staking = await staking_artifact.at(staking_instance.address);
    });

    const unit = new BN(1), zero = new BN(0);

    const alice = a1;
    const bob = a2;
    const admin = A0;
    const alice_balance = unit.muln(1_0000);
    const bob_balance = unit.muln(2_000);

    beforeEach(async function () {
        await token.transfer(alice, alice_balance, { from: A0 });
        await token.transfer(bob, bob_balance, { from: A0 });
        await token.approve(staking.address, alice_balance, { from: alice });
        await token.approve(staking.address, bob_balance, { from: bob });

    });


    it("deploys successfully", async function () {
        expect(await staking.token()).to.equal(token.address);
    })

    it("should not allow to initialize on implementation", async function () {
        await expectRevert(staking_impl.postConstruct(token.address, 1), "Initializable: contract is already initialized")
    })

    describe("stake", async function () {
        it("fails: if stake 0 amount", async function () {
            await expectRevert(staking.stake(0, { from: alice }), "cannot stake 0");
        })
        it("fails: if stake amount is greater than approved", async function () {
            await token.approve(staking.address, 10, { from: alice })
            await expectRevert(staking.stake(100, { from: alice }), "ERC20: transfer amount exceeds allowance")
        })
        describe("succeed, otherwise", function () {
            let amount = unit.muln(1_000), tokenBalanceBefore;
            beforeEach(async function () {
                tokenBalanceBefore = await token.balanceOf(alice)

                receipt = await staking.stake(amount, { from: alice })
            })
            it("updates users balance", async function () {
                expect(await staking.balanceOf(alice)).to.be.bignumber.that.equals(amount)
            })
            it("updates totalsupply", async function () {
                expect(await staking.totalSupply()).to.be.bignumber.that.equal(amount)
            })
            it("deducts tokens", async function () {
                const balance = await token.balanceOf(alice)
                const contractBalance = await token.balanceOf(staking.address)
                expect(tokenBalanceBefore.sub(balance)).to.be.bignumber.equals(amount)
                expect(contractBalance).to.be.bignumber.equals(amount)
            })
            it("updates no of stakers", async function () {
                expect(await staking.totalNoOfStakers()).to.be.bignumber.equals("1")
            })
            it("'Staked' event is emitted", async function () {
                const lastBlock = await getLastBlock()
                expectEvent(receipt, "Staked", {
                    user: alice,
                    amount,
                    time: Number(lastBlock.timestamp).toString(10)
                })
            })
            it("should not update no of stakers on restake", async function () {
                await staking.stake(amount, { from: alice })
                expect(await staking.totalNoOfStakers()).to.be.bignumber.equals("1")
            })
        })
    })

    describe("unstake", function () {
        it("fails: if tries to withdraw more than staked", async function () {
            await expectRevert(staking.withdraw(100, { from: alice }), "bad withdraw");
        })
        it('fails: if tires to withdraw 0 amount', async function () {
            await expectRevert(staking.withdraw(0, { from: alice }), "cannot withdraw 0");
        })
        it("fails: when unlockTime not reached", async function () {
            await staking.stake(alice_balance, { from: alice })
            await expectRevert(staking.withdraw(alice_balance, { from: alice }), "withdraw is locked")
        })
        it("does not update no of stakers if full amount not withdrawn", async function () {
            await staking.stake(alice_balance, { from: alice })
            const unlockTime = await staking.getUnlockTime()
            hre.network.provider.send("evm_setNextBlockTimestamp", [
                Number(unlockTime),
            ])
            await staking.withdraw(1_000, { from: alice })
            expect(await staking.totalNoOfStakers()).to.be.bignumber.equals("1")
        })
        describe("succeed, otherwise", function () {
            let tokenBalanceBefore;
            beforeEach(async function () {
                await staking.stake(alice_balance, { from: alice })
                tokenBalanceBefore = await token.balanceOf(alice)
                const unlockTime = await staking.getUnlockTime()
                hre.network.provider.send("evm_setNextBlockTimestamp", [
                    Number(unlockTime),
                ])
                receipt = await staking.withdraw(alice_balance, { from: alice })
            })
            it("updates user balance", async function () {
                expect(await staking.balanceOf(alice)).to.be.bignumber.that.equals(zero)
            })
            it("updates totalSupply", async function () {
                expect(await staking.totalSupply()).to.be.bignumber.that.equals(zero)
            })
            it('transfers tokens', async function () {
                expect(await token.balanceOf(staking.address)).to.be.bignumber.that.equals(zero)
                const balance = await token.balanceOf(alice)
                expect(balance.add(tokenBalanceBefore)).to.be.bignumber.equals(alice_balance)
            })
            it("updates the no of stakers on full withdraw", async function () {
                expect(await staking.totalNoOfStakers()).to.be.bignumber.equals("0")
            })
            it("'Withdrawn' event is emitted", async function () {
                const lastBlock = await getLastBlock()
                expectEvent(receipt, "Withdrawn", {
                    user: alice,
                    amount: alice_balance,
                    time: Number(lastBlock.timestamp).toString(10)
                })
            })
            it("fails: if double withdraw", async function () {
                await expectRevert(staking.withdraw(alice_balance, { from: alice }), "bad withdraw")
            })
        })
    })

    describe("updateUnlockTime", function () {
        let lastBlockTime, day = 86400, days30 = 30 * day, days252 = 252 * day, days253 = 253 * day;
        beforeEach(async function () {
            const lastBlock = await getLastBlock()
            lastBlockTime = Number(lastBlock.timestamp)
        })
        it('fails: when try someone else', async function () {
            await expectRevert(staking.updateUnlockTime(lastBlockTime + 100, { from: alice }), "Ownable: caller is not the owner")
        })
        describe("when called by owner", function () {
            it("fails: when pass past date", async function () {
                await expectRevert(staking.updateUnlockTime(lastBlockTime, { from: A0 }), "invalid unlockTime")
            })
            it("fails: when pass date in too future", async function () {
                await expectRevert(staking.updateUnlockTime(lastBlockTime + days253, { from: A0 }), "invalid unlockTime")
            })
            function run_test_with_unlockTime(label, days) {
                describe(`succeed, if ${label}`, function () {
                    let unlockTime;
                    beforeEach(async function () {
                        unlockTime = lastBlockTime + days;
                        receipt = await staking.updateUnlockTime(unlockTime)
                    })
                    it("updates the unlockTime", async function () {
                        expect(await staking.getUnlockTime()).to.be.bignumber.equals(unlockTime.toString(10))
                    })
                    it("emits 'UnlockTimeUpdated' event", async function () {
                        await expectEvent(receipt, "UnlockTimeUpdated", {
                            sender: A0,
                            unlockTime: unlockTime.toString(10)
                        })
                    })
                })
            }
            run_test_with_unlockTime("decreases", days30)
            run_test_with_unlockTime("increases", days252)

        })
    })

    describe("pause", function () {
        it('fails: when try someone else', async function () {
            await expectRevert(staking.pause({ from: alice }), "Ownable: caller is not the owner")
        })
        describe("when called by owner", function () {
            beforeEach(async function () {
                receipt = await staking.pause({ from: A0 })
            })
            it("pauses the contract", async function () {
                expect(await staking.paused()).to.be.equals(true);
            })
            it("should not repause", async function () {
                await expectRevert(staking.pause({ from: A0 }), "Pausable: paused")
            })
            it("should not allow to stake", async function () {
                await expectRevert(staking.stake(alice_balance, { from: alice }), "Pausable: paused")
            })
        })
    })

    describe("unpause", function () {
        it('fails: when try someone else', async function () {
            await expectRevert(staking.unpause({ from: alice }), "Ownable: caller is not the owner")
        })
        describe("when called by owner", function () {
            beforeEach(async function () {
                await staking.pause({ from: A0 })
                receipt = await staking.unpause({ from: A0 })
            })
            it("unpauses the contract", async function () {
                expect(await staking.paused()).to.be.equals(false);
            })
            it("should not unpause again", async function () {
                await expectRevert(staking.unpause({ from: A0 }), "Pausable: not paused")
            })
        })
    })
})