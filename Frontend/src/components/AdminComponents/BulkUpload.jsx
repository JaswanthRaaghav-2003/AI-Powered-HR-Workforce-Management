import React, { useState, useEffect } from "react";
import axios from "axios";
import * as faceapi from "@vladmandic/face-api";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [facialFiles, setFacialFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [facialResult, setFacialResult] = useState(null);
  const [error, setError] = useState(null);
  const [facialError, setFacialError] = useState(null);

  // Load face-api models from public folder
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    };
    loadModels();
  }, []);

  // ======= BULK DATA UPLOAD =======
  const handleUpload = async () => {
    if (!file) return alert("Select a file first.");
    setUploading(true); setProgress(0); setResult(null); setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally { setUploading(false); setProgress(0); }
  };

  // ======= FACIAL DATA UPLOAD =======
  const handleFacialUpload = async () => {
    if (!facialFiles.length) return alert("Select images first.");
    setUploading(true); setProgress(0); setFacialResult(null); setFacialError(null);

    try {
      const descriptors = [];

      for (let i = 0; i < facialFiles.length; i++) {
        const img = await faceapi.bufferToImage(facialFiles[i]);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (!detection) continue;

        // Get empId, name etc from file name: e.g., "EmpID_Name_Department.jpg"
        const parts = facialFiles[i].name.split(".")[0].split("_");
        descriptors.push({
          empId: parts[0],
          name: parts[1],
          department: parts[2] || "",
          descriptor: Array.from(detection.descriptor),
        });

        setProgress(Math.round(((i + 1) / facialFiles.length) * 100));
      }

      // Upload descriptors to backend
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/facial/bulk-upload`, { records: descriptors }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFacialResult(res.data);
    } catch (err) {
      console.error(err);
      setFacialError(err.response?.data?.error || err.message);
    } finally { setUploading(false); setProgress(0); }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-8">

      {/* BULK DATA UPLOAD */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Bulk Employee Data Upload</h2>
        <input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files[0])} className="mb-3" />
        <div className="flex items-center gap-3">
          <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {uploading ? `Uploading (${progress}%)` : "Upload Excel"}
          </button>
          {uploading && <div className="w-48 bg-gray-100 rounded"><div style={{ width: `${progress}%` }} className="bg-blue-500 h-2 rounded"></div></div>}
        </div>
        {result && <pre className="mt-4 p-3 border rounded bg-green-50 text-sm">{JSON.stringify(result, null, 2)}</pre>}
        {error && <div className="mt-4 p-3 border rounded bg-red-50 text-red-700">Error: {error}</div>}
      </div>

      {/* FACIAL DATA UPLOAD */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Facial Data Upload (Images)</h2>
        <input type="file" accept="image/*" multiple onChange={(e) => setFacialFiles([...e.target.files])} className="mb-3" />
        <div className="flex items-center gap-3">
          <button onClick={handleFacialUpload} disabled={uploading} className="bg-purple-600 text-white px-4 py-2 rounded">
            {uploading ? `Uploading (${progress}%)` : "Upload Facial Data"}
          </button>
          {uploading && <div className="w-48 bg-gray-100 rounded"><div style={{ width: `${progress}%` }} className="bg-purple-500 h-2 rounded"></div></div>}
        </div>
        {facialResult && <pre className="mt-4 p-3 border rounded bg-green-50 text-sm">{JSON.stringify(facialResult, null, 2)}</pre>}
        {facialError && <div className="mt-4 p-3 border rounded bg-red-50 text-red-700">Error: {facialError}</div>}
      </div>

    </div>
  );
};

export default BulkUpload;
