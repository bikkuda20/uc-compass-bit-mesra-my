
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Calendar, User, Building, FileText } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { FileActions } from "./FileActions";

interface UCCardProps {
  entry: any;
  onPreview: (filePath: string) => void;
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
                    {entry.uc_entry_no || 'N/A'}
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
                <div className="flex items-center space-x-1">
                  {entry.uc_file_path && entry.uc_file_name ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">File Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">No File</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Financial Year Badge */}
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50">
              <span className="text-sm font-medium text-orange-700">
                {entry.financial_year?.year || 'N/A'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Principal Investigator</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.principal_investigator?.name || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Funding Agency</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.funding_agency?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Scheme</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.scheme?.name || entry.scheme_name || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Upload Date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
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
