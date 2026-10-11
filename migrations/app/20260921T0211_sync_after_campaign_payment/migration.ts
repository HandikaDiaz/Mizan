#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract';
import endContract from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/831f639277eef802f353a0ebba48645d66b98ef8315749b274fe8f49a8a8d92f/contract';
import startContract from '../../snapshots/831f639277eef802f353a0ebba48645d66b98ef8315749b274fe8f49a8a8d92f/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'campaignPayment',
        columns: [
          col('amountWei', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('campaignId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('donorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('donorWallet', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idempotencyKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mode', 'text', {
            notNull: true,
            default: lit('MOCK'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('transactionHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('campaignPayment_mode_check_7b45e9f3', "\"mode\" IN ('MOCK', 'ONCHAIN')"),
          checkExpression(
            'campaignPayment_status_check_1439faa3',
            "\"status\" IN ('PENDING', 'CONFIRMED', 'FAILED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'community',
        columns: [
          col('chainType', 'text', {
            notNull: true,
            default: lit('BSC_TESTNET'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ownerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('verificationStatus', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('walletAddress', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'community_verificationStatus_check_c2f2b79a',
            "\"verificationStatus\" IN ('PENDING', 'VERIFIED', 'REJECTED')",
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('aiConfidence', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('aiDraft', 'json', { codecRef: { codecId: 'pg/json@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('aiReference', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('approvedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('approvedById', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('communityId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('contractCampaignId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('contractTransactionHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('recipientWallet', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('rejectionReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('reviewStatus', 'text', {
          notNull: true,
          default: lit('AI_DRAFT'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('source', 'text', {
          notNull: true,
          default: lit('AI_MOCK'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('targetAmountWei', 'text', {
          notNull: true,
          default: lit('0'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_reviewStatus_check_8871a79a',
        expression: "\"reviewStatus\" IN ('AI_DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED')",
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_source_check_49f4562b',
        expression: '"source" IN (\'AI_MOCK\')',
      }),
      this.addUnique({
        schema: 'public',
        table: 'campaignPayment',
        constraint: 'campaignPayment_idempotencyKey_key',
        columns: ['idempotencyKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'community',
        constraint: 'community_walletAddress_chainType_key',
        columns: ['walletAddress', 'chainType'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'campaign',
        index: 'campaign_approvedById_idx_01ef8410',
        columns: ['approvedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'campaign',
        index: 'campaign_communityId_idx_e2c72225',
        columns: ['communityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'campaignPayment',
        index: 'campaignPayment_campaignId_idx_3aacd648',
        columns: ['campaignId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'campaignPayment',
        index: 'campaignPayment_donorId_idx_e0e8e1e7',
        columns: ['donorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'community',
        index: 'community_ownerId_idx_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'campaign',
        foreignKey: {
          name: 'campaign_approvedById_fkey',
          columns: ['approvedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'campaignPayment',
        foreignKey: {
          name: 'campaignPayment_campaignId_fkey',
          columns: ['campaignId'],
          references: { schema: 'public', table: 'campaign', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'campaignPayment',
        foreignKey: {
          name: 'campaignPayment_donorId_fkey',
          columns: ['donorId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'community',
        foreignKey: {
          name: 'community_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'campaign',
        foreignKey: {
          name: 'campaign_communityId_fkey',
          columns: ['communityId'],
          references: { schema: 'public', table: 'community', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
