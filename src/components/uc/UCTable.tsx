
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { FileActions } from "./FileActions";

interface UCTableProps {
  entries: any[];
  loading: boolean;
  searchTerm: string;
  onPreview: (filePath: string) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onEdit: (ucId: string) => void;
  onPrint: (filePath: string) => void;
  onDelete: (ucId: string) => void;
}

export const UCTable = ({
  entries,
  loading,
  searchTerm,
  onPreview,
  onDownload,
  onEdit,
  onPrint,
  onDelete,
}: UCTableProps) => {
  return (
    <div className="overflow-x-auto border rounded-xl shadow-xl bg-gradient-to-br from-white/90 via-blue-50/50 to-purple-50/50 backdrop-blur-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300">
            <TableHead className="text-white font-bold text-sm shadow-lg">UC Entry No</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">Project Code</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">Principal Investigator</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">Funding Agency</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">Scheme</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">Financial Year</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">Status</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">Upload Date</TableHead>
            <TableHead className="text-white font-bold text-sm shadow-lg">File Status</TableHead>
            <TableHead className="text-right text-white font-bold text-sm shadow-lg">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Loading UC files...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12">
                <div className="space-y-3">
                  <div className="text-2xl text-gray-400">📁</div>
                  <p className="text-lg font-medium text-gray-500">
                    {searchTerm ? 'No UC files match your search.' : 'No UC files found.'}
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto opacity-50"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry: any, index: number) => (
              <TableRow 
                key={entry.id} 
                className={`hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-purple-50/50 hover:to-pink-50/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                  index % 2 === 0 ? 'bg-white/70' : 'bg-gradient-to-r from-blue-50/30 to-purple-50/20'
                }`}
              >
                <TableCell className="font-medium text-blue-700 bg-gradient-to-r from-blue-100/50 to-purple-100/30 rounded-lg mx-1 my-1 shadow-sm">
                  <div className="px-2 py-1 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50">
                    {entry.uc_entry_no || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-gray-800">
                  <div className="px-2 py-1 rounded-md bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50">
                    {entry.project_code}
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">{entry.principal_investigator?.name || 'N/A'}</TableCell>
                <TableCell className="text-gray-700">{entry.funding_agency?.name || 'N/A'}</TableCell>
                <TableCell className="text-gray-700">{entry.scheme?.name || entry.scheme_name || 'N/A'}</TableCell>
                <TableCell className="text-center">
                  <div className="px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50 text-orange-700 font-medium">
                    {entry.financial_year?.year || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <StatusBadge status={entry.status} />
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {entry.uc_file_path && entry.uc_file_name ? (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-200">
                          Uploaded
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-200">
                          Missing
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <FileActions
                      entry={entry}
                      onPreview={onPreview}
                      onDownload={onDownload}
                      onEdit={onEdit}
                      onPrint={onPrint}
                      onDelete={onDelete}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
