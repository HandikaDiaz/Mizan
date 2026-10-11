#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/226c4814f24f6edc98c9ac7e712d5947f5cf0009c95c326a5944a9b40ea76a5e/contract';
import startContract from '../../snapshots/226c4814f24f6edc98c9ac7e712d5947f5cf0009c95c326a5944a9b40ea76a5e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b43c626eb3dcbe000a914e2816d6805a17561cf2805e964623a65d8a95ab9c79/contract';
import endContract from '../../snapshots/b43c626eb3dcbe000a914e2816d6805a17561cf2805e964623a65d8a95ab9c79/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_role_check_758453b1',
        expression: "\"role\" IN ('USER', 'ADMIN', 'BENEFACTOR', 'BENEFACTORY')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
