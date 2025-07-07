
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFundingAgencies, useFinancialYears, usePrincipalInvestigators } from "@/hooks/useSupabaseData";

interface UCFormProps {
  uc?: any;
  onComplete: () => void;
  onCancel: () => void;
}

const UCForm = ({ uc, onComplete, onCancel }: UCFormProps) => {
  const { agencies } = useFundingAgencies();
  const { years } = useFinancialYears();
  const { pis } = usePrincipalInvestigators();
  
  const [formData, setFormData] = useState({
    fundingAgencyId: "",
    financialYearId: "",
    piId: "",
    projectCode: "",
    projectTitle: "",
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
  const { toast } = useToast();

  useEffect(() => {
    if (uc) {
      setFormData({
        fundingAgencyId: uc.funding_agency?.id || "",
        financialYearId: uc.financial_year?.id || "",
        piId: uc.principal_investigator?.id || "",
        projectCode: uc.project_code || "",
        projectTitle: uc.project_title || "",
        ucEntryNo: uc.uc_entry_no || "",
        projectType: uc.project_type || "Project",
        status: uc.status || "Pending",
        
        // Workflow tracking fields
        ucReceivedDate: uc.uc_received_date || "",
        ucVerifiedDate: uc.uc_verified_date || "",
        ucCheckedArFinanceDate: uc.uc_checked_ar_finance_date || "",
        ucSentDeputyComptrollerDate: uc.uc_sent_deputy_comptroller_date || "",
        ucSentRegistrarDate: uc.uc_sent_registrar_date || "",
        ucReturnedRegistrarDate: uc.uc_returned_registrar_date || "",
        ucHandedOverPiDate: uc.uc_handed_over_pi_date || "",
      });
    }
  }, [uc]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        financial_year_id: formData.financialYearId,
        pi_id: formData.piId,
        project_code: formData.projectCode,
        project_title: formData.projectTitle,
        uc_entry_no: formData.ucEntryNo || null,
        project_type: formData.projectType,
        status: formData.status,
        uc_file_name: uc?.uc_file_name || "",
        uc_file_path: uc?.uc_file_path || "",
        sanction_letter_file_name: uc?.sanction_letter_file_name || "",
        sanction_letter_file_path: uc?.sanction_letter_file_path || "",
        
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

      if (uc) {
        // Update existing UC
        const { error } = await supabase
          .from('uc_entries')
          .update(ucData)
          .eq('id', uc.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "UC tracker updated successfully",
        });
      } else {
        // Create new UC tracker
        const { error } = await supabase
          .from('uc_entries')
          .insert([{
            ...ucData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "UC tracker created successfully",
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving UC tracker:', error);
      toast({
        title: "Error",
        description: "Failed to save UC tracker",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses = ["Pending", "Submitted", "Verified"];
  const projectTypes = ["Project", "Workshop", "Seminar", "Symposium", "Conference"];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
        <h2 className="text-2xl font-bold text-slate-800">
          {uc ? "Edit UC Tracker" : "New UC Tracker"}
        </h2>
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
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={formData.projectTitle}
                  onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                  placeholder="Enter project title"
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
            {isSubmitting ? "Saving..." : uc ? "Update UC Tracker" : "Create UC Tracker"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UCForm;
