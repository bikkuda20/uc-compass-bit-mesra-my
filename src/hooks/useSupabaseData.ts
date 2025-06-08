
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
  project_code: string;
  uc_file_name: string;
  uc_file_path: string;
  sanction_letter_file_name: string;
  sanction_letter_file_path: string;
  date_received?: string;
  date_given?: string;
  status: 'Pending' | 'Submitted' | 'Verified';
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
          principal_investigator:principal_investigators(id, name, email, department)
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
        project_code: item.project_code,
        uc_file_name: item.uc_file_name,
        uc_file_path: item.uc_file_path,
        sanction_letter_file_name: item.sanction_letter_file_name,
        sanction_letter_file_path: item.sanction_letter_file_path,
        date_received: item.date_received,
        date_given: item.date_given,
        status: item.status as 'Pending' | 'Submitted' | 'Verified',
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
  const [agencies, setAgencies] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const { data, error } = await supabase
          .from('funding_agencies')
          .select('id, name')
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

    fetchAgencies();
  }, []);

  return { agencies, loading };
};

export const useFinancialYears = () => {
  const [years, setYears] = useState<Array<{id: string, year: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const { data, error } = await supabase
          .from('financial_years')
          .select('id, year')
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

    fetchYears();
  }, []);

  return { years, loading };
};

export const usePrincipalInvestigators = () => {
  const [pis, setPis] = useState<Array<{id: string, name: string, email?: string, department?: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPIs = async () => {
      try {
        const { data, error } = await supabase
          .from('principal_investigators')
          .select('id, name, email, department')
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

    fetchPIs();
  }, []);

  return { pis, loading };
};
