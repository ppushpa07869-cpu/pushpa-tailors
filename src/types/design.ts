import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export const WORK_TYPES = [
  'Machine Work',
  'Stone Work',
  'Patch Work',
  'Combination Work',
] as const;

export type WorkType = typeof WORK_TYPES[number];

export const DESIGN_CATEGORIES = [
  'Blouse Work',
  'Bridal Blouse',
  'Front & Back Neck',
  'Saree Border & Kuchu',
  'Lehenga & Half Saree',
  'Kurti / Dress',
  'Buttas & Motifs',
  'Other / Custom',
] as const;

export type DesignCategory = typeof DESIGN_CATEGORIES[number] | string;

export interface Design {
  id?: string;
  designCode: string;
  name: string;
  category: string;
  workType: WorkType | string;
  price: number;
  description?: string;
  previewImageUrl: string;
  previewImages?: string[];
  machineFiles: string[];
   active: boolean;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export const designSchema = z.object({
  designCode: z.string().min(1, 'Design Code is required (డిజైన్ కోడ్ తప్పనిసరి)'),
  name: z.string().min(1, 'Design Name is required (డిజైన్ పేరు తప్పనిసరి)'),
  category: z.string().min(1, 'Category is required (కేటగిరీ తప్పనిసరి)'),
  workType: z.string().min(1, 'Work Type is required (వర్క్ రకం తప్పనిసరి)'),
  price: z.coerce.number().min(0, 'Price must be a valid non-negative number (ధర కనీసం 0 ఉండాలి)'),
  description: z.string().optional(),
  previewImageUrl: z.string().min(1, 'Preview image is required (ప్రివ్యూ ఫోటో తప్పనిసరి)'),
previewImages: z.array(z.string()).optional(),
  machineFiles: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export type DesignFormData = z.infer<typeof designSchema>;
