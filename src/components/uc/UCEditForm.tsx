import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  useFundingAgencies,
  useFinancialYears,
  usePrincipalInvestigators,
  useSchemes,
} from "@/hooks/useSupabaseData";

interface UCEditFormProps {
  ucId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const UCEditForm = ({ ucId, onComplete, onCancel }: UCEditFormProps) => {
  const { agencies } = useFundingAgencies();
  const { years } = useFinancialYears();
  const { pis } = usePrincipalInvestigators();
  const { toast } = useToast();

  const [formData, setFormData] = useState<any>({
    fundingAgencyId: "",
    schemeId: "",
    financialYearId: "",
    piId: "",
    projectTitle: "",
    projectCode: "",
    ucEntryNo: "",
    projectType: "Project", // ✅ already existed
    status: "Pending",

    sanctionNumber: "",
    sanctionDate: "",

    totalSanctionAmount: "",
    programmeStartDate: "",
    programmeEndDate: "",

    recurringBalance: "",
    nonRecurringBalance: "",
    interestEarned: "",
    interestRefunded: "",
    totalBalance: "",

    ucReceivedDate: "",
    ucVerifiedDate: "",
    ucCheckedArFinanceDate: "",
    ucSentDeputyComptrollerDate: "",
    ucSentRegistrarDate: "",
    ucReturnedRegistrarDate: "",
    ucHandedOverPiDate: "",

    uc_file_path: null,
    uc_file_name: null,
    sanction_letter_file_path: null,
    sanction_letter_file_name: null,
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { schemes } = useSchemes(formData.fundingAgencyId);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchUC = async () => {
      const { data, error } = await supabase
        .from("uc_entries")
        .select("*")
        .eq("id", ucId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load UC entry",
          variant: "destructive",
        });
        return;
      }

      const r = parseFloat(data.recurring_balance) || 0;
      const nr = parseFloat(data.non_recurring_balance) || 0;
      const ie = parseFloat(data.interest_earned) || 0;
      const ir = parseFloat(data.interest_refunded) || 0;

      setFormData({
        fundingAgencyId: data.funding_agency_id || "",
        schemeId: data.scheme_id || "",
        financialYearId: data.financial_year_id || "",
        piId: data.pi_id || "",
        projectTitle: data.project_title || "",
        projectCode: data.project_code || "",
        ucEntryNo: data.uc_entry_no || "",
        projectType: data.project_type || "Project",
        status: data.status || "Pending",

        sanctionNumber: data.sanction_number || "",
        sanctionDate: data.sanction_date || "",

        totalSanctionAmount: data.total_sanction_amount?.toString() || "",
        programmeStartDate: data.project_start_date || "",
        programmeEndDate: data.project_end_date || "",

        recurringBalance: r.toString(),
        nonRecurringBalance: nr.toString(),
        interestEarned: ie.toString(),
        interestRefunded: ir.toString(),
        totalBalance: (r + nr + ie + ir).toFixed(2),

        ucReceivedDate: data.uc_received_date || "",
        ucVerifiedDate: data.uc_verified_date || "",
        ucCheckedArFinanceDate: data.uc_checked_ar_finance_date || "",
        ucSentDeputyComptrollerDate:
          data.uc_sent_deputy_comptroller_date || "",
        ucSentRegistrarDate: data.uc_sent_registrar_date || "",
        ucReturnedRegistrarDate: data.uc_returned_registrar_date || "",
        ucHandedOverPiDate: data.uc_handed_over_pi_date || "",

        uc_file_path: data.uc_file_path,
        uc_file_name: data.uc_file_name,
        sanction_letter_file_path: data.sanction_letter_file_path,
        sanction_letter_file_name: data.sanction_letter_file_name,
      });

      setLoading(false);
    };

    fetchUC();
  }, [ucId, toast]);

  /* ================= INPUT HANDLER ================= */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (
        field === "recurringBalance" ||
        field === "nonRecurringBalance" ||
        field === "interestEarned" ||
        field === "interestRefunded"
      ) {
        const r = parseFloat(updated.recurringBalance) || 0;
        const nr = parseFloat(updated.nonRecurringBalance) || 0;
        const ie = parseFloat(updated.interestEarned) || 0;
        const ir = parseFloat(updated.interestRefunded) || 0;
        updated.totalBalance = (r + nr + ie + ir).toFixed(2);
      }

      if (field === "fundingAgencyId") updated.schemeId = "";
      return updated;
    });
  };

  /* ================= FILE HELPERS ================= */
  const previewFile = async (path: string) => {
    const { data } = await supabase.storage.from("uc-files").download(path);
    window.open(URL.createObjectURL(data), "_blank");
  };

  const downloadFile = async (path: string, name: string) => {
    const { data } = await supabase.storage.from("uc-files").download(path);
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadFile = async (file: File, type: "uc" | "sanction") => {
    const path = `${ucId}/${type}-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("uc-files")
      .upload(path, file, { upsert: true });

    if (error) {
      toast({ title: "Upload failed", variant: "destructive" });
      return;
    }

    const update =
      type === "uc"
        ? { uc_file_path: path, uc_file_name: file.name }
        : {
            sanction_letter_file_path: path,
            sanction_letter_file_name: file.name,
          };

    await supabase.from("uc_entries").update(update).eq("id", ucId);
    toast({ title: "File uploaded successfully" });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await supabase
      .from("uc_entries")
      .update({
        funding_agency_id: formData.fundingAgencyId,
        scheme_id: formData.schemeId || null,
        financial_year_id: formData.financialYearId,
        pi_id: formData.piId,
        project_title: formData.projectTitle || null,
        project_code: formData.projectCode,
        uc_entry_no: formData.ucEntryNo || null,
        project_type: formData.projectType, // ✅ already wired
        status: formData.status,

        sanction_number: formData.sanctionNumber || null,
        sanction_date: formData.sanctionDate || null,

        total_sanction_amount:
          parseFloat(formData.totalSanctionAmount) || null,
        project_start_date: formData.programmeStartDate || null,
        project_end_date: formData.programmeEndDate || null,

        recurring_balance: parseFloat(formData.recurringBalance) || 0,
        non_recurring_balance:
          parseFloat(formData.nonRecurringBalance) || 0,
        interest_earned: parseFloat(formData.interestEarned) || 0,
        interest_refunded:
          parseFloat(formData.interestRefunded) || 0,

        uc_received_date: formData.ucReceivedDate || null,
        uc_verified_date: formData.ucVerifiedDate || null,
        uc_checked_ar_finance_date:
          formData.ucCheckedArFinanceDate || null,
        uc_sent_deputy_comptroller_date:
          formData.ucSentDeputyComptrollerDate || null,
        uc_sent_registrar_date:
          formData.ucSentRegistrarDate || null,
        uc_returned_registrar_date:
          formData.ucReturnedRegistrarDate || null,
        uc_handed_over_pi_date:
          formData.ucHandedOverPiDate || null,

        updated_at: new Date().toISOString(),
      })
      .eq("id", ucId);

    toast({ title: "UC entry updated successfully" });
    onComplete();
    setIsSubmitting(false);
  };

  if (loading) return <div className="p-6">Loading UC entry…</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onCancel}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to UC Files
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* BASIC + WORKFLOW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* BASIC INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <Label>Funding Agency *</Label>
              <Select
                value={formData.fundingAgencyId}
                onValueChange={(v) =>
                  handleInputChange("fundingAgencyId", v)
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Project Title</Label>
              <Input
                value={formData.projectTitle}
                onChange={(e) =>
                  handleInputChange("projectTitle", e.target.value)
                }
              />

              <Label>Scheme</Label>
              <Select
                value={formData.schemeId}
                onValueChange={(v) =>
                  handleInputChange("schemeId", v)
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {schemes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Financial Year *</Label>
              <Select
                value={formData.financialYearId}
                onValueChange={(v) =>
                  handleInputChange("financialYearId", v)
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Principal Investigator *</Label>
              <Select
                value={formData.piId}
                onValueChange={(v) =>
                  handleInputChange("piId", v)
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {pis.map((pi) => (
                    <SelectItem key={pi.id} value={pi.id}>
                      {pi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Project Code *</Label>
              <Input
                value={formData.projectCode}
                onChange={(e) =>
                  handleInputChange("projectCode", e.target.value)
                }
              />

              <Label>UC Entry No</Label>
              <Input
                value={formData.ucEntryNo}
                onChange={(e) =>
                  handleInputChange("ucEntryNo", e.target.value)
                }
              />

              {/* ✅ NEW FIELD — PROJECT TYPE */}
              <Label>Project Type *</Label>
              <Select
                value={formData.projectType}
                onValueChange={(v) =>
                  handleInputChange("projectType", v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Symposium">Symposium</SelectItem>
                </SelectContent>
              </Select>

              <Label>Sanction Number</Label>
              <Input
                value={formData.sanctionNumber}
                onChange={(e) =>
                  handleInputChange("sanctionNumber", e.target.value)
                }
              />

              <Label>Sanction Date</Label>
              <Input
                type="date"
                value={formData.sanctionDate}
                onChange={(e) =>
                  handleInputChange("sanctionDate", e.target.value)
                }
              />

              <Label>Total Sanction Amount (₹)</Label>
              <Input
                type="number"
                value={formData.totalSanctionAmount}
                onChange={(e) =>
                  handleInputChange("totalSanctionAmount", e.target.value)
                }
              />

              <Label>Programme Start Date</Label>
              <Input
                type="date"
                value={formData.programmeStartDate}
                onChange={(e) =>
                  handleInputChange("programmeStartDate", e.target.value)
                }
              />

              <Label>Programme End Date</Label>
              <Input
                type="date"
                value={formData.programmeEndDate}
                onChange={(e) =>
                  handleInputChange("programmeEndDate", e.target.value)
                }
              />

              <Label>Recurring Balance (₹)</Label>
              <Input
                value={formData.recurringBalance}
                onChange={(e) =>
                  handleInputChange("recurringBalance", e.target.value)
                }
              />

              <Label>Non-Recurring Balance (₹)</Label>
              <Input
                value={formData.nonRecurringBalance}
                onChange={(e) =>
                  handleInputChange("nonRecurringBalance", e.target.value)
                }
              />

              <Label>Interest Earned (₹)</Label>
              <Input
                value={formData.interestEarned}
                onChange={(e) =>
                  handleInputChange("interestEarned", e.target.value)
                }
              />

              <Label>Interest Refunded (₹)</Label>
              <Input
                value={formData.interestRefunded}
                onChange={(e) =>
                  handleInputChange("interestRefunded", e.target.value)
                }
              />

              <Label>Total Balance (₹)</Label>
              <Input value={formData.totalBalance} readOnly />
            </CardContent>
          </Card>

          {/* WORKFLOW */}
          <Card>
            <CardHeader>
              <CardTitle>UC Workflow Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "ucReceivedDate",
                "ucVerifiedDate",
                "ucCheckedArFinanceDate",
                "ucSentDeputyComptrollerDate",
                "ucSentRegistrarDate",
                "ucReturnedRegistrarDate",
                "ucHandedOverPiDate",
              ].map((field) => (
                <div key={field}>
                  <Label>{field.replace(/([A-Z])/g, " $1")}</Label>
                  <Input
                    type="date"
                    value={formData[field]}
                    onChange={(e) =>
                      handleInputChange(field, e.target.value)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* ATTACHMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div>
              <Label>Utilisation Certificate (PDF)</Label>
              {formData.uc_file_path && (
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>{formData.uc_file_name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      previewFile(formData.uc_file_path)
                    }
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      downloadFile(
                        formData.uc_file_path,
                        formData.uc_file_name
                      )
                    }
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  e.target.files &&
                  uploadFile(e.target.files[0], "uc")
                }
              />
            </div>

            <div>
              <Label>Sanction Letter (PDF)</Label>
              {formData.sanction_letter_file_path && (
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    {formData.sanction_letter_file_name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      previewFile(
                        formData.sanction_letter_file_path
                      )
                    }
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      downloadFile(
                        formData.sanction_letter_file_path,
                        formData.sanction_letter_file_name
                      )
                    }
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  e.target.files &&
                  uploadFile(e.target.files[0], "sanction")
                }
              />
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating…" : "Update UC Entry"}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default UCEditForm;
