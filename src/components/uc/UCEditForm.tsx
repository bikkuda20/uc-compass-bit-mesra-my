
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
  
  const [formData, setFormData] = useState({
    fundingAgencyId: "",
    schemeId: "",
    financialYearId: "",
    piId: "",
    projectCode: "",
    ucEntryNo: "",
    projectType: "Project",
    status: "Pending",
    
    // Workflow tracking fields
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
  const { toast } = useToast();
  
  // Get schemes based on selected funding agency
  const { schemes } = useSchemes(formData.fundingAgencyId);

  useEffect(() => {
    const fetchUCEntry = async () => {
      try {
        const { data, error } = await supabase
          .from('uc_entries')
          .select(`
            *,
            funding_agency:funding_agencies(id, name),
            financial_year:financial_years(id, year),  
            principal_investigator:principal_investigators(id, name, email, department),
            scheme:schemes(id, name, description)
          `)
          .eq('id', ucId)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            fundingAgencyId: data.funding_agency_id || "",
            schemeId: data.scheme_id || "",
            financialYearId: data.financial_year_id || "",
            piId: data.pi_id || "",
            projectCode: data.project_code || "",
            ucEntryNo: data.uc_entry_no || "",
            projectType: data.project_type || "Project",
            status: data.status || "Pending",
            
            // Workflow tracking fields
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
        console.error('Error fetching UC entry:', error);
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
  }, [ucId, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset scheme when funding agency changes
    if (field === "fundingAgencyId") {
      setFormData(prev => ({ ...prev, schemeId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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
        scheme_id: formData.schemeId || null,
        financial_year_id: formData.financialYearId,
        pi_id: formData.piId,
        project_code: formData.projectCode,
        uc_entry_no: formData.ucEntryNo || null,
        project_type: formData.projectType,
        status: formData.status,
        
        // Workflow tracking fields
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
      console.error('Error updating UC entry:', error);
      toast({
        title: "Error",
        description: "Failed to update UC entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses = ["Pending", "Submitted", "Verified"];
  const projectTypes = ["Project", "Workshop", "Seminar", "Symposium", "Conference"];

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
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fundingAgency">Funding Agency *</Label>
                <Select 
                  value={formData.fundingAgencyId} 
                  onValueChange={(value) => handleInputChange("fundingAgencyId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scheme">Scheme</Label>
                <Select 
                  value={formData.schemeId} 
                  onValueChange={(value) => handleInputChange("schemeId", value)}
                  disabled={!formData.fundingAgencyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scheme (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemes.map((scheme) => (
                      <SelectItem key={scheme.id} value={scheme.id}>
                        {scheme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="financialYear">Financial Year *</Label>
                <Select 
                  value={formData.financialYearId} 
                  onValueChange={(value) => handleInputChange("financialYearId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select financial year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="piName">Principal Investigator *</Label>
                <Select 
                  value={formData.piId} 
                  onValueChange={(value) => handleInputChange("piId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PI" />
                  </SelectTrigger>
                  <SelectContent>
                    {pis.map((pi) => (
                      <SelectItem key={pi.id} value={pi.id}>
                        {pi.name} {pi.department && `(${pi.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="projectCode">Project Code *</Label>
                <Input
                  id="projectCode"
                  value={formData.projectCode}
                  onChange={(e) => handleInputChange("projectCode", e.target.value)}
                  placeholder="Enter project code"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ucEntryNo">UC Entry No</Label>
                <Input
                  id="ucEntryNo"
                  value={formData.ucEntryNo}
                  onChange={(e) => handleInputChange("ucEntryNo", e.target.value)}
                  placeholder="Enter UC entry number"
                />
              </div>

              <div>
                <Label htmlFor="projectType">Project Type</Label>
                <Select 
                  value={formData.projectType} 
                  onValueChange={(value) => handleInputChange("projectType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* UC Workflow Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>UC Workflow Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ucReceivedDate">1. UC Received Date by PI</Label>
                <Input
                  id="ucReceivedDate"
                  type="date"
                  value={formData.ucReceivedDate}
                  onChange={(e) => handleInputChange("ucReceivedDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ucVerifiedDate">2. UC Verified by Related Person</Label>
                <Input
                  id="ucVerifiedDate"
                  type="date"
                  value={formData.ucVerifiedDate}
                  onChange={(e) => handleInputChange("ucVerifiedDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ucCheckedArFinanceDate">3. UC Checked by AR Finance</Label>
                <Input
                  id="ucCheckedArFinanceDate"
                  type="date"
                  value={formData.ucCheckedArFinanceDate}
                  onChange={(e) => handleInputChange("ucCheckedArFinanceDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ucSentDeputyComptrollerDate">4. UC Sent to Deputy Comptroller</Label>
                <Input
                  id="ucSentDeputyComptrollerDate"
                  type="date"
                  value={formData.ucSentDeputyComptrollerDate}
                  onChange={(e) => handleInputChange("ucSentDeputyComptrollerDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ucSentRegistrarDate">5. UC Sent to Registrar Office</Label>
                <Input
                  id="ucSentRegistrarDate"
                  type="date"
                  value={formData.ucSentRegistrarDate}
                  onChange={(e) => handleInputChange("ucSentRegistrarDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ucReturnedRegistrarDate">6. UC Returned from Registrar</Label>
                <Input
                  id="ucReturnedRegistrarDate"
                  type="date"
                  value={formData.ucReturnedRegistrarDate}
                  onChange={(e) => handleInputChange("ucReturnedRegistrarDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ucHandedOverPiDate">7. UC Handed Over to PI</Label>
                <Input
                  id="ucHandedOverPiDate"
                  type="date"
                  value={formData.ucHandedOverPiDate}
                  onChange={(e) => handleInputChange("ucHandedOverPiDate", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Updating..." : "Update UC Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UCEditForm;
