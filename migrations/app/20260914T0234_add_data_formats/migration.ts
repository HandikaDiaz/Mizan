#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/7a244ad21dd3ec59fc6cdd6c726844fadc8a556a421ef4f567bca0dbde62a151/contract';
import startContract from '../../snapshots/7a244ad21dd3ec59fc6cdd6c726844fadc8a556a421ef4f567bca0dbde62a151/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a4c6945ba10418539499d9f156220d330650ee91afff9a3ec1900bf43c4727d8/contract';
import endContract from '../../snapshots/a4c6945ba10418539499d9f156220d330650ee91afff9a3ec1900bf43c4727d8/contract.json' with { type: 'json' };
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
        table: 'analysis',
        constraint: 'analysis_disasterType_check_5cc3211b',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'disasterEvent',
        constraint: 'disasterEvent_disasterType_check_5cc3211b',
      }),
      this.dropColumn({ schema: 'public', table: 'source', column: 'platforms' }),
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
      this.addColumn({
        schema: 'public',
        table: 'source',
        column: col('dataFormats', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract as unknown as End, 'backfill-source-dataFormats', {
        check: () => placeholder('backfill-source-dataFormats:check'),
        run: () => placeholder('backfill-source-dataFormats:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'source', column: 'dataFormats' }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'analysis',
        constraint: 'analysis_disasterType_check_77cea590',
        expression:
          "\"disasterType\" IN ('GEMPA_BUMI', 'BANJIR', 'TANAH_LONGSOR', 'KARHUTLA', 'TSUNAMI', 'ERUPSI_GUNUNG_API', 'KEKERINGAN', 'LAINNYA')",
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'disasterEvent',
        constraint: 'disasterEvent_disasterType_check_77cea590',
        expression:
          "\"disasterType\" IN ('GEMPA_BUMI', 'BANJIR', 'TANAH_LONGSOR', 'KARHUTLA', 'TSUNAMI', 'ERUPSI_GUNUNG_API', 'KEKERINGAN', 'LAINNYA')",
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'source',
        constraint: 'source_dataFormats_check_ff9e5fea',
        expression: "\"dataFormats\" IN ('JSON', 'RSS', 'HTML', 'OTHERS')",
      }),
      this.createIndex({
        schema: 'public',
        table: 'scrapeJob',
        index: 'scrapeJob_status_idx_e98638ab',
        columns: ['status'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
