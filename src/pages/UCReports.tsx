import { useState, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Calendar, User, Building, TrendingUp, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUCEntries, useFinancialYears, useFundingAgencies } from "@/hooks/useSupabaseData";
import { format } from "date-fns";
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";

const UCReports = () => {
  const navigate = useNavigate();
  const { ucs, loading } = useUCEntries();
  const { years } = useFinancialYears();
  const { agencies } = useFundingAgencies();
  const printRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    financialYear: 'all',
    fundingAgency: 'all',
    status: 'all',
    dateRange: 'all',
  });

  /* ================= FILTER ================= */
  const filteredUCs = useMemo(() => {
    return ucs.filter(uc => {
      if (filters.financialYear !== 'all' && uc.financial_year?.id !== filters.financialYear) return false;
      if (filters.fundingAgency !== 'all' && uc.funding_agency?.id !== filters.fundingAgency) return false;
      if (filters.status !== 'all' && uc.current_status !== filters.status) return false;

      if (filters.dateRange !== 'all' && uc.uc_received_date) {
        const receivedDate = new Date(uc.uc_received_date);
        const now = new Date();

        switch (filters.dateRange) {
          case 'thisMonth':
            if (receivedDate.getMonth() !== now.getMonth() ||
                receivedDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'thisQuarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const ucQuarter = Math.floor(receivedDate.getMonth() / 3);
            if (ucQuarter !== currentQuarter ||
                receivedDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'thisYear':
            if (receivedDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }
      return true;
    });
  }, [ucs, filters]);

  /* ================= SUMMARY ================= */
  const summaryStats = useMemo(() => ({
    total: filteredUCs.length,
    handedOverToPI: filteredUCs.filter(uc => uc.uc_handed_over_pi_date).length,
    inProgress: filteredUCs.filter(
      uc => uc.current_status !== 'Handed Over to PI' && uc.current_status !== 'Not Started'
    ).length,
    notStarted: filteredUCs.filter(uc => uc.current_status === 'Not Started').length,
  }), [filteredUCs]);

  /* ================= PRINT ================= */
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `UC_Report_${format(new Date(), 'yyyy-MM-dd')}`,
  });

  /* ================= PDF ================= */
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    doc.setFontSize(16);
    doc.text('UC Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);

    const tableData = filteredUCs.map(uc => [
      uc.uc_entry_no || 'N/A',
      uc.project_code || 'N/A',
      uc.project_title || 'N/A',
      uc.principal_investigator?.name || 'N/A',
      uc.funding_agency?.name || 'N/A',
      uc.financial_year?.year || 'N/A',
      uc.current_status || 'Not Started',
      uc.uc_received_date
        ? format(new Date(uc.uc_received_date), 'dd/MM/yyyy')
        : 'Not received',
      uc.uc_handed_over_pi_date
        ? format(new Date(uc.uc_handed_over_pi_date), 'dd/MM/yyyy')
        : 'Not handed over'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [[
        'UC Entry',
        'Project Code',
        'Project Title',
        'PI Name',
        'Funding Agency',
        'Financial Year',
        'Status',
        'UC Received Date',
        'Handed Over Date'
      ]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 35, left: 14, right: 14 },
    });

    doc.save(`UC_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  /* ================= STATUS COLOR ================= */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Handed Over to PI':
        return 'bg-green-100 text-green-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 to-pink-100">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-6 space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h2 className="text-2xl font-bold text-slate-800">UC Reports</h2>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
                  <FileText className="w-4 h-4 mr-2" /> Export PDF
                </Button>
              </div>
            </div>

            {/* TABLE */}
            <Card ref={printRef}>
              <CardHeader>
                <CardTitle>Detailed UC Report</CardTitle>
                <p className="text-sm text-gray-500">
                  Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left">UC Entry</th>
                        <th className="p-3 text-left">Project Code</th>
                        <th className="p-3 text-left">Project Title</th>
                        <th className="p-3 text-left">PI</th>
                        <th className="p-3 text-left">Agency</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">UC Received Date</th>
                        <th className="p-3 text-left">Handed Over Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUCs.map(uc => (
                        <tr key={uc.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{uc.uc_entry_no}</td>
                          <td className="p-3">{uc.project_code}</td>
                          <td className="p-3">{uc.project_title}</td>
                          <td className="p-3">{uc.principal_investigator?.name}</td>
                          <td className="p-3">{uc.funding_agency?.name}</td>
                          <td className="p-3">
                            <Badge className={getStatusColor(uc.current_status)}>
                              {uc.current_status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {uc.uc_received_date
                              ? format(new Date(uc.uc_received_date), 'dd/MM/yyyy')
                              : 'Not received'}
                          </td>
                          <td className="p-3">
                            {uc.uc_handed_over_pi_date
                              ? format(new Date(uc.uc_handed_over_pi_date), 'dd/MM/yyyy')
                              : 'Not handed over'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCReports;
