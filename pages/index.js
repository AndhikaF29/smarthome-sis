import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>

// Inisialisasi font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Komponen layout utama
function RootLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {children}
    </div>
  );
}

// Komponen Home yang sekarang menjadi children dari RootLayout
function Home() {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Modifikasi fetch data untuk handle berbagai format response
  const fetchData = async () => {
    if (!apiUrl) return;
    
    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (result.success && result.data) {
        const sensorData = {
          gas: result.data.gas ?? 0,
          humidity: result.data.humidity ?? 0,
          temperature: result.data.temperature ?? 0
        };
        
        console.log('Processed Data:', sensorData);
        setData(sensorData);
        setIsConnected(true);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsConnected(false);
      alert("Failed to fetch data. Please check your API URL.");
    }
  };

  // Handle connect button click
  const handleConnect = () => {
    if (!apiUrl) {
      alert("Please enter API URL first");
      return;
    }

    if (!isConnected) {
      // Mulai fetching data ketika user klik connect
      fetchData();
      const interval = setInterval(fetchData, 1000);
      setIsConnected(true);
      return () => clearInterval(interval);
    } else {
      // Stop fetching data ketika user klik disconnect
      setIsConnected(false);
      setData(null);
    }
  };

  // Render UI
  return (
    <div className="dashboard">
      <h1 className="title">
        <span className="icon">🏠</span>
        IoT Sensor Dashboard
      </h1>

      <div className="connection-bar">
        <span className="date">{currentDate}</span>
        <span className="time">{currentTime}</span>
        <input 
          type="text" 
          placeholder="Enter API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />
        <button 
          className={`connect-btn ${isConnected ? 'connected' : ''}`}
          onClick={handleConnect}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="sensors-grid">
        <div className="sensor-card">
          <div className="sensor-icon">⛽</div>
          <div className="sensor-label">Gas Level:</div>
          <div className="sensor-value">{data?.gas || 0}%</div>
        </div>

        <div className="sensor-card">
          <div className="sensor-icon">💧</div>
          <div className="sensor-label">Humidity:</div>
          <div className="sensor-value">{data?.humidity || 0}%</div>
        </div>

        <div className="sensor-card">
          <div className="sensor-icon">🌡️</div>
          <div className="sensor-label">Temperature:</div>
          <div className="sensor-value">{data?.temperature || 0}°C</div>
        </div>
      </div>

      <div className="averages-grid">
        <div className="average-card">
          <div className="average-icon">📊</div>
          <div className="average-label">Daily Average</div>
          <div className="average-value">0</div>
        </div>

        <div className="average-card">
          <div className="average-icon">📈</div>
          <div className="average-label">Weekly Average</div>
          <div className="average-value">0</div>
        </div>

        <div className="average-card">
          <div className="average-icon">📅</div>
          <div className="average-label">Monthly Average</div>
          <div className="average-value">0</div>
        </div>
      </div>

      <div className="control-buttons">
        <button className="control-btn">
          <span className="btn-icon">🌬️</span>
          Nyalakan Kipas
        </button>
        <button className="control-btn">
          <span className="btn-icon">⭕</span>
          Matikan Kipas
        </button>
        <button className="control-btn">
          <span className="btn-icon">🚪</span>
          Buka Pintu
        </button>
        <button className="control-btn">
          <span className="btn-icon">🔒</span>
          Tutup Pintu
        </button>
      </div>
    </div>
  );
}

// Render Home sebagai children dari RootLayout
export default function App() {
  return (
    <RootLayout>
      <Home />
    </RootLayout>
  );
}
