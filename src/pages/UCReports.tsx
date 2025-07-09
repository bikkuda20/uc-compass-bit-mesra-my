
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
import 'jspdf-autotable';

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
    dateRange: 'all', // all, thisMonth, thisQuarter, thisYear
  });

  // Filter UCs based on selected criteria
  const filteredUCs = useMemo(() => {
    return ucs.filter(uc => {
      if (filters.financialYear !== 'all' && uc.financial_year?.id !== filters.financialYear) return false;
      if (filters.fundingAgency !== 'all' && uc.funding_agency?.id !== filters.fundingAgency) return false;
      if (filters.status !== 'all' && uc.current_status !== filters.status) return false;
      
      // Date range filtering
      if (filters.dateRange !== 'all' && uc.uc_handed_over_pi_date) {
        const handedOverDate = new Date(uc.uc_handed_over_pi_date);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'thisMonth':
            if (handedOverDate.getMonth() !== now.getMonth() || 
                handedOverDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'thisQuarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const ucQuarter = Math.floor(handedOverDate.getMonth() / 3);
            if (ucQuarter !== currentQuarter || 
                handedOverDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'thisYear':
            if (handedOverDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }
      
      return true;
    });
  }, [ucs, filters]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      total: filteredUCs.length,
      handedOverToPI: filteredUCs.filter(uc => uc.uc_handed_over_pi_date).length,
      inProgress: filteredUCs.filter(uc => uc.current_status !== 'Handed Over to PI' && uc.current_status !== 'Not Started').length,
      notStarted: filteredUCs.filter(uc => uc.current_status === 'Not Started').length,
    };
    
    return stats;
  }, [filteredUCs]);

  // Print functionality
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `UC_Report_${format(new Date(), 'yyyy-MM-dd')}`,
  });

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // Add title
    doc.setFontSize(16);
    doc.text('UC Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);
    
    // Prepare data for the table
    const tableData = filteredUCs.map(uc => [
      uc.uc_entry_no || 'N/A',
      uc.project_code || 'N/A',
      uc.project_title || 'N/A',
      uc.principal_investigator?.name || 'N/A',
      uc.funding_agency?.name || 'N/A',
      uc.financial_year?.year || 'N/A',
      uc.current_status || 'Not Started',
      uc.uc_handed_over_pi_date ? format(new Date(uc.uc_handed_over_pi_date), 'dd/MM/yyyy') : 'Not handed over'
    ]);

    // Add table
    (doc as any).autoTable({
      startY: 35,
      head: [['UC Entry', 'Project Code', 'Project Title', 'PI Name', 'Funding Agency', 'Financial Year', 'Status', 'Handed Over Date']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 35, left: 14, right: 14 },
    });

    // Save the PDF
    doc.save(`UC_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'UC Entry No',
      'Project Code',
      'Project Title',
      'PI Name',
      'Funding Agency',
      'Financial Year',
      'Current Status',
      'UC Received Date',
      'UC Verified Date',
      'UC Checked by AR Finance',
      'UC Sent to Deputy Comptroller',
      'UC Sent to Registrar',
      'UC Returned from Registrar',
      'UC Handed Over to PI'
    ];

    const csvData = filteredUCs.map(uc => [
      uc.uc_entry_no || '',
      uc.project_code || '',
      uc.project_title || '',
      uc.principal_investigator?.name || '',
      uc.funding_agency?.name || '',
      uc.financial_year?.year || '',
      uc.current_status || '',
      uc.uc_received_date || '',
      uc.uc_verified_date || '',
      uc.uc_checked_ar_finance_date || '',
      uc.uc_sent_deputy_comptroller_date || '',
      uc.uc_sent_registrar_date || '',
      uc.uc_returned_registrar_date || '',
      uc.uc_handed_over_pi_date || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `UC_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-slate-800">UC Reports</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handlePrint} variant="outline" className="border-purple-200 hover:bg-purple-50 hover:text-purple-700">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Financial Year
              </label>
              <Select 
                value={filters.financialYear} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, financialYear: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Funding Agency
              </label>
              <Select 
                value={filters.fundingAgency} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, fundingAgency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="Received from PI">Received from PI</SelectItem>
                  <SelectItem value="Verified by Related Person">Verified by Related Person</SelectItem>
                  <SelectItem value="Checked by AR Finance">Checked by AR Finance</SelectItem>
                  <SelectItem value="Sent to Deputy Comptroller">Sent to Deputy Comptroller</SelectItem>
                  <SelectItem value="Sent to Registrar Office">Sent to Registrar Office</SelectItem>
                  <SelectItem value="Returned from Registrar Office">Returned from Registrar Office</SelectItem>
                  <SelectItem value="Handed Over to PI">Handed Over to PI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Date Range
              </label>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="thisQuarter">This Quarter</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total UCs</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Handed Over to PI</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.handedOverToPI}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Not Started</p>
                <p className="text-2xl font-bold text-gray-600">{summaryStats.notStarted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card ref={printRef}>
        <CardHeader>
          <CardTitle>Detailed UC Report</CardTitle>
          <p className="text-sm text-gray-500">Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-md bg-gray-200 h-6 w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredUCs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No UC entries match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-700">UC Entry</th>
                    <th className="text-left p-3 font-medium text-gray-700">Project Code</th>
                    <th className="text-left p-3 font-medium text-gray-700">Project Title</th>
                    <th className="text-left p-3 font-medium text-gray-700">PI</th>
                    <th className="text-left p-3 font-medium text-gray-700">Agency</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Handed Over Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUCs.map((uc) => (
                    <tr key={uc.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium text-gray-900">{uc.uc_entry_no || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-900">{uc.project_code}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-900 max-w-xs truncate">
                          {uc.project_title || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">{uc.financial_year?.year}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-900">{uc.principal_investigator?.name}</p>
                        {uc.principal_investigator?.department && (
                          <p className="text-sm text-gray-500">{uc.principal_investigator.department}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-900">{uc.funding_agency?.name}</p>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(uc.current_status || 'Not Started')}>
                          {uc.current_status || 'Not Started'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {uc.uc_handed_over_pi_date ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {format(new Date(uc.uc_handed_over_pi_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not handed over</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UCReports;
