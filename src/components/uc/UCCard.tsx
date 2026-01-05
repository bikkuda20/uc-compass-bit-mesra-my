import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Calendar,
  User,
  Building,
  FileText,
  BookOpen,
  Layers,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { FileActions } from "./FileActions";

interface UCCardProps {
  entry: any;
  onPreview: (filePath: string, fileName: string) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onEdit: (ucId: string) => void;
  onPrint: (filePath: string) => void;
  onDelete: (ucId: string) => void;
}

export const UCCard = ({
  entry,
  onPreview,
  onDownload,
  onEdit,
  onPrint,
  onDelete,
}: UCCardProps) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden group hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="space-y-4">

          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50">
                  <span className="text-sm font-bold text-blue-700">
                    {entry.uc_entry_no || "N/A"}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-md bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50">
                  <span className="text-sm font-mono font-bold text-emerald-700">
                    {entry.project_code}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <StatusBadge status={entry.status} />

                <div className="flex items-center space-x-3">
                  {entry.uc_file_path && entry.uc_file_name && (
                    <div
                      className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(entry.uc_file_path, entry.uc_file_name);
                      }}
                      title="Click to preview UC file"
                    >
                      <FileText className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">
                        UC
                      </span>
                    </div>
                  )}
                  {entry.sanction_letter_file_path &&
                    entry.sanction_letter_file_name && (
                      <div
                        className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-md border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(
                            entry.sanction_letter_file_path,
                            entry.sanction_letter_file_name
                          );
                        }}
                        title="Click to preview Sanction Letter"
                      >
                        <FileText className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">
                          SL
                        </span>
                      </div>
                    )}
                  {!entry.uc_file_path &&
                    !entry.sanction_letter_file_path && (
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">
                          No Files
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50">
              <span className="text-sm font-medium text-orange-700">
                {entry.financial_year?.year || "N/A"}
              </span>
            </div>
          </div>

          {/* Project Title */}
          {entry.project_title && (
            <div className="flex items-start space-x-2">
              <BookOpen className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Project Title
                </p>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {entry.project_title}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-3">
              {/* Principal Investigator */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Principal Investigator
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.principal_investigator?.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Funding Agency – COLORED */}
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Funding Agency
                  </p>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                    {entry.funding_agency?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Scheme */}
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Scheme</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.scheme?.name || entry.scheme_name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Upload Date */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Upload Date
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Project Type – COLORED */}
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-teal-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Project Type
                  </p>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
                    {entry.project_type || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balances */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1 border border-gray-200">
            <p className="text-xs text-gray-500 font-medium">Balances</p>
            <p className="text-sm font-semibold text-green-700">
              Recurring: ₹ {entry.recurring_balance || "0"}
            </p>
            <p className="text-sm font-semibold text-amber-700">
              Non-Recurring: ₹ {entry.non_recurring_balance || "0"}
            </p>
            <p className="text-sm font-bold text-indigo-700">
              Total: ₹ {entry.total_balance || "0"}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">Actions</p>
              <FileActions
                entry={entry}
                onPreview={onPreview}
                onDownload={onDownload}
                onEdit={onEdit}
                onPrint={onPrint}
                onDelete={onDelete}
              />
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
