#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/831f639277eef802f353a0ebba48645d66b98ef8315749b274fe8f49a8a8d92f/contract';
import endContract from '../../snapshots/831f639277eef802f353a0ebba48645d66b98ef8315749b274fe8f49a8a8d92f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a4c6945ba10418539499d9f156220d330650ee91afff9a3ec1900bf43c4727d8/contract';
import startContract from '../../snapshots/a4c6945ba10418539499d9f156220d330650ee91afff9a3ec1900bf43c4727d8/contract.json' with { type: 'json' };
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
      this.createTable({
        schema: 'public',
        table: 'campaign',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('donatur', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('judul', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('penyelenggara', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('satuan', 'text', {
            notNull: true,
            default: lit('BNB'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('menunggu'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('target', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('terkumpul', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'userWallet',
        columns: [
          col('address', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('chainType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('privyWalletId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('walletType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('avatarUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('dataConsent', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('dataConsentAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('dataConsentVersion', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('domicile', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('onboardingCompletedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('referralSource', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('referralSourceOther', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('role', 'text', {
          notNull: true,
          default: lit('USER'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('userType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('whatsappNotificationConsent', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('whatsappNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('privyId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-user-privyId', {
        check: () => placeholder('backfill-user-privyId:check'),
        run: () => placeholder('backfill-user-privyId:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'privyId' }),
      this.dropNotNull({ schema: 'public', table: 'user', column: 'email' }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_role_check_758453b1',
        expression: "\"role\" IN ('USER', 'ADMIN', 'BENEFACTOR', 'BENEFACTORY')",
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_privyId_key',
        columns: ['privyId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_username_key',
        columns: ['username'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'userWallet',
        constraint: 'userWallet_privyWalletId_key',
        columns: ['privyWalletId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'userWallet',
        constraint: 'userWallet_address_chainType_key',
        columns: ['address', 'chainType'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'userWallet',
        index: 'userWallet_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'userWallet',
        foreignKey: {
          name: 'userWallet_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
