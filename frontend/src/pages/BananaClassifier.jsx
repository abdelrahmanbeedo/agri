
import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "../i18n/LanguageContext";
import { FaCloudUploadAlt, FaSpinner, FaHistory } from "react-icons/fa";

const ML_API_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

const BananaClassifier = () => {
  const { t, isRTL } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${ML_API_URL}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
      fetchHistory();
    } catch (err) {
      console.error("Error classifying image:", err);
      setError(t('bananaClassifier.failedClassify'));
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

  const getProgressColor = (score) => {
    if (score > 0.7) return "bg-green-500";
    if (score > 0.4) return "bg-yellow-400";
    return "bg-red-400";
  };

  const isGradeA = result?.grade === "Grade A";

  return (
    <div className="min-h-screen bg-sage-50/30 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl w-full space-y-8 bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-sage-100">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {t('bananaClassifier.title')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('bananaClassifier.subtitle')}
          </p>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-4 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
              isDragActive ? "border-sage-500 bg-sage-50" : "border-sage-300 hover:border-sage-400 hover:bg-sage-50"
            }`}
          >
            <input {...getInputProps()} />
            <FaCloudUploadAlt className="text-6xl text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-700">
              {isDragActive ? t('bananaClassifier.dropHere') : t('bananaClassifier.dragDrop')}
            </p>
            <p className="mt-2 text-sm text-gray-500">{t('bananaClassifier.supports')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <img
                src={preview}
                alt="Upload preview"
                className="max-h-80 rounded-lg shadow-md object-contain border border-gray-200"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-sm transition"
                title={t('bananaClassifier.removeImage')}
              >
                ✕
              </button>
            </div>

            {!result && !loading && (
              <button
                onClick={handleClassify}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>{t('bananaClassifier.analyzeRipeness')}</span>
              </button>
            )}

            {loading && (
              <div className="flex items-center space-x-3 text-green-600">
                <FaSpinner className="animate-spin text-2xl" />
                <span className="font-medium animate-pulse">{t('bananaClassifier.analyzing')}</span>
              </div>
            )}

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
              {t('bananaClassifier.predictionResult')}
            </h2>

            <div className="flex flex-col items-center space-y-6">
              {/* Grade Badge */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full text-white text-6xl font-extrabold shadow-lg ${isGradeA ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  {result.grade === "Grade A" ? "A" : "C"}
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-gray-800">{result.fruit}</span>
                </div>
                <div className="text-lg text-gray-600 mt-1 font-medium">
                  {t('bananaClassifier.confidence')} {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>

              {/* Overall Grade Verdict */}
              <div className="w-full max-w-md pt-4">
                <h3 className="text-base font-semibold text-gray-700 mb-3 text-center">
                  {t('bananaClassifier.overallGrade')}
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.grade_confidence || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([g, conf]) => (
                      <div key={g}>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                          <span>{g === "Grade A" ? t('bananaClassifier.gradeA') : t('bananaClassifier.gradeC')}</span>
                          <span>{(conf * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full transition-all duration-1000 ease-out ${g === "Grade A" ? "bg-emerald-400" : "bg-red-400"}`}
                            style={{ width: `${conf * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Predictions */}
              <div className="w-full max-w-md pt-2">
                <h3 className="text-base font-semibold text-gray-700 mb-3 text-center">
                  {t('bananaClassifier.topPredictions')}
                </h3>
                <div className="space-y-2">
                  {Object.entries(result.probabilities)
                    .slice(0, 5)
                    .map(([className, prob]) => (
                      <div key={className}>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                          <span>{className}</span>
                          <span>{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${getProgressColor(prob)}`}
                            style={{ width: `${prob * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center mx-auto space-x-2"
              >
                <FaHistory />
                <span>{t('bananaClassifier.classifyAnother')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent History Section */}
        {history.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('bananaClassifier.recentScans')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {history.map((item) => (
                <div key={item._id} className="bg-sage-50/60 rounded-lg p-2 border border-sage-100 hover:shadow-md transition">
                  <img
                    src={item.image_url}
                    alt={item.prediction}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <div className="text-center">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {item.grade ? (
                        <><span className={`inline-block w-5 h-5 rounded-full text-white text-xs font-bold leading-5 mr-1 ${item.grade === "Grade A" ? "bg-emerald-500" : "bg-red-500"}`}>{item.grade === "Grade A" ? "A" : "C"}</span> {item.fruit || item.prediction}</>
                      ) : (
                        item.prediction
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{(item.confidence * 100).toFixed(0)}% {t('bananaClassifier.confAbbr')}</p>
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
