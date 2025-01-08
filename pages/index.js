"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { Geist, Geist_Mono } from "next/font/google";
import "../public/globals.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Line = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", 
  subsets: ["latin"],
});

function RootLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient`}>
      {children}
    </div>
  );
}

function Home() {
  const [data, setData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [mqttStatus, setMqttStatus] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sendMqttCommand = (command) => {
    setMqttStatus(`Perintah "${command}" tidak dapat diproses - MQTT tidak aktif ⚠️`);
  };

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
        setHistoricalData(prev => [...prev, sensorData].slice(-10));
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

  const handleConnect = () => {
    if (!apiUrl) {
      alert("Silakan masukkan URL API terlebih dahulu");
      return;
    }

    if (!isConnected) {
      fetchData();
      const interval = setInterval(fetchData, 1000);
      setIsConnected(true);
      return () => clearInterval(interval);
    } else {
      setIsConnected(false);
      setData(null);
    }
  };

  return (
    <div className="dashboard modern-theme">
      <h1 className="title glow-text">
        <span className="icon rotate-icon">🏠</span>
        Smart Home Control Center
        <span className="subtitle pulse-animation">IoT Dashboard v2.0</span>
      </h1>

      <div className="connection-bar glass-morphism">
        <div className="connection-info">
          <span className="date-time fade-in">
            <span className="icon bounce">📅</span> {currentDate}
            <span className="icon clock spin">⏰</span> {currentTime}
          </span>
        </div>
        <div className="connection-controls">
          <input 
            type="text"
            placeholder="Masukkan URL API Anda..."
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="api-input modern-input"
          />
          <button 
            className={`connect-btn ${isConnected ? 'connected pulse' : 'hover-effect'}`}
            onClick={handleConnect}
          >
            {isConnected ? '🔴 Disconnect' : '🟢 Connect'}
          </button>
        </div>
      </div>

      <div className="sensors-grid animate-in">
        <div className="sensor-card glass-morphism hover-lift">
          <div className="sensor-header">
            <div className="sensor-icon gas pulse">⛽</div>
            <div className="sensor-label">Gas Level</div>
          </div>
          <div className="sensor-value glow">{data?.gas || 0}
            <span className="unit">PPM</span>
          </div>
        </div>

        <div className="sensor-card glass-morphism hover-lift">
          <div className="sensor-header">
            <div className="sensor-icon humidity wave">💧</div>
            <div className="sensor-label">Humidity</div>
          </div>
          <div className="sensor-value glow">{data?.humidity || 0}
            <span className="unit">%</span>
          </div>
        </div>

        <div className="sensor-card glass-morphism hover-lift">
          <div className="sensor-header">
            <div className="sensor-icon temperature pulse">🌡️</div>
            <div className="sensor-label">Temperature</div>
          </div>
          <div className="sensor-value glow">{data?.temperature || 0}
            <span className="unit">°C</span>
          </div>
        </div>

        <div className="sensor-card glass-morphism hover-lift">
          <div className="sensor-header">
            <div className={`sensor-icon flame ${data?.flame === 1 ? 'danger-flicker' : ''}`}>
              {data?.flame === 1 ? '🔥' : '🚫'}
            </div>
            <div className="sensor-label">Fire Status</div>
          </div>
          <div className={`sensor-value ${data?.flame === 1 ? 'danger-text' : 'safe-text'}`}>
            {data?.flame === 1 ? 'KEBAKARAN!' : 'AMAN'}
            <div className={`status-indicator ${data?.flame === 1 ? 'warning-blink' : ''}`}>
              {data?.flame === 1 ? '🚨' : '✅'}
            </div>
          </div>
        </div>
      </div>

      <div className="control-section glass-morphism">
        <h2 className="section-title glow-text" style={{ textAlign: 'center' }}>Smart Control Panel</h2>
        <div className="control-buttons">
          <button className="control-btn neo-btn" onClick={() => sendMqttCommand('fan on')}>
            <span className="btn-icon spin">🌬️</span>
            <span className="btn-text">Nyalakan Kipas</span>
          </button>
          <button className="control-btn neo-btn" onClick={() => sendMqttCommand('fan off')}>
            <span className="btn-icon pulse">⭕</span>
            <span className="btn-text">Matikan Kipas</span>
          </button>
          <button className="control-btn neo-btn" onClick={() => sendMqttCommand('open door')}>
            <span className="btn-icon swing">🚪</span>
            <span className="btn-text">Buka Pintu</span>
          </button>
          <button className="control-btn neo-btn" onClick={() => sendMqttCommand('close door')}>
            <span className="btn-icon bounce">🔒</span>
            <span className="btn-text">Tutup Pintu</span>
          </button>
        </div>
        <div className={`mqtt-status ${mqttStatus ? 'active fade-in' : ''}`}>
          <span className="status-icon pulse">📡</span>
          {mqttStatus || 'Menunggu perintah...'}
        </div>
      </div>

      {isClient && historicalData.length > 0 && (
        <div className="charts-grid glass-morphism">
          <div className="chart-container">
            <h3 className="chart-title">Gas Level History</h3>
            <Line
              data={{
                labels: historicalData.map((_, index) => index + 1),
                datasets: [{
                  label: 'Gas Level (PPM)',
                  data: historicalData.map(d => d.gas),
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Temperature History</h3>
            <Line
              data={{
                labels: historicalData.map((_, index) => index + 1),
                datasets: [{
                  label: 'Temperature (°C)',
                  data: historicalData.map(d => d.temperature),
                  borderColor: 'rgba(255, 159, 64, 1)',
                  backgroundColor: 'rgba(255, 159, 64, 0.2)',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Humidity History</h3>
            <Line
              data={{
                labels: historicalData.map((_, index) => index + 1),
                datasets: [{
                  label: 'Humidity (%)',
                  data: historicalData.map(d => d.humidity),
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <RootLayout>
      <Home />
    </RootLayout>
  );
}
