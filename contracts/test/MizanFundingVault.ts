import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { keccak256, parseEther, stringToHex, zeroAddress } from "viem"
import { network } from "hardhat"

describe("MizanFundingVault", async function () {
  const { viem, networkHelpers } = await network.create()
  const EXTERNAL_REF = keccak256(stringToHex("campaign-uuid-1"))
  const CAMPAIGN_ID = BigInt(1)

  async function deployVaultFixture() {
    const [admin, manager, pauser, recipient, funder, secondFunder, stranger, verifier, disburser] =
      await viem.getWalletClients()
    const vault = await viem.deployContract("MizanFundingVault", [admin.account.address])

    const managerRole = await vault.read.CAMPAIGN_MANAGER_ROLE()
    const pauserRole = await vault.read.PAUSER_ROLE()
    const verifierRole = await vault.read.VERIFIER_ROLE()
    const disburserRole = await vault.read.DISBURSER_ROLE()

    await vault.write.grantRole([managerRole, manager.account.address], { account: admin.account })
    await vault.write.grantRole([pauserRole, pauser.account.address], { account: admin.account })
    await vault.write.grantRole([verifierRole, verifier.account.address], { account: admin.account })
    await vault.write.grantRole([disburserRole, disburser.account.address], { account: admin.account })

    return {
      vault,
      admin,
      manager,
      pauser,
      recipient,
      funder,
      secondFunder,
      stranger,
      verifier,
      disburser,
    }
  }

  async function futureDeadline(offset = BigInt(3600)) {
    const publicClient = await viem.getPublicClient()
    const block = await publicClient.getBlock()
    return block.timestamp + offset
  }

  async function registerCampaign(
    context: Awaited<ReturnType<typeof deployVaultFixture>>,
    amounts: bigint[],
  ) {
    const target = amounts.reduce((sum, amount) => sum + amount, BigInt(0))
    const deadline = await futureDeadline()
    await context.vault.write.registerCampaign(
      [
        CAMPAIGN_ID,
        EXTERNAL_REF,
        context.recipient.account.address,
        target,
        deadline,
        amounts.map((amount, index) => ({ id: BigInt(index + 1), amount })),
      ],
      { account: context.manager.account },
    )
    return { target, deadline }
  }

  async function submitAndVerify(
    context: Awaited<ReturnType<typeof deployVaultFixture>>,
    milestoneId = BigInt(1),
  ) {
    const evidenceHash = keccak256(stringToHex(`evidence-${milestoneId}`))
    await context.vault.write.submitMilestone([CAMPAIGN_ID, milestoneId, evidenceHash], {
      account: context.manager.account,
    })
    await context.vault.write.verifyMilestone([CAMPAIGN_ID, milestoneId], {
      account: context.verifier.account,
    })
    return evidenceHash
  }

  it("menolak admin zero address", async function () {
    const { vault } = await networkHelpers.loadFixture(deployVaultFixture)
    await viem.assertions.revertWithCustomError(
      viem.deployContract("MizanFundingVault", [zeroAddress]),
      vault,
      "InvalidAdmin",
    )
  })

  it("hanya campaign manager yang dapat mendaftarkan campaign", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const deadline = await futureDeadline()
    await viem.assertions.revertWithCustomError(
      context.vault.write.registerCampaign(
        [
          CAMPAIGN_ID,
          EXTERNAL_REF,
          context.recipient.account.address,
          parseEther("1"),
          deadline,
          [{ id: BigInt(1), amount: parseEther("1") }],
        ],
        { account: context.stranger.account },
      ),
      context.vault,
      "AccessControlUnauthorizedAccount",
    )
  })

  it("mendaftarkan deadline dan milestone yang totalnya tepat sama dengan target", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const first = parseEther("1")
    const second = parseEther("2")
    const { target, deadline } = await registerCampaign(context, [first, second])

    const campaign = await context.vault.read.getCampaign([CAMPAIGN_ID])
    assert.equal(campaign.targetAmount, target)
    assert.equal(campaign.fundingDeadline, deadline)
    assert.equal(campaign.cancelled, false)
    assert.equal((await context.vault.read.getMilestone([CAMPAIGN_ID, BigInt(2)])).amount, second)
  })

  it("menolak total milestone yang tidak sama dengan target", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    await viem.assertions.revertWithCustomError(
      context.vault.write.registerCampaign(
        [
          CAMPAIGN_ID,
          EXTERNAL_REF,
          context.recipient.account.address,
          parseEther("2"),
          await futureDeadline(),
          [{ id: BigInt(1), amount: parseEther("1") }],
        ],
        { account: context.manager.account },
      ),
      context.vault,
      "MilestoneAmountMismatch",
    )
  })

  it("menolak deadline yang tidak berada di masa depan", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const publicClient = await viem.getPublicClient()
    const block = await publicClient.getBlock()
    await viem.assertions.revertWithCustomError(
      context.vault.write.registerCampaign(
        [
          CAMPAIGN_ID,
          EXTERNAL_REF,
          context.recipient.account.address,
          parseEther("1"),
          block.timestamp,
          [{ id: BigInt(1), amount: parseEther("1") }],
        ],
        { account: context.manager.account },
      ),
      context.vault,
      "InvalidFundingDeadline",
    )
  })

  it("menahan dana di escrow dan mencatat kontribusi", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const { target } = await registerCampaign(context, [parseEther("1")])

    await viem.assertions.emitWithArgs(
      context.vault.write.fundCampaign([CAMPAIGN_ID], {
        account: context.funder.account,
        value: target,
      }),
      context.vault,
      "FundsCommitted",
      [CAMPAIGN_ID, context.funder.account.address, target, target],
    )

    assert.equal(
      await (await viem.getPublicClient()).getBalance({ address: context.vault.address }),
      target,
    )
    assert.equal(
      await context.vault.read.contributionOf([CAMPAIGN_ID, context.funder.account.address]),
      target,
    )
  })

  it("menolak dana nol dan dana yang melewati target", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const { target } = await registerCampaign(context, [parseEther("1")])

    await viem.assertions.revertWithCustomError(
      context.vault.write.fundCampaign([CAMPAIGN_ID], {
        account: context.funder.account,
        value: BigInt(0),
      }),
      context.vault,
      "InvalidAmount",
    )
    await viem.assertions.revertWithCustomError(
      context.vault.write.fundCampaign([CAMPAIGN_ID], {
        account: context.funder.account,
        value: target + BigInt(1),
      }),
      context.vault,
      "FundingTargetExceeded",
    )
  })

  it("menolak funding setelah deadline", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const { deadline } = await registerCampaign(context, [parseEther("1")])
    await networkHelpers.time.increaseTo(deadline + BigInt(1))
    await viem.assertions.revertWithCustomError(
      context.vault.write.fundCampaign([CAMPAIGN_ID], {
        account: context.funder.account,
        value: parseEther("0.1"),
      }),
      context.vault,
      "FundingDeadlinePassed",
    )
  })

  it("pause dan unpause menjaga operasi escrow", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    await registerCampaign(context, [parseEther("1")])
    await context.vault.write.pause({ account: context.pauser.account })
    await viem.assertions.revertWithCustomError(
      context.vault.write.fundCampaign([CAMPAIGN_ID], {
        account: context.funder.account,
        value: parseEther("1"),
      }),
      context.vault,
      "EnforcedPause",
    )
    await context.vault.write.unpause({ account: context.pauser.account })
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: parseEther("1"),
    })
  })

  it("recipient atau campaign manager dapat submit evidence, pihak lain ditolak", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    await registerCampaign(context, [parseEther("1")])
    const firstHash = keccak256(stringToHex("recipient-evidence"))
    const managerHash = keccak256(stringToHex("manager-evidence"))

    await viem.assertions.revertWithCustomError(
      context.vault.write.submitMilestone([CAMPAIGN_ID, BigInt(1), firstHash], {
        account: context.stranger.account,
      }),
      context.vault,
      "UnauthorizedBeneficiary",
    )
    await context.vault.write.submitMilestone([CAMPAIGN_ID, BigInt(1), firstHash], {
      account: context.recipient.account,
    })
    await context.vault.write.submitMilestone([CAMPAIGN_ID, BigInt(1), managerHash], {
      account: context.manager.account,
    })
    assert.equal(
      (await context.vault.read.getMilestone([CAMPAIGN_ID, BigInt(1)])).evidenceHash,
      managerHash,
    )
  })

  it("verifikasi membutuhkan target tercapai, evidence, dan verifier role", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const { target } = await registerCampaign(context, [parseEther("1")])
    const evidenceHash = keccak256(stringToHex("evidence"))
    await context.vault.write.submitMilestone([CAMPAIGN_ID, BigInt(1), evidenceHash], {
      account: context.manager.account,
    })

    await viem.assertions.revertWithCustomError(
      context.vault.write.verifyMilestone([CAMPAIGN_ID, BigInt(1)], {
        account: context.verifier.account,
      }),
      context.vault,
      "FundingTargetNotReached",
    )
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: target,
    })
    await viem.assertions.revertWithCustomError(
      context.vault.write.verifyMilestone([CAMPAIGN_ID, BigInt(1)], {
        account: context.stranger.account,
      }),
      context.vault,
      "AccessControlUnauthorizedAccount",
    )
  })

  it("verifikasi mereservasi nominal dan mengurangi saldo tersedia", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const amount = parseEther("1")
    await registerCampaign(context, [amount])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: amount,
    })
    await submitAndVerify(context)

    const [funded, reserved, released, available] =
      await context.vault.read.getCampaignSummary([CAMPAIGN_ID])
    assert.equal(funded, amount)
    assert.equal(reserved, amount)
    assert.equal(released, BigInt(0))
    assert.equal(available, BigInt(0))
  })

  it("disburser dapat mencairkan saat dana tepat sebesar milestone", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const amount = parseEther("1")
    const releaseKey = keccak256(stringToHex("release-exact"))
    await registerCampaign(context, [amount])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: amount,
    })
    await submitAndVerify(context)

    await viem.assertions.emitWithArgs(
      context.vault.write.releaseFunds([CAMPAIGN_ID, BigInt(1), releaseKey], {
        account: context.disburser.account,
      }),
      context.vault,
      "FundsReleased",
      [CAMPAIGN_ID, BigInt(1), context.recipient.account.address, amount, releaseKey],
    )

    const [, reserved, released, available] =
      await context.vault.read.getCampaignSummary([CAMPAIGN_ID])
    assert.equal(reserved, BigInt(0))
    assert.equal(released, amount)
    assert.equal(available, BigInt(0))
    assert.equal(
      await (await viem.getPublicClient()).getBalance({ address: context.vault.address }),
      BigInt(0),
    )
  })

  it("dua milestone dapat menghabiskan target tanpa saldo terkunci", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const amounts = [parseEther("1"), parseEther("2")]
    const { target } = await registerCampaign(context, amounts)
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: target,
    })

    for (let index = 0; index < amounts.length; index += 1) {
      const milestoneId = BigInt(index + 1)
      await submitAndVerify(context, milestoneId)
      await context.vault.write.releaseFunds(
        [CAMPAIGN_ID, milestoneId, keccak256(stringToHex(`release-${milestoneId}`))],
        { account: context.disburser.account },
      )
    }

    const [, reserved, released, available] =
      await context.vault.read.getCampaignSummary([CAMPAIGN_ID])
    assert.equal(reserved, BigInt(0))
    assert.equal(released, target)
    assert.equal(available, BigInt(0))
    assert.equal(
      await (await viem.getPublicClient()).getBalance({ address: context.vault.address }),
      BigInt(0),
    )
  })

  it("menolak pencairan tanpa disburser role dan pemakaian ulang release key", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const amount = parseEther("1")
    const releaseKey = keccak256(stringToHex("single-release"))
    await registerCampaign(context, [amount])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: amount,
    })
    await submitAndVerify(context)

    await viem.assertions.revertWithCustomError(
      context.vault.write.releaseFunds([CAMPAIGN_ID, BigInt(1), releaseKey], {
        account: context.stranger.account,
      }),
      context.vault,
      "AccessControlUnauthorizedAccount",
    )
    await context.vault.write.releaseFunds([CAMPAIGN_ID, BigInt(1), releaseKey], {
      account: context.disburser.account,
    })
    await viem.assertions.revertWithCustomError(
      context.vault.write.releaseFunds([CAMPAIGN_ID, BigInt(1), releaseKey], {
        account: context.disburser.account,
      }),
      context.vault,
      "ReleaseKeyAlreadyUsed",
    )
  })

  it("donor dapat claim refund setelah deadline gagal", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const { deadline } = await registerCampaign(context, [parseEther("2")])
    const contribution = parseEther("1")
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: contribution,
    })
    await networkHelpers.time.increaseTo(deadline + BigInt(1))

    await viem.assertions.emitWithArgs(
      context.vault.write.claimRefund([CAMPAIGN_ID], { account: context.funder.account }),
      context.vault,
      "RefundClaimed",
      [CAMPAIGN_ID, context.funder.account.address, contribution],
    )
    assert.equal(
      await context.vault.read.contributionOf([CAMPAIGN_ID, context.funder.account.address]),
      BigInt(0),
    )
    assert.equal((await context.vault.read.getCampaign([CAMPAIGN_ID])).fundedAmount, BigInt(0))
  })

  it("refund tidak tersedia ketika target sudah tercapai", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const { target, deadline } = await registerCampaign(context, [parseEther("1")])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: target,
    })
    await networkHelpers.time.increaseTo(deadline + BigInt(1))
    await viem.assertions.revertWithCustomError(
      context.vault.write.claimRefund([CAMPAIGN_ID], { account: context.funder.account }),
      context.vault,
      "RefundNotAvailable",
    )
  })

  it("campaign manager dapat membatalkan sebelum release dan donor dapat refund", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const { target } = await registerCampaign(context, [parseEther("1")])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: target,
    })
    await context.vault.write.cancelCampaign([CAMPAIGN_ID], { account: context.manager.account })
    await context.vault.write.claimRefund([CAMPAIGN_ID], { account: context.funder.account })
    const campaign = await context.vault.read.getCampaign([CAMPAIGN_ID])
    assert.equal(campaign.cancelled, true)
    assert.equal(campaign.active, false)
    assert.equal(campaign.fundedAmount, BigInt(0))
  })

  it("refund setelah milestone direservasi tidak membuat saldo tersedia underflow", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const amount = parseEther("1")
    await registerCampaign(context, [amount])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: amount,
    })
    await submitAndVerify(context)
    await context.vault.write.cancelCampaign([CAMPAIGN_ID], { account: context.manager.account })
    await context.vault.write.claimRefund([CAMPAIGN_ID], { account: context.funder.account })

    const [funded, reserved, released, available] =
      await context.vault.read.getCampaignSummary([CAMPAIGN_ID])
    assert.equal(funded, BigInt(0))
    assert.equal(reserved, amount)
    assert.equal(released, BigInt(0))
    assert.equal(available, BigInt(0))
  })

  it("campaign tidak dapat dibatalkan setelah release pertama", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const amount = parseEther("1")
    await registerCampaign(context, [amount])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: amount,
    })
    await submitAndVerify(context)
    await context.vault.write.releaseFunds(
      [CAMPAIGN_ID, BigInt(1), keccak256(stringToHex("released"))],
      { account: context.disburser.account },
    )
    await viem.assertions.revertWithCustomError(
      context.vault.write.cancelCampaign([CAMPAIGN_ID], { account: context.manager.account }),
      context.vault,
      "CampaignCannotBeCancelled",
    )
  })

  it("happy path penuh: register → fund → submit → verify → release", async function () {
    const context = await networkHelpers.loadFixture(deployVaultFixture)
    const amount = parseEther("1")
    const releaseKey = keccak256(stringToHex("happy-path"))
    await registerCampaign(context, [amount])
    await context.vault.write.fundCampaign([CAMPAIGN_ID], {
      account: context.funder.account,
      value: amount,
    })
    const evidenceHash = await submitAndVerify(context)
    await context.vault.write.releaseFunds([CAMPAIGN_ID, BigInt(1), releaseKey], {
      account: context.disburser.account,
    })

    const milestone = await context.vault.read.getMilestone([CAMPAIGN_ID, BigInt(1)])
    assert.equal(milestone.evidenceHash, evidenceHash)
    assert.equal(milestone.verified, true)
    assert.equal(milestone.released, true)
    assert.equal(await context.vault.read.releaseKeyUsed([releaseKey]), true)
  })
})
