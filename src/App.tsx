import { useState, useEffect } from "react";

function App() {
  // API Base URL
  const API_BASE = "https://uptimerust.onrender.com";

  // State Management
  const [healthStatus, setHealthStatus] = useState({
    status: "",
    database_connected: false,
  });
  const [monitoringStatus, setMonitoringStatus] = useState({
    monitoring_active: false,
    urls_monitored: 0,
    monitored_urls: [] as string[],
    success_count: 0,
    failure_count: 0,
    last_updated: "",
  });
  const [urlsList, setUrlsList] = useState<string[]>([]);

  // Recent Checks Filter & Pagination State
  const [selectedCheckUrl, setSelectedCheckUrl] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Data Table State
  const [monitoringData, setMonitoringData] = useState<any[]>([]);

  // Form States
  const [newUrl, setNewUrl] = useState("");
  const [urlToRemove, setUrlToRemove] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch Health Status
  const fetchHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      if (data.success) {
        setHealthStatus(data.data);
      }
    } catch (error) {
      console.error("Error fetching health:", error);
    }
  };

  // Fetch Monitoring Status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      if (data.success) {
        setMonitoringStatus(data.data);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  // Fetch URLs List
  const fetchUrls = async () => {
    try {
      const response = await fetch(`${API_BASE}/urls`);
      const data = await response.json();
      if (data.success) {
        setUrlsList(data.data);
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
    }
  };

  // Fetch Monitoring Data with Pagination
  const fetchData = async () => {
    if (!selectedCheckUrl) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        url: selectedCheckUrl,
      });

      const response = await fetch(`${API_BASE}/data?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setMonitoringData(data.data);
        setTotalRecords(data.data.length * currentPage);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Start Monitoring
  const startMonitoring = async () => {
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchStatus();
      }
    } catch (error) {
      console.error("Error starting monitoring:", error);
    }
  };

  // Stop Monitoring
  const stopMonitoring = async () => {
    try {
      const response = await fetch(`${API_BASE}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchStatus();
      }
    } catch (error) {
      console.error("Error stopping monitoring:", error);
    }
  };

  // Add URL
  const addUrl = async () => {
    if (!newUrl.trim()) {
      alert("Please enter a URL");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setNewUrl("");
        fetchUrls();
        fetchStatus();
      }
    } catch (error) {
      console.error("Error adding URL:", error);
    }
  };

  // Remove URL
  const removeUrl = async () => {
    if (!urlToRemove.trim()) {
      alert("Please select a URL to remove");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/urls`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToRemove }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setUrlToRemove("");
        fetchUrls();
        fetchStatus();
        if (selectedCheckUrl === urlToRemove) {
          setSelectedCheckUrl("");
          setMonitoringData([]);
        }
      }
    } catch (error) {
      console.error("Error removing URL:", error);
    }
  };

  // Pagination Handlers
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const goToLastPage = () => {
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    setCurrentPage(totalPages);
  };

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Initial Data Fetch on Mount
  useEffect(() => {
    fetchHealth();
    fetchStatus();
    fetchUrls();
  }, []);

  // Fetch Data when selected URL or pagination changes
  useEffect(() => {
    if (selectedCheckUrl) {
      fetchData();
    }
  }, [selectedCheckUrl, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-black text-cyan-50 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsIDE4MywgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      <div className="relative z-10 p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-wider">
            RUST UPTIME MONITOR
          </h1>
        </div>

        {/* Status Bar */}
        <div className="mb-6 backdrop-blur-xl bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,183,255,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-cyan-500/20">
              <div>
                <p className="text-cyan-400/60 text-xs uppercase tracking-wider mb-1">
                  System Status
                </p>
                <p
                  className={`text-2xl font-bold font-mono ${
                    monitoringStatus.monitoring_active
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {monitoringStatus.monitoring_active
                    ? "● ACTIVE"
                    : "○ INACTIVE"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400/60 text-xs uppercase tracking-wider mb-1">
                  Monitored URLs
                </p>
                <p className="text-2xl font-bold font-mono text-cyan-400">
                  {monitoringStatus.urls_monitored}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-cyan-500/20">
              <div>
                <p className="text-cyan-400/60 text-xs uppercase tracking-wider mb-1">
                  Success
                </p>
                <p className="text-2xl font-bold font-mono text-green-400">
                  ✓ {monitoringStatus.success_count}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400/60 text-xs uppercase tracking-wider mb-1">
                  Failures
                </p>
                <p className="text-2xl font-bold font-mono text-red-400">
                  ✕ {monitoringStatus.failure_count}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-cyan-500/20">
              <div>
                <p className="text-cyan-400/60 text-xs uppercase tracking-wider mb-1">
                  Database
                </p>
                <p
                  className={`text-2xl font-bold font-mono ${
                    healthStatus.database_connected
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {healthStatus.database_connected ? "● ONLINE" : "○ OFFLINE"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400/60 text-xs uppercase tracking-wider mb-1">
                  Last Update
                </p>
                <p className="text-sm font-mono text-cyan-400">
                  {new Date(monitoringStatus.last_updated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Panel - Monitored URLs */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,183,255,0.15)]">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              Monitored URLs
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {monitoringStatus.monitored_urls.length === 0 ? (
                <div className="text-center py-8 text-cyan-400/40">
                  No URLs monitored yet
                </div>
              ) : (
                monitoringStatus.monitored_urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/30 transition-all duration-300 group"
                  >
                    <span className="text-cyan-400 font-mono font-bold text-sm bg-cyan-500/10 px-2 py-1 rounded">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-cyan-100 font-mono text-sm flex-1 truncate group-hover:text-cyan-300">
                      {url}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="backdrop-blur-xl bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,183,255,0.15)]">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              Controls
            </h3>

            <div className="space-y-4">
              <button
                onClick={startMonitoring}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] uppercase tracking-wider border border-green-400/30"
              >
                ▶ Start
              </button>

              <button
                onClick={stopMonitoring}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] uppercase tracking-wider border border-red-400/30"
              >
                ■ Stop
              </button>

              <div className="border-t border-cyan-500/20 pt-4 mt-4">
                <label className="text-cyan-400 text-xs uppercase tracking-wider mb-2 block">
                  Add New URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 bg-black/60 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-400/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,183,255,0.3)] transition-all font-mono text-sm"
                  />
                  <button
                    onClick={addUrl}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(0,183,255,0.3)] hover:shadow-[0_0_25px_rgba(0,183,255,0.5)]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-cyan-400 text-xs uppercase tracking-wider mb-2 block">
                  Remove URL
                </label>
                <div className="flex gap-2">
                  <select
                    value={urlToRemove}
                    onChange={(e) => setUrlToRemove(e.target.value)}
                    className="flex-1 bg-black/60 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,183,255,0.3)] transition-all font-mono text-sm"
                  >
                    <option value="">Select URL...</option>
                    {urlsList.map((url, index) => (
                      <option key={index} value={url}>
                        {url}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={removeUrl}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Checks Section */}
        <div className="backdrop-blur-xl bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,183,255,0.15)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              Recent Checks
            </h3>
            <select
              value={selectedCheckUrl}
              onChange={(e) => {
                setSelectedCheckUrl(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-black/60 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,183,255,0.3)] transition-all font-mono text-sm max-w-md"
            >
              <option value="">Select URL to view checks...</option>
              {urlsList.map((url, index) => (
                <option key={index} value={url}>
                  {url}
                </option>
              ))}
            </select>
          </div>

          {selectedCheckUrl && (
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 p-4 bg-black/40 rounded-xl border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <label className="text-cyan-400/80 text-xs uppercase tracking-wider">
                  Page:
                </label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  min="1"
                  className="bg-black/60 border border-cyan-500/30 rounded px-3 py-1 text-cyan-100 w-20 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-cyan-400/80 text-xs uppercase tracking-wider">
                  Per Page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-black/60 border border-cyan-500/30 rounded px-3 py-1 text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>

              <span className="text-cyan-400/60 text-sm font-mono">
                Total: {totalRecords}
              </span>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={goToFirstPage}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded transition-all text-sm font-mono"
                >
                  First
                </button>
                <button
                  onClick={goToPrevPage}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded transition-all text-sm font-mono"
                >
                  ← Prev
                </button>
                <span className="text-cyan-400 px-3 py-1 font-mono text-sm">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={goToNextPage}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded transition-all text-sm font-mono"
                >
                  Next →
                </button>
                <button
                  onClick={goToLastPage}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded transition-all text-sm font-mono"
                >
                  Last
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <p className="text-cyan-400 mt-4 font-mono">Loading data...</p>
            </div>
          ) : !selectedCheckUrl ? (
            <div className="text-center py-12 text-cyan-400/40">
              Please select a URL to view recent checks
            </div>
          ) : monitoringData.length === 0 ? (
            <div className="text-center py-12 text-cyan-400/40">
              No data available for {selectedCheckUrl}
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-full">
                <div className="grid grid-cols-4 gap-4 p-4 bg-cyan-500/10 border-b border-cyan-500/30 font-bold text-cyan-400 text-xs uppercase tracking-wider">
                  <span>Timestamp</span>
                  <span>Status</span>
                  <span>Response Time</span>
                  <span>Message</span>
                </div>

                <div className="space-y-2 mt-2">
                  {monitoringData.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-4 p-4 bg-black/40 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/20 transition-all duration-300 items-center"
                    >
                      <span className="text-cyan-100 font-mono text-sm">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          item.status_code === 200
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.status_code === 200 ? "✓" : "✕"}{" "}
                        {item.status_code}
                      </span>
                      <span className="text-cyan-400 font-mono text-sm">
                        {item.response_time_ms} ms
                      </span>
                      <span
                        className={`font-mono text-sm ${
                          item.success ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {item.success ? "OK" : "FAILED"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
