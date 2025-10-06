
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Calendar, User, FileText, Workflow, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFundingAgencies, useFinancialYears, usePrincipalInvestigators } from "@/hooks/useSupabaseData";
import { Separator } from "@/components/ui/separator";

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

  console.log("UCForm is rendering with new layout!");
  
  return (
    <div className="min-h-screen bg-red-500 p-6" style={{backgroundColor: 'red'}}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onCancel} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {uc ? "Edit UC Tracker" : "Create New UC Tracker"}
                </h1>
                <p className="text-slate-600 mt-1">
                  {uc ? "Update existing UC entry details" : "Add a new UC entry to the tracking system"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Project Details Card */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-800">Project Details</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Basic project information and identifiers</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fundingAgency" className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Funding Agency *</span>
                    </Label>
                    <Select 
                      value={formData.fundingAgencyId} 
                      onValueChange={(value) => handleInputChange("fundingAgencyId", value)}
                    >
                      <SelectTrigger className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors">
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

                  <div className="space-y-2">
                    <Label htmlFor="financialYear" className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Financial Year *</span>
                    </Label>
                    <Select 
                      value={formData.financialYearId} 
                      onValueChange={(value) => handleInputChange("financialYearId", value)}
                    >
                      <SelectTrigger className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="piName" className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Principal Investigator *</span>
                  </Label>
                  <Select 
                    value={formData.piId} 
                    onValueChange={(value) => handleInputChange("piId", value)}
                  >
                    <SelectTrigger className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Select Principal Investigator" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectCode" className="text-sm font-semibold text-slate-700">
                      Project Code *
                    </Label>
                    <Input
                      id="projectCode"
                      value={formData.projectCode}
                      onChange={(e) => handleInputChange("projectCode", e.target.value)}
                      placeholder="Enter project code"
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ucEntryNo" className="text-sm font-semibold text-slate-700">
                      UC Entry No
                    </Label>
                    <Input
                      id="ucEntryNo"
                      value={formData.ucEntryNo}
                      onChange={(e) => handleInputChange("ucEntryNo", e.target.value)}
                      placeholder="Enter UC entry number"
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectTitle" className="text-sm font-semibold text-slate-700">
                    Project Title
                  </Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                    placeholder="Enter project title"
                    className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectType" className="text-sm font-semibold text-slate-700">
                      Project Type
                    </Label>
                    <Select 
                      value={formData.projectType} 
                      onValueChange={(value) => handleInputChange("projectType", value)}
                    >
                      <SelectTrigger className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors">
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

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold text-slate-700">
                      Status
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors">
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
                </div>
              </CardContent>
            </Card>

            {/* UC Workflow Tracking Card */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Workflow className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-800">UC Workflow Tracking</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Track the progress through different stages</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ucReceivedDate" className="text-sm font-semibold text-slate-700">
                      1. UC Received Date by PI
                    </Label>
                    <Input
                      id="ucReceivedDate"
                      type="date"
                      value={formData.ucReceivedDate}
                      onChange={(e) => handleInputChange("ucReceivedDate", e.target.value)}
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ucVerifiedDate" className="text-sm font-semibold text-slate-700">
                      2. UC Verified by Related Person
                    </Label>
                    <Input
                      id="ucVerifiedDate"
                      type="date"
                      value={formData.ucVerifiedDate}
                      onChange={(e) => handleInputChange("ucVerifiedDate", e.target.value)}
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ucCheckedArFinanceDate" className="text-sm font-semibold text-slate-700">
                      3. UC Checked by AR Finance
                    </Label>
                    <Input
                      id="ucCheckedArFinanceDate"
                      type="date"
                      value={formData.ucCheckedArFinanceDate}
                      onChange={(e) => handleInputChange("ucCheckedArFinanceDate", e.target.value)}
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ucSentDeputyComptrollerDate" className="text-sm font-semibold text-slate-700">
                      4. UC Sent to Deputy Comptroller
                    </Label>
                    <Input
                      id="ucSentDeputyComptrollerDate"
                      type="date"
                      value={formData.ucSentDeputyComptrollerDate}
                      onChange={(e) => handleInputChange("ucSentDeputyComptrollerDate", e.target.value)}
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ucSentRegistrarDate" className="text-sm font-semibold text-slate-700">
                      5. UC Sent to Registrar Office
                    </Label>
                    <Input
                      id="ucSentRegistrarDate"
                      type="date"
                      value={formData.ucSentRegistrarDate}
                      onChange={(e) => handleInputChange("ucSentRegistrarDate", e.target.value)}
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ucReturnedRegistrarDate" className="text-sm font-semibold text-slate-700">
                      6. UC Returned from Registrar
                    </Label>
                    <Input
                      id="ucReturnedRegistrarDate"
                      type="date"
                      value={formData.ucReturnedRegistrarDate}
                      onChange={(e) => handleInputChange("ucReturnedRegistrarDate", e.target.value)}
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ucHandedOverPiDate" className="text-sm font-semibold text-slate-700">
                      7. UC Handed Over to PI
                    </Label>
                    <Input
                      id="ucHandedOverPiDate"
                      type="date"
                      value={formData.ucHandedOverPiDate}
                      onChange={(e) => handleInputChange("ucHandedOverPiDate", e.target.value)}
                      className="h-12 bg-white border-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="h-12 px-8 border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all flex items-center space-x-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting ? "Saving..." : uc ? "Update UC Tracker" : "Create UC Tracker"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UCForm;
