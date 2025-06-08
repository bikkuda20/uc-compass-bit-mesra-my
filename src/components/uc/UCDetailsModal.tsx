
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, User, FileText, Hash } from "lucide-react";
import UCProgressTracker from "./UCProgressTracker";

interface UCDetailsModalProps {
  uc: any;
  isOpen: boolean;
  onClose: () => void;
}

const UCDetailsModal = ({ uc, isOpen, onClose }: UCDetailsModalProps) => {
  if (!uc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>UC Tracker Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>Project Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Funding Agency</div>
                  <div className="font-medium">{uc.funding_agency?.name}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Financial Year</div>
                  <div className="font-medium">{uc.financial_year?.year}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Principal Investigator</div>
                  <div className="font-medium">{uc.principal_investigator?.name}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Project Code</div>
                  <div className="font-medium">{uc.project_code}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Project Type</div>
                  <div className="font-medium">{uc.project_type}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4" />
                <div>
                  <div className="text-sm text-gray-500">Current Status</div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {uc.current_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>UC Progress Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UCProgressTracker 
                uc={uc} 
                variant="vertical" 
                showLabels={true}
                size="lg"
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UCDetailsModal;
