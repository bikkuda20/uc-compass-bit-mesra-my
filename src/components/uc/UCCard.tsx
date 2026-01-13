import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Calendar,
  User,
  Building,
  FileText,
  BookOpen,
  Layers,
  FileSignature,
  IndianRupee,
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

const formatAmount = (value: number | string | null) => {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString("en-IN");
};

export const UCCard = ({
  entry,
  onPreview,
  onDownload,
  onEdit,
  onPrint,
  onDelete,
}: UCCardProps) => {

  /* ================= SIMPLE AUTO-ADD LOGIC ================= */
  const recurring = Number(entry.recurring_balance || 0);
  const nonRecurring = Number(entry.non_recurring_balance || 0);
  const interestEarned = Number(entry.interest_earned || 0);
  const interestRefunded = Number(entry.interest_refunded || 0);

  const finalBalance =
    recurring +
    nonRecurring +
    interestEarned +
    interestRefunded;
  /* ========================================================= */

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden group hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="space-y-4">

          {/* Header */}
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
                      className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100"
                      onClick={() =>
                        onPreview(entry.uc_file_path, entry.uc_file_name)
                      }
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
                        className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-md border border-green-200 cursor-pointer hover:bg-green-100"
                        onClick={() =>
                          onPreview(
                            entry.sanction_letter_file_path,
                            entry.sanction_letter_file_name
                          )
                        }
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
              <BookOpen className="h-4 w-4 text-indigo-500 mt-0.5" />
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

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Principal Investigator</p>
                  <p className="text-sm font-semibold">
                    {entry.principal_investigator?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500">Funding Agency</p>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                    {entry.funding_agency?.name || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <FileSignature className="h-4 w-4 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Sanction Number</p>
                  <p className="text-sm font-medium text-gray-800 break-all">
                    {entry.sanction_number || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">
                    Total Sanction Amount
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    ₹{" "}
                    {formatAmount(
                      entry.total_sanction_amount ??
                        entry.sanction_amount ??
                        null
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Scheme</p>
                  <p className="text-sm font-semibold">
                    {entry.scheme?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">Upload Date</p>
                  <p className="text-sm font-semibold">
                    {entry.created_at
                      ? new Date(entry.created_at)
                          .toLocaleDateString("en-GB")
                          .replace(/\//g, "-")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-teal-500" />
                <div>
                  <p className="text-xs text-gray-500">Programme Duration</p>
                  <p className="text-sm font-semibold">
                    {entry.project_start_date
                      ? new Date(entry.project_start_date)
                          .toLocaleDateString("en-GB")
                          .replace(/\//g, "-")
                      : "N/A"}{" "}
                    →{" "}
                    {entry.project_end_date
                      ? new Date(entry.project_end_date)
                          .toLocaleDateString("en-GB")
                          .replace(/\//g, "-")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-teal-500" />
                <div>
                  <p className="text-xs text-gray-500">Project Type</p>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
                    {entry.project_type || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BALANCES */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm space-y-1">
            <p className="text-xs text-gray-500">Balances</p>

            <div className="flex justify-between font-semibold text-emerald-700">
              <span>Recurring</span>
              <span>₹ {formatAmount(recurring)}</span>
            </div>

            <div className="flex justify-between font-semibold text-amber-700">
              <span>Non-Recurring</span>
              <span>₹ {formatAmount(nonRecurring)}</span>
            </div>

            <div className="flex justify-between font-semibold text-blue-700">
              <span>Interest Earned</span>
              <span>₹ {formatAmount(interestEarned)}</span>
            </div>

            <div className="flex justify-between font-semibold text-red-700">
              <span>Interest Refunded</span>
              <span>₹ {formatAmount(interestRefunded)}</span>
            </div>

            <div className="pt-1 border-t flex justify-between font-bold">
              <span>Total</span>
              <span
                className={
                  finalBalance < 0
                    ? "text-red-700"
                    : "text-purple-700"
                }
              >
                ₹ {formatAmount(finalBalance)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-between">
            <p className="text-xs text-gray-500">Actions</p>
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
      </CardContent>
    </Card>
  );
};
