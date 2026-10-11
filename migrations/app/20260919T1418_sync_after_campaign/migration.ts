#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/15859cba78ee101600b5bbee86d9b613573049feca819543b94fc87fce7449b7/contract';
import startContract from '../../snapshots/15859cba78ee101600b5bbee86d9b613573049feca819543b94fc87fce7449b7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/831f639277eef802f353a0ebba48645d66b98ef8315749b274fe8f49a8a8d92f/contract';
import endContract from '../../snapshots/831f639277eef802f353a0ebba48645d66b98ef8315749b274fe8f49a8a8d92f/contract.json' with { type: 'json' };
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
      this.addUnique({
        schema: 'public',
        table: 'analysis',
        constraint: 'analysis_rawCaptureId_key',
        columns: ['rawCaptureId'],
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
