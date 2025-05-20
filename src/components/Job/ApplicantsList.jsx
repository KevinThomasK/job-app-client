import { useEffect, useState } from "react";
import axios from "axios";

export default function ApplicantsList({ jobId, user, onClose }) {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/applications/job/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setApplicants(response.data.applications);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applicants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId, user.token]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Applicants</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No applicants yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((application) => (
                <div
                  key={application._id}
                  className="border-b border-gray-200 pb-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {application.applicant.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {application.applicant.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : application.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Cover Letter:</span>{" "}
                      {application.coverLetter}
                    </p>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => updateStatus(application._id, "accepted")}
                      className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(application._id, "rejected")}
                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
