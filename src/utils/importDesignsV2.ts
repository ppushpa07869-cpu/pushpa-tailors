import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { designService } from '../services/designService';
import type { DesignFormData } from '../types/design';

const EXPECTED_DESIGNS = 1900;
const EXPECTED_IMAGES = 7765;
const EXPECTED_PROJECT_ID = 'pushpa-tailors';

interface CatalogRow {
  designId: string;
  displayName: string;
  categoryName: string;
  workCategory: string;
  priceInr: string;
  coverImage: string;
  galleryImages: string;
  isActive: string;
}

interface ManifestEntry {
  designId: string | number;
  images: string[];
}

function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let insideQuotes = false;

  const input = csvText.replace(/^\uFEFF/, '');

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"') {
      if (insideQuotes && input[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      row.push(field);
      field = '';
    } else if (
      (char === '\n' || char === '\r') &&
      !insideQuotes
    ) {
      if (char === '\r' && input[i + 1] === '\n') {
        i++;
      }

      row.push(field);

      if (row.some((value) => value.trim() !== '')) {
        rows.push(row);
      }

      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (insideQuotes) {
    throw new Error('The CSV contains an unclosed quoted field.');
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);

    if (row.some((value) => value.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function parseCatalog(csvText: string): CatalogRow[] {
  if (!csvText.trim()) {
    throw new Error('The catalog CSV file is empty.');
  }

  const rows = parseCsv(csvText);

  if (rows.length < 2) {
    throw new Error('The catalog CSV has no design records.');
  }

  const headers = rows[0].map((header) => header.trim());

  const requiredHeaders = [
    'designId',
    'displayName',
    'categoryName',
    'workCategory',
    'priceInr',
    'coverImage',
    'galleryImages',
    'isActive',
  ];

  for (const header of requiredHeaders) {
    if (!headers.includes(header)) {
      throw new Error(`Missing required CSV column: ${header}`);
    }
  }

  const columnIndex = new Map(
    headers.map((header, index) => [header, index]),
  );

  const records: CatalogRow[] = rows.slice(1).map((values, index) => {
    const get = (key: string): string => {
      const position = columnIndex.get(key);

      if (position === undefined) {
        throw new Error(`Missing CSV column: ${key}`);
      }

      return (values[position] ?? '').trim();
    };

    const record: CatalogRow = {
      designId: get('designId'),
      displayName: get('displayName'),
      categoryName: get('categoryName'),
      workCategory: get('workCategory'),
      priceInr: get('priceInr'),
      coverImage: get('coverImage'),
      galleryImages: get('galleryImages'),
      isActive: get('isActive'),
    };

    if (!record.designId || !/^\d+$/.test(record.designId)) {
      throw new Error(
        `Invalid design ID on CSV data row ${index + 2}.`,
      );
    }

    if (!record.displayName) {
      throw new Error(
        `Missing display name for design ${record.designId}.`,
      );
    }

    return record;
  });

  if (records.length !== EXPECTED_DESIGNS) {
    throw new Error(
      `Expected ${EXPECTED_DESIGNS} designs, but found ${records.length}.`,
    );
  }

  const ids = records.map((record) => record.designId);

  if (new Set(ids).size !== ids.length) {
    throw new Error('The catalog CSV contains duplicate design IDs.');
  }

  return records;
}

function parseManifest(
  manifestText: string,
): Map<string, string[]> {
  if (!manifestText.trim()) {
    throw new Error('The image manifest file is empty.');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(manifestText);
  } catch {
    throw new Error('The image manifest is not valid JSON.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('The image manifest must contain an array.');
  }

  const manifest = new Map<string, string[]>();

  for (const item of parsed as ManifestEntry[]) {
    if (
      item === null ||
      typeof item !== 'object' ||
      item.designId === undefined ||
      !Array.isArray(item.images)
    ) {
      throw new Error('The image manifest contains an invalid entry.');
    }

    const id = String(item.designId).trim();

    if (!/^\d+$/.test(id)) {
      throw new Error(`Invalid design ID in manifest: ${id}`);
    }

    if (manifest.has(id)) {
      throw new Error(`Duplicate design ID in manifest: ${id}`);
    }

    if (item.images.length === 0) {
      throw new Error(`Design ${id} has no preview images.`);
    }

    const images = item.images.map((path) => {
      if (typeof path !== 'string') {
        throw new Error(`Invalid image path for design ${id}.`);
      }

      const cleanPath = path.trim();

      if (
        !cleanPath.startsWith('/designs/') ||
        cleanPath.includes('..') ||
        cleanPath.includes('\\')
      ) {
        throw new Error(
          `Invalid preview image path for design ${id}: ${cleanPath}`,
        );
      }

      return cleanPath;
    });

    if (new Set(images).size !== images.length) {
      throw new Error(
        `Design ${id} contains duplicate image paths in the manifest.`,
      );
    }

    manifest.set(id, images);
  }

  if (manifest.size !== EXPECTED_DESIGNS) {
    throw new Error(
      `Expected ${EXPECTED_DESIGNS} manifest entries, but found ${manifest.size}.`,
    );
  }

  return manifest;
}

export function prepareDesignsV2(
  csvText: string,
  manifestText: string,
): DesignFormData[] {
  const catalog = parseCatalog(csvText);
  const manifest = parseManifest(manifestText);
  const catalogIds = new Set(catalog.map((row) => row.designId));

  for (const id of manifest.keys()) {
    if (!catalogIds.has(id)) {
      throw new Error(
        `Manifest contains design ${id}, which is missing from the CSV.`,
      );
    }
  }

  let totalImages = 0;

  const designs: DesignFormData[] = catalog.map((row) => {
    const images = manifest.get(row.designId);

    if (!images) {
      throw new Error(
        `No image manifest entry exists for design ${row.designId}.`,
      );
    }

    const coverImage = row.coverImage.trim();

    if (!coverImage.startsWith('/designs/')) {
      throw new Error(
        `Invalid cover image path for design ${row.designId}.`,
      );
    }

    if (!images.includes(coverImage)) {
      throw new Error(
        `Cover image for design ${row.designId} is missing from its gallery.`,
      );
    }

    let csvGallery: string[];

    try {
      const parsedGallery: unknown = JSON.parse(row.galleryImages);

      if (
        !Array.isArray(parsedGallery) ||
        parsedGallery.some(
          (path: unknown) => typeof path !== 'string',
        )
      ) {
        throw new Error('Invalid gallery array');
      }

      csvGallery = parsedGallery.map(
        (path: string) => path.trim(),
      );
    } catch {
      throw new Error(
        `Invalid JSON galleryImages for design ${row.designId}.`,
      );
    }

    if (
      csvGallery.length !== images.length ||
      csvGallery.some((path, index) => path !== images[index])
    ) {
      throw new Error(
        `CSV gallery images do not match the manifest for design ${row.designId}.`,
      );
    }

    if (row.isActive.toLowerCase() !== 'false') {
      throw new Error(
        `Design ${row.designId} must be inactive before import.`,
      );
    }

    if (
      row.categoryName &&
      row.categoryName !== 'Other / Custom'
    ) {
      throw new Error(
        `Unexpected category for design ${row.designId}.`,
      );
    }

    if (
      row.workCategory &&
      row.workCategory !== 'Machine Work'
    ) {
      throw new Error(
        `Unexpected work category for design ${row.designId}.`,
      );
    }

    if (row.priceInr && Number(row.priceInr) !== 0) {
      throw new Error(
        `Design ${row.designId} must have a zero import price.`,
      );
    }

    totalImages += images.length;

    return {
      designCode: row.designId,
      name: row.displayName,
      category: 'Other / Custom',
      workType: 'Machine Work',
      price: 0,
      description: `Embroidery design ${row.designId}`,
      previewImageUrl: coverImage,
      previewImages: images,
      machineFiles: [],
      active: false,
    };
  });

  if (totalImages !== EXPECTED_IMAGES) {
    throw new Error(
      `Expected ${EXPECTED_IMAGES} preview images, but found ${totalImages}.`,
    );
  }

  return designs;
}

export async function importDesignsV2(
  csvText: string,
  manifestText: string,
  onProgress?: (committed: number, total: number) => void,
): Promise<number> {
  // Validate the entire catalog before any database writes.
  const designs = prepareDesignsV2(csvText, manifestText);

  // Ensure this is the intended Firebase project.
  if (
    import.meta.env.VITE_FIREBASE_PROJECT_ID !==
    EXPECTED_PROJECT_ID
  ) {
    throw new Error(
      `Import cancelled: expected Firebase project "${EXPECTED_PROJECT_ID}".`,
    );
  }

  // Read existing designs and reconcile them before writing.
  // The service skips exact matches and stops on mismatches.
  const existing = await getDocs(collection(db, 'designs'));

  if (existing.size > 0) {
    // Do not let this utility blindly overwrite existing data.
    // The service performs its own detailed reconciliation.
    console.info(
      `Found ${existing.size} existing design documents; checking for safe resume.`,
    );
  }

  return designService.batchCreateDesigns(designs, onProgress);
}