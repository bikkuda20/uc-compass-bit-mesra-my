
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UCFormProps {
  uc?: any;
  onComplete: () => void;
  onCancel: () => void;
}

const UCForm = ({ uc, onComplete, onCancel }: UCFormProps) => {
  const [formData, setFormData] = useState({
    fundingAgency: "",
    financialYear: "",
    piName: "",
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
        fundingAgency: uc.fundingAgency || "",
        financialYear: uc.financialYear || "",
        piName: uc.piName || "",
        projectCode: uc.projectCode || "",
        dateReceived: uc.dateReceived || "",
        dateGiven: uc.dateGiven || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fundingAgency || !formData.financialYear || !formData.piName || !formData.projectCode) {
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
      // Here you would implement the actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      console.log("Form Data:", formData);
      console.log("Files:", files);
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save UC entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fundingAgencies = ["DST", "DRDO", "ISRO", "UGC", "AICTE", "CSIR", "DBT"];
  const financialYears = ["2024-2025", "2023-2024", "2022-2023", "2021-2022"];
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
                  value={formData.fundingAgency} 
                  onValueChange={(value) => handleInputChange("fundingAgency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundingAgencies.map((agency) => (
                      <SelectItem key={agency} value={agency}>
                        {agency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="financialYear">Financial Year *</Label>
                <Select 
                  value={formData.financialYear} 
                  onValueChange={(value) => handleInputChange("financialYear", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select financial year" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="piName">PI Name *</Label>
                <Input
                  id="piName"
                  value={formData.piName}
                  onChange={(e) => handleInputChange("piName", e.target.value)}
                  placeholder="Enter PI name"
                  required
                />
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
            existingFileName={uc?.ucFile}
          />
          <FileUploadCard
            title="Sanction Letter *"
            field="sanctionLetter"
            currentFile={files.sanctionLetter}
            existingFileName={uc?.sanctionLetter}
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
