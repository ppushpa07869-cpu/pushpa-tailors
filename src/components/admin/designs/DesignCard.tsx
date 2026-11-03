import { Eye, Edit3, Trash2, Cpu, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { Design } from '../../../types/design';

interface DesignCardProps {
  design: Design;
  onView: (design: Design) => void;
  onEdit: (design: Design) => void;
  onToggleActive: (design: Design) => void;
  onDelete: (design: Design) => void;
}

export default function DesignCard({
  design,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
}: DesignCardProps) {
  // Work type badge colors
  const getWorkTypeBadge = (workType: string) => {
    switch (workType) {
      case 'Machine Work':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Stone Work':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Patch Work':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Combination Work':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl ${
      design.active ? 'border-gray-200 hover:border-primary/40' : 'border-gray-200/60 opacity-85 bg-gray-50/50'
    }`}>
      {/* Image Preview Container */}
      <div
        className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => onView(design)}
      >
        {design.previewImageUrl ? (
          <img
            src={design.previewImageUrl}
            alt={design.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="eager"
            onError={(e) => {
              // fallback image if broken link
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583391733958-625078508e67?auto=format&fit=crop&w=600&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <Sparkles className="w-10 h-10 mb-1 opacity-40 text-primary" />
            <span className="text-xs">No Preview Image</span>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(design);
            }}
            className="w-full py-2 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl text-xs font-semibold hover:bg-white flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Eye className="w-4 h-4 text-primary" />
            Quick View (à°µà°¿à°µà°°à°¾à°²à±)
          </button>
        </div>

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider bg-gray-900/80 backdrop-blur-md text-white border border-white/20 shadow-sm">
            #{design.designCode}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(design);
            }}
            title={design.active ? 'Click to deactivate' : 'Click to activate'}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-sm transition-all ${
              design.active
                ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                : 'bg-gray-600/90 text-gray-200 hover:bg-gray-700'
            }`}
          >
            {design.active ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Inactive
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Work Type & Category Row */}
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getWorkTypeBadge(design.workType)}`}>
              {design.workType}
            </span>
            <span className="text-xs text-gray-500 font-medium truncate max-w-[130px]">
              {design.category}
            </span>
          </div>

          {/* Design Name */}
          <h3
            className="font-serif font-bold text-base text-gray-900 hover:text-primary transition-colors line-clamp-1 cursor-pointer"
            onClick={() => onView(design)}
            title={design.name}
          >
            {design.name}
          </h3>

          {/* Machine Files Indicator */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-medium">
              {design.machineFiles && design.machineFiles.length > 0
                ? `${design.machineFiles.length} Machine File${design.machineFiles.length > 1 ? 's' : ''} (.DST)`
                : 'No machine files linked'}
            </span>
          </div>
        </div>

        {/* Bottom Price and Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Price / à°§à°°</span>
            <span className="text-lg font-bold text-primary">
              â‚¹{design.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(design)}
              className="p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors"
              title="Edit Design (à°¸à°µà°°à°¿à°‚à°šà°‚à°¡à°¿)"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(design)}
              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete or Deactivate (à°¤à±Šà°²à°—à°¿à°‚à°šà°‚à°¡à°¿)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
