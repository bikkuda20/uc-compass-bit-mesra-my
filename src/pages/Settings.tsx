
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Database, Upload, Shield } from "lucide-react";

const Settings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b px-6">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Version:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Environment:</span>
                    <span className="font-medium">Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Database Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Connection:</span>
                    <span className="font-medium text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tables:</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Storage:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    File Upload Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max File Size:</span>
                    <span className="font-medium">10 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Allowed Types:</span>
                    <span className="font-medium">PDF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Storage Bucket:</span>
                    <span className="font-medium">uc-files</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">RLS Enabled:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Public Access:</span>
                    <span className="font-medium">Limited</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">File Security:</span>
                    <span className="font-medium text-green-600">Protected</span>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
