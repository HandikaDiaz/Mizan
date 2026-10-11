# Disbursement M1 — Design Decisions and Deployment Inventory

Status: **accepted for M2 implementation**  
Decision date: **2026-10-06**  
Network: **BNB Smart Chain Testnet (chain ID 97)**

This document freezes the disbursement lifecycle, amount invariants, refund
policy, signer custody, and legacy deployment handling. It does not authorize or
perform any blockchain transaction.

## 1. Reference implementation

Commit `7e4a73a` is a design and test reference only. It must not be
cherry-picked as a whole.

Keep these properties:

- donations remain in contract escrow until an approved release;
- verified amounts are reserved before release;
- available funds are `funded - released - reserved`;
- release is idempotent and can only pay the campaign recipient;
- contract state is updated before the external transfer;
- pause and unpause are both available;
- evidence, AI output, and policy content remain off-chain and are represented
  on-chain only by deterministic hashes.

Change these properties in the next contract:

- register the milestone IDs and fixed amounts when the campaign is registered;
- separate `VERIFIER_ROLE` from `DISBURSER_ROLE`;
- rejected AI or admin reviews remain off-chain so a beneficiary can submit a
  corrected request for the same milestone;
- add the refund state and donor-initiated refund path defined below;
- use one versioned ABI and typed chain client instead of hand-maintained
  selectors and event topics.

## 2. Disbursement lifecycle

The authoritative off-chain request state machine is:

```text
SUBMITTED
  ├─ AI approves ───────────────→ AI_VERIFIED
  ├─ AI rejects ────────────────→ REJECTED
  └─ AI unavailable/uncertain ──→ MANUAL_REVIEW

AI_VERIFIED / MANUAL_REVIEW
  ├─ Admin approves ────────────→ ADMIN_APPROVED
  └─ Admin rejects ─────────────→ REJECTED

ADMIN_APPROVED
  └─ First chain transaction broadcast → CHAIN_PENDING

CHAIN_PENDING
  ├─ Receipt and release event valid ──→ DISBURSED
  └─ Transaction definitively fails ───→ CHAIN_FAILED

CHAIN_FAILED
  └─ Explicit retry of the same request → CHAIN_PENDING
```

Rules:

- `REJECTED` and `DISBURSED` are terminal for one request.
- `CHAIN_FAILED` remains the same active request; retry must not create a new
  request or idempotency key.
- An RPC timeout or unknown receipt is not a definitive failure. The request
  stays `CHAIN_PENDING` until reconciliation determines the transaction result.
- The database may enter `DISBURSED` only after validating the receipt, contract
  address, chain ID, campaign ID, milestone ID, recipient, amount, and release
  event.
- AI only produces a recommendation. It cannot hold a signer or cause a chain
  transaction without an authenticated admin decision.

The next contract should use a smaller on-chain milestone lifecycle:

```text
PLANNED → VERIFIED/RESERVED → RELEASED
```

Rejection and document revision stay in the database. This avoids permanently
rejecting an on-chain milestone when a beneficiary is allowed to resubmit proof.

## 3. One active request per milestone

A milestone can have at most one request in any of these active states:

```text
SUBMITTED
AI_VERIFIED
MANUAL_REVIEW
ADMIN_APPROVED
CHAIN_PENDING
CHAIN_FAILED
```

A new request is allowed only when the previous request is `REJECTED`. A
`DISBURSED` milestone never accepts another request.

This rule must be enforced twice in M4:

1. a database constraint or transaction-safe uniqueness mechanism; and
2. a server-side check executed in the same transaction that creates the
   request.

## 4. Amount invariants

The initial implementation does not support partial milestone disbursement.
Smaller releases must be represented as separate milestones at campaign
creation.

The following equalities are mandatory:

```text
sum(campaign milestone amounts) == campaign target amount
request.requestedAmountWei == milestone.amountWei
sum(request item quantity × unit price) == request.requestedAmountWei
on-chain release amount == registered on-chain milestone amount
```

Additional rules:

- every amount is a positive integer wei value;
- a milestone amount and recipient are immutable after campaign registration;
- a milestone can be released once;
- a funding transaction that would exceed the remaining campaign target
  reverts instead of creating excess escrow;
- the contract, not a client request, is the source of truth for the release
  amount and recipient.

## 5. Refund policy

The contract must support the public product promise that an unsuccessful
campaign does not leave donor funds under operator control.

Policy locked for the next contract:

1. Every campaign has an immutable funding deadline.
2. If the target is reached on or before the deadline, the campaign becomes
   funded, refunds are disabled, and milestone disbursement is enabled.
3. If the deadline passes below target, the campaign becomes refundable and
   milestone verification/release is disabled.
4. Each donor claims their own full recorded contribution through a pull-based
   `claimRefund` flow. The operator cannot redirect refunds.
5. An admin may cancel a campaign and enable full refunds only before any
   milestone has been released.
6. A campaign cannot be cancelled through the normal path after its first
   release. An exceptional incident must be paused and handled by governance;
   it must not introduce an arbitrary admin withdrawal.
7. Release and refund states are mutually exclusive.

The current `daysLeft` presentation field is not an acceptable deadline source.
M4 must add an immutable timestamp used by both the database and contract.

## 6. Signer custody

### Testnet and hackathon

- `DEFAULT_ADMIN_ROLE`: offline deployer/recovery wallet. Its key must not be
  loaded by the Next.js application.
- `CAMPAIGN_MANAGER_ROLE`: dedicated server-side operational signer for
  campaign registration and activation.
- `VERIFIER_ROLE`: records an authenticated admin approval and reserves the
  fixed milestone amount.
- `DISBURSER_ROLE`: releases a verified milestone. For the testnet MVP, one
  dedicated operational signer may hold both verifier and disburser roles, but
  the roles remain separate so they can be rotated independently.
- `PAUSER_ROLE`: separate operations/security wallet used only for emergency
  pause and unpause.

No signer secret may use a `NEXT_PUBLIC_*` variable, be returned to the browser,
or be stored in the database. The deployer/admin signer must not be reused as an
application signer.

### Mainnet gate

This M1 decision does not authorize mainnet deployment. Before mainnet:

- `DEFAULT_ADMIN_ROLE` moves to a multisig with delayed administration;
- operational signing uses a managed signer/HSM or equivalent protected
  service, not a raw application environment key;
- verifier and disburser custody are separated;
- the contract and signer runbook receive an independent security audit.

## 7. BSC Testnet deployment inventory

Inventory was collected with read-only RPC calls. Addresses and role holders are
public blockchain data; no secret material is recorded here.

| Purpose                                        | Address                                      |     Runtime |     Balance | Decision                                                         |
| ---------------------------------------------- | -------------------------------------------- | ----------: | ----------: | ---------------------------------------------------------------- |
| Current configured direct-transfer contract    | `0x260949115e71799C285cfe7Ee50003f6edd95530` | 3,760 bytes |    `0 tBNB` | Historical after v3 deploy; do not use for new donations         |
| Legacy escrow contract                         | `0xE8e0eE10f620464d9CD475c6A2Ba9dC13B9623de` | 6,409 bytes | `0.01 tBNB` | Settle through its existing milestone flow, then retire          |
| Address currently displayed by the public site | `0x7A3f9C2B41dE8b5061aA4f17C93eD28B5a0E9b21` | no bytecode |    `0 tBNB` | Invalid display address; replace with canonical v3 address in M3 |

Known active role holders on the legacy contract were verified with `hasRole`:

| Role                    | Holder                                       |
| ----------------------- | -------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`    | `0x8a08A09fC516ADA95DDd267D60787Ce4B3A932De` |
| `CAMPAIGN_MANAGER_ROLE` | `0x49FcE4Fc03F91bEB1f04f7D3cD89C5DD856A380e` |
| `VERIFIER_ROLE`         | `0xfC6AF7726436D786111Cb7c35A7F42dBF13De54e` |
| `PAUSER_ROLE`           | `0xc76a78A2e3185497fa24a887AE859Ebd11016B5d` |

Operational access to the legacy manager and default admin was validated
locally. The legacy verifier and pauser secrets are not part of the current
configuration. No private key was printed, copied, or committed.

## 8. Legacy balance decision

The remaining `0.01 tBNB` is recoverable through the contract's normal flow.
Current read-only state:

```text
campaign ID:      804936431
recipient:        0x8a08A09fC516ADA95DDd267D60787Ce4B3A932De
target:           1 tBNB
funded:           0.02 tBNB
released:         0.01 tBNB
reserved:         0 tBNB
available:        0.01 tBNB
campaign active:  yes
contract paused:  no
milestone 1:      RELEASED, 0.01 tBNB
milestone 2:      NONE
```

Approved settlement runbook for a later, explicitly authorized transaction:

1. Grant `VERIFIER_ROLE` to a dedicated recovery signer using the existing
   default admin.
2. Submit milestone `2` for exactly `0.01 tBNB` with a non-zero evidence hash
   using the existing campaign manager.
3. Verify milestone `2` with the recovery verifier.
4. Release milestone `2`; the contract can only pay the immutable recipient
   shown above.
5. Verify the `FundsReleased` event and confirm contract balance and available
   amount are zero.
6. Revoke the temporary verifier role and mark the deployment retired.

No emergency withdrawal, storage mutation, or balance migration is required.
No step in this runbook was executed during M1.

## 9. M1 exit criteria

- [x] Commit `7e4a73a` classified as a reference, not a cherry-pick target.
- [x] Request lifecycle and retry behavior fixed.
- [x] One-active-request rule fixed.
- [x] Exact milestone amount rule fixed.
- [x] Refund policy fixed.
- [x] Testnet and mainnet signer custody fixed.
- [x] Current, legacy, and invalid display deployments inventoried.
- [x] Legacy `0.01 tBNB` settlement feasibility verified.
- [x] No blockchain mutation performed.

M1 is complete. M2 may implement the new escrow contract against these
decisions.
