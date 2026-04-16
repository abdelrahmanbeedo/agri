
import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaSpinner, FaHistory } from "react-icons/fa";

const ML_API_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

const BananaClassifier = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const [history, setHistory] = useState([]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${ML_API_URL}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  // Load history on mount
  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle classification
  const handleClassify = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(`${ML_API_URL}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
      fetchHistory(); // Refresh history after new classification
    } catch (err) {
      console.error("Error classifying image:", err);
      setError("Failed to classify image. Ensure the Python API is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  // Helper to format class names (e.g., "Ripe_Banana" -> "Ripe Banana")
  const formatClass = (name) => name.replace(/_/g, " ");

  // Helper for progress bar color
  const getProgressColor = (score) => {
    if (score > 0.7) return "bg-green-500";
    if (score > 0.4) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            🍌 Fruit & Mango AI
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload an image of a Banana or Mango to detect its ripeness.
          </p>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-4 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
              isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <FaCloudUploadAlt className="text-6xl text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-700">
              {isDragActive ? "Drop the image here..." : "Drag & drop an image here, or click to select"}
            </p>
            <p className="mt-2 text-sm text-gray-500">Supports JPG, PNG</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            {/* Image Preview */}
            <div className="relative group">
              <img
                src={preview}
                alt="Upload preview"
                className="max-h-80 rounded-lg shadow-md object-contain border border-gray-200"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-sm transition"
                title="Remove image"
              >
                ✕
              </button>
            </div>

            {/* Action Buttons */}
            {!result && !loading && (
              <button
                onClick={handleClassify}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>🔍 Analyze Ripeness</span>
              </button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center space-x-3 text-green-600">
                <FaSpinner className="animate-spin text-2xl" />
                <span className="font-medium animate-pulse">Analyzing image features...</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="w-full bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-8 border-t pt-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Prediction Result
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
              {/* Top Prediction */}
              <div className="text-center">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                  Identified As
                </div>
                <div className="text-5xl font-extrabold text-green-600">
                  {formatClass(result.prediction)}
                </div>
                <div className="text-lg text-gray-600 mt-2 font-medium">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>

              {/* Probability Bars */}
              <div className="w-full max-w-md space-y-4">
                {Object.entries(result.probabilities)
                  .sort(([, a], [, b]) => b - a) // Sort by probability descending
                  .map(([className, prob]) => (
                    <div key={className}>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>{formatClass(className)}</span>
                        <span>{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${getProgressColor(prob)}`}
                          style={{ width: `${prob * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center mx-auto space-x-2"
              >
                <FaHistory />
                <span>Classify Another Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent History Section */}
        {history.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Scans</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {history.map((item) => (
                <div key={item._id} className="bg-gray-50 rounded-lg p-2 border hover:shadow-md transition">
                  <img 
                    src={item.image_url} 
                    alt={item.prediction} 
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <div className="text-center">
                    <p className="font-semibold text-sm text-gray-800 truncate">{formatClass(item.prediction)}</p>
                    <p className="text-xs text-gray-500">{(item.confidence * 100).toFixed(0)}% Conf.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BananaClassifier;
