#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract';
import startContract from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/dab1d0e0b6b9b184965175642f17f5163b653cd6d231acd075fcdac5a57eafcb/contract';
import endContract from '../../snapshots/dab1d0e0b6b9b184965175642f17f5163b653cd6d231acd075fcdac5a57eafcb/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  foreignKey,
  lit,
  unique,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropNotNull({
        schema: 'public',
        table: 'user',
        column: 'email',
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('privyId', 'text', {
          notNull: true,
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('avatarUrl', 'text'),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('role', 'text', {
          notNull: true,
          default: lit('USER'),
        }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_privyId_key',
        columns: ['privyId'],
      }),
      this.createTable({
        schema: 'public',
        table: 'userWallet',
        columns: [
          col('id', 'SERIAL', {
            notNull: true,
            primaryKey: true,
            default: fn('autoincrement()'),
          }),
          col('userId', 'int4', { notNull: true }),
          col('address', 'text', { notNull: true }),
          col('chainType', 'text', { notNull: true }),
          col('walletType', 'text', { notNull: true }),
          col('privyWalletId', 'text'),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
          }),
          col('updatedAt', 'timestamptz', { notNull: true }),
        ],
        constraints: [
          unique(['privyWalletId'], { name: 'userWallet_privyWalletId_key' }),
          unique(['address', 'chainType'], {
            name: 'userWallet_address_chainType_key',
          }),
          foreignKey(['userId'], 'user', ['id'], {
            name: 'userWallet_userId_fkey',
          }),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'userWallet',
        index: 'userWallet_userId_idx_a489d58a',
        columns: ['userId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
