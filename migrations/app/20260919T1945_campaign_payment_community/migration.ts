#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/15859cba78ee101600b5bbee86d9b613573049feca819543b94fc87fce7449b7/contract';
import startContract from '../../snapshots/15859cba78ee101600b5bbee86d9b613573049feca819543b94fc87fce7449b7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract';
import endContract from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract.json' with { type: 'json' };
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
        table: 'analysis',
        columns: [
          col('confidenceScore', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('disasterType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('eventId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('extractedLocation', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isDisaster', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('rawCaptureId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'analysis_disasterType_check_77cea590',
            "\"disasterType\" IN ('GEMPA_BUMI', 'BANJIR', 'TANAH_LONGSOR', 'KARHUTLA', 'TSUNAMI', 'ERUPSI_GUNUNG_API', 'KEKERINGAN', 'LAINNYA')",
          ),
        ],
      }),
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
      this.createTable({
        schema: 'public',
        table: 'disasterEvent',
        columns: [
          col('capitalCity', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('disasterType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('firstDetectedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastUpdatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('locationName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('officialConfirmed', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('province', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('validationStatus', 'text', {
            notNull: true,
            default: lit('UNVERIFIED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'disasterEvent_disasterType_check_77cea590',
            "\"disasterType\" IN ('GEMPA_BUMI', 'BANJIR', 'TANAH_LONGSOR', 'KARHUTLA', 'TSUNAMI', 'ERUPSI_GUNUNG_API', 'KEKERINGAN', 'LAINNYA')",
          ),
          checkExpression(
            'disasterEvent_validationStatus_check_a271e93d',
            "\"validationStatus\" IN ('UNVERIFIED', 'CORROBORATED', 'OFFICIAL_CONFIRMED', 'REJECTED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'rawCapture',
        columns: [
          col('authorName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('authorVerified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('capturedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('contentHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('contentText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('engagementMetrics', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mediaUrls', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('publishedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('sourceId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'scrapeJob',
        columns: [
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('endDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('errorMessage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('processedData', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('startDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('startedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalSources', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'scrapeJob_status_check_f5cc9040',
            "\"status\" IN ('PENDING', 'PLANNING', 'SCRAPING', 'ANALYZING', 'COMPLETED', 'FAILED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'source',
        columns: [
          col('baseUrlOrHandle', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dataFormats', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isOfficial', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sourceType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'source_dataFormats_check_ff9e5fea',
            "\"dataFormats\" IN ('JSON', 'RSS', 'HTML', 'OTHERS')",
          ),
          checkExpression(
            'source_sourceType_check_51734c6c',
            "\"sourceType\" IN ('OFFICIAL', 'NEWS', 'SOCIAL_MEDIA')",
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
      this.addUnique({
        schema: 'public',
        table: 'analysis',
        constraint: 'analysis_rawCaptureId_key',
        columns: ['rawCaptureId'],
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
      this.addUnique({
        schema: 'public',
        table: 'rawCapture',
        constraint: 'rawCapture_contentHash_key',
        columns: ['contentHash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'analysis',
        index: 'analysis_eventId_idx_6a266d47',
        columns: ['eventId'],
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
      this.createIndex({
        schema: 'public',
        table: 'disasterEvent',
        index: 'disasterEvent_disasterType_idx_7f709b63',
        columns: ['disasterType'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disasterEvent',
        index: 'disasterEvent_validationStatus_idx_e615ae80',
        columns: ['validationStatus'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'rawCapture',
        index: 'rawCapture_capturedAt_idx_2c071597',
        columns: ['capturedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'rawCapture',
        index: 'rawCapture_sourceId_idx_d92a2571',
        columns: ['sourceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'scrapeJob',
        index: 'scrapeJob_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'source',
        index: 'source_sourceType_idx_d8b2a801',
        columns: ['sourceType'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'analysis',
        foreignKey: {
          name: 'analysis_rawCaptureId_fkey',
          columns: ['rawCaptureId'],
          references: { schema: 'public', table: 'rawCapture', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'analysis',
        foreignKey: {
          name: 'analysis_eventId_fkey',
          columns: ['eventId'],
          references: { schema: 'public', table: 'disasterEvent', columns: ['id'] },
        },
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
      this.addForeignKey({
        schema: 'public',
        table: 'rawCapture',
        foreignKey: {
          name: 'rawCapture_sourceId_fkey',
          columns: ['sourceId'],
          references: { schema: 'public', table: 'source', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
