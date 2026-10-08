const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const hash = (v) => ethers.id(String(v));
async function deploy(name) {
  return (await ethers.getContractFactory(name)).deploy();
}
describe("ProductRegistry — R07 C01", function () {
  let c, owner, m, other;
  beforeEach(async () => {
    [owner, m, other] = await ethers.getSigners();
    c = await deploy("ProductRegistry");
    await c.connect(m).registerManufacturer("Factory");
  });
  it("requires explicit active identity on single and batch writes", async () => {
    await expect(
      c.connect(other).registerProduct("a", "A", hash("a"), "ipfs://a"),
    ).to.be.revertedWith("Not a registered manufacturer");
    await c.deactivateManufacturer(m.address);
    await expect(
      c.connect(m).registerProduct("a", "A", hash("a"), "ipfs://a"),
    ).to.be.revertedWith("Manufacturer account is not active");
    await expect(
      c
        .connect(m)
        .batchRegisterProducts(["a"], ["A"], [hash("a")], ["ipfs://a"]),
    ).to.be.reverted;
  });
  it("reconciles global/manufacturer totals and retains original string IDs across batches", async () => {
    for (let batch = 0; batch < 4; batch++) {
      const ids = Array.from(
        { length: 7 },
        (_, i) => `Unicode-界-${batch}-${i}`,
      );
      await c.connect(m).batchRegisterProducts(
        ids,
        ids,
        ids.map(hash),
        ids.map((id) => `ipfs://${id}`),
      );
      expect(await c.getTotalProductCount()).to.equal((batch + 1) * 7);
      expect(await c.getManufacturerProductCount(m.address)).to.equal(
        (batch + 1) * 7,
      );
    }
    expect(await c.getManufacturerProductsPage(m.address, 7, 7)).to.have.length(
      7,
    );
    expect(
      await c.getManufacturerProductsPage(m.address, 100, 7),
    ).to.have.length(0);
  });
  for (const [id, name, uri] of [
    ["", "Name", "ipfs://a"],
    ["a".repeat(101), "Name", "ipfs://a"],
    ["a", "", "ipfs://a"],
    ["a", "n".repeat(201), "ipfs://a"],
    ["a", "Name", ""],
    ["a", "Name", "u".repeat(501)],
  ])
    it(`rejects batch invalid bytes (${id.length}/${name.length}/${uri.length}) atomically`, async () => {
      await expect(
        c
          .connect(m)
          .batchRegisterProducts(
            ["valid", id],
            ["Valid", name],
            [hash("valid"), hash(id)],
            ["ipfs://valid", uri],
          ),
      ).to.be.reverted;
      expect(await c.getTotalProductCount()).to.equal(0);
      expect(await c.isProductRegistered("valid")).to.equal(false);
    });
  it("rejects duplicate IDs/hash, zero hash and over-limit arrays", async () => {
    await c.connect(m).registerProduct("a", "A", hash("a"), "ipfs://a");
    await expect(
      c.connect(m).registerProduct("a", "A", hash("b"), "ipfs://b"),
    ).to.be.revertedWith("Product already exists");
    await expect(
      c.connect(m).registerProduct("b", "B", hash("a"), "ipfs://b"),
    ).to.be.revertedWith("Data hash already used");
    await expect(
      c.connect(m).registerProduct("b", "B", ethers.ZeroHash, "ipfs://b"),
    ).to.be.reverted;
    const ids = Array.from({ length: 51 }, (_, i) => `${i}`);
    await expect(
      c.connect(m).batchRegisterProducts(ids, ids, ids.map(hash), ids),
    ).to.be.revertedWith("Maximum 50 products per batch");
  });
  it("updates both commitment and URI only for the registrant; revocation remains revoked", async () => {
    await c.connect(m).registerProduct("a", "A", hash("a"), "ipfs://a");
    await expect(
      c.connect(other).updateProductMetadata("a", "ipfs://b", hash("b")),
    ).to.be.reverted;
    const timestamp = (await time.latest()) + 10;
    await time.setNextBlockTimestamp(timestamp);
    await expect(c.connect(m).updateProductMetadata("a", "ipfs://b", hash("b")))
      .to.emit(c, "ProductUpdated")
      .withArgs("a", hash("b"), timestamp);
    const p = await c.getProduct("a");
    expect(p.dataHash).to.equal(hash("b"));
    expect(p.metadataURI).to.equal("ipfs://b");
    await c.connect(m).revokeProduct("a", "Retired");
    expect((await c.getProduct("a")).isVerified).to.equal(false);
    await c.connect(m).updateProductMetadata("a", "ipfs://c", hash("c"));
    expect((await c.getProduct("a")).isVerified).to.equal(false);
  });
});
describe("VerificationRegistry — C02", () => {
  let c, a;
  beforeEach(async () => {
    [a] = await ethers.getSigners();
    c = await deploy("VerificationRegistry");
  });
  it("reconciles sums and averages over mixed single/batch observations", async () => {
    const scores = [1, 2, 3, 100, 17, 42, 99, 0, 87];
    for (let i = 0; i < scores.length; i++) {
      if (i % 2)
        await c.batchRecordVerifications(
          ["p"],
          [i % 3 === 0],
          [scores[i]],
          [hash(i)],
        );
      else await c.recordVerification("p", i % 3 === 0, scores[i], "", hash(i));
      const s = await c.getProductStats("p");
      expect(s.totalVerifications).to.equal(i + 1);
      expect(s.averageConfidenceScore).to.equal(
        Math.floor(scores.slice(0, i + 1).reduce((x, y) => x + y) / (i + 1)),
      );
      expect(s.authenticCount + s.counterfeitCount).to.equal(i + 1);
    }
    expect(await c.getVerificationCount("p")).to.equal(9);
    expect(await c.getVerifierStats(a.address)).to.equal(9);
    const g = await c.getGlobalStats();
    expect(g.totalVerifications).to.equal(9);
  });
  it("does not authenticate caller opinions and enforces boundaries", async () => {
    await expect(
      c.recordVerification("p", false, 100, "Moon", hash("fake")),
    ).to.emit(c, "VerificationRecorded");
    await expect(c.batchRecordVerifications([""], [true], [50], [hash("x")])).to
      .be.reverted;
    await expect(c.recordVerification("p", true, 101, "", hash("x"))).to.be
      .reverted;
    await expect(c.recordVerification("p", true, 50, "", ethers.ZeroHash)).to.be
      .reverted;
  });
});
describe("SupplyChainTracker — C03", () => {
  let c, owner, h, other;
  beforeEach(async () => {
    [owner, h, other] = await ethers.getSigners();
    c = await deploy("SupplyChainTracker");
    await c.authorizeHandler(h.address);
  });
  it("rejects unauthorized/revoked handlers including edits", async () => {
    await expect(
      c
        .connect(other)
        .initializeSupplyChain("p", "Delhi", "manufactured", hash("a"), ""),
    ).to.be.reverted;
    await c
      .connect(h)
      .initializeSupplyChain("p", "Delhi", "manufactured", hash("a"), "");
    await c.revokeHandler(h.address);
    await expect(
      c.connect(h).addSupplyChainStep("p", "Mumbai", "shipped", hash("b"), ""),
    ).to.be.reverted;
    await expect(c.connect(h).updateStepNotes("p", 1, "changed")).to.be
      .reverted;
  });
  it("preserves sequence/hash continuity, product isolation and completion rules", async () => {
    await c
      .connect(h)
      .initializeSupplyChain("p", "Delhi", "manufactured", hash("a"), "");
    await expect(c.connect(h).completeSupplyChain("p")).to.be.reverted;
    await c
      .connect(h)
      .initializeSupplyChain("q", "Chennai", "manufactured", hash("q"), "");
    await c
      .connect(h)
      .addSupplyChainStep("p", "Mumbai", "shipped", hash("b"), "");
    expect((await c.verifySupplyChainIntegrity("p")).isValid).to.equal(true);
    expect(await c.getSupplyChainSteps("p")).to.equal(2);
    expect(await c.getSupplyChainSteps("q")).to.equal(1);
    await c.completeSupplyChain("p");
    await expect(
      c.connect(h).addSupplyChainStep("p", "Pune", "delivered", hash("c"), ""),
    ).to.be.reverted;
  });
  it("validates action, location and proof", async () => {
    await expect(
      c
        .connect(h)
        .initializeSupplyChain("p", "Delhi", "invalid", hash("a"), ""),
    ).to.be.reverted;
    await expect(
      c
        .connect(h)
        .initializeSupplyChain("p", "", "manufactured", hash("a"), ""),
    ).to.be.reverted;
    await expect(
      c
        .connect(h)
        .initializeSupplyChain(
          "p",
          "Delhi",
          "manufactured",
          ethers.ZeroHash,
          "",
        ),
    ).to.be.reverted;
  });
});
describe("CounterfeitReporter quarantined escrow v2 — C04 C05", () => {
  let c, s;
  const stake = ethers.parseEther(".01"),
    vote = ethers.parseEther(".005");
  beforeEach(async () => {
    s = await ethers.getSigners();
    c = await deploy("CounterfeitReporter");
    await c.updateMinimumVotes(3);
  });
  async function report() {
    await c
      .connect(s[1])
      .reportCounterfeit("p", "Concern", "ipfs://e", { value: stake });
  }
  async function invariant() {
    expect(await ethers.provider.getBalance(await c.getAddress())).to.be.gte(
      (await c.outstandingStakes()) + (await c.rewardPool()),
    );
  }
  it("rejects repeated winner claims and keeps principal accounting solvent without bonuses", async () => {
    await report();
    for (let i = 2; i <= 4; i++)
      await c.connect(s[i]).voteOnReport(1, true, { value: vote });
    await invariant();
    for (let i = 1; i <= 4; i++) {
      await c.connect(s[i]).claimReward(1);
      await expect(c.connect(s[i]).claimReward(1)).to.be.revertedWith(
        "Already claimed",
      );
      await invariant();
    }
    expect(await c.outstandingStakes()).to.equal(0);
    expect(await c.rewardPool()).to.equal(0);
  });
  it("refunds incorrect votes only once and reconciles reserves", async () => {
    await report();
    await c.connect(s[2]).voteOnReport(1, false, { value: vote });
    await c.connect(s[3]).voteOnReport(1, true, { value: vote });
    await c.connect(s[4]).voteOnReport(1, true, { value: vote });
    await time.increase(8 * 24 * 3600);
    await c.resolveReport(1);
    await c.connect(s[2]).returnIncorrectVoteStake(1);
    await expect(
      c.connect(s[2]).returnIncorrectVoteStake(1),
    ).to.be.revertedWith("Already claimed");
    await invariant();
    expect(await c.outstandingStakes()).to.equal(stake + vote * 2n);
  });
  it("releases stalled reports permissionlessly after deadline, retaining all refunds", async () => {
    await report();
    await c.connect(s[2]).voteOnReport(1, true, { value: vote });
    await expect(c.expireReport(1)).to.be.reverted;
    await time.increase(8 * 24 * 3600);
    await c.connect(s[5]).expireReport(1);
    await c.connect(s[1]).claimReward(1);
    await c.connect(s[2]).claimReward(1);
    expect(await c.outstandingStakes()).to.equal(0);
    await invariant();
  });
  it("cancels unused reports and forbids owner escrow withdrawals or reporter voting", async () => {
    await report();
    await expect(
      c.connect(s[1]).voteOnReport(1, true, { value: vote }),
    ).to.be.revertedWith("Reporter cannot vote on own report");
    await expect(c.emergencyWithdraw(stake)).to.be.revertedWith(
      "Cannot withdraw escrow",
    );
    await c.fundRewardPool({ value: vote });
    await c.emergencyWithdraw(vote);
    await invariant();
    await c.connect(s[1]).cancelReport(1);
    await expect(c.connect(s[1]).claimReward(1)).to.be.reverted;
    await invariant();
  });
  it("failed and reentrant recipient cannot consume another stake or corrupt liabilities", async () => {
    const receiver = await (
      await ethers.getContractFactory("TestClaimReceiver")
    ).deploy(await c.getAddress());
    await receiver.report({ value: stake });
    for (let i = 2; i <= 4; i++)
      await c.connect(s[i]).voteOnReport(1, true, { value: vote });
    const before = await c.outstandingStakes();
    await expect(receiver.claim(1)).to.be.revertedWith("Transfer failed");
    expect(await c.outstandingStakes()).to.equal(before);
    expect(await c.claimed(1, await receiver.getAddress())).to.equal(false);
    await receiver.accept();
    await receiver.claim(1);
    expect(await c.outstandingStakes()).to.equal(before - stake);
    await expect(receiver.claim(1)).to.be.revertedWith("Already claimed");
    await invariant();
  });
});
