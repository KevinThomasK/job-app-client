import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../components/Job/ConfirmModal";
import ApplyModal from "../components/Job/ApplyModal";
import ApplicantsList from "../components/Job/ApplicantsList";

export default function Home({ user }) {
  const [publicJobs, setPublicJobs] = useState([]);
  const [userJobs, setUserJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] =
    useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [applicationError, setApplicationError] = useState(null);

  // Handle applying for a job by opening the apply modal
  const handleApply = (jobId) => {
    setSelectedJobId(jobId);
    setIsApplyModalOpen(true);
  };

  // Open applicants modal
  const viewApplicants = (jobId, jobTitle) => {
    setSelectedJobForApplicants(jobId);
    setSelectedJobTitle(jobTitle);
    setIsApplicantsModalOpen(true);
  };

  // Submit job application to the backend
  const submitApplication = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/applications/${selectedJobId}`,
        { coverLetter },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setIsApplyModalOpen(false);
      setSelectedJobId(null);
      setCoverLetter("");
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Application error:", err);

      // Custom message for 403 Forbidden errors
      let errorMessage;
      if (err.response?.status === 403) {
        errorMessage = "You cannot apply to jobs you created";
      } else {
        // Default to the error message from the response or generic message
        errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to submit application";
      }

      alert(errorMessage);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch all public jobs
        const publicResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/jobs/public`
        );
        setPublicJobs(publicResponse.data.jobs);

        // Fetch user's jobs if logged in
        if (user) {
          const userResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/jobs`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          setUserJobs(userResponse.data.jobs);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  // Function to open the modal for deletion confirmation
  const openDeleteModal = (jobId) => {
    setJobIdToDelete(jobId);
    setIsModalOpen(true);
  };

  // Function to handle job deletion
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/jobs/${jobIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setUserJobs(userJobs.filter((job) => job._id !== jobIdToDelete));
      setPublicJobs(publicJobs.filter((job) => job._id !== jobIdToDelete));
      setIsModalOpen(false);
      setJobIdToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job");
      setIsModalOpen(false);
      setJobIdToDelete(null);
    }
  };

  // Filter jobs based on search term
  const filteredPublicJobs = publicJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              {user ? "Welcome back to JobApp" : "Find Your Dream Job"}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              {user
                ? "Browse available jobs or post new opportunities."
                : "Connect with top employers and discover opportunities tailored for you."}
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {user ? (
                <Link
                  to="/create-job"
                  className="px-8 py-3 text-lg font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                >
                  Post a New Job
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 text-lg font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 text-lg font-medium rounded-md text-white bg-transparent border border-white hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-150"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-grow mb-4 md:mb-0">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Search for jobs, companies, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-md ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Jobs
                </button>
                {user && (
                  <button
                    onClick={() => setFilter("my-jobs")}
                    className={`px-4 py-2 rounded-md ${
                      filter === "my-jobs"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    My Jobs
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* User's Job Postings (if logged in and filter is set to my-jobs) */}
        {user && filter === "my-jobs" && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Job Postings
              </h2>
              <Link
                to="/create-job"
                className="flex items-center text-blue-600 hover:text-blue-500"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Post New Job
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            ) : userJobs.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No jobs posted yet
                </h3>
                <p className="mt-1 text-gray-500">
                  Get started by creating your first job posting.
                </p>
                <div className="mt-6">
                  <Link
                    to="/create-job"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Job Post
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {job.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Your Post
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {job.company}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="mt-1 flex items-center text-sm font-medium text-green-600">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {job.salary}
                        </div>
                      )}
                      <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="mt-5 flex flex-wrap justify-between items-center gap-2">
                        {/* Left side buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => viewApplicants(job._id, job.title)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Applicants
                          </button>
                          <Link
                            to={`/jobs/${job._id}`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </Link>
                        </div>
                        {/* Right side actions */}
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/edit-job/${job._id}`}
                            className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100"
                            title="Edit Job"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(job._id)}
                            className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-100"
                            title="Delete Job"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* All Available Jobs */}
        {(filter === "all" || !user) && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Jobs
              </h2>
              {filteredPublicJobs.length > 0 && (
                <p className="text-gray-600">
                  Showing {filteredPublicJobs.length}{" "}
                  {filteredPublicJobs.length === 1 ? "job" : "jobs"}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredPublicJobs.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No jobs found
                </h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm
                    ? `No jobs match "${searchTerm}". Try a different search term.`
                    : "No jobs available at the moment."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPublicJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 transform hover:-translate-y-1 transition-transform duration-200"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {job.title}
                        </h3>
                        {user && job.createdBy === user.userId && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Your Post
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {job.company}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="mt-1 flex items-center text-sm font-medium text-green-600">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {job.salary}
                        </div>
                      )}
                      <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="mt-5 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {user &&
                            job.createdBy &&
                            String(job.createdBy) !== String(user.userId) && (
                              <button
                                onClick={() => handleApply(job._id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Apply Now
                              </button>
                            )}
                          <Link
                            to={`/jobs/${job._id}`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </Link>
                          {user && job.createdBy === user.userId && (
                            <button
                              onClick={() => viewApplicants(job._id, job.title)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              View Applicants
                            </button>
                          )}
                        </div>
                        {user && job.createdBy === user.userId && (
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/edit-job/${job._id}`}
                              className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100"
                              title="Edit Job"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>
                            <button
                              onClick={() => openDeleteModal(job._id)}
                              className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-100"
                              title="Delete Job"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Job"
          message="Are you sure you want to delete this job? This action cannot be undone."
        />

        {/* Apply Modal */}
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={submitApplication}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
        />

        {/* Applicants Modal */}
        {isApplicantsModalOpen && (
          <ApplicantsList
            jobId={selectedJobForApplicants}
            user={user}
            onClose={() => setIsApplicantsModalOpen(false)}
            jobTitle={selectedJobTitle}
          />
        )}
      </div>
    </div>
  );
}
