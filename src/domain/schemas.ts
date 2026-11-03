import { z } from 'zod/v4';
import { validateStayDates } from './dates';

export const citySchema = z.enum(['riyadh', 'jeddah', 'dubai']);

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const isoDateSchema = z.string().regex(isoDateRegex, 'Must be YYYY-MM-DD');

export const searchParamsSchema = z
  .object({
    city: citySchema,
    checkIn: isoDateSchema,
    checkOut: isoDateSchema,
    adults: z.coerce.number().int().min(1).max(4),
    maxPrice: z.coerce.number().int().positive().optional(),
    stars: z.coerce.number().int().min(1).max(5).optional(),
    sort: z.enum(['price', 'rating']).optional(),
  })
  .refine((d) => !validateStayDates(d.checkIn, d.checkOut), {
    message: 'Invalid stay dates',
    path: ['checkIn'],
  });

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const holdRequestSchema = z
  .object({
    hotelId: z.string().min(1),
    roomId: z.string().min(1),
    checkIn: isoDateSchema,
    checkOut: isoDateSchema,
    adults: z.coerce.number().int().min(1).max(4),
    quotedTotal: z.number().int().positive(),
  })
  .refine((d) => !validateStayDates(d.checkIn, d.checkOut), {
    message: 'Invalid stay dates',
    path: ['checkIn'],
  });

export type HoldRequest = z.infer<typeof holdRequestSchema>;

export const guestSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number too short').max(20),
});

export type GuestInput = z.infer<typeof guestSchema>;
