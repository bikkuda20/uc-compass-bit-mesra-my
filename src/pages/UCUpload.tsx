
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFundingAgencies, useFinancialYears, usePrincipalInvestigators, useSchemes } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";

const UCUpload = () => {
  const { agencies } = useFundingAgencies();
  const { years } = useFinancialYears();
  const { pis } = usePrincipalInvestigators();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fundingAgencyId: "",
    schemeId: "",
    financialYearId: "",
    piId: "",
    projectCode: "",
    projectType: "Project",
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
  
  // Get schemes based on selected funding agency
  const { schemes } = useSchemes(formData.fundingAgencyId);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset scheme when funding agency changes
    if (field === "fundingAgencyId") {
      setFormData(prev => ({ ...prev, schemeId: "" }));
    }
  };

  const handleFileChange = (field: "ucFile" | "sanctionLetter", file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const uploadFile = async (file: File, path: string) => {
    console.log(`Uploading file: ${file.name} to path: ${path}`);
    
    const { data, error } = await supabase.storage
      .from('uc-files')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);
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

    if (!files.ucFile) {
      toast({
        title: "UC File Required",
        description: "Please upload the UC file",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let ucFilePath = "";
      let ucFileName = "";
      let sanctionLetterPath = "";
      let sanctionLetterFileName = "";

      // Upload UC file
      if (files.ucFile) {
        const timestamp = Date.now();
        const ucPath = `uc-files/${timestamp}_${files.ucFile.name}`;
        try {
          await uploadFile(files.ucFile, ucPath);
          ucFilePath = ucPath;
          ucFileName = files.ucFile.name;
          console.log('UC file uploaded successfully');
        } catch (uploadError) {
          console.error('UC file upload failed:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload UC file. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Upload sanction letter (optional)
      if (files.sanctionLetter) {
        const timestamp = Date.now();
        const sanctionPath = `sanction-letters/${timestamp}_${files.sanctionLetter.name}`;
        try {
          await uploadFile(files.sanctionLetter, sanctionPath);
          sanctionLetterPath = sanctionPath;
          sanctionLetterFileName = files.sanctionLetter.name;
          console.log('Sanction letter uploaded successfully');
        } catch (uploadError) {
          console.error('Sanction letter upload failed:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload Sanction Letter. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      const ucData = {
        funding_agency_id: formData.fundingAgencyId,
        scheme_id: formData.schemeId || null,
        financial_year_id: formData.financialYearId,
        pi_id: formData.piId,
        project_code: formData.projectCode,
        project_type: formData.projectType,
        date_received: formData.dateReceived || null,
        date_given: formData.dateGiven || null,
        status: formData.status,
        uc_file_name: ucFileName,
        uc_file_path: ucFilePath,
        sanction_letter_file_name: sanctionLetterFileName || "",
        sanction_letter_file_path: sanctionLetterPath || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('uc_entries')
        .insert([ucData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "UC entry uploaded successfully!",
      });
      
      // Reset form
      setFormData({
        fundingAgencyId: "",
        schemeId: "",
        financialYearId: "",
        piId: "",
        projectCode: "",
        projectType: "Project",
        dateReceived: "",
        dateGiven: "",
        status: "Pending",
      });
      setFiles({
        ucFile: null,
        sanctionLetter: null,
      });
      
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

  const projectTypes = ["Project", "Workshop", "Seminar", "Symposium", "Conference"];
  const statuses = ["Pending", "Submitted", "Verified"];

  const FileUploadCard = ({ 
    title, 
    field, 
    currentFile,
    isRequired = false
  }: { 
    title: string; 
    field: "ucFile" | "sanctionLetter"; 
    currentFile: File | null;
    isRequired?: boolean;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {title} {isRequired && <span className="text-red-500">*</span>}
        </CardTitle>
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
        ) : (
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required={isRequired}
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-green-50 to-blue-100 min-h-screen">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-slate-800">UC Upload</h2>
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
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="projectType">Project Type *</Label>
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
            title="UC File"
            field="ucFile"
            currentFile={files.ucFile}
            isRequired={true}
          />
          <FileUploadCard
            title="Sanction Letter"
            field="sanctionLetter"
            currentFile={files.sanctionLetter}
            isRequired={false}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Uploading..." : "Upload UC Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UCUpload;
