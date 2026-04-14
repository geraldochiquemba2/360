import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const RegisterSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(9, "Telefone inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["candidato", "mentor", "admin"]).default("candidato"),
  
  // Profile fields (conditional in UI, but validated here)
  formation: z.string().optional(),
  areaOfInterest: z.string().optional(),
  experienceLevel: z.string().optional(),
  careerGoals: z.string().optional(),
  difficulties: z.array(z.string()).optional(),
  province: z.string().optional(),
  municipality: z.string().optional(),
  cvFile: z.any().optional(), // Allow file objects from browser
  
  // Mentor specific fields
  bio: z.string().optional(),
  specialties: z.string().optional(),
  linkedinUrl: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }),
  token: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
