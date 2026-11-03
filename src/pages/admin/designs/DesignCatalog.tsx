import { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Layers,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

import { designService } from '../../../services/designService';
import type { Design, DesignFormData } from '../../../types/design';
import { WORK_TYPES, DESIGN_CATEGORIES } from '../../../types/design';

import DesignCard from '../../../components/admin/designs/DesignCard';
import DesignFormModal from '../../../components/admin/designs/DesignFormModal';
import DesignDetailModal from '../../../components/admin/designs/DesignDetailModal';
import DeleteDesignDialog from '../../../components/admin/designs/DeleteDesignDialog';

export default function DesignCatalog() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkType, setSelectedWorkType] = useState('All');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Active' | 'Inactive'
  >('All');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingDesign, setViewingDesign] = useState<Design | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isActivatingAll, setIsActivatingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchDesigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await designService.getDesigns();
      setDesigns(data);
    } catch (err: unknown) {
      console.error('Error fetching designs:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load design catalog.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDesigns();
  }, []);

  const filteredDesigns = useMemo(() => {
    return designs.filter((design) => {
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !query ||
        design.designCode.toLowerCase().includes(query) ||
        design.name.toLowerCase().includes(query) ||
        (design.description || '').toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'All' ||
        design.category === selectedCategory;

      const matchesWorkType =
        selectedWorkType === 'All' ||
        design.workType === selectedWorkType;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && design.active) ||
        (statusFilter === 'Inactive' && !design.active);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWorkType &&
        matchesStatus
      );
    });
  }, [
    designs,
    searchTerm,
    selectedCategory,
    selectedWorkType,
    statusFilter,
  ]);

  const totalCount = designs.length;
  const activeCount = designs.filter((design) => design.active).length;
  const inactiveCount = totalCount - activeCount;

  const handleOpenAdd = () => {
    setEditingDesign(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (design: Design) => {
    setEditingDesign(design);
    setIsFormOpen(true);
  };

  const handleOpenView = (design: Design) => {
    setViewingDesign(design);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (design: Design) => {
    setDesignToDelete(design);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveDesign = async (data: DesignFormData) => {
    try {
      if (editingDesign?.id) {
        await designService.updateDesign(editingDesign.id, data);
        showToast(`Design #${data.designCode} updated successfully!`);
      } else {
        await designService.createDesign(data);
        showToast(`New design #${data.designCode} added successfully!`);
      }

      await fetchDesigns();
    } catch (err) {
      console.error('Failed to save design:', err);
      showToast('Failed to save design. Please try again.');
      throw err;
    }
  };

  const handleToggleActive = async (design: Design) => {
    if (!design.id) {
      showToast('This design has no database ID.');
      return;
    }

    try {
      await designService.toggleDesignActive(
        design.id,
        design.active
      );

      const updatedStatus = !design.active;

      setDesigns((previous) =>
        previous.map((item) =>
          item.id === design.id
            ? { ...item, active: updatedStatus }
            : item
        )
      );

      if (viewingDesign?.id === design.id) {
        setViewingDesign((previous) =>
          previous
            ? { ...previous, active: updatedStatus }
            : null
        );
      }

      showToast(
        `Design #${design.designCode} is now ${updatedStatus ? 'Active' : 'Inactive'
        }.`
      );
    } catch (err) {
      console.error('Failed to toggle design status:', err);
      showToast('Failed to update design status.');
    }
  };

  // Activate all currently inactive designs.
  const handleActivateAll = async () => {
    const inactiveDesigns = designs.filter(
      (design) => !design.active && Boolean(design.id)
    );

    if (inactiveDesigns.length === 0) {
      showToast('All designs are already active.');
      return;
    }

    const confirmed = window.confirm(
      `Activate all ${inactiveDesigns.length} inactive designs?`
    );

    if (!confirmed) return;

    setIsActivatingAll(true);

    try {
      const results = await Promise.allSettled(
        inactiveDesigns.map((design) =>
          designService.toggleDesignActive(design.id!, false)
        )
      );

      const failedCount = results.filter(
        (result) => result.status === 'rejected'
      ).length;

      await fetchDesigns();

      if (failedCount === 0) {
        showToast(
          `Successfully activated ${inactiveDesigns.length} designs.`
        );
      } else {
        showToast(
          `${inactiveDesigns.length - failedCount} activated; ${failedCount} failed. Check the console and retry.`
        );
      }
    } catch (err) {
      console.error('Failed to activate all designs:', err);
      showToast('Unable to activate designs. Please try again.');
      await fetchDesigns();
    } finally {
      setIsActivatingAll(false);
    }
  };

  const handleDeactivate = async (design: Design) => {
    if (!design.id) return;

    setIsDeleting(true);

    try {
      await designService.toggleDesignActive(design.id, true);

      showToast(`Design #${design.designCode} has been deactivated.`);
      setIsDeleteDialogOpen(false);
      setDesignToDelete(null);

      await fetchDesigns();
    } catch (err) {
      console.error('Error deactivating design:', err);
      showToast('Error deactivating design.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePermanentDelete = async (design: Design) => {
    if (!design.id) return;

    const confirmed = window.confirm(
      `Permanently delete design #${design.designCode}? This cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await designService.deleteDesign(design.id);

      showToast(`Design #${design.designCode} permanently deleted.`);
      setIsDeleteDialogOpen(false);
      setDesignToDelete(null);

      await fetchDesigns();
    } catch (err) {
      console.error('Error deleting design:', err);
      showToast('Error deleting design.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedWorkType('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-900 px-5 py-3 text-white shadow-2xl"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header and actions */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-3xl tracking-wide text-gray-900">
            <Palette className="h-8 w-8 text-primary" />
            Design Catalog
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            డిజైన్ కేటలాగ్ — ఎంబ్రాయిడరీ మోడల్స్, మెషిన్ ఫైల్స్ మరియు వర్క్ ధరల నిర్వహణ
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
          <button
            type="button"
            onClick={() => void fetchDesigns()}
            disabled={isLoading || isActivatingAll}
            title="Refresh Catalog"
            className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => void handleActivateAll()}
            disabled={
              isLoading ||
              isActivatingAll ||
              inactiveCount === 0
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isActivatingAll
              ? 'Activating...'
              : `Activate All (${inactiveCount})`}
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            <span>Add Design (డిజైన్ జోడించండి)</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Designs
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {totalCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Active / లైవ్
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              {activeCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Inactive / దాచినవి
            </span>
            <span className="text-2xl font-bold text-gray-700">
              {inactiveCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Categories
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {new Set(designs.map((design) => design.category)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by Design Code (e.g. 001) or Name..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Categories (అన్ని కేటగిరీలు)</option>
              {DESIGN_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedWorkType}
              onChange={(event) => setSelectedWorkType(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Work Types</option>
              {WORK_TYPES.map((workType) => (
                <option key={workType} value={workType}>
                  {workType}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'All' | 'Active' | 'Inactive'
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {(searchTerm ||
          selectedCategory !== 'All' ||
          selectedWorkType !== 'All' ||
          statusFilter !== 'All') && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
              <span>
                Showing {filteredDesigns.length} of {designs.length} designs
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All Filters
              </button>
            </div>
          )}
      </div>

      {/* Catalog content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
                <div className="h-6 w-full rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
          <h3 className="mb-1 text-lg font-bold text-red-900">
            Failed to Load Designs
          </h3>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => void fetchDesigns()}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Retry (మళ్ళీ ప్రయత్నించండి)
          </button>
        </div>
      ) : designs.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Palette className="h-8 w-8" />
          </div>
          <h3 className="mb-2 font-serif text-xl font-bold text-gray-900">
            No Designs in Catalog
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            మీ డిజైన్ కేటలాగ్‌లో ఇంకా ఎంబ్రాయిడరీ డిజైన్లు లేవు. మొదటి డిజైన్‌ను జోడించడానికి క్రింది బటన్ నొక్కండి.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add First Design (మొదటి డిజైన్ జోడించండి)
          </button>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <Filter className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="mb-1 text-base font-bold text-gray-800">
            No Matching Designs
          </h3>
          <p className="mb-4 text-xs text-gray-500">
            ఎంచుకున్న ఫిల్టర్లతో సరిపోలే డిజైన్స్ ఏవీ లేవు.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Clear Filters (ఫిల్టర్లు క్లియర్ చేయండి)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredDesigns.map((design) => (
            <DesignCard
              key={design.id || design.designCode}
              design={design}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DesignFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveDesign}
        initialData={editingDesign}
      />

      <DesignDetailModal
        isOpen={isDetailOpen}
        design={viewingDesign}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(design) => {
          setIsDetailOpen(false);
          handleOpenEdit(design);
        }}
        onToggleActive={handleToggleActive}
      />

      <DeleteDesignDialog
        isOpen={isDeleteDialogOpen}
        design={designToDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeactivate={handleDeactivate}
        onPermanentDelete={handlePermanentDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
}