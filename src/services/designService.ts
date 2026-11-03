
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebase';
import type { Design, DesignFormData } from '../types/design';

const COLLECTION_NAME = 'designs';
const IMPORT_BATCH_SIZE = 400;

function normalizeCode(value: unknown): string {
  return String(value ?? '').trim();
}

function designsMatch(
  existing: Record<string, unknown>,
  expected: DesignFormData
): boolean {
  return (
    normalizeCode(existing.designCode) ===
    normalizeCode(expected.designCode) &&
    existing.name === expected.name &&
    existing.category === expected.category &&
    existing.workType === expected.workType &&
    existing.price === expected.price &&
    existing.description === expected.description &&
    existing.previewImageUrl === expected.previewImageUrl &&
    JSON.stringify(existing.previewImages ?? []) ===
    JSON.stringify(expected.previewImages ?? []) &&
    JSON.stringify(existing.machineFiles ?? []) ===
    JSON.stringify(expected.machineFiles ?? []) &&
    existing.active === false
  );
}

export const designService = {
  async getDesigns(): Promise<Design[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as Design[];
  },

  async getActiveDesigns(): Promise<Design[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as Design[];
  },

  async getDesign(id: string): Promise<Design | null> {
    const snapshot = await getDoc(
      doc(db, COLLECTION_NAME, id)
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Design;
  },

  async createDesign(
    designData: DesignFormData
  ): Promise<Design> {
    const newDesign = {
      ...designData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      newDesign
    );

    return {
      id: docRef.id,
      ...newDesign,
    } as Design;
  },

  async updateDesign(
    id: string,
    designData: Partial<DesignFormData>
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...designData,
      updatedAt: serverTimestamp(),
    });
  },

  async toggleDesignActive(
    id: string,
    currentStatus: boolean
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      active: !currentStatus,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Activates every design in Firestore in batches.
   * Does not re-import designs or change their images.
   */
  async activateAllDesigns(): Promise<number> {
    const snapshot = await getDocs(
      collection(db, COLLECTION_NAME)
    );

    const inactiveDesigns = snapshot.docs.filter(
      (item) => item.data().active !== true
    );

    let activated = 0;

    for (
      let start = 0;
      start < inactiveDesigns.length;
      start += IMPORT_BATCH_SIZE
    ) {
      const chunk = inactiveDesigns.slice(
        start,
        start + IMPORT_BATCH_SIZE
      );

      const batch = writeBatch(db);

      for (const item of chunk) {
        batch.update(item.ref, {
          active: true,
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
      activated += chunk.length;
    }

    return activated;
  },

  async deleteDesign(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  async batchCreateDesigns(
    designs: DesignFormData[],
    onProgress?: (committed: number, total: number) => void
  ): Promise<number> {
    const codes = designs.map((design) =>
      normalizeCode(design.designCode)
    );

    if (codes.some((code) => !/^\d+$/.test(code))) {
      throw new Error(
        'Import cancelled: a design has an invalid design code.'
      );
    }

    if (new Set(codes).size !== codes.length) {
      throw new Error(
        'Import cancelled: duplicate design codes exist in the input.'
      );
    }

    const expectedByCode = new Map<string, DesignFormData>();

    for (const design of designs) {
      expectedByCode.set(
        normalizeCode(design.designCode),
        design
      );
    }

    const snapshot = await getDocs(
      collection(db, COLLECTION_NAME)
    );

    const existingCodes = new Set<string>();
    const existingDocumentIds = new Set(
      snapshot.docs.map((item) => item.id)
    );

    for (const existingDoc of snapshot.docs) {
      const data = existingDoc.data() as Record<string, unknown>;
      const code = normalizeCode(data.designCode);
      const expected = expectedByCode.get(code);

      if (!expected) {
        throw new Error(
          `Import stopped: existing document "${existingDoc.id}" has an unknown or empty design code. No writes were made.`
        );
      }

      if (existingCodes.has(code)) {
        throw new Error(
          `Import stopped: design code ${code} appears more than once. No writes were made.`
        );
      }

      if (!designsMatch(data, expected)) {
        throw new Error(
          `Import stopped: existing design ${code} differs from the catalog. No writes were made.`
        );
      }

      existingCodes.add(code);
    }

    const missing = designs.filter(
      (design) =>
        !existingCodes.has(normalizeCode(design.designCode))
    );

    for (const design of missing) {
      const stableId =
        `design_${normalizeCode(design.designCode)}`;

      if (existingDocumentIds.has(stableId)) {
        throw new Error(
          `Import stopped: target document "${stableId}" already exists but was not reconciled as a matching catalog record. No writes were made.`
        );
      }
    }

    let committed = existingCodes.size;
    onProgress?.(committed, designs.length);

    for (
      let start = 0;
      start < missing.length;
      start += IMPORT_BATCH_SIZE
    ) {
      const chunk = missing.slice(
        start,
        start + IMPORT_BATCH_SIZE
      );

      const targetSnapshots = await Promise.all(
        chunk.map((design) =>
          getDoc(
            doc(
              db,
              COLLECTION_NAME,
              `design_${normalizeCode(design.designCode)}`
            )
          )
        )
      );

      const occupied = targetSnapshots.find(
        (target) => target.exists()
      );

      if (occupied) {
        throw new Error(
          `Import stopped: target document "${occupied.id}" appeared before the batch could be written. Earlier batches, if any, may already have committed.`
        );
      }

      const batch = writeBatch(db);

      for (const design of chunk) {
        const stableId =
          `design_${normalizeCode(design.designCode)}`;

        batch.set(doc(db, COLLECTION_NAME, stableId), {
          ...design,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      committed += chunk.length;
      onProgress?.(committed, designs.length);
    }

    return committed;
  },

  async updatePreviewPaths(
    previewMap: Record<string, string>
  ): Promise<number> {
    const snapshot = await getDocs(
      collection(db, COLLECTION_NAME)
    );

    const updates = snapshot.docs.filter((item) => {
      const data = item.data();

      return Boolean(
        data.designCode &&
        previewMap[String(data.designCode)]
      );
    });

    let updated = 0;

    for (
      let start = 0;
      start < updates.length;
      start += 500
    ) {
      const chunk = updates.slice(start, start + 500);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const code = String(item.data().designCode);

        batch.update(item.ref, {
          previewImageUrl: previewMap[code],
          updatedAt: serverTimestamp(),
        });

        updated++;
      }

      await batch.commit();
    }

    return updated;
  },

  /**
   * Read-only preview. Does not delete or update documents.
   */
  async previewDesignsToDelete(): Promise<{
    totalDocumentsInCollection: number;
    matchingDocuments: number;
    sample: Array<{
      documentId: string;
      designCode: unknown;
      name: string;
    }>;
    invalidCodeCount: number;
  }> {
    const snapshot = await getDocs(
      collection(db, COLLECTION_NAME)
    );

    const matches: typeof snapshot.docs = [];
    let invalidCodeCount = 0;

    for (const item of snapshot.docs) {
      const rawCode = item.data().designCode;

      if (
        (typeof rawCode !== 'string' &&
          typeof rawCode !== 'number') ||
        !/^\d+$/.test(String(rawCode).trim())
      ) {
        invalidCodeCount++;
        continue;
      }

      const code = Number(String(rawCode).trim());

      if (!Number.isSafeInteger(code)) {
        invalidCodeCount++;
        continue;
      }

      if (code >= 1 && code <= 2000) {
        matches.push(item);
      }
    }

    return {
      totalDocumentsInCollection: snapshot.size,
      matchingDocuments: matches.length,
      sample: matches.slice(0, 30).map((item) => ({
        documentId: item.id,
        designCode: item.data().designCode,
        name: String(item.data().name ?? ''),
      })),
      invalidCodeCount,
    };
  },
};
