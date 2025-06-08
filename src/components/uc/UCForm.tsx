
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
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
    dateReceived: "",
    dateGiven: "",
    status: "Pending",
  });
  
  const [files, setFiles] = useState({
    ucFile: null as File | null,
    sanctionLetter: null as File | null,
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
        dateReceived: uc.date_received || "",
        dateGiven: uc.date_given || "",
        status: uc.status || "Pending",
      });
    }
  }, [uc]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: "ucFile" | "sanctionLetter", file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('uc-files')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    return data;
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

    if (!uc && (!files.ucFile || !files.sanctionLetter)) {
      toast({
        title: "Files Required",
        description: "Please upload both UC file and Sanction Letter",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let ucFilePath = uc?.uc_file_path || "";
      let ucFileName = uc?.uc_file_name || "";
      let sanctionLetterPath = uc?.sanction_letter_file_path || "";
      let sanctionLetterFileName = uc?.sanction_letter_file_name || "";

      // Upload new files if provided
      if (files.ucFile) {
        const timestamp = Date.now();
        const ucPath = `uc-files/${timestamp}_${files.ucFile.name}`;
        await uploadFile(files.ucFile, ucPath);
        ucFilePath = ucPath;
        ucFileName = files.ucFile.name;
      }

      if (files.sanctionLetter) {
        const timestamp = Date.now();
        const sanctionPath = `sanction-letters/${timestamp}_${files.sanctionLetter.name}`;
        await uploadFile(files.sanctionLetter, sanctionPath);
        sanctionLetterPath = sanctionPath;
        sanctionLetterFileName = files.sanctionLetter.name;
      }

      const ucData = {
        funding_agency_id: formData.fundingAgencyId,
        financial_year_id: formData.financialYearId,
        pi_id: formData.piId,
        project_code: formData.projectCode,
        date_received: formData.dateReceived || null,
        date_given: formData.dateGiven || null,
        status: formData.status,
        uc_file_name: ucFileName,
        uc_file_path: ucFilePath,
        sanction_letter_file_name: sanctionLetterFileName,
        sanction_letter_file_path: sanctionLetterPath,
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
          description: "UC entry updated successfully",
        });
      } else {
        // Create new UC
        const { error } = await supabase
          .from('uc_entries')
          .insert([{
            ...ucData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "UC entry created successfully",
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving UC entry:', error);
      toast({
        title: "Error",
        description: "Failed to save UC entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses = ["Pending", "Submitted", "Verified"];

  const FileUploadCard = ({ 
    title, 
    field, 
    currentFile, 
    existingFileName 
  }: { 
    title: string; 
    field: "ucFile" | "sanctionLetter"; 
    currentFile: File | null;
    existingFileName?: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentFile ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <span className="text-sm text-green-700">{currentFile.name}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleFileChange(field, null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : existingFileName ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <span className="text-sm text-blue-700">Current: {existingFileName}</span>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-md hover:border-blue-400 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mr-2" />
                <span className="text-sm text-slate-600">Replace file (PDF only)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required={!uc}
            />
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-md hover:border-blue-400 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mr-2" />
              <span className="text-slate-600">Upload PDF file</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
        <h2 className="text-2xl font-bold text-slate-800">
          {uc ? "Edit UC Entry" : "New UC Entry"}
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
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dateReceived">Date Received from PI</Label>
                <Input
                  id="dateReceived"
                  type="date"
                  value={formData.dateReceived}
                  onChange={(e) => handleInputChange("dateReceived", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dateGiven">Date Given to PI</Label>
                <Input
                  id="dateGiven"
                  type="date"
                  value={formData.dateGiven}
                  onChange={(e) => handleInputChange("dateGiven", e.target.value)}
                />
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
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploadCard
            title="UC File *"
            field="ucFile"
            currentFile={files.ucFile}
            existingFileName={uc?.uc_file_name}
          />
          <FileUploadCard
            title="Sanction Letter *"
            field="sanctionLetter"
            currentFile={files.sanctionLetter}
            existingFileName={uc?.sanction_letter_file_name}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Saving..." : uc ? "Update UC" : "Create UC"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UCForm;
