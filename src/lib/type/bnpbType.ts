export interface BNPBResult {
  sourceId: string;
  number: string;
  disasterCode: string;
  regencyId: string;

  disasterDate: string;
  disasterType: string;

  location: string;
  regency: string;
  province: string;

  documentation?: string;
  reason?: string;

  died: number;
  disappeared: number;
  injured: number;

  damagedHouse: number;
  destroyedHouse: number;
  floodedHouse: number;

  destroyedInfrastructure?: string;
}