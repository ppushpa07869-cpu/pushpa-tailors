import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const MeasurementTypes = [
  'Standard (సాధారణం)',
  'Princess Cut (ప్రిన్సెస్ కట్)',
  'Boat Neck (బోట్ నెక్)',
  'High Neck (హై నెక్)',
  'Deep Neck (డీప్ నెక్)',
  'Others (ఇతర)'
] as const;

export type MeasurementType = typeof MeasurementTypes[number];

export interface Measurement {
  id?: string;
  customerId: string;
  measurementType: MeasurementType;
  bust?: number;
  waist?: number;
  shoulder?: number;
  frontNeck?: number;
  backNeck?: number;
  sleeveLength?: number;
  sleeveRound?: number;
  blouseLength?: number;
  armHole?: number;
  chestRound?: number;
  margin?: number;
  notes?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

const optionalNumericField = z.preprocess(
  (val) => (val === '' || val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))) ? undefined : Number(val),
  z.number().positive('Must be greater than zero').optional()
);

export const measurementSchema = z.object({
  measurementType: z.enum(MeasurementTypes, {
    message: 'Please select a valid measurement type'
  }),
  bust: optionalNumericField,
  waist: optionalNumericField,
  shoulder: optionalNumericField,
  frontNeck: optionalNumericField,
  backNeck: optionalNumericField,
  sleeveLength: optionalNumericField,
  sleeveRound: optionalNumericField,
  blouseLength: optionalNumericField,
  armHole: optionalNumericField,
  chestRound: optionalNumericField,
  margin: optionalNumericField,
  notes: z.string().optional(),
});

export type MeasurementFormData = z.infer<typeof measurementSchema>;
