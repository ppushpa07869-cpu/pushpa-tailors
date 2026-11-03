import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { db } from "../services/firebase";

type DesignInfo = {
  firestoreId: string;
  designCode: string;
  previewImageUrl: string;
  name: string;
  category: string;
  price: string;
  createdAt: string;
  updatedAt: string;
};

function getDateValue(value: unknown): number {
  if (!value) {
    return 0;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (
      (value as { toDate: () => Date })
        .toDate()
        .getTime()
    );
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsed = new Date(String(value)).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Check for duplicate design codes.
 *
 * This function DOES NOT delete anything.
 */
export async function checkDuplicateDesigns() {
  const snapshot = await getDocs(
    collection(db, "designs")
  );

  const groups = new Map<
    string,
    DesignInfo[]
  >();

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    const rawCode = String(
      data.designCode ?? ""
    ).trim();

    if (!rawCode) {
      continue;
    }

    const numericCode = Number(rawCode);

    if (!Number.isFinite(numericCode)) {
      continue;
    }

    const normalizedCode =
      String(numericCode);

    const record: DesignInfo = {
      firestoreId: docSnap.id,

      designCode: String(
        data.designCode ?? ""
      ),

      previewImageUrl:
        typeof data.previewImageUrl === "string"
          ? data.previewImageUrl
          : "",

      name:
        typeof data.name === "string"
          ? data.name
          : "",

      category:
        typeof data.category === "string"
          ? data.category
          : "",

      price:
        data.price !== undefined &&
          data.price !== null
          ? String(data.price)
          : "",

      createdAt:
        data.createdAt?.toDate
          ? data.createdAt
            .toDate()
            .toISOString()
          : String(
            data.createdAt ?? ""
          ),

      updatedAt:
        data.updatedAt?.toDate
          ? data.updatedAt
            .toDate()
            .toISOString()
          : String(
            data.updatedAt ?? ""
          ),
    };

    if (!groups.has(normalizedCode)) {
      groups.set(
        normalizedCode,
        []
      );
    }

    groups
      .get(normalizedCode)!
      .push(record);
  }

  const duplicates = [
    ...groups.entries(),
  ]
    .filter(
      ([, records]) =>
        records.length > 1
    )
    .sort(
      (a, b) =>
        Number(a[0]) -
        Number(b[0])
    );

  console.log("");
  console.log(
    "=========================================="
  );
  console.log(
    "FIRESTORE DESIGN DUPLICATE CHECK"
  );
  console.log(
    "=========================================="
  );

  console.log(
    "Total Firestore documents:",
    snapshot.size
  );

  console.log(
    "Unique design codes:",
    groups.size
  );

  console.log(
    "Duplicate design codes:",
    duplicates.length
  );

  console.log(
    "=========================================="
  );

  if (duplicates.length === 0) {
    console.log(
      "NO DUPLICATE DESIGN CODES FOUND"
    );

    console.log(
      "=========================================="
    );

    return [];
  }

  console.log(
    `FOUND ${duplicates.length} DUPLICATE DESIGN CODES`
  );

  for (const [
    code,
    records,
  ] of duplicates) {
    console.log("");
    console.log(
      "------------------------------------------"
    );

    console.log(
      `DUPLICATE DESIGN CODE: ${code}`
    );

    console.log(
      `TOTAL RECORDS: ${records.length}`
    );

    console.log(
      "------------------------------------------"
    );

    records.forEach(
      (record, index) => {
        console.log("");
        console.log(
          `RECORD ${index + 1}`
        );

        console.log(
          "Firestore ID:",
          record.firestoreId
        );

        console.log(
          "designCode:",
          record.designCode
        );

        console.log(
          "previewImageUrl:",
          record.previewImageUrl ||
          "(EMPTY)"
        );

        console.log(
          "name:",
          record.name ||
          "(EMPTY)"
        );

        console.log(
          "category:",
          record.category ||
          "(EMPTY)"
        );

        console.log(
          "price:",
          record.price ||
          "(EMPTY)"
        );

        console.log(
          "createdAt:",
          record.createdAt ||
          "(EMPTY)"
        );

        console.log(
          "updatedAt:",
          record.updatedAt ||
          "(EMPTY)"
        );
      }
    );
  }

  console.log("");
  console.log(
    "=========================================="
  );
  console.log(
    "DUPLICATE CHECK COMPLETE"
  );
  console.log(
    "=========================================="
  );

  return duplicates;
}

/**
 * Removes older duplicate records.
 *
 * RULE:
 * - Newest record = KEEP
 * - Older records = DELETE
 *
 * IMPORTANT:
 * This function actually deletes Firestore documents.
 */
export async function removeOldDuplicateDesigns(): Promise<number> {
  console.log("");
  console.log(
    "=========================================="
  );
  console.log(
    "DUPLICATE CLEANUP"
  );
  console.log(
    "KEEPING NEWEST RECORDS"
  );
  console.log(
    "=========================================="
  );

  const snapshot = await getDocs(
    collection(db, "designs")
  );

  console.log(
    "Total Firestore documents:",
    snapshot.size
  );

  const groups = new Map<
    string,
    DesignInfo[]
  >();

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    const rawCode = String(
      data.designCode ?? ""
    ).trim();

    if (!rawCode) {
      continue;
    }

    const numericCode = Number(rawCode);

    if (!Number.isFinite(numericCode)) {
      continue;
    }

    const normalizedCode =
      String(numericCode);

    const record: DesignInfo = {
      firestoreId: docSnap.id,

      designCode: String(
        data.designCode ?? ""
      ),

      previewImageUrl:
        typeof data.previewImageUrl === "string"
          ? data.previewImageUrl
          : "",

      name:
        typeof data.name === "string"
          ? data.name
          : "",

      category:
        typeof data.category === "string"
          ? data.category
          : "",

      price:
        data.price !== undefined &&
          data.price !== null
          ? String(data.price)
          : "",

      createdAt:
        data.createdAt?.toDate
          ? data.createdAt
            .toDate()
            .toISOString()
          : String(
            data.createdAt ?? ""
          ),

      updatedAt:
        data.updatedAt?.toDate
          ? data.updatedAt
            .toDate()
            .toISOString()
          : String(
            data.updatedAt ?? ""
          ),
    };

    if (!groups.has(normalizedCode)) {
      groups.set(
        normalizedCode,
        []
      );
    }

    groups
      .get(normalizedCode)!
      .push(record);
  }

  const duplicateGroups = [
    ...groups.entries(),
  ]
    .filter(
      ([, records]) =>
        records.length > 1
    )
    .sort(
      (a, b) =>
        Number(a[0]) -
        Number(b[0])
    );

  console.log(
    "Duplicate design codes:",
    duplicateGroups.length
  );

  const documentsToDelete: string[] = [];

  for (const [
    code,
    records,
  ] of duplicateGroups) {
    /*
     * Sort oldest -> newest.
     */
    const sortedRecords =
      [...records].sort(
        (a, b) =>
          getDateValue(
            a.createdAt
          ) -
          getDateValue(
            b.createdAt
          )
      );

    /*
     * Last record is the newest.
     */
    const newest =
      sortedRecords[
      sortedRecords.length - 1
      ];

    /*
     * Everything before newest
     * will be deleted.
     */
    const olderRecords =
      sortedRecords.slice(
        0,
        -1
      );

    console.log("");
    console.log(
      `DESIGN CODE: ${code}`
    );

    console.log(
      "KEEP:",
      newest.firestoreId,
      newest.createdAt
    );

    for (const oldRecord of olderRecords) {
      console.log(
        "DELETE:",
        oldRecord.firestoreId,
        oldRecord.createdAt
      );

      documentsToDelete.push(
        oldRecord.firestoreId
      );
    }
  }

  console.log("");
  console.log(
    "TOTAL DOCUMENTS TO DELETE:",
    documentsToDelete.length
  );

  /*
   * Firestore batch maximum:
   * 500 operations.
   */
  for (
    let start = 0;
    start < documentsToDelete.length;
    start += 500
  ) {
    const batch = writeBatch(db);

    const currentBatch =
      documentsToDelete.slice(
        start,
        start + 500
      );

    for (
      const firestoreId
      of currentBatch
    ) {
      batch.delete(
        doc(
          db,
          "designs",
          firestoreId
        )
      );
    }

    await batch.commit();

    console.log(
      `Deleted ${Math.min(
        start +
        currentBatch.length,
        documentsToDelete.length
      )
      } / ${documentsToDelete.length
      }`
    );
  }

  console.log("");
  console.log(
    "=========================================="
  );
  console.log(
    "DUPLICATE CLEANUP COMPLETE"
  );
  console.log(
    "=========================================="
  );

  console.log(
    "Deleted:",
    documentsToDelete.length
  );

  console.log(
    "Remaining documents:",
    snapshot.size -
    documentsToDelete.length
  );

  return documentsToDelete.length;
}