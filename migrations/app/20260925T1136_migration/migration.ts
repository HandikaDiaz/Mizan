#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/469b5e8dc45125020f014e26a27c9e6eb91e621f0a1758d32f1b83a87d925823/contract';
import endContract from '../../snapshots/469b5e8dc45125020f014e26a27c9e6eb91e621f0a1758d32f1b83a87d925823/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7036377a389f83a4c2b8286346fca85693937a3b0a9a04e7c00dd97e89e85a81/contract';
import startContract from '../../snapshots/7036377a389f83a4c2b8286346fca85693937a3b0a9a04e7c00dd97e89e85a81/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'analysis',
        constraint: 'analysis_disasterType_check_77cea590',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'disasterEvent',
        constraint: 'disasterEvent_disasterType_check_77cea590',
      }),
      this.addColumn({
        schema: 'public',
        table: 'rawCapture',
        column: col('campaignCheckedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'analysis',
        constraint: 'analysis_disasterType_check_0ba89e00',
        expression:
          "\"disasterType\" IN ('GEMPA_BUMI', 'BANJIR', 'TANAH_LONGSOR', 'KARHUTLA', 'TSUNAMI', 'ERUPSI_GUNUNG_API', 'KEKERINGAN', 'ANGIN_PUTING_BELIUNG', 'LAINNYA')",
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'disasterEvent',
        constraint: 'disasterEvent_disasterType_check_0ba89e00',
        expression:
          "\"disasterType\" IN ('GEMPA_BUMI', 'BANJIR', 'TANAH_LONGSOR', 'KARHUTLA', 'TSUNAMI', 'ERUPSI_GUNUNG_API', 'KEKERINGAN', 'ANGIN_PUTING_BELIUNG', 'LAINNYA')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
