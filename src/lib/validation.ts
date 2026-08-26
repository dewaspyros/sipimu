import { z } from "zod";

/**
 * Skema validasi bersama untuk input pengguna.
 * Dipakai di sisi klien sebagai lapis pertama; RLS dan edge function tetap
 * menjadi lapis validasi terakhir di sisi server.
 */

const trimmed = (max: number) => z.string().trim().max(max);

export const patientFormSchema = z.object({
  clinicalPathway: trimmed(120).min(1, { message: "Jenis clinical pathway wajib dipilih" }),
  verifikator: trimmed(120),
  dpjp: trimmed(120),
  noRM: trimmed(20)
    .min(1, { message: "No. RM wajib diisi" })
    .regex(/^[A-Za-z0-9.\-/]+$/, { message: "No. RM hanya boleh berisi huruf, angka, titik, strip, atau garis miring" }),
  patientNameAge: trimmed(150).min(1, { message: "Nama pasien wajib diisi" }),
  admissionDate: trimmed(10).min(1, { message: "Tanggal masuk wajib diisi" }),
  admissionTime: trimmed(8).min(1, { message: "Jam masuk wajib diisi" }),
  dischargeDate: trimmed(10).optional().or(z.literal("")),
  dischargeTime: trimmed(8).optional().or(z.literal("")),
  lengthOfStay: trimmed(5).optional().or(z.literal("")),
  bangsal: trimmed(50).optional().or(z.literal("")),
  keterangan: trimmed(1000).optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

/** ID grup / nomor tujuan Fonnte. */
export const whatsappTargetSchema = z
  .string()
  .trim()
  .min(1, { message: "ID grup tidak boleh kosong" })
  .max(64, { message: "ID grup maksimal 64 karakter" })
  .regex(/^[0-9A-Za-z@.\-]+$/, { message: "ID grup mengandung karakter tidak valid" });

export const whatsappSettingsSchema = z.object({
  api_key: z.string().trim().max(255, { message: "API key maksimal 255 karakter" }),
  notification_phones: z
    .array(whatsappTargetSchema)
    .max(50, { message: "Maksimal 50 grup tujuan" }),
  message_template: z
    .string()
    .trim()
    .min(1, { message: "Template pesan tidak boleh kosong" })
    .max(4000, { message: "Template pesan maksimal 4000 karakter" }),
});

/** Mengubah error zod menjadi satu kalimat yang siap ditampilkan ke pengguna. */
export const firstZodMessage = (error: z.ZodError): string =>
  error.errors[0]?.message ?? "Data yang dimasukkan tidak valid";
