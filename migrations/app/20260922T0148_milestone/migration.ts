#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract';
import startContract from '../../snapshots/471c3375a45c5c83a01aeaf1cf75090b29197abbf13fb1c1b3aff699e5de8b80/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7f4a00b82c26ff4dc02484d0d7bdb452a92a5b9558db2d6c90c9c2accca7f57d/contract';
import endContract from '../../snapshots/7f4a00b82c26ff4dc02484d0d7bdb452a92a5b9558db2d6c90c9c2accca7f57d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, placeholder } from '@prisma/orm-postgres/migration';

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
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_role_check_07b2d93b',
        expression: "\"role\" IN ('BENEFACTOR', 'BENEFICIARY', 'ADMIN')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
