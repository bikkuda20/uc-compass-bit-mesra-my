
import { CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface UCProgressTrackerProps {
  uc: any;
  variant?: "horizontal" | "vertical";
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

const UCProgressTracker = ({ 
  uc, 
  variant = "horizontal", 
  showLabels = true,
  size = "md" 
}: UCProgressTrackerProps) => {
  const steps = [
    {
      key: "uc_received_date",
      label: "UC Received by PI",
      shortLabel: "Received",
      date: uc?.uc_received_date,
    },
    {
      key: "uc_verified_date", 
      label: "Verified by Related Person",
      shortLabel: "Verified",
      date: uc?.uc_verified_date,
    },
    {
      key: "uc_checked_ar_finance_date",
      label: "Checked by AR Finance", 
      shortLabel: "AR Finance",
      date: uc?.uc_checked_ar_finance_date,
    },
    {
      key: "uc_sent_deputy_comptroller_date",
      label: "Sent to Deputy Comptroller",
      shortLabel: "Deputy Comp.",
      date: uc?.uc_sent_deputy_comptroller_date,
    },
    {
      key: "uc_sent_registrar_date",
      label: "Sent to Registrar Office",
      shortLabel: "To Registrar",
      date: uc?.uc_sent_registrar_date,
    },
    {
      key: "uc_returned_registrar_date",
      label: "Returned from Registrar Office",
      shortLabel: "From Registrar", 
      date: uc?.uc_returned_registrar_date,
    },
    {
      key: "uc_handed_over_pi_date",
      label: "Handed Over to PI",
      shortLabel: "Completed",
      date: uc?.uc_handed_over_pi_date,
    },
  ];

  const getStepStatus = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.date) return "completed";
    
    // Find the last completed step using a reverse loop instead of findLastIndex
    let lastCompletedIndex = -1;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].date) {
        lastCompletedIndex = i;
        break;
      }
    }
    
    if (stepIndex === lastCompletedIndex + 1) return "current";
    
    return "pending";
  };

  const sizeClasses = {
    sm: {
      circle: "w-6 h-6",
      text: "text-xs",
      connector: "h-0.5",
    },
    md: {
      circle: "w-8 h-8", 
      text: "text-sm",
      connector: "h-1",
    },
    lg: {
      circle: "w-10 h-10",
      text: "text-base", 
      connector: "h-1.5",
    },
  };

  if (variant === "vertical") {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={step.key} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-300",
                  sizeClasses[size].circle,
                  status === "completed" && "bg-green-500 text-white shadow-lg",
                  status === "current" && "bg-blue-500 text-white shadow-lg animate-pulse",
                  status === "pending" && "bg-gray-200 text-gray-400"
                )}>
                  {status === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === "current" ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-0.5 mt-2 transition-all duration-300",
                    "h-8",
                    status === "completed" ? "bg-green-300" : "bg-gray-200"
                  )} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium transition-colors duration-300",
                  sizeClasses[size].text,
                  status === "completed" && "text-green-700",
                  status === "current" && "text-blue-700", 
                  status === "pending" && "text-gray-500"
                )}>
                  {showLabels ? step.label : step.shortLabel}
                </div>
                {step.date && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(step.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center group">
              <div className={cn(
                "rounded-full flex items-center justify-center transition-all duration-300",
                sizeClasses[size].circle,
                status === "completed" && "bg-green-500 text-white shadow-lg",
                status === "current" && "bg-blue-500 text-white shadow-lg animate-pulse",
                status === "pending" && "bg-gray-200 text-gray-400"
              )}>
                {status === "completed" ? (
                  <CheckCircle className="w-3 h-3" />
                ) : status === "current" ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <div className={cn(
                    "rounded-full bg-current transition-all duration-300",
                    size === "sm" ? "w-2 h-2" : size === "md" ? "w-2.5 h-2.5" : "w-3 h-3"
                  )} />
                )}
              </div>
              {showLabels && (
                <div className={cn(
                  "mt-1 text-center font-medium transition-colors duration-300 max-w-16",
                  sizeClasses[size].text,
                  status === "completed" && "text-green-700",
                  status === "current" && "text-blue-700",
                  status === "pending" && "text-gray-500"
                )}>
                  {step.shortLabel}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "transition-all duration-300 mx-2",
                sizeClasses[size].connector,
                showLabels ? "w-8" : "w-4",
                status === "completed" ? "bg-green-300" : "bg-gray-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UCProgressTracker;
