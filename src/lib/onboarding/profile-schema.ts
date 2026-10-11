import { z } from 'zod';

export const referralSourceOptions = [
  { value: 'SOCIAL_MEDIA', label: 'Media Sosial (Instagram / Twitter / TikTok)' },
  { value: 'FRIEND', label: 'Teman / Kerabat' },
  { value: 'COMMUNITY', label: 'Komunitas / Organisasi' },
  { value: 'SEARCH', label: 'Mesin Pencari (Google)' },
  { value: 'EVENT', label: 'Acara / Webinar' },
  { value: 'OTHER', label: 'Lainnya' },
] as const;

export const referralSources = [
  'SOCIAL_MEDIA',
  'FRIEND',
  'COMMUNITY',
  'SEARCH',
  'EVENT',
  'OTHER',
] as const;

export const onboardingProfileSchema = z
  .object({
    role: z.enum(['BENEFACTOR', 'BENEFICIARY']).optional(),
    userType: z.enum(['BENEFACTOR', 'BENEFICIARY', 'DONOR']).optional(),
    name: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter').max(100),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, 'Username minimal 3 karakter')
      .max(30)
      .regex(/^[a-z0-9_-]+$/, 'Username hanya boleh berisi huruf, angka, _ dan -'),
    domicile: z.string().trim().min(2, 'Domisili wajib diisi').max(120),
    whatsappNumber: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((value) => value || null),
    whatsappNotificationConsent: z.boolean().default(false),
    referralSource: z.enum(referralSources, {
      message: 'Pilih sumber informasi Mizan',
    }),
    referralSourceOther: z
      .string()
      .trim()
      .max(120)
      .optional()
      .nullable()
      .transform((value) => value || null),
    dataConsent: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.whatsappNotificationConsent && !value.whatsappNumber) {
      context.addIssue({
        code: 'custom',
        path: ['whatsappNumber'],
        message: 'Nomor WhatsApp diperlukan untuk menerima notifikasi',
      });
    }

    if (value.referralSource === 'OTHER' && !value.referralSourceOther) {
      context.addIssue({
        code: 'custom',
        path: ['referralSourceOther'],
        message: 'Jelaskan sumber informasi lainnya',
      });
    }
  });

export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;

