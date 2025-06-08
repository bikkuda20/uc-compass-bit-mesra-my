import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UCEntry {
  id: string;
  funding_agency: {
    id: string;
    name: string;
  };
  financial_year: {
    id: string;
    year: string;
  };
  principal_investigator: {
    id: string;
    name: string;
    email?: string;
    department?: string;
  };
  scheme?: {
    id: string;
    name: string;
    description?: string;
  };
  project_code: string;
  project_type: string;
  uc_file_name: string;
  uc_file_path: string;
  sanction_letter_file_name: string;
  sanction_letter_file_path: string;
  date_received?: string;
  date_given?: string;
  status: 'Pending' | 'Submitted' | 'Verified';
  
  // New workflow tracking fields
  uc_received_date?: string;
  uc_verified_date?: string;
  uc_checked_ar_finance_date?: string;
  uc_sent_deputy_comptroller_date?: string;
  uc_sent_registrar_date?: string;
  uc_returned_registrar_date?: string;
  uc_handed_over_pi_date?: string;
  current_status: string;
  
  created_at: string;
  updated_at: string;
}

export const useUCEntries = () => {
  const [ucs, setUcs] = useState<UCEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUCEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uc_entries')
        .select(`
          *,
          funding_agency:funding_agencies(id, name),
          financial_year:financial_years(id, year),
          principal_investigator:principal_investigators(id, name, email, department),
          scheme:schemes(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching UC entries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch UC entries",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match our UCEntry interface with proper type assertion
      const transformedData: UCEntry[] = (data || []).map(item => ({
        id: item.id,
        funding_agency: item.funding_agency,
        financial_year: item.financial_year,
        principal_investigator: item.principal_investigator,
        scheme: item.scheme,
        project_code: item.project_code,
        project_type: item.project_type || 'Project',
        uc_file_name: item.uc_file_name,
        uc_file_path: item.uc_file_path,
        sanction_letter_file_name: item.sanction_letter_file_name,
        sanction_letter_file_path: item.sanction_letter_file_path,
        date_received: item.date_received,
        date_given: item.date_given,
        status: item.status as 'Pending' | 'Submitted' | 'Verified',
        
        // New workflow fields
        uc_received_date: item.uc_received_date,
        uc_verified_date: item.uc_verified_date,
        uc_checked_ar_finance_date: item.uc_checked_ar_finance_date,
        uc_sent_deputy_comptroller_date: item.uc_sent_deputy_comptroller_date,
        uc_sent_registrar_date: item.uc_sent_registrar_date,
        uc_returned_registrar_date: item.uc_returned_registrar_date,
        uc_handed_over_pi_date: item.uc_handed_over_pi_date,
        current_status: item.current_status || 'Not Started',
        
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setUcs(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUCEntries();
  }, []);

  return { ucs, loading, refetch: fetchUCEntries };
};

export const useFundingAgencies = () => {
  const [agencies, setAgencies] = useState<Array<{id: string, name: string, created_at?: string, updated_at?: string}>>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funding_agencies')
        .select('id, name, created_at, updated_at')
        .order('name');

      if (error) {
        console.error('Error fetching funding agencies:', error);
        return;
      }

      setAgencies(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  return { agencies, loading, refetch: fetchAgencies };
};

export const useSchemes = (fundingAgencyId?: string) => {
  const [schemes, setSchemes] = useState<Array<{id: string, name: string, description?: string, funding_agency_id: string}>>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('schemes')
        .select('id, name, description, funding_agency_id')
        .order('name');

      if (fundingAgencyId) {
        query = query.eq('funding_agency_id', fundingAgencyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching schemes:', error);
        return;
      }

      setSchemes(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [fundingAgencyId]);

  return { schemes, loading, refetch: fetchSchemes };
};

export const useFinancialYears = () => {
  const [years, setYears] = useState<Array<{id: string, year: string, is_active: boolean, created_at?: string}>>([]);
  const [loading, setLoading] = useState(true);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_years')
        .select('id, year, is_active, created_at')
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching financial years:', error);
        return;
      }

      setYears(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  return { years, loading, refetch: fetchYears };
};

export const usePrincipalInvestigators = () => {
  const [pis, setPis] = useState<Array<{id: string, name: string, email?: string, department?: string, project_code?: string, created_at?: string}>>([]);
  const [loading, setLoading] = useState(true);

  const fetchPIs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('principal_investigators')
        .select('id, name, email, department, project_code, created_at')
        .order('name');

      if (error) {
        console.error('Error fetching principal investigators:', error);
        return;
      }

      setPis(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPIs();
  }, []);

  return { pis, loading, refetch: fetchPIs };
};
