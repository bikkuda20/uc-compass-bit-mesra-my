import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFundingAgencies, useFinancialYears, usePrincipalInvestigators, useSchemes } from "@/hooks/useSupabaseData";

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

  const [formData, setFormData] = useState({
    fundingAgencyId: "",
    schemeId: "",
    financialYearId: "",
    piId: "",
    projectTitle: "",
    projectCode: "",
    ucEntryNo: "",
    projectType: "Project",
    status: "Pending",

    recurringBalance: "",
    nonRecurringBalance: "",
    totalBalance: "",

    ucReceivedDate: "",
    ucVerifiedDate: "",
    ucCheckedArFinanceDate: "",
    ucSentDeputyComptrollerDate: "",
    ucSentRegistrarDate: "",
    ucReturnedRegistrarDate: "",
    ucHandedOverPiDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { schemes } = useSchemes(formData.fundingAgencyId);

  useEffect(() => {
    const fetchUCEntry = async () => {
      try {
        const { data, error } = await supabase
          .from('uc_entries')
          .select('*')
          .eq('id', ucId)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            fundingAgencyId: data.funding_agency_id || "",
            projectTitle: data.project_title || "",
            schemeId: data.scheme_id || "",
            financialYearId: data.financial_year_id || "",
            piId: data.pi_id || "",
            projectCode: data.project_code || "",
            ucEntryNo: data.uc_entry_no || "",
            projectType: data.project_type || "Project",
            status: data.status || "Pending",

            recurringBalance: data.recurring_balance?.toString() || "",
            nonRecurringBalance: data.non_recurring_balance?.toString() || "",
            totalBalance: (
              (parseFloat(data.recurring_balance) || 0) +
              (parseFloat(data.non_recurring_balance) || 0)
            ).toFixed(2),

            ucReceivedDate: data.uc_received_date || "",
            ucVerifiedDate: data.uc_verified_date || "",
            ucCheckedArFinanceDate: data.uc_checked_ar_finance_date || "",
            ucSentDeputyComptrollerDate: data.uc_sent_deputy_comptroller_date || "",
            ucSentRegistrarDate: data.uc_sent_registrar_date || "",
            ucReturnedRegistrarDate: data.uc_returned_registrar_date || "",
            ucHandedOverPiDate: data.uc_handed_over_pi_date || "",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load UC entry details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUCEntry();
  }, [ucId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === "recurringBalance" || field === "nonRecurringBalance") {
        const recurring = parseFloat(field === "recurringBalance" ? value : updated.recurringBalance) || 0;
        const nonRecurring = parseFloat(field === "nonRecurringBalance" ? value : updated.nonRecurringBalance) || 0;
        updated.totalBalance = (recurring + nonRecurring).toFixed(2);
      }

      if (field === "fundingAgencyId") {
        updated.schemeId = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fundingAgencyId || !formData.financialYearId || !formData.piId || !formData.projectCode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ucData = {
        funding_agency_id: formData.fundingAgencyId,
        project_title: formData.projectTitle || null,
        scheme_id: formData.schemeId || null,
        financial_year_id: formData.financialYearId,
        pi_id: formData.piId,
        project_code: formData.projectCode,
        uc_entry_no: formData.ucEntryNo || null,
        project_type: formData.projectType,
        status: formData.status,

        recurring_balance: parseFloat(formData.recurringBalance) || 0,
        non_recurring_balance: parseFloat(formData.nonRecurringBalance) || 0,
        total_balance:
          (parseFloat(formData.recurringBalance) || 0) +
          (parseFloat(formData.nonRecurringBalance) || 0),

        uc_received_date: formData.ucReceivedDate || null,
        uc_verified_date: formData.ucVerifiedDate || null,
        uc_checked_ar_finance_date: formData.ucCheckedArFinanceDate || null,
        uc_sent_deputy_comptroller_date: formData.ucSentDeputyComptrollerDate || null,
        uc_sent_registrar_date: formData.ucSentRegistrarDate || null,
        uc_returned_registrar_date: formData.ucReturnedRegistrarDate || null,
        uc_handed_over_pi_date: formData.ucHandedOverPiDate || null,

        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('uc_entries')
        .update(ucData)
        .eq('id', ucId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "UC entry updated successfully",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update UC entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading UC entry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to UC Files
        </Button>
        <h2 className="text-2xl font-bold text-slate-800">Edit UC Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <Label>Funding Agency *</Label>
                <Select value={formData.fundingAgencyId} onValueChange={v => handleInputChange("fundingAgencyId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map(agency => (
                      <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Project Title</Label>
                <Input value={formData.projectTitle} onChange={e => handleInputChange("projectTitle", e.target.value)} />
              </div>


              <div>
                <Label>Scheme</Label>
                <Select value={formData.schemeId} onValueChange={v => handleInputChange("schemeId", v)} disabled={!formData.fundingAgencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemes.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Financial Year *</Label>
                <Select value={formData.financialYearId} onValueChange={v => handleInputChange("financialYearId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select financial year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Principal Investigator *</Label>
                <Select value={formData.piId} onValueChange={v => handleInputChange("piId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PI" />
                  </SelectTrigger>
                  <SelectContent>
                    {pis.map(pi => (
                      <SelectItem key={pi.id} value={pi.id}>{pi.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Project Code *</Label>
                <Input value={formData.projectCode} onChange={e => handleInputChange("projectCode", e.target.value)} />
              </div>

              <div>
                <Label>UC Entry No</Label>
                <Input value={formData.ucEntryNo} onChange={e => handleInputChange("ucEntryNo", e.target.value)} />
              </div>

              <div>
                <Label>Recurring Balance (₹)</Label>
                <Input value={formData.recurringBalance} onChange={e => handleInputChange("recurringBalance", e.target.value)} />
              </div>

              <div>
                <Label>Non-Recurring Balance (₹)</Label>
                <Input value={formData.nonRecurringBalance} onChange={e => handleInputChange("nonRecurringBalance", e.target.value)} />
              </div>

              <div>
                <Label>Total Balance (₹)</Label>
                <Input value={formData.totalBalance} readOnly className="bg-slate-100 cursor-not-allowed" />
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UC Workflow Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["ucReceivedDate", "ucVerifiedDate", "ucCheckedArFinanceDate", "ucSentDeputyComptrollerDate", "ucSentRegistrarDate", "ucReturnedRegistrarDate", "ucHandedOverPiDate"].map(field => (
                <div key={field}>
                  <Label>{field.replace(/([A-Z])/g, ' $1')}</Label>
                  <Input type="date" value={formData[field as keyof typeof formData] as string} onChange={e => handleInputChange(field, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update UC Entry"}</Button>
        </div>
      </form>
    </div>
  );
};

export default UCEditForm;
