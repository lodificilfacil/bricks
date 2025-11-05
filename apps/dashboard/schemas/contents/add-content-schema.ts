import { z } from 'zod';

export const addContentSchema = z.object({
  title: z
    .string({
      invalid_type_error: 'Title must be a string.'
    })
    .trim()
    .max(255, 'Maximum 255 characters allowed.'),
  type: z.enum(['course', 'microlearning'], {
    required_error: 'Type is required.',
    invalid_type_error: 'Type must be "course" or "microlearning".'
  }),
  folderId: z
    .string({
      invalid_type_error: 'Folder ID must be a string.'
    })
    .uuid('Folder ID must be a valid UUID.')
    .optional()
    .nullable(),
  organizationId: z.string().uuid('Organization ID must be a valid UUID.')
});

export type AddContentSchema = z.infer<typeof addContentSchema>;
