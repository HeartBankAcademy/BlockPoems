var BlockPoem = artifacts.require("./BlockPoem.sol");
var BlockPoemFactory = artifacts.require("./BlockPoemFactory.sol");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

let poemAddress;

contract("BlockPoemFactory", function() {
  it("should create a poem", async function() {
    let instance = await BlockPoemFactory.deployed();
    let accounts = await web3.eth.getAccounts();
    let firstAccount = accounts[0];

    await instance.createPoem("this is a poem", firstAccount);

    let poems = await instance.getDeployedPoems.call({ from: accounts[0] });
    poemAddress = poems[0];

    let expectedLength = 1;

    assert.equal(poems.length, expectedLength, "There should be 1 poem");
  });
});

describe("BlockPoem", function() {
  it("should let writer add extra message", async function() {
    let accounts = await web3.eth.getAccounts();
    let firstAccount = accounts[0];
    const poemInstance = await BlockPoem.at(poemAddress);

    await poemInstance.addMessage("this is an extra message noice", {
      from: firstAccount
    });

    let message = await poemInstance.extraMessage.call();
    console.log(message);

    assert.ok(message);
  });

  it("should prevent others from adding extra message", async function() {
    let accounts = await web3.eth.getAccounts();
    let secondAccount = accounts[1];
    const poemInstance = await BlockPoem.at(poemAddress);

    const secondMessage = "This is the second message";

    // We want this to fail because second account is not the writer
    try {
      await poemInstance.addMessage(secondMessage, {
        from: secondAccount
      });
      assert(false);
    } catch (err) {
      assert(true);
    }
  });

  it("should let others like a poem", async function() {
    let accounts = await web3.eth.getAccounts();
    let secondAccount = accounts[1];
    const poemInstance = await BlockPoem.at(poemAddress);

    await poemInstance.like({ from: secondAccount });

    const expectedNumOfLikes = 1;

    let numberOfLikes = await poemInstance.numberOfLikes.call();

    assert.equal(numberOfLikes, expectedNumOfLikes);
  });

  it("should prevent an account from liking a poem more than once", async function() {
    let accounts = await web3.eth.getAccounts();
    let secondAccount = accounts[1];
    const poemInstance = await BlockPoem.at(poemAddress);

    try {
      await poemInstance.like({ from: secondAccount });
      assert(false);
    } catch (err) {
      assert(true);
    }
  });

  it("should prevent the writer from liking their own poem", async function() {
    let accounts = await web3.eth.getAccounts();
    let firstAccount = accounts[0];
    const poemInstance = await BlockPoem.at(poemAddress);

    try {
      await poemInstance.like({ from: firstAccount });
      assert(false);
    } catch (err) {
      assert(true);
    }
  });
});
