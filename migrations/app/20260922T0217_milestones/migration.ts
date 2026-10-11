#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/27a68a675affc383f239b010bbd543fbd317e1cfbdc84dbee8f80d4c8e1979c5/contract';
import endContract from '../../snapshots/27a68a675affc383f239b010bbd543fbd317e1cfbdc84dbee8f80d4c8e1979c5/contract.json' with { type: 'json' };
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
      this.createTable({
        schema: 'public',
        table: 'milestone',
        columns: [
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
        table: 'campaign',
        column: col('category', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-campaign-category', {
        check: async (db) => {
          // Pengecekan apakah masih ada data campaign yang category-nya NULL
          const result = await db.query(
            `SELECT COUNT(*) FROM "public"."campaign" WHERE "category" IS NULL`
          );
          return parseInt(result.rows[0].count, 10) === 0;
        },
        run: async (db) => {
          // Mengisi nilai default 'DONASI_UMUM' untuk data lama yang belum punya kategori
          await db.query(
            `UPDATE "public"."campaign" SET "category" = 'DONASI_UMUM' WHERE "category" IS NULL`
          );
        },
      }),
      this.setNotNull({ schema: 'public', table: 'campaign', column: 'category' }),
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
      this.createIndex({
        schema: 'public',
        table: 'milestone',
        index: 'milestone_campaignId_idx_3aacd648',
        columns: ['campaignId'],
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
