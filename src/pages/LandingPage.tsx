import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDriverStandings, fetchSeasons, type DriverStanding } from '../services/f1-api';
import { getTeamColor } from '../utils/team-colors';
import { FaCheckCircle, FaCalendarAlt, FaFlagCheckered, FaTrophy, FaExclamationCircle } from 'react-icons/fa';
import './LandingPage.css';

export default function LandingPage() {
    const [standings, setStandings] = useState<DriverStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const seasonsData = await fetchSeasons();
                if (!seasonsData?.championships?.length) {
                    throw new Error("No seasons data available");
                }

                // Get the most recent year
                const latestYear = seasonsData.championships[0].year;
                
                // Fetch the top 5 drivers
                const response = await fetchDriverStandings(latestYear, 5);
                
                if (response.drivers_championship) {
                    setStandings(response.drivers_championship);
                } else {
                    throw new Error("No standings data received");
                }
            } catch (err) {
                console.error(err);
                setError("Unable to load standings.");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    // Helper to format rank classes
    const getRankClass = (position: number) => {
        if (position === 1) return 'gold';
        if (position === 2) return 'silver';
        if (position === 3) return 'bronze';
        return '';
    };

    return (
        <div>
            {/* Navigation */}
            <nav className="navbar">
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-brand">
                            <h1 className="brand-name">Pit Wall</h1>
                        </div>
                        <ul className="nav-links">
                            <li><a href="#features">Features</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-left">
                            <h2 className="hero-title">Pit Wall</h2>
                            <p className="hero-description">
                                Explore Formula 1 data like never before. Dive into seasons, races, and driver stats with live data.
                            </p>

                            <ul className="features-list">
                                <li><FaCheckCircle /> <span>Browse seasons from the F1 API</span></li>
                                <li><FaCheckCircle /> <span>Inspect race results and podiums</span></li>
                                <li><FaCheckCircle /> <span>Compare teams and drivers side by side</span></li>
                            </ul>

                            <div className="hero-buttons">
                                {/* React Router Link instead of standard <a> tags */}
                                <Link to="/seasons" className="btn btn-primary">Enter the Pit Wall</Link>
                                <Link to="/overview" className="btn btn-secondary">View Season Overview</Link>
                            </div>
                        </div>

                        <div className="hero-right">
                            <div className="championship-card">
                                <div className="championship-header">
                                    <h3>Championship Standings</h3>
                                </div>
                                <div className="divider"></div>

                                {loading && (
                                    <div className="standings-loader">
                                        <div className="spinner"></div>
                                        <p>Loading standings...</p>
                                    </div>
                                )}

                                {error && (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255, 255, 255, 0.6)' }}>
                                        <FaExclamationCircle style={{ fontSize: '32px', color: '#e10600', marginBottom: '16px' }} />
                                        <p style={{ margin: 0 }}>{error}</p>
                                    </div>
                                )}

                                {!loading && !error && (
                                    <ul className="standings-list">
                                        {standings.map((entry, index) => (
                                            <li 
                                                key={entry.driverId} 
                                                className="standing-item"
                                                style={{ animationDelay: `${index * 0.1}s` }} // Staggered animation
                                            >
                                                <div className={`standing-rank ${getRankClass(entry.position)}`}>
                                                    {entry.position}
                                                </div>
                                                <div 
                                                    className="standing-bar" 
                                                    style={{ backgroundColor: getTeamColor(entry.teamId) }}
                                                ></div>
                                                <div className="standing-name">
                                                    {entry.driver.name} {entry.driver.surname}
                                                </div>
                                                <div className="standing-points">{entry.points} PTS</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works" id="features">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="features-grid">
                        <article className="feature-card">
                            <div className="feature-icon"><FaCalendarAlt /></div>
                            <h3 className="feature-title">Pick a Season</h3>
                            <p className="feature-description">Select any F1 season from the extensive history available through the API.</p>
                        </article>

                        <article className="feature-card">
                            <div className="feature-icon"><FaFlagCheckered /></div>
                            <h3 className="feature-title">Explore Races & Drivers</h3>
                            <p className="feature-description">Dive deep into race results, driver performances, and team statistics.</p>
                        </article>

                        <article className="feature-card">
                            <div className="feature-icon"><FaTrophy /></div>
                            <h3 className="feature-title">Follow Driver Standings</h3>
                            <p className="feature-description">Track the championship fight with live updates on driver and constructor standings.</p>
                        </article>
                    </div>
                    <div className="section-divider"></div>
                </div>
            </section>

            <footer className="footer" id="about">
                <div className="container">
                    <p className="footer-text">© 2025 Pit Wall. Data powered by the community-maintained F1 API (f1api.dev).</p>
                </div>
            </footer>
        </div>
    );
}