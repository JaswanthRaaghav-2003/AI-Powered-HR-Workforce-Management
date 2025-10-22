import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const MODEL_PATH = "/models";

export default function CameraPage({ onAttendanceUpdate }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [status, setStatus] = useState("Loading models...");
  const [lastMatch, setLastMatch] = useState(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await tf.ready();
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH);

      if (!mounted) return;

      setStatus("Starting camera...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("Camera started — detecting...");
        startDetection();
      } catch (err) {
        console.error("Camera error:", err);
        setStatus("Unable to access camera. Check permissions.");
      }
    })();

    return () => {
      mounted = false;
      const video = videoRef.current;
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
    faceapi.matchDimensions(canvas, displaySize);

    const loop = async () => {
      if (!video || video.paused || video.ended) {
        requestAnimationFrame(loop);
        return;
      }

      const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        const resized = faceapi.resizeResults(detection, displaySize);
        faceapi.draw.drawDetections(canvas, resized);

        const descriptor = Array.from(detection.descriptor);
        const now = Date.now();

        if (now - lastSentRef.current > 5000) {
          lastSentRef.current = now;
          setStatus("Face detected — matching...");
          try {
            const token = localStorage.getItem("token");
            const resp = await axios.post(
              `${API_URL}/api/facial/match`,
              { descriptor },
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            setLastMatch(resp.data);
            setStatus(`Matched: ${resp.data.match.name} (${resp.data.match.empId})`);

            // ✅ Notify Dashboard to refresh AttendancePanel
            if (onAttendanceUpdate) onAttendanceUpdate();
          } catch (err) {
            console.warn("No match or error", err.response?.data || err.message);
            setLastMatch(err.response?.data || { error: err.message });
            setStatus("No match");
          }
        }
      } else {
        setStatus("No face detected");
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Camera — Face Detection</h2>
      <div className="flex gap-4">
        <div>
          <video ref={videoRef} autoPlay muted playsInline width="480" height="360" style={{ borderRadius: 8 }} />
          <canvas ref={canvasRef} width="480" height="360" style={{ position: "relative", marginTop: -360 }} />
        </div>
        <div>
          <div className="mb-2">Status: {status}</div>
          <pre className="text-sm bg-slate-50 p-2 rounded w-80 h-72 overflow-auto">
            {lastMatch ? JSON.stringify(lastMatch, null, 2) : "No matches yet"}
          </pre>
        </div>
      </div>
    </div>
  );
}
