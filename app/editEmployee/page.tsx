"use client";
import { CheckCircle, X } from "lucide-react";
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app";

import { useTheme } from "next-themes";
import EditEmployeeForm from "@/components/layout/edit-employee";

interface EditEmployeeManagementProps {
  onClose?: () => void;
  visible: boolean;
  onSuccess?: () => void;
  mode?: "view" | "edit";
}

const EditEmployeeManagement: React.FC<EditEmployeeManagementProps> = ({
  onClose,
  onSuccess,
}) => {
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const handleUserAddSuccess = () => {
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 5000);
  };

  // return
  return (
    <AppLayout>
      <EditEmployeeForm />
    </AppLayout>
  );
};

export default EditEmployeeManagement;
