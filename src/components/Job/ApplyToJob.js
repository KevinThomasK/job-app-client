// ApplyToJob.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ApplyToJob() {
  const { id } = useParams();
  const { token } = useAuth();
  const [coverLetter, setCoverLetter] = useState("");

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/applications/${id}`,
        { coverLetter },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Application submitted!");
    } catch (err) {
      alert("Application failed");
    }
  };

  return (
    <div className="container">
      <h2>Apply to Job</h2>
      <form onSubmit={handleApply}>
        <textarea
          placeholder="Cover Letter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          required
        />
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}

export default ApplyToJob;
