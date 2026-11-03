
import { useState } from "react";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";

import { importDesigns } from "../../../utils/importDesigns";
import {
  importDesignsV2,
  prepareDesignsV2,
} from "../../../utils/importDesignsV2";
import { repairPreviewPaths } from "../../../utils/repairPreviewPaths";
import { updateGeneratedPreviews } from "../../../utils/updateGeneratedPreviews";
import { checkDuplicateDesigns } from "../../../utils/checkDuplicateDesigns";

const CATALOG_URL = "/design_catalog_final.csv";
const V2_CATALOG_URL = "/design-catalog-v2.csv";
const V2_MANIFEST_URL = "/design-image-manifest-v2.json";

const EXPECTED_DESIGNS = 1901;
const EXPECTED_V2_DESIGNS = 1900;
const EXPECTED_V2_IMAGES = 7765;
const EXPECTED_PROJECT_ID = "pushpa-tailors";

async function fetchV2Files(): Promise<{
  catalogText: string;
  manifestText: string;
}> {
  const [catalogResponse, manifestResponse] = await Promise.all([
    fetch(V2_CATALOG_URL, { cache: "no-store" }),
    fetch(V2_MANIFEST_URL, { cache: "no-store" }),
  ]);

  if (!catalogResponse.ok) {
    throw new Error(
      `V2 catalog could not be loaded (HTTP ${catalogResponse.status}).`
    );
  }

  if (!manifestResponse.ok) {
    throw new Error(
      `V2 manifest could not be loaded (HTTP ${manifestResponse.status}).`
    );
  }

  const [catalogText, manifestText] = await Promise.all([
    catalogResponse.text(),
    manifestResponse.text(),
  ]);

  if (!catalogText.trim() || !manifestText.trim()) {
    throw new Error("The V2 catalog or manifest is empty.");
  }

  return { catalogText, manifestText };
}

function validateV2Defaults(
  designs: ReturnType<typeof prepareDesignsV2>
): void {
  if (designs.length !== EXPECTED_V2_DESIGNS) {
    throw new Error(
      `Expected ${EXPECTED_V2_DESIGNS} designs; found ${designs.length}.`
    );
  }

  const totalPreviews = designs.reduce(
    (total, design) => total + (design.previewImages?.length ?? 0),
    0
  );

  if (totalPreviews !== EXPECTED_V2_IMAGES) {
    throw new Error(
      `Expected ${EXPECTED_V2_IMAGES} preview images; found ${totalPreviews}.`
    );
  }

  const ids = designs.map((design) =>
    String(design.designCode).trim()
  );

  if (
    ids.some((id) => !/^\d+$/.test(id)) ||
    new Set(ids).size !== EXPECTED_V2_DESIGNS
  ) {
    throw new Error("Missing, invalid, or duplicate design IDs were detected.");
  }

  for (const design of designs) {
    if (
      design.active !== false ||
      design.category !== "Other / Custom" ||
      design.workType !== "Machine Work" ||
      design.price !== 0 ||
      !Array.isArray(design.machineFiles) ||
      design.machineFiles.length !== 0
    ) {
      throw new Error(
        `Design ${design.designCode} has unexpected default values.`
      );
    }
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function verifyProject(): Promise<string> {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (projectId !== EXPECTED_PROJECT_ID) {
    throw new Error(
      `Expected Firebase project "${EXPECTED_PROJECT_ID}", found ` +
      `"${projectId || "not configured"}".`
    );
  }

  return projectId;
}

export default function DesignImport() {
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);

  const handleValidateV2 = async () => {
    if (loading) return;

    setLoading(true);

    try {
      setStatus("Reading and validating V2 catalog files...");

      const { catalogText, manifestText } = await fetchV2Files();
      const designs = prepareDesignsV2(catalogText, manifestText);

      validateV2Defaults(designs);

      setStatus(
        `V2 validation passed: ${designs.length} designs and ` +
        `${EXPECTED_V2_IMAGES} preview images. All designs are inactive. ` +
        "No Firebase changes were made."
      );
    } catch (error) {
      console.error("V2 validation failed:", error);
      setStatus(`V2 validation failed: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreflight = async () => {
    if (loading) return;

    setLoading(true);

    try {
      setStatus("Running read-only preflight checks...");

      const projectId = await verifyProject();
      const { catalogText, manifestText } = await fetchV2Files();
      const designs = prepareDesignsV2(catalogText, manifestText);

      validateV2Defaults(designs);

      const snapshot = await getDocs(collection(db, "designs"));

      setStatus(
        `Preflight passed for project ${projectId}. Catalog: ` +
        `${designs.length} designs and ${EXPECTED_V2_IMAGES} images. ` +
        `Firestore currently contains ${snapshot.size} design documents. ` +
        "No Firebase changes were made."
      );
    } catch (error) {
      console.error("Preflight failed:", error);
      setStatus(`Preflight failed: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportV2 = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      "V2 CATALOG IMPORT\n\n" +
      "Project: pushpa-tailors\n" +
      "Designs: 1,900\n" +
      "Preview images: 7,765\n\n" +
      "Designs will be inactive, with price 0, category Other / Custom, " +
      "and work type Machine Work.\n\n" +
      "Do not continue unless the catalog has been validated and you " +
      "understand that a failed batch may leave earlier batches saved.\n\n" +
      "Continue?"
    );

    if (!confirmed) {
      setStatus("V2 import cancelled. No import was started.");
      return;
    }

    setLoading(true);

    try {
      setStatus("Verifying Firebase project...");

      const projectId = await verifyProject();
      const { catalogText, manifestText } = await fetchV2Files();
      const designs = prepareDesignsV2(catalogText, manifestText);

      validateV2Defaults(designs);

      setStatus("Checking current Firestore design documents...");

      const snapshot = await getDocs(collection(db, "designs"));

      const secondConfirmation = window.confirm(
        `Final confirmation\n\nProject: ${projectId}\n` +
        `Catalog designs: ${designs.length}\n` +
        `Preview images: ${EXPECTED_V2_IMAGES}\n` +
        `Existing design documents: ${snapshot.size}\n\n` +
        "The importer will first check every existing design. Exact matching " +
        "records will be skipped; unknown, duplicate, or mismatched records " +
        "will stop the import. New records are added in batches. Customer " +
        "and order collections are not part of this operation.\n\n" +
        "Start the import now?"
      );

      if (!secondConfirmation) {
        setStatus("V2 import cancelled before writing.");
        return;
      }

      setStatus("Starting V2 import...");

      const count = await importDesignsV2(
        catalogText,
        manifestText,
        (committed, total) => {
          setStatus(
            `V2 import progress: ${committed} of ${total} designs committed.`
          );
        }
      );

      if (count !== EXPECTED_V2_DESIGNS) {
        setStatus(
          `Import returned ${count} designs instead of ${EXPECTED_V2_DESIGNS}. ` +
          "Inspect Firestore before retrying."
        );
        return;
      }

      setStatus(
        `Import reported completion: ${count} designs. Verify the records ` +
        "in Firestore before using the catalog."
      );
    } catch (error) {
      console.error("V2 import failed or stopped:", error);
      setStatus(
        `V2 import failed or stopped: ${getErrorMessage(error)} ` +
        "Check Firestore before any retry; earlier batches may have committed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      "This imports the OLD 1,901-design catalog and may write to Firebase. " +
      "Continue only if you specifically intend to use the old catalog."
    );

    if (!confirmed) {
      setStatus("Old catalog import cancelled.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(CATALOG_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Old catalog request failed (HTTP ${response.status}).`);
      }

      const csvText = await response.text();

      if (!csvText.trim()) {
        throw new Error("The old catalog CSV is empty.");
      }

      setStatus("Importing old catalog...");
      const count = await importDesigns(csvText);

      setStatus(`Old catalog import reported ${count} designs imported.`);
    } catch (error) {
      console.error("Old catalog import failed:", error);
      setStatus(`Old catalog import failed: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRepair = async () => {
    if (loading) return;

    if (
      !window.confirm(
        "Repair preview paths in existing Firestore documents? This may update data."
      )
    ) {
      setStatus("Preview repair cancelled.");
      return;
    }

    setLoading(true);

    try {
      setStatus("Repairing preview paths...");
      const count = await repairPreviewPaths();
      setStatus(`Preview path repair reported ${count} repaired paths.`);
    } catch (error) {
      console.error("Preview repair failed:", error);
      setStatus(`Preview repair failed: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGeneratedPreviews = async () => {
    if (loading) return;

    if (
      !window.confirm(
        "Update generated preview paths in existing Firestore documents? This may modify data."
      )
    ) {
      setStatus("Generated preview update cancelled.");
      return;
    }

    setLoading(true);

    try {
      setStatus("Updating generated previews...");
      const count = await updateGeneratedPreviews();
      setStatus(`Generated preview update reported ${count} updates.`);
    } catch (error) {
      console.error("Generated preview update failed:", error);
      setStatus(`Generated preview update failed: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDuplicates = async () => {
    if (loading) return;

    setLoading(true);

    try {
      setStatus("Checking for duplicate design codes...");
      const duplicates = await checkDuplicateDesigns();

      setStatus(
        duplicates.length === 0
          ? "No duplicate design codes found."
          : `Found ${duplicates.length} duplicate design codes. Check the browser console.`
      );
    } catch (error) {
      console.error("Duplicate check failed:", error);
      setStatus(`Duplicate check failed: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Design Catalog Import</h1>

      <p className="mb-4">
        Validate the catalog and run preflight checks before importing.
      </p>

      <div
        className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900"
        role="note"
      >
        <p className="font-semibold">Safety notes</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Catalog validation and preflight checks are read-only.</li>
          <li>Import buttons can write to Firebase.</li>
          <li>Do not retry a failed import until Firestore has been inspected.</li>
          <li>Customer and order data must remain untouched.</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleValidateV2}
          disabled={loading}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Validate V2 Catalog"}
        </button>

        <button
          type="button"
          onClick={handlePreflight}
          disabled={loading}
          className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Preflight Check"}
        </button>

        <button
          type="button"
          onClick={handleImportV2}
          disabled={loading}
          className="rounded-lg bg-purple-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Import V2 - 1,900 Designs"}
        </button>

        <button
          type="button"
          onClick={handleImport}
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : `Import OLD ${EXPECTED_DESIGNS} Designs`}
        </button>

        <button
          type="button"
          onClick={handleRepair}
          disabled={loading}
          className="rounded-lg bg-amber-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Repair Preview Paths"}
        </button>

        <button
          type="button"
          onClick={handleUpdateGeneratedPreviews}
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Update Generated Previews"}
        </button>

        <button
          type="button"
          onClick={handleCheckDuplicates}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Check Duplicate Designs"}
        </button>
      </div>

      <p
        className="mt-4 whitespace-pre-wrap font-medium"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
