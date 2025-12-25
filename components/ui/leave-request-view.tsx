"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Toast } from "./toast";

export default function LeaveRequestDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [leaveRequest, setLeaveRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchLeaveRequest();
  }, [id]);

  const fetchLeaveRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leave request");
      }

      const data = await response.json();
      setLeaveRequest(data);
    } catch (error) {
      console.error("Error fetching leave request:", error);
      setToastMessage("Failed to load leave request");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "APPROVED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve leave request");
      }

      setToastMessage("Leave request approved successfully");
      setShowToast(true);
      setShowApproveModal(false);

      setTimeout(() => {
        router.push("/leave-requests");
      }, 1500);
    } catch (error) {
      console.error("Error approving leave request:", error);
      setToastMessage("Failed to approve leave request");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "REJECTED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to deny leave request");
      }

      setToastMessage("Leave request denied successfully");
      setShowToast(true);
      setShowDenyModal(false);

      setTimeout(() => {
        router.push("/leave-requests");
      }, 1500);
    } catch (error) {
      console.error("Error denying leave request:", error);
      setToastMessage("Failed to deny leave request");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100">
          Leave request not found
        </div>
      </div>
    );
  }

  const isPending = leaveRequest.status === "PENDING";

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Leave Request Details
              </h1>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  leaveRequest.status === "APPROVED"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : leaveRequest.status === "REJECTED"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {leaveRequest.status}
              </span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Employee Name
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {leaveRequest.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {leaveRequest.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Department
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {leaveRequest.department}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Role
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {leaveRequest.role}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Start Date
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {leaveRequest.startDate}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    End Date
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {leaveRequest.endDate}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Reason for Leave
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {leaveRequest.reason}
                  </p>
                </div>
              </div>

              {isPending && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex-1 sm:flex-none rounded-md bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-600"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => setShowDenyModal(true)}
                    className="flex-1 sm:flex-none rounded-md bg-red-500 px-6 py-3 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Deny Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowApproveModal(false)}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Approve Leave Request?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to approve this leave request for{" "}
              {leaveRequest?.name}?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={isProcessing}
                className="w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDenyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowDenyModal(false)}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Deny Leave Request?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to deny this leave request for{" "}
              {leaveRequest?.name}?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDenyModal(false)}
                disabled={isProcessing}
                className="w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Deny"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
