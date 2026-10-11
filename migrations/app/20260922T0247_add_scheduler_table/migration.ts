#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract';
import startContract from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7036377a389f83a4c2b8286346fca85693937a3b0a9a04e7c00dd97e89e85a81/contract';
import endContract from '../../snapshots/7036377a389f83a4c2b8286346fca85693937a3b0a9a04e7c00dd97e89e85a81/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
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
      this.dropColumn({ schema: 'public', table: 'campaign', column: 'donatur' }),
      this.dropColumn({ schema: 'public', table: 'campaign', column: 'judul' }),
      this.dropColumn({ schema: 'public', table: 'campaign', column: 'penyelenggara' }),
      this.dropColumn({ schema: 'public', table: 'campaign', column: 'satuan' }),
      this.dropColumn({ schema: 'public', table: 'campaign', column: 'target' }),
      this.dropColumn({ schema: 'public', table: 'campaign', column: 'terkumpul' }),
      this.dropColumn({ schema: 'public', table: 'disasterEvent', column: 'capitalCity' }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_role_check_758453b1',
      }),
      this.createTable({
        schema: 'public',
        table: 'scheduler',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('cron', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('jobType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastFinishedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('lastRunAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nextRunAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('currency', 'text', {
          notNull: true,
          default: lit('BNB'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('donorCount', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('raisedAmountWei', 'text', {
          notNull: true,
          default: lit('0'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'disasterEvent',
        column: col('city', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'disasterEvent',
        column: col('severityLevel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('organizerName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-campaign-organizerName', {
        check: () => placeholder('backfill-campaign-organizerName:check'),
        run: () => placeholder('backfill-campaign-organizerName:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'campaign', column: 'organizerName' }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('title', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-campaign-title', {
        check: () => placeholder('backfill-campaign-title:check'),
        run: () => placeholder('backfill-campaign-title:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'campaign', column: 'title' }),
      this.setDefault({
        schema: 'public',
        table: 'campaign',
        column: 'status',
        defaultSql: "DEFAULT 'ACTIVE'",
        operationClass: 'widening',
      }),
      this.setDefault({
        schema: 'public',
        table: 'user',
        column: 'role',
        defaultSql: "DEFAULT 'BENEFACTOR'",
        operationClass: 'widening',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_status_check_ce20f2be',
        expression: "\"status\" IN ('ACTIVE', 'COMPLETED', 'CLOSED')",
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'disasterEvent',
        constraint: 'disasterEvent_severityLevel_check_62b7cb66',
        expression: "\"severityLevel\" IN ('RENDAH', 'SEDANG', 'TINGGI', 'KRITIS')",
      }),
      this.addUnique({
        schema: 'public',
        table: 'scheduler',
        constraint: 'scheduler_name_key',
        columns: ['name'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_role_check_07b2d93b',
        expression: "\"role\" IN ('BENEFACTOR', 'BENEFICIARY', 'ADMIN')",
      }),
      this.createIndex({
        schema: 'public',
        table: 'scheduler',
        index: 'scheduler_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'scheduler',
        index: 'scheduler_jobType_idx_65878b3e',
        columns: ['jobType'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
