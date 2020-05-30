import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import { assert } from "chai";

describe("dapp rewards test suite", () => {
  let dappRewardsClient: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    dappRewardsClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.dapp-rewards", "dapp-rewards", provider);
  });

  it("should have a valid syntax", async () => {
    await dappRewardsClient.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    const address = "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB";
    before(async () => {
      await dappRewardsClient.deployContract();
    });

    it("test get-user-points-private before any dapp events", async () => {
      const query = dappRewardsClient.createQuery({ method: { name: "get-user-points-private", args: [`'${address}`]}});
      const receipt = await dappRewardsClient.submitQuery(query);
      assert.equal(receipt.result, "0");
    });

    it("test get-user-points-private after dapp events", async () => {
      // submit dapp event with uuid 1
      const uuid = 1;
      const tx = dappRewardsClient.createTransaction( {method: {name: "sample-event", args: [`${uuid}`]}});
      await tx.sign(`${address}`);
      await dappRewardsClient.submitTransaction(tx);

      // submit dapp event with uuid 2
      const uuid2 = 2;
      const tx2 = dappRewardsClient.createTransaction( {method: {name: "sample-event", args: [`${uuid2}`]}});
      await tx2.sign(`${address}`);
      await dappRewardsClient.submitTransaction(tx2);

      // User's total points should be 2 since 2 dapp events were submitted
      const query = dappRewardsClient.createQuery({ method: { name: "get-user-points-private", args: [`'${address}`]}});
      const receipt = await dappRewardsClient.submitQuery(query);
      assert.equal(receipt.result, "2");

      //no nft transferred to user for dapp event with uuid 1 since nft is minted when user's total points is 3
      const query2 = dappRewardsClient.createQuery({ method: { name: "owner-of", args: [`${uuid}`]}});
      const receipt2 = await dappRewardsClient.submitQuery(query2);
      assert.equal(receipt2.result, `(ok none)`);

      //no nft transferred to user for dapp event with uuid 2 since nft is minted when user's total points is 3
      const query3 = dappRewardsClient.createQuery({ method: { name: "owner-of", args: [`${uuid2}`]}});
      const receipt3 = await dappRewardsClient.submitQuery(query3);
      assert.equal(receipt3.result, `(ok none)`);

      // submit dapp event with uuid 3
      const uuid3 = 3;
      const tx3 = dappRewardsClient.createTransaction( {method: {name: "sample-event", args: [`${uuid3}`]}});
      await tx3.sign(`${address}`);
      await dappRewardsClient.submitTransaction(tx3);

      // User's total points should be 3 since 3 dapp events were submitted till now
      const query4 = dappRewardsClient.createQuery({ method: { name: "get-user-points-private", args: [`'${address}`]}});
      const receipt4 = await dappRewardsClient.submitQuery(query4);
      assert.equal(receipt4.result, "3");

      //nft transferred to user for dapp event with uuid 3 since nft is minted when user's total points is 3
      const query5 = dappRewardsClient.createQuery({ method: { name: "owner-of", args: [`${uuid3}`]}});
      const receipt5 = await dappRewardsClient.submitQuery(query5);
      assert.equal(receipt5.result, `(ok (some ${address}))`);

    });
  });

  after(async () => {
    await provider.close();
  });
});
