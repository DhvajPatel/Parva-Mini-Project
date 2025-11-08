import React, { useEffect, useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function App() {
  // Theme (light/dark)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  // Data state
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch JSON from public folder (exported from R)
  useEffect(() => {
    fetch("/dashboard_data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard_data.json");
        return res.json();
      })
      .then((json) => {
        setSummary(json.summary);
        if (json.accident_by_time) {
          const chartData = json.accident_by_time.map((item) => ({
            time: item.Var1,
            accidents: item.Freq,
          }));
          setData(chartData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setError("⚠️ Unable to load dashboard_data.json. Please check the file path.");
        setLoading(false);
      });
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle handler
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const COLORS = ["#0088FE", "#f91ea5", "#FFBB28", "#ff9a42"];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
        <h1>🚦 Accident Risk Analysis Dashboard</h1>
        <p>Urban Road Network Accident Prediction & Visualization</p>
      </header>

      {/* Main Content */}
      <main>
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {/* Summary Section */}
            <section className="panel">
              <h3>Dataset & Model Summary</h3>
              <div className="card-grid">
                <div className="stat-card">
                  <h4>Rows Loaded</h4>
                  <p>{summary?.rowsLoaded ?? "-"}</p>
                </div>
                <div className="stat-card">
                  <h4>Rows Used (Cleaned)</h4>
                  <p>{summary?.rowsUsed ?? "-"}</p>
                </div>
                <div className="stat-card">
                  <h4>Model Trained Samples</h4>
                  <p>{summary?.trainedSamples ?? "-"}</p>
                </div>
                <div className="stat-card">
                  <h4>Feature Vector Length</h4>
                  <p>{summary?.featureVectorLength ?? "-"}</p>
                </div>
              </div>

              {/* Numeric Summary */}
              <div className="numeric-card">
                <h4>Numeric Features Normalized</h4>
                <div className="numeric-grid">
                  {summary &&
                    Object.keys(summary.numericStats).map((k) => (
                      <div key={k} className="num-stat">
                        <span className="num-label">{k}</span>
                        <span className="num-value">
                          mean={Number(summary.numericStats[k].mean).toFixed(2)}, sd=
                          {Number(summary.numericStats[k].sd).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </section>

            {/* Charts Section */}
            <section className="charts-container">
              <div className="chart-box">
                <h3>Accidents by Time of Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="accidents"
                      stroke="#0072B2"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <h3>Accident Distribution (Pie)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="accidents"
                      nameKey="time"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <h3>Accident Frequency (Bar)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accidents" fill="#00C49F" barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Recommendations Section */}
            <section className="recommendations">
              <h3>📊 Recommendations for Safety Interventions</h3>
              <ul>
                <li>
                  <strong>Peak Risk Hours:</strong> Increase road lighting &
                  patrol during <em>Evening/Night</em>.
                </li>
                <li>
                  <strong>Weather Conditions:</strong> Adaptive lighting &
                  alerts for rain/fog.
                </li>
                <li>
                  <strong>Traffic Density:</strong> Optimize traffic flow and
                  enforce speed limits in dense areas.
                </li>
                <li>
                  <strong>Driver Factors:</strong> Campaigns for sober and
                  fatigue-free driving.
                </li>
                <li>
                  <strong>Speed Management:</strong> Roads above{" "}
                  <em>67 km/h</em> need stricter speed enforcement.
                </li>
              </ul>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© Accident Risk Analysis 2025</p>
        <p>Created by Parva Raval & Aditya Nair</p>
      </footer>
    </div>
  );
}

export default App;
