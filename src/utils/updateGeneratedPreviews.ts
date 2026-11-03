import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { db } from "../services/firebase";

const DESIGN_COLLECTION = "designs";

/*
 * The actual preview filename in your folders appears to be:
 *
 * frount.jpg
 *
 * Keep this first because your previous test found
 * frount.jpg for all 2000 designs.
 */
const PREVIEW_FILES = [
  "frount.jpg",
  "front.jpg",
  "full.jpg",
  "butta.jpg",
  "motive.jpg",
  "sleeves.jpg",
];

type DesignRecord = {
  id: string;
  designCode: string;
  previewImageUrl?: string;
};

type TargetRecord = DesignRecord & {
  numericCode: number;
};

type PreviewResult = {
  url: string;
  filename: string;
};

/**
 * Returns the main range folder for a design code.
 *
 * Examples:
 *
 * 1    -> 1 to 200
 * 200  -> 1 to 200
 * 201  -> 201 to 400
 * 400  -> 201 to 400
 * 401  -> 401 to 600
 * 601  -> 601 to 800
 * 801  -> 801 to 1000
 * 1001 -> 1001 to 1100
 */
function getRangeFolder(code: number): string {
  if (code >= 1 && code <= 200) {
    return "1 to 200";
  }

  if (code >= 201 && code <= 400) {
    return "201 to 400";
  }

  if (code >= 401 && code <= 600) {
    return "401 to 600";
  }

  if (code >= 601 && code <= 800) {
    return "601 to 800";
  }

  if (code >= 801 && code <= 1000) {
    return "801 to 1000";
  }

  if (code >= 1001 && code <= 1100) {
    return "1001 to 1100";
  }

  if (code >= 1101 && code <= 1200) {
    return "1101 to 1200";
  }

  if (code >= 1201 && code <= 1300) {
    return "1201 to 1300";
  }

  if (code >= 1301 && code <= 1400) {
    return "1301 to 1400";
  }

  if (code >= 1401 && code <= 1500) {
    return "1401 to 1500";
  }

  if (code >= 1501 && code <= 1600) {
    return "1501 to 1600";
  }

  if (code >= 1601 && code <= 1700) {
    return "1601 to 1700";
  }

  if (code >= 1701 && code <= 1800) {
    return "1701 to 1800";
  }

  if (code >= 1801 && code <= 1900) {
    return "1801 to 1900";
  }

  if (code >= 1901 && code <= 2000) {
    return "1901 to 2000";
  }

  return "";
}

/**
 * Returns the folder number INSIDE the range.
 *
 * Examples:
 *
 * 1    -> 01
 * 2    -> 02
 * 94   -> 94
 * 200  -> 200
 *
 * 201  -> 01
 * 202  -> 02
 * 400  -> 200
 *
 * 401  -> 01
 * 461  -> 61
 * 600  -> 200
 *
 * 801  -> 01
 * 894  -> 94
 * 1000 -> 200
 *
 * 1001 -> 01
 * 1095 -> 95
 * 1100 -> 100
 *
 * 2000 -> 100
 */
function getDesignFolder(code: number): string {
  let folderNumber: number;

  if (code >= 1 && code <= 200) {
    folderNumber = code;
  } else if (code >= 201 && code <= 400) {
    folderNumber = code - 200;
  } else if (code >= 401 && code <= 600) {
    folderNumber = code - 400;
  } else if (code >= 601 && code <= 800) {
    folderNumber = code - 600;
  } else if (code >= 801 && code <= 1000) {
    folderNumber = code - 800;
  } else if (code >= 1001 && code <= 1100) {
    folderNumber = code - 1000;
  } else if (code >= 1101 && code <= 1200) {
    folderNumber = code - 1100;
  } else if (code >= 1201 && code <= 1300) {
    folderNumber = code - 1200;
  } else if (code >= 1301 && code <= 1400) {
    folderNumber = code - 1300;
  } else if (code >= 1401 && code <= 1500) {
    folderNumber = code - 1400;
  } else if (code >= 1501 && code <= 1600) {
    folderNumber = code - 1500;
  } else if (code >= 1601 && code <= 1700) {
    folderNumber = code - 1600;
  } else if (code >= 1701 && code <= 1800) {
    folderNumber = code - 1700;
  } else if (code >= 1801 && code <= 1900) {
    folderNumber = code - 1800;
  } else if (code >= 1901 && code <= 2000) {
    folderNumber = code - 1900;
  } else {
    return "";
  }

  return String(folderNumber).padStart(2, "0");
}

/**
 * Builds the expected base folder URL.
 *
 * Examples:
 *
 * Design 894:
 * /designs/801 to 1000/94
 *
 * Design 1000:
 * /designs/801 to 1000/200
 *
 * Design 1095:
 * /designs/1001 to 1100/95
 */
function getDesignFolderUrl(code: number): string | null {
  const rangeFolder = getRangeFolder(code);
  const designFolder = getDesignFolder(code);

  if (!rangeFolder || !designFolder) {
    return null;
  }

  return `/designs/${rangeFolder}/${designFolder}`;
}

/**
 * Finds the first available preview image.
 */
async function findPreview(
  code: number
): Promise<PreviewResult | null> {
  const baseUrl = getDesignFolderUrl(code);

  if (!baseUrl) {
    return null;
  }

  for (const filename of PREVIEW_FILES) {
    const url = `${baseUrl}/${filename}`;

    try {
      const response = await fetch(url, {
        method: "HEAD",
      });

      if (response.ok) {
        return {
          url,
          filename,
        };
      }
    } catch {
      /*
       * Continue checking the next filename.
       */
    }
  }

  return null;
}

/**
 * Updates previewImageUrl for all Firestore designs.
 */
export async function updateGeneratedPreviews(): Promise<number> {
  console.log("🔥 NEW updateGeneratedPreviews.ts IS RUNNING");
  console.log("==============================");
  console.log("STARTING PREVIEW UPDATE");
  console.log("==============================");

  try {
    /*
     * Get all Firestore design records.
     */
    const snapshot = await getDocs(
      collection(db, DESIGN_COLLECTION)
    );

    console.log(
      `Total Firestore design records: ${snapshot.size}`
    );

    /*
     * Convert Firestore documents into records.
     */
    const records: DesignRecord[] = snapshot.docs.map(
      (docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          designCode: String(
            data.designCode ?? ""
          ).trim(),
          previewImageUrl:
            typeof data.previewImageUrl === "string"
              ? data.previewImageUrl
              : undefined,
        };
      }
    );

    /*
     * Convert designCode to numbers.
     */
    const targets: TargetRecord[] = records
      .map((record) => ({
        ...record,
        numericCode: Number(record.designCode),
      }))
      .filter(
        (record) =>
          Number.isFinite(record.numericCode) &&
          record.numericCode >= 1 &&
          record.numericCode <= 2000
      )
      .sort(
        (a, b) =>
          a.numericCode - b.numericCode
      );

    console.log(
      `Valid design records: ${targets.length}`
    );

    /*
     * Show first and last codes.
     */
    if (targets.length > 0) {
      console.log(
        "First 10 design codes:",
        targets
          .slice(0, 10)
          .map(
            (record) =>
              record.numericCode
          )
      );

      console.log(
        "Last 10 design codes:",
        targets
          .slice(-10)
          .map(
            (record) =>
              record.numericCode
          )
      );
    }

    if (targets.length === 0) {
      console.warn(
        "No valid design codes between 1 and 2000 were found."
      );

      console.log(
        "Sample Firestore design codes:",
        records
          .slice(0, 20)
          .map(
            (record) =>
              record.designCode
          )
      );

      return 0;
    }

    let updated = 0;
    let checked = 0;

    /*
     * Designs for which no image was found.
     */
    const missingPreviews: Array<{
      code: number;
      rangeFolder: string;
      designFolder: string;
      expectedFolder: string;
    }> = [];

    /*
     * Count which filename was used.
     */
    const filenameCounts: Record<
      string,
      number
    > = {};

    /*
     * Firestore maximum batch size = 500.
     */
    for (
      let start = 0;
      start < targets.length;
      start += 500
    ) {
      const batchTargets =
        targets.slice(
          start,
          start + 500
        );

      const batch = writeBatch(db);

      let batchUpdates = 0;

      /*
       * Check every design.
       */
      for (const record of batchTargets) {
        checked++;

        const code =
          record.numericCode;

        const preview =
          await findPreview(code);

        /*
         * No preview found.
         */
        if (!preview) {
          const rangeFolder =
            getRangeFolder(code);

          const designFolder =
            getDesignFolder(code);

          const expectedFolder =
            getDesignFolderUrl(code) ??
            "INVALID PATH";

          missingPreviews.push({
            code,
            rangeFolder,
            designFolder,
            expectedFolder,
          });

          console.warn(
            `[MISSING ${String(code).padStart(
              4,
              "0"
            )}] ${expectedFolder}`
          );

          continue;
        }

        /*
         * Count filename.
         */
        filenameCounts[
          preview.filename
        ] =
          (filenameCounts[
            preview.filename
          ] ?? 0) + 1;

        /*
         * Don't update Firestore if
         * the URL is already correct.
         */
        if (
          record.previewImageUrl ===
          preview.url
        ) {
          continue;
        }

        /*
         * Update Firestore.
         */
        batch.update(
          doc(
            db,
            DESIGN_COLLECTION,
            record.id
          ),
          {
            previewImageUrl:
              preview.url,
          }
        );

        batchUpdates++;

        console.log(
          `[${checked}/${targets.length}] ` +
          `${code} -> ${preview.url}`
        );
      }

      /*
       * Commit batch.
       */
      if (batchUpdates > 0) {
        await batch.commit();

        updated += batchUpdates;

        console.log(
          `Updated ${updated} / ${targets.length}`
        );
      }
    }

    /*
     * Final report.
     */
    console.log("");
    console.log("==============================");
    console.log("PREVIEW UPDATE COMPLETE");
    console.log("==============================");

    console.log(
      `Checked: ${checked}`
    );

    console.log(
      `Updated: ${updated}`
    );

    console.log(
      `Missing previews: ${missingPreviews.length}`
    );

    /*
     * Preview file statistics.
     */
    console.log("");
    console.log("==============================");
    console.log("PREVIEW FILE STATISTICS");
    console.log("==============================");

    for (
      const filename of PREVIEW_FILES
    ) {
      console.log(
        `${filename}: ${filenameCounts[filename] ?? 0
        }`
      );
    }

    /*
     * Missing previews.
     */
    if (
      missingPreviews.length > 0
    ) {
      console.warn("");
      console.warn("==============================");
      console.warn(
        "MISSING PREVIEW DESIGNS"
      );
      console.warn("==============================");

      console.warn(
        `Total missing: ${missingPreviews.length}`
      );

      /*
       * Print every missing design.
       */
      for (
        const missing of missingPreviews
      ) {
        console.warn(
          `Design ${String(
            missing.code
          ).padStart(
            4,
            "0"
          )} -> ${missing.expectedFolder}`
        );
      }

      /*
       * Print codes as an array.
       */
      console.warn("");
      console.warn(
        "MISSING DESIGN CODES:"
      );

      console.warn(
        missingPreviews.map(
          (item) =>
            item.code
        )
      );

      /*
       * Print comma-separated codes.
       */
      console.warn("");
      console.warn(
        "MISSING CODES (COPY):"
      );

      console.warn(
        missingPreviews
          .map(
            (item) =>
              String(
                item.code
              ).padStart(
                4,
                "0"
              )
          )
          .join(", ")
      );
    } else {
      console.log("");
      console.log(
        "ALL DESIGNS HAVE A PREVIEW IMAGE."
      );
    }

    /*
     * Show a few important path checks.
     */
    console.log("");
    console.log("==============================");
    console.log("PATH VERIFICATION");
    console.log("==============================");

    const testCodes = [
      1,
      200,
      201,
      400,
      401,
      600,
      601,
      800,
      801,
      894,
      1000,
      1001,
      1095,
      1100,
      1101,
      1200,
      2000,
    ];

    for (
      const code of testCodes
    ) {
      console.log(
        `${code} -> ${getDesignFolderUrl(
          code
        )}`
      );
    }

    console.log("");
    console.log("==============================");
    console.log("END");
    console.log("==============================");

    return updated;
  } catch (error) {
    console.error(
      "Failed to update generated previews:",
      error
    );

    throw error;
  }
  async function testSpecificPaths() {
  const tests = [
    "/designs/1001 to 1100/01/frount.jpg",
    "/designs/1001 to 1100/95/frount.jpg",
    "/designs/1001 to 1100/100/frount.jpg",

    "/designs/1001 to 1100/1001/frount.jpg",
    "/designs/1001 to 1100/1095/frount.jpg",
    "/designs/1001 to 1100/1100/frount.jpg",
  ];

  console.log("==============================");
  console.log("ACTUAL PATH TEST");
  console.log("==============================");

  for (const url of tests) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        cache: "no-store",
      });

      console.log(
        response.ok ? "✅ EXISTS" : "❌ NOT FOUND",
        url,
        response.status
      );
    } catch (error) {
      console.log("❌ ERROR", url, error);
    }
  }
}
await testSpecificPaths();
}