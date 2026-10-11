#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/015a4cd27c4d70e1e3d16b0f6b9f73166f47bd2cb174045f017e00de2dd0af65/contract';
import endContract from '../../snapshots/015a4cd27c4d70e1e3d16b0f6b9f73166f47bd2cb174045f017e00de2dd0af65/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7f4a00b82c26ff4dc02484d0d7bdb452a92a5b9558db2d6c90c9c2accca7f57d/contract';
import startContract from '../../snapshots/7f4a00b82c26ff4dc02484d0d7bdb452a92a5b9558db2d6c90c9c2accca7f57d/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  placeholder,
  primaryKey,
  rawSql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_source_check_49f4562b',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'community',
        constraint: 'community_ownerId_fkey',
        kind: 'foreignKey',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'community',
        index: 'community_ownerId_idx_e2d0c1ef',
      }),
      this.dropColumn({ schema: 'public', table: 'community', column: 'ownerId' }),
      this.createTable({
        schema: 'public',
        table: 'communityMember',
        columns: [
          col('communityId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('STAFF'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('communityMember_role_check_1ff37111', "\"role\" IN ('OWNER', 'STAFF')"),
          checkExpression(
            'communityMember_status_check_767350ca',
            "\"status\" IN ('PENDING', 'ACTIVE', 'REJECTED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'milestone',
        columns: [
          col('aiConfidence', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('aiVerificationNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('amountWei', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('campaignId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('contractMilestoneId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('disbursementRequestedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('disbursementTxHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('order', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('proofImageUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('proofNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'milestone_status_check_7a06db4d',
            "\"status\" IN ('PENDING', 'PROOF_SUBMITTED', 'AI_VERIFIED', 'REJECTED', 'DISBURSEMENT_REQUESTED', 'DISBURSED')",
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('legalDocumentUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('registrationNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('category', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      rawSql({
        id: 'data_migration.backfill-campaign-category',
        label: 'Data transform: backfill-campaign-category',
        operationClass: 'data',
        target: { id: 'postgres' },
        precheck: [
          {
            description: 'Check backfill-campaign-category has work to do',
            sql: 'SELECT EXISTS (SELECT 1 FROM "public"."campaign" WHERE "category" IS NULL) AS ok',
            params: [],
          },
        ],
        execute: [
          {
            description: 'Run backfill-campaign-category',
            sql: 'UPDATE "public"."campaign" SET "category" = \'DONASI_UMUM\' WHERE "category" IS NULL',
            params: [],
          },
        ],
        postcheck: [
          {
            description: 'Verify backfill-campaign-category resolved all violations',
            sql: 'SELECT NOT EXISTS (SELECT 1 FROM "public"."campaign" WHERE "category" IS NULL) AS ok',
            params: [],
          },
        ],
      }),
      this.setNotNull({ schema: 'public', table: 'campaign', column: 'category' }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('inviteCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      rawSql({
        id: 'data_migration.backfill-community-inviteCode',
        label: 'Data transform: backfill-community-inviteCode',
        operationClass: 'data',
        target: { id: 'postgres' },
        precheck: [
          {
            description: 'Check backfill-community-inviteCode has work to do',
            sql: 'SELECT EXISTS (SELECT 1 FROM "public"."community" WHERE "inviteCode" IS NULL) AS ok',
            params: [],
          },
        ],
        execute: [
          {
            description: 'Run backfill-community-inviteCode',
            sql: 'UPDATE "public"."community" SET "inviteCode" = upper(substr(md5(random()::text), 1, 7)) WHERE "inviteCode" IS NULL',
            params: [],
          },
        ],
        postcheck: [
          {
            description: 'Verify backfill-community-inviteCode resolved all violations',
            sql: 'SELECT NOT EXISTS (SELECT 1 FROM "public"."community" WHERE "inviteCode" IS NULL) AS ok',
            params: [],
          },
        ],
      }),
      this.setNotNull({ schema: 'public', table: 'community', column: 'inviteCode' }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_category_check_e13ef3a7',
        expression: "\"category\" IN ('ZAKAT', 'DONASI_UMUM', 'WAKAF', 'BENCANA')",
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_source_check_f0d75fbf',
        expression: "\"source\" IN ('AI_MOCK', 'MANUAL')",
      }),
      this.addUnique({
        schema: 'public',
        table: 'community',
        constraint: 'community_inviteCode_key',
        columns: ['inviteCode'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'communityMember',
        constraint: 'communityMember_userId_communityId_key',
        columns: ['userId', 'communityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'communityMember',
        index: 'communityMember_communityId_idx_e2c72225',
        columns: ['communityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'communityMember',
        index: 'communityMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'milestone',
        index: 'milestone_campaignId_idx_3aacd648',
        columns: ['campaignId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'communityMember',
        foreignKey: {
          name: 'communityMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'communityMember',
        foreignKey: {
          name: 'communityMember_communityId_fkey',
          columns: ['communityId'],
          references: { schema: 'public', table: 'community', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'milestone',
        foreignKey: {
          name: 'milestone_campaignId_fkey',
          columns: ['campaignId'],
          references: { schema: 'public', table: 'campaign', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
