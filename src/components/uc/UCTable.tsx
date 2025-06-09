
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
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
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Code</TableHead>
            <TableHead>Principal Investigator</TableHead>
            <TableHead>Funding Agency</TableHead>
            <TableHead>Scheme</TableHead>
            <TableHead>Financial Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Loading UC files...
                </div>
              </TableCell>
            </TableRow>
          ) : entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                {searchTerm ? 'No UC files match your search.' : 'No UC files found.'}
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry: any) => (
              <TableRow key={entry.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{entry.project_code}</TableCell>
                <TableCell>{entry.principal_investigator?.name || 'N/A'}</TableCell>
                <TableCell>{entry.funding_agency?.name || 'N/A'}</TableCell>
                <TableCell>{entry.scheme?.name || entry.scheme_name || 'N/A'}</TableCell>
                <TableCell className="text-center">{entry.financial_year?.year || 'N/A'}</TableCell>
                <TableCell>
                  <StatusBadge status={entry.status} />
                </TableCell>
                <TableCell>
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <FileActions
                    entry={entry}
                    onPreview={onPreview}
                    onDownload={onDownload}
                    onEdit={onEdit}
                    onPrint={onPrint}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
