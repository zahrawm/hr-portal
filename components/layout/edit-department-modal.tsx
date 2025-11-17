"use client";

import { useState } from "react";

interface EditDepartmentModalProps {
  onClose?: () => void;
  visible: boolean;
  onSuccess?: () => void;
  mode?: "view" | "edit";
}

export default function EditDepartmentModal({
  onClose,
  onSuccess,
}: EditDepartmentModalProps) {
  const [name, setName] = useState("Operational");
  const [description, setDescription] = useState("Brand Awareness Growth");
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [showApproveModal, setShowApproveModal] = useState(false);

  const closeModal = () => {
    setShowApproveModal(false);
    if (onClose) {
      onClose();
    }
  };

  const handleUserAddSuccess = () => {
    setTimeout(() => {}, 5000);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("Department created:", { name, description });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setIsOpen(false);

    // Trigger the toast notification
    if (onSuccess) {
      onSuccess();
    }

    // Close the modal
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 sm:gap-8 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Edit Department
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Make changes to your department here. Click save when you're done.
          </p>
        </div>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 outline-none transition-colors text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            placeholder="Enter department name"
          />
        </div>

        {/* Description Input */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 outline-none transition-colors text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            placeholder="Enter department description"
          />
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <img
              src="../img/loader.svg"
              alt="Loading"
              className="h-5 w-5 sm:h-6 sm:w-6"
            />
            <span className="text-xs sm:text-sm font-medium">Loading...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg bg-[#02AA69] text-white font-medium hover:bg-[#029858] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
