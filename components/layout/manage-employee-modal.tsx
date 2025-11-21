"use client";
import { CheckCircle, X } from "lucide-react";
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app";
import AddEmployeeForm from "./add-employee";

interface AddEmployeeManagementProps {
  onClose?: () => void;
  visible: boolean;
  onSuccess?: () => void;
  mode?: "view" | "edit";
}

const AddEmployeeManagement: React.FC<AddEmployeeManagementProps> = ({
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
      <AddEmployeeForm />;
    </AppLayout>
  );
};

export default AddEmployeeManagement;
