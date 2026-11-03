import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../services/firebase";

const COLLECTION_NAME = "designs";

export async function repairPreviewPaths(): Promise<number> {
  const response = await fetch("/design_catalog_preview.csv");

  if (!response.ok) {
    throw new Error("Could not load design_catalog_preview.csv");
  }

  const csvText = await response.text();

  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");

  const csvRows = lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() ?? "";
    });

    return row;
  });

  console.log(`CSV records: ${csvRows.length}`);

  const snapshot = await getDocs(collection(db, COLLECTION_NAME));

  const csvMap = new Map(
    csvRows.map((row) => [
      String(row.designCode).padStart(3, "0"),
      row.preview,
    ])
  );

  const updates = snapshot.docs.filter((docSnap) => {
    const data = docSnap.data();
    const code = String(data.designCode).padStart(3, "0");
    return csvMap.has(code);
  });

  console.log(`Firestore records matched: ${updates.length}`);

  let updated = 0;

  for (let start = 0; start < updates.length; start += 500) {
    const batch = writeBatch(db);
    const chunk = updates.slice(start, start + 500);

    for (const docSnap of chunk) {
      const data = docSnap.data();
      const code = String(data.designCode).padStart(3, "0");
      const preview = csvMap.get(code);

      if (preview) {
        batch.update(docSnap.ref, {
          previewImageUrl: preview,
        });

        updated++;
      }
    }

    await batch.commit();

    console.log(
      `Updated ${Math.min(start + 500, updates.length)} / ${updates.length}`
    );
  }

  console.log(`DONE. Updated preview paths: ${updated}`);

  return updated;
}