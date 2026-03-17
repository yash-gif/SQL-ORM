import React, { useState } from "react";
import "./App.css";
import axios from "axios";

const initialJson = {
  operation: "SELECT",
  table: "students",
};

interface ResponseState {
  data: any;
  status: "idle" | "loading" | "success" | "error";
  timestamp?: Date;
}

function App() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(initialJson, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [response, setResponse] = useState<ResponseState>({
    data: null,
    status: "idle",
  });

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch (err) {
      setJsonError("Invalid JSON format. Please check your syntax.");
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    validateJson(value);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      setError(null);
    } catch (err) {
      setJsonError("Invalid JSON format. Please check your syntax.");
      console.error("JSON parsing error:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + "\t" + value.substring(end);

      setJsonInput(newValue);
      validateJson(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      JSON.parse(jsonInput);
    } catch (err) {
      setJsonError("Please fix JSON format before submitting.");
      return;
    }

    setResponse({ data: null, status: "loading" });
    setError(null);
    setJsonError(null);

    try {
      const result = await axios.post("http://localhost:5000/query", JSON.parse(jsonInput), {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response:", result.data);
      setResponse({
        data: result.data,
        status: "success",
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error("Error submitting query:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred while submitting the query.";
      setError(errorMessage);
      setResponse({
        data: null,
        status: "error",
      });
    }
  };

  const clearResponse = () => {
    setResponse({ data: null, status: "idle" });
    setError(null);
  };

  const resetToDefault = () => {
    setJsonInput(JSON.stringify(initialJson, null, 2));
    setJsonError(null);
    setError(null);
    setResponse({ data: null, status: "idle" });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">JSON Query Runner</h1>
          <p className="text-gray-400">Submit JSON queries and view responses in real-time</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700 fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-200">Query Input</h2>
              <button
                onClick={resetToDefault}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Reset to Default
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="json-input"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  JSON Query
                </label>
                <textarea
                  id="json-input"
                  spellCheck="false"
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  onBlur={formatJson}
                  onKeyDown={handleKeyDown}
                  className={`w-full h-80 p-4 font-mono text-sm bg-gray-900/80 text-gray-300 border rounded-lg focus:outline-none focus:ring-2 resize-none custom-scrollbar transition-all duration-200 ${
                    jsonError
                      ? "border-red-500 focus:ring-red-500/50"
                      : response.status === "success" && !jsonError
                      ? "success-border focus:ring-emerald-500/50"
                      : "border-gray-600 focus:ring-blue-500/50"
                  }`}
                  placeholder="Enter JSON here..."
                />
                {jsonError && (
                  <div className="mt-2">
                    <p className="text-sm text-red-400">{jsonError}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={response.status === "loading" || !!jsonError}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    response.status === "loading" || !!jsonError
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  }`}
                >
                  {response.status === "loading" ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Query"
                  )}
                </button>

                <button
                  onClick={formatJson}
                  className="px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200"
                >
                  Format
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700 fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-200">Response</h2>
              {response.status !== "idle" && (
                <button
                  onClick={clearResponse}
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="h-80 bg-gray-900/80 rounded-lg border border-gray-600 overflow-hidden">
              {response.status === "idle" && (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p>Waiting for response...</p>
                  </div>
                </div>
              )}

              {response.status === "loading" && (
                <div className="h-full flex items-center justify-center text-blue-400">
                  <div className="text-center pulse-animation">
                    <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p>Processing query...</p>
                  </div>
                </div>
              )}

              {response.status === "error" && error && (
                <div className="h-full p-4 flex items-start">
                  <div className="w-full">
                    <div className="mb-3">
                      <span className="text-red-400 font-medium">Error</span>
                    </div>
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {response.status === "success" && response.data && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-3 border-b border-gray-600">
                    <div>
                      <span className="text-emerald-400 font-medium">Success</span>
                    </div>
                    {response.timestamp && (
                      <span className="text-xs text-gray-500">
                        {response.timestamp.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <pre className="flex-1 p-4 text-gray-300 text-sm overflow-auto custom-scrollbar">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
