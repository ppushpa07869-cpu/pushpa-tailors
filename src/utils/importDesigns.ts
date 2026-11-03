import { designService } from "../services/designService";
import type { DesignFormData } from "../types/design";

type CatalogRow = {
  designCode: string;
  batch: string;
  folder: string;
  preview: string;
};

/**
 * Parse one CSV line.
 * Handles normal comma-separated values and quoted values.
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

/**
 * Parse catalog CSV.
 */
function parseCSV(csvText: string): CatalogRow[] {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV file is empty or contains no design records.");
  }

  const headers = parseCSVLine(lines[0]).map((header) =>
    header.trim().toLowerCase()
  );

  const designCodeIndex = headers.indexOf("designcode");
  const batchIndex = headers.indexOf("batch");
  const folderIndex = headers.indexOf("folder");
  const previewIndex = headers.indexOf("preview");

  if (designCodeIndex === -1) {
    throw new Error("CSV is missing the 'designCode' column.");
  }

  if (folderIndex === -1) {
    throw new Error("CSV is missing the 'folder' column.");
  }

  if (previewIndex === -1) {
    throw new Error("CSV is missing the 'preview' column.");
  }

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    return {
      designCode: values[designCodeIndex] ?? "",
      batch: batchIndex >= 0 ? values[batchIndex] ?? "" : "",
      folder: values[folderIndex] ?? "",
      preview: values[previewIndex] ?? "",
    };
  });
}

/**
 * Convert catalog rows into Firestore design records.
 */
export function prepareDesigns(csvText: string): DesignFormData[] {
  const rows = parseCSV(csvText);

  console.log("===================================");
  console.log("CSV IMPORT");
  console.log("===================================");
  console.log(`Total CSV rows: ${rows.length}`);

  // Only import designs 1001-2000.
  const targetRows = rows.filter((row) => {
    const code = Number(row.designCode);

    return (
      Number.isFinite(code) &&
      code >= 1001 &&
      code <= 2000
    );
  });

  console.log(`Designs 1001-2000 found: ${targetRows.length}`);

  if (targetRows.length === 0) {
    console.error(
      "No designs from 1001-2000 were found in the CSV."
    );

    console.error(
      "First 20 design codes found in CSV:",
      rows.slice(0, 20).map((row) => row.designCode)
    );

    throw new Error(
      "The CSV does not contain designs 1001-2000."
    );
  }

  const uniqueRows = new Map<string, CatalogRow>();

  for (const row of targetRows) {
    const code = String(Number(row.designCode));

    if (!uniqueRows.has(code)) {
      uniqueRows.set(code, row);
    }
  }

  const designs: DesignFormData[] = [];

  for (const row of uniqueRows.values()) {
    const code = String(Number(row.designCode));

    designs.push({
      designCode: code,

      name: `Design ${code}`,

      category: "Blouse Work",

      workType: "Machine Work",

      price: 0,

      description: `Embroidery design ${code}`,

      previewImageUrl: row.preview || '',

      machineFiles: [],

      active: true,
    });
  }

  designs.sort(
    (a, b) =>
      Number(a.designCode) - Number(b.designCode)
  );

  console.log(
    `Unique designs prepared: ${designs.length}`
  );

  console.log(
    `First design: ${designs[0]?.designCode}`
  );

  console.log(
    `Last design: ${designs[designs.length - 1]?.designCode}`
  );

  console.log("===================================");

  return designs;
}

/**
 * Import designs 1001-2000 into Firestore.
 */
export async function importDesigns(
  csvText: string
): Promise<number> {
  console.log("");
  console.log("===================================");
  console.log("STARTING DESIGN IMPORT");
  console.log("===================================");

  const designs = prepareDesigns(csvText);

  console.log(
    `Sending ${designs.length} designs to Firestore...`
  );

  const imported =
    await designService.batchCreateDesigns(designs);

  console.log("");
  console.log("===================================");
  console.log("DESIGN IMPORT COMPLETE");
  console.log("===================================");

  console.log(`Prepared: ${designs.length}`);
  console.log(`Imported: ${imported}`);

  if (imported === 0) {
    console.warn(
      "WARNING: 0 designs were imported."
    );

    console.warn(
      "This usually means these design codes already exist in Firestore."
    );
  }

  console.log("===================================");

  return imported;
}