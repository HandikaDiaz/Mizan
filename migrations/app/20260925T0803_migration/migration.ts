#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/7036377a389f83a4c2b8286346fca85693937a3b0a9a04e7c00dd97e89e85a81/contract';
import startContract from '../../snapshots/7036377a389f83a4c2b8286346fca85693937a3b0a9a04e7c00dd97e89e85a81/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e8abfc5aa1f7d91569cbbdb2bd3b7a507a6056cdd280570f40f13ea155846d9b/contract';
import endContract from '../../snapshots/e8abfc5aa1f7d91569cbbdb2bd3b7a507a6056cdd280570f40f13ea155846d9b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'rawCapture',
        column: col('campaignCheckedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
