import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell, Loader2 } from "lucide-react";
import api from "../config/api";

const AlertPreferencesPage = () => {
  const [receiveJobAlerts, setReceiveJobAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await api.get("/alerts/preference/");
        setReceiveJobAlerts(Boolean(res.data?.receive_job_alerts));
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load alert preferences");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = async () => {
    const nextValue = !receiveJobAlerts;
    setReceiveJobAlerts(nextValue);
    setIsSaving(true);
    try {
      await api.patch("/alerts/preference/", {
        receive_job_alerts: nextValue,
      });
      toast.success("Alert preferences updated");
    } catch (error) {
      setReceiveJobAlerts(!nextValue);
      toast.error(error.response?.data?.message || "Could not update alert preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Alert Preferences</h1>
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-xl">Job alerts</h2>
            <p className="text-muted-foreground mt-1">
              Receive job alert notifications from the backend alert preference service.
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading || isSaving}
          className={`relative w-16 h-9 rounded-full transition-colors shrink-0 ${
            receiveJobAlerts ? "bg-primary" : "bg-muted"
          } disabled:opacity-60`}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin text-background mx-auto" />
          ) : (
            <span
              className={`absolute left-1 top-1 w-7 h-7 rounded-full bg-background shadow transition-transform ${
                receiveJobAlerts ? "translate-x-7" : "translate-x-0"
              }`}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default AlertPreferencesPage;
