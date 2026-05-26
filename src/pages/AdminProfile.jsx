import React from "react";
import { ShieldAlert } from "lucide-react";

const AdminProfile = () => (
  <div className="mt-8 bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
    <ShieldAlert className="w-12 h-12 text-primary mx-auto mb-4" />
    <h2 className="text-2xl font-black text-foreground">
      Admin dashboard is managed from the Django admin panel.
    </h2>
  </div>
);

export default AdminProfile;
