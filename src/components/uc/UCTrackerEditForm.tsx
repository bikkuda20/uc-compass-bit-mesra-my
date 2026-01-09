import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  ucId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const UCTrackerEditForm = ({ ucId, onComplete, onCancel }: Props) => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<any>({
    uc_received_date: "",
    uc_verified_date: "",
    uc_checked_ar_finance_date: "",
    uc_sent_deputy_comptroller_date: "",
    uc_sent_registrar_date: "",
    uc_returned_registrar_date: "",
    uc_handed_over_pi_date: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("uc_entries")
        .select("*")
        .eq("id", ucId)
        .single();

      if (error) {
        toast({ title: "Failed to load UC", variant: "destructive" });
        return;
      }

      setDates({
        uc_received_date: data.uc_received_date || "",
        uc_verified_date: data.uc_verified_date || "",
        uc_checked_ar_finance_date: data.uc_checked_ar_finance_date || "",
        uc_sent_deputy_comptroller_date:
          data.uc_sent_deputy_comptroller_date || "",
        uc_sent_registrar_date: data.uc_sent_registrar_date || "",
        uc_returned_registrar_date:
          data.uc_returned_registrar_date || "",
        uc_handed_over_pi_date: data.uc_handed_over_pi_date || "",
      });

      setLoading(false);
    };

    load();
  }, [ucId, toast]);

  const handleChange = (key: string, value: string) => {
    setDates((p: any) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    await supabase.from("uc_entries").update(dates).eq("id", ucId);
    toast({ title: "UC Tracker updated" });
    onComplete();
  };

  if (loading) return <div className="p-6">Loading tracker…</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onCancel}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tracker
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>UC Workflow Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dates).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm font-medium">
                {key.replace(/_/g, " ").toUpperCase()}
              </label>
              <Input
                type="date"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Tracker</Button>
      </div>
    </div>
  );
};

export default UCTrackerEditForm;
