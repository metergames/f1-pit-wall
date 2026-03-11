import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { fetchSeasonRaces, fetchRaceResults, type Race, type RaceResult } from '../services/f1-api';
import { getTrackImage } from '../utils/tracks';
import { getCountryFlag } from '../utils/flags';
import { getTeamColor } from '../utils/team-colors';
import { formatUtcDate, getCurrentYear, getTodayIsoDate } from '../utils/date';
import './Races.css';

export default function Races() {
    // Standardize initial year from local storage
    const initialYear = Number(localStorage.getItem('selectedSeason')) || getCurrentYear();
    const [selectedYear, setSelectedYear] = useState<number>(initialYear);
    
    const [races, setRaces] = useState<Race[]>([]);
    const [selectedRace, setSelectedRace] = useState<Race | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'results'>('info');
    const [results, setResults] = useState<RaceResult[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);

    // 1. Fetch Schedule on year change
    useEffect(() => {
        async function loadRaces() {
            try {
                const data = await fetchSeasonRaces(selectedYear);
                const seasonRaces = data.races || [];
                setRaces(seasonRaces);
                
                // Auto-select the next upcoming race, or the last completed one
                const today = getTodayIsoDate();
                let targetRace = seasonRaces.find(r => r.schedule.race.date >= today);
                if (!targetRace && seasonRaces.length > 0) {
                    targetRace = seasonRaces[seasonRaces.length - 1];
                }
                setSelectedRace(targetRace || null);
                setActiveTab('info');
            } catch (err) {
                console.error("Failed to load races:", err);
            }
        }
        loadRaces();
    }, [selectedYear]);

    // 2. Fetch Results when a specific race is clicked AND the user switches to the 'results' tab
    useEffect(() => {
        if (!selectedRace || activeTab !== 'results') return;
        
        const today = getTodayIsoDate();
        if (selectedRace.schedule.race.date >= today) {
            setResults([]); // Future race, no results
            return;
        }

        async function loadResults() {
            setResultsLoading(true);
            try {
                const data = await fetchRaceResults(selectedYear, selectedRace!.round);
                setResults(data.races?.results || []);
            } catch (err) {
                console.error("Failed to fetch results:", err);
                setResults([]);
            } finally {
                setResultsLoading(false);
            }
        }
        loadResults();
    }, [selectedRace, activeTab, selectedYear]);

    const formatTime = (timeStr?: string) => {
        return timeStr ? timeStr.replace("Z", " UTC") : "TBA";
    };

    const todayStr = getTodayIsoDate();

    return (
        <div className="dashboard-container">
            <Navbar selectedYear={selectedYear} onSeasonChange={setSelectedYear} />

            <main className="main-content">
                <div className="container">
                    <div className="split-layout">
                        
                        {/* LEFT COLUMN: RACE LIST */}
                        <aside className="race-list">
                            {races.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading races...</p> : null}
                            
                            {races.map((race) => {
                                const isCompleted = race.schedule.race.date < todayStr;
                                const isActive = selectedRace?.round === race.round;
                                
                                return (
                                    <div 
                                        key={race.round} 
                                        className={`race-list-item ${isActive ? 'active' : ''}`}
                                        onClick={() => { setSelectedRace(race); setActiveTab('info'); }}
                                    >
                                        <div className="item-left">
                                            <div className="item-round">{race.round}</div>
                                            <div className="item-info">
                                                <h3>{race.raceName}</h3>
                                                <div className="item-location">
                                                    <img src={getCountryFlag(race.circuit.country)} alt="" style={{ width: 16 }} />
                                                    <span>{race.circuit.country}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`item-status ${isCompleted ? 'status-completed' : 'status-upcoming'}`}>
                                            {isCompleted ? 'Completed' : 'Upcoming'}
                                        </div>
                                    </div>
                                );
                            })}
                        </aside>

                        {/* RIGHT COLUMN: DETAIL VIEW */}
                        {selectedRace && (
                            <section className="race-detail">
                                <div className="detail-header">
                                    <h1 className="detail-title">{selectedRace.raceName}</h1>
                                    <p className="detail-subtitle">{selectedRace.circuit.circuitName}, {selectedRace.circuit.city}</p>
                                </div>

                                <div className="detail-track-map">
                                    <img src={getTrackImage(selectedRace.circuit.circuitId)} className="track-map-large" alt="Track layout" />
                                </div>

                                <div className="race-data-panel">
                                    <div className="detail-tabs">
                                        <button 
                                            className={`inner-tab ${activeTab === 'info' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('info')}
                                        >
                                            Overview
                                        </button>
                                        <button 
                                            className={`inner-tab ${activeTab === 'results' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('results')}
                                        >
                                            Results
                                        </button>
                                    </div>

                                    {/* INFO TAB */}
                                    {activeTab === 'info' && (
                                        <div className="detail-scroll-area info-grid-vertical">
                                            <div className="info-item">
                                                <div className="info-label">Race Date</div>
                                                <div className="info-value">{formatUtcDate(selectedRace.schedule.race.date, { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="info-label">Start Time</div>
                                                <div className="info-value">{formatTime(selectedRace.schedule.race.time)}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* RESULTS TAB */}
                                    {activeTab === 'results' && (
                                        <div className="detail-scroll-area">
                                            {selectedRace.schedule.race.date >= todayStr ? (
                                                <p style={{ color: '#94a3b8' }}>Race has not started yet.</p>
                                            ) : resultsLoading ? (
                                                <p style={{ color: '#94a3b8' }}>Loading full results...</p>
                                            ) : results.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {results.map((res) => (
                                                        <div key={res.driver.name} className="results-row">
                                                            <span className="results-pos">{res.position}</span>
                                                            <div style={{ width: 4, height: 16, backgroundColor: getTeamColor(res.team.teamId), marginRight: 12, borderRadius: 2 }}></div>
                                                            <span style={{ flex: 1, fontWeight: 500 }}>{res.driver.name} {res.driver.surname}</span>
                                                            <span style={{ color: '#00d2be', fontWeight: 600 }}>+{res.points}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ color: '#e10600' }}>Results pending.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}