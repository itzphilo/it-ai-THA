import { z } from "zod";

export const FieldsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  available: z.string().min(1, "Availability is required"),
  skills: z.array(z.string()),
});

export const AdditionalQuestionSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  content: z.string().optional(),
});

export const CandidateSchema = z.object({
  sessionId: z.string(),
  fields: FieldsSchema,
  additionalQuestions: z.array(AdditionalQuestionSchema),
});

export const CandidatesArraySchema = z.array(CandidateSchema);
