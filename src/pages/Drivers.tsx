import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import Navbar from '../components/Navbar';
import { fetchDriverStandings, fetchDriverDetail, type DriverStanding, type DriverResult } from '../services/f1-api';
import { getTeamColor } from '../utils/team-colors';
import {
  Chart as ChartJS,
    type ChartOptions,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
    Legend,
    type TooltipItem
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatUtcDate, getCurrentYear } from '../utils/date';
import './Drivers.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Drivers() {
    const initialYear = Number(localStorage.getItem('selectedSeason')) || getCurrentYear();
    const [selectedYear, setSelectedYear] = useState<number>(initialYear);
    
    // Sidebar state
    const [allDrivers, setAllDrivers] = useState<DriverStanding[]>([]);
    const [teamFilter, setTeamFilter] = useState<string>('all');
    const [selectedDriver, setSelectedDriver] = useState<DriverStanding | null>(null);
    const [loadingSidebar, setLoadingSidebar] = useState(true);

    // Detail state
    const [driverResults, setDriverResults] = useState<DriverResult[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // 1. Fetch all drivers for the year
    useEffect(() => {
        async function loadDrivers() {
            setLoadingSidebar(true);
            try {
                const data = await fetchDriverStandings(selectedYear, 30);
                const driversList = data.drivers_championship || [];
                setAllDrivers(driversList);
                
                // Reset filter and auto-select first driver
                setTeamFilter('all');
                if (driversList.length > 0) {
                    setSelectedDriver(driversList[0]);
                }
            } catch (err) {
                console.error("Failed to load drivers:", err);
            } finally {
                setLoadingSidebar(false);
            }
        }
        loadDrivers();
    }, [selectedYear]);

    // 2. Fetch driver detail when selectedDriver changes
    useEffect(() => {
        if (!selectedDriver) return;

        async function loadDetails() {
            setLoadingDetails(true);
            try {
                const data = await fetchDriverDetail(selectedYear, selectedDriver!.driverId);
                // Sort by round ascending just in case
                const sorted = (data.results || []).sort((a, b) => a.race.round - b.race.round);
                setDriverResults(sorted);
            } catch (err) {
                console.error("Failed to load driver details:", err);
                setDriverResults([]);
            } finally {
                setLoadingDetails(false);
            }
        }
        loadDetails();
    }, [selectedDriver, selectedYear]);

    // Derived states
    const uniqueTeams = useMemo(() => {
        const teams = new Map<string, string>();
        allDrivers.forEach(d => teams.set(d.team.teamId, d.team.teamName));
        return Array.from(teams.entries());
    }, [allDrivers]);

    const filteredDrivers = useMemo(() => {
        if (teamFilter === 'all') return allDrivers;
        return allDrivers.filter(d => d.team.teamId === teamFilter);
    }, [allDrivers, teamFilter]);

    // Calculated Stats
    const podiums = driverResults.filter(r => r.result.finishingPosition && r.result.finishingPosition <= 3).length;

    const finishPositions = driverResults.flatMap((r) => {
        if (r.result.retired) return [];

        return typeof r.result.finishingPosition === 'number' && Number.isFinite(r.result.finishingPosition)
            ? [r.result.finishingPosition]
            : [];
    });
    const avgFinish = finishPositions.length
        ? (finishPositions.reduce((sum, position) => sum + position, 0) / finishPositions.length).toFixed(1)
        : "-";

    const last5Races = [...driverResults].reverse().slice(0, 5);

    // Chart Configuration
    const chartData = {
        labels: driverResults.map(r => {
            return formatUtcDate(r.race.date, { month: 'short', day: '2-digit' });
        }),
        datasets: [
            {
                label: "Finish Position",
                data: driverResults.map(r => r.result.retired ? null : r.result.finishingPosition),
                backgroundColor: "rgba(225, 6, 0, 0.6)",
                borderColor: "#e10600",
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 'flex' as const,
                maxBarThickness: 30,
            },
        ],
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#15191e",
                titleColor: "#fff",
                bodyColor: "#94a3b8",
                callbacks: {
                    title: (items: TooltipItem<'bar'>[]) => driverResults[items[0].dataIndex]?.race.name,
                    label: (context: TooltipItem<'bar'>) => `Position: P${context.raw}`,
                },
            },
        },
        scales: {
            y: {
                min: 0,
                max: 24,
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#94a3b8", stepSize: 1 },
            },
            x: {
                grid: { display: false },
                ticks: { color: "#94a3b8", maxRotation: 45, minRotation: 45 },
            },
        },
    };

    const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setTeamFilter(e.target.value);
    };

    return (
        <div className="dashboard-container">
            <Navbar selectedYear={selectedYear} onSeasonChange={setSelectedYear} />

            <main className="main-content">
                <div className="container">
                    <div className="split-layout">
                        
                        {/* SIDEBAR */}
                        <aside className="driver-list-sidebar">
                            <div className="filter-container">
                                <select className="team-filter" value={teamFilter} onChange={handleFilterChange}>
                                    <option value="all">All Teams</option>
                                    {uniqueTeams.map(([id, name]) => (
                                        <option key={id} value={id}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="driver-list">
                                {loadingSidebar ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading drivers...</p> : null}
                                
                                {filteredDrivers.map(d => (
                                    <div 
                                        key={d.driverId}
                                        className={`driver-list-item ${selectedDriver?.driverId === d.driverId ? 'active' : ''}`}
                                        onClick={() => setSelectedDriver(d)}
                                    >
                                        <div className="driver-number-badge" style={{ backgroundColor: getTeamColor(d.team.teamId) }}>
                                            {d.driver.number || "?"}
                                        </div>
                                        <div className="driver-info-sm">
                                            <div className="driver-name-sm">{d.driver.name} {d.driver.surname}</div>
                                            <div className="driver-team-sm">{d.team.teamName}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        {/* DETAIL VIEW */}
                        <section className="driver-detail">
                            {!selectedDriver ? (
                                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <p>Select a driver to view details</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="detail-header">
                                        <div className="header-info">
                                            <h1 className="driver-name">{selectedDriver.driver.name} {selectedDriver.driver.surname}</h1>
                                            <p className="driver-team">{selectedDriver.team.teamName}</p>
                                        </div>
                                        <div className="driver-number" style={{ color: getTeamColor(selectedDriver.team.teamId) }}>
                                            {selectedDriver.driver.number || "?"}
                                        </div>
                                    </div>

                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{selectedDriver.points}</div>
                                            <div className="stat-label">Points</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{selectedDriver.wins}</div>
                                            <div className="stat-label">Wins</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{loadingDetails ? '--' : podiums}</div>
                                            <div className="stat-label">Podiums</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{loadingDetails ? '--' : avgFinish}</div>
                                            <div className="stat-label">Avg. Finish</div>
                                        </div>
                                    </div>

                                    <div className="chart-section">
                                        <h2 className="section-title">Latest Finishing Positions</h2>
                                        <div className="chart-container">
                                            {!loadingDetails && driverResults.length > 0 ? (
                                                <Bar data={chartData} options={chartOptions} />
                                            ) : (
                                                <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '4rem' }}>
                                                    {loadingDetails ? 'Loading chart...' : 'No race data available.'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="races-table-section">
                                        <h2 className="section-title">Last 5 Races</h2>
                                        <table className="races-table">
                                            <thead>
                                                <tr>
                                                    <th>Race</th>
                                                    <th>Position</th>
                                                    <th style={{ textAlign: 'right' }}>Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loadingDetails ? (
                                                    <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
                                                ) : last5Races.length === 0 ? (
                                                    <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8' }}>No race results</td></tr>
                                                ) : (
                                                    last5Races.map((r, i) => {
                                                        const pos = r.result.retired ? "DNF" : r.result.finishingPosition;
                                                        const pts = r.result.pointsObtained;
                                                        const colorClass = pos === 1 ? 'pos-1' : pos === 2 ? 'pos-2' : pos === 3 ? 'pos-3' : '';
                                                        
                                                        return (
                                                            <tr key={`${r.race.round}-${i}`}>
                                                                <td>{r.race.name.replace(" Grand Prix", " GP").replace(/\d{4}$/, "")}</td>
                                                                <td className={`pos-text ${colorClass}`}>{pos}</td>
                                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', color: 'var(--accent-cyan)' }}>+{pts}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}