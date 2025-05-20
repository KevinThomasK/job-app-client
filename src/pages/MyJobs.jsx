// MyJobs.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function MyJobs() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/jobs/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setJobs(res.data))
      .catch((err) => console.log(err));
  }, [token]);

  return (
    <div className="container">
      <h2>My Jobs</h2>
      {jobs.length === 0 ? (
        <p>You haven't posted any jobs.</p>
      ) : (
        jobs.map((job) => (
          <div key={job._id} className="job-card">
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <p>
              <strong>Company:</strong> {job.company}
            </p>
            <p>
              <strong>Location:</strong> {job.location}
            </p>
            <p>
              <strong>Salary:</strong> ${job.salary}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyJobs;
