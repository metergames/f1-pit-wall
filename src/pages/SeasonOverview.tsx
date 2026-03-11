import { useEffect, useState } from 'react';
import { fetchSeasonRaces, fetchDriverStandings, fetchRaceResults, type Race, type DriverStanding, type RaceResult } from '../services/f1-api';
import { getTeamColor } from '../utils/team-colors';
import { getTrackImage } from '../utils/tracks';
import { getCountryFlag } from '../utils/flags';
import { FaFlagCheckered, FaTimes } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { formatUtcDate, getCurrentYear, getTodayIsoDate } from '../utils/date';
import './SeasonOverview.css';

export default function SeasonOverview() {
    const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());
    
    const [races, setRaces] = useState<Race[]>([]);
    const [standings, setStandings] = useState<DriverStanding[]>([]);
    const [fullStandings, setFullStandings] = useState<DriverStanding[]>([]);
    const [podium, setPodium] = useState<RaceResult[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial load: get selected year
    useEffect(() => {
        const saved = localStorage.getItem('selectedSeason');
        if (saved) {
            setSelectedYear(Number(saved));
        }
    }, []);

    // Fetch Dashboard Data whenever selectedYear changes
    useEffect(() => {
        if (!selectedYear) return;

        async function loadDashboard() {
            try {
                // 1. Get Schedule
                const scheduleData = await fetchSeasonRaces(selectedYear);
                const seasonRaces = scheduleData.races || [];
                setRaces(seasonRaces);

                // 2. Get Top 5 Standings
                const standingsData = await fetchDriverStandings(selectedYear, 5);
                setStandings(standingsData.drivers_championship || []);

                // 3. Find Last Race and get Podium
                const today = getTodayIsoDate();
                const completedRaces = seasonRaces.filter(r => r.schedule.race.date < today);
                const lastRace = completedRaces.length > 0 ? completedRaces[completedRaces.length - 1] : null;

                if (lastRace) {
                    const resultsData = await fetchRaceResults(selectedYear, lastRace.round);
                    const resultsList = resultsData.races?.results || [];
                    setPodium(resultsList.slice(0, 3));
                } else {
                    setPodium([]);
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            }
        }
        loadDashboard();
    }, [selectedYear]);

    const openFullStandings = async () => {
        setIsModalOpen(true);
        if (fullStandings.length === 0) {
            const data = await fetchDriverStandings(selectedYear, 30);
            setFullStandings(data.drivers_championship || []);
        }
    };

    // Derived Data for UI
    const todayStr = getTodayIsoDate();
    const nextRace = races.find(r => r.schedule.race.date >= todayStr);
    const completedRaces = races.filter(r => r.schedule.race.date < todayStr);
    const lastRace = completedRaces.length > 0 ? completedRaces[completedRaces.length - 1] : null;

    return (
        <div className="dashboard-container">
            <Navbar selectedYear={selectedYear} onSeasonChange={setSelectedYear} />

            <main className="main-content">
                <div className="container">
                    
                    {/* Summary Bar */}
                    <section className="season-summary">
                        <div className="summary-label">{selectedYear} Season Summary</div>
                        <div className="summary-item">
                            <div className="summary-value">{races.length || '--'}</div>
                            <div className="summary-sublabel">Races</div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-value">{races.length > 0 ? formatUtcDate(races[0].schedule.race.date, { month: 'short', day: '2-digit' }) : '--'}</div>
                            <div className="summary-sublabel">Start Date</div>
                        </div>
                        <div className="summary-item">
                            <div className="summary-value">{races.length > 0 ? formatUtcDate(races[races.length - 1].schedule.race.date, { month: 'short', day: '2-digit' }) : '--'}</div>
                            <div className="summary-sublabel">End Date</div>
                        </div>
                    </section>

                    <div className="content-grid">
                        <div className="left-column">
                            {/* NEXT RACE CARD */}
                            <article className="race-card">
                                <div className="track-image">
                                    {nextRace ? (
                                        <img src={getTrackImage(nextRace.circuit.circuitId)} alt="Track Map" className="track-map" />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                            <FaFlagCheckered style={{ fontSize: '3rem', color: '#e10600', opacity: 0.5 }} />
                                            <p style={{ marginTop: '1rem' }}>No upcoming races</p>
                                        </div>
                                    )}
                                </div>
                                <div className="race-info">
                                    <p className="race-label">Up Next: {nextRace?.raceName || 'Season Ended'}</p>
                                    <h2 className="race-title">{nextRace ? nextRace.circuit.circuitName : `${selectedYear} Season Complete`}</h2>
                                    {nextRace && (
                                        <div className="race-details">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img src={getCountryFlag(nextRace.circuit.country)} alt={nextRace.circuit.country} style={{ width: 24 }} />
                                                <span>{nextRace.circuit.country}</span>
                                            </div>
                                            <div style={{ fontWeight: 600 }}>{formatUtcDate(nextRace.schedule.race.date, { month: 'short', day: '2-digit' })}</div>
                                        </div>
                                    )}
                                </div>
                            </article>

                            {/* LAST RACE RESULTS CARD */}
                            <article className="race-card">
                                <div className="track-image">
                                    {lastRace && <img src={getTrackImage(lastRace.circuit.circuitId)} alt="Track Map" className="track-map" />}
                                </div>
                                <div className="race-info">
                                    <p className="race-label">Results: {lastRace?.raceName || '--'}</p>
                                    <h2 className="race-title">Podium Finishers</h2>
                                    <div className="podium-list">
                                        {podium.map((res, i) => (
                                            <div key={res.driver.name} className="podium-row">
                                                <span className={`podium-pos pos-${i + 1}`}>{i + 1}</span>
                                                <div className="team-pill" style={{ backgroundColor: getTeamColor(res.team.teamId) }}></div>
                                                <span className="podium-driver-name">{res.driver.name} {res.driver.surname}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* STANDINGS CARD */}
                        <aside className="right-column">
                            <div className="standings-card">
                                <div className="standings-header">
                                    <h2 style={{ fontFamily: 'Space Grotesk', marginBottom: '4px' }}>Championship Standings</h2>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Top 5 drivers in {selectedYear}</p>
                                </div>
                                <div className="standings-table-header">
                                    <span>Pos</span><span>Driver</span><span>Team</span><span>Points</span>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                                    {standings.map(d => (
                                        <div key={d.driverId} className="driver-row" style={{ marginBottom: 0 }}>
                                            <span style={{ fontWeight: 700, color: '#94a3b8' }}>{d.position}</span>
                                            <span style={{ fontWeight: 500 }}>{d.driver.name.charAt(0)}. {d.driver.surname}</span>
                                            <span className="col-team-name">{d.team.teamName.replace(/Formula 1 Team|F1 Team/i, '').trim()}</span>
                                            <span className="driver-points">{d.points}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-view-full" onClick={openFullStandings}>View Full Standings</button>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* FULL STANDINGS MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ fontFamily: 'Space Grotesk' }}>Full Championship Standings</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                        </div>
                        <div className="standings-table-header">
                            <span>Pos</span><span>Driver</span><span>Team</span><span>Points</span>
                        </div>
                        <div>
                            {fullStandings.length === 0 ? <p>Loading...</p> : fullStandings.map(d => (
                                <div key={d.driverId} className="driver-row">
                                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>{d.position}</span>
                                    <span style={{ fontWeight: 500 }}>{d.driver.name} {d.driver.surname}</span>
                                    <span className="col-team-name">{d.team.teamName.replace(/Formula 1 Team|F1 Team/i, '').trim()}</span>
                                    <span className="driver-points">{d.points}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}