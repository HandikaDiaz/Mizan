import { describe, expect, it } from 'vitest';
import { onboardingProfileSchema } from './profile-schema';

describe('onboardingProfileSchema', () => {
  it('accepts the approved onboarding profile for BENEFACTOR', () => {
    const result = onboardingProfileSchema.parse({
      role: 'BENEFACTOR',
      name: 'Ahmad Rizky',
      username: 'mizan-user',
      domicile: 'Yogyakarta',
      whatsappNumber: '081234567890',
      whatsappNotificationConsent: true,
      referralSource: 'FRIEND',
      referralSourceOther: null,
    });

    expect(result.username).toBe('mizan-user');
    expect(result.role).toBe('BENEFACTOR');
    expect(result.name).toBe('Ahmad Rizky');
  });

  it('accepts the approved onboarding profile for BENEFICIARY', () => {
    const result = onboardingProfileSchema.parse({
      role: 'BENEFICIARY',
      name: 'Siti Rahma',
      username: 'mizan-beneficiary',
      domicile: 'Jakarta',
      whatsappNumber: '+6281234567890',
      whatsappNotificationConsent: true,
      referralSource: 'COMMUNITY',
      referralSourceOther: null,
    });

    expect(result.username).toBe('mizan-beneficiary');
    expect(result.role).toBe('BENEFICIARY');
    expect(result.name).toBe('Siti Rahma');
  });

  it('rejects incomplete referral source OTHER', () => {
    const result = onboardingProfileSchema.safeParse({
      role: 'BENEFACTOR',
      name: 'User Test',
      username: 'mizan-user',
      domicile: 'Yogyakarta',
      whatsappNumber: '08123',
      whatsappNotificationConsent: false,
      referralSource: 'OTHER',
      referralSourceOther: '',
    });

    expect(result.success).toBe(false);
  });
});
