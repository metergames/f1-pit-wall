import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSeasons } from '../services/f1-api';
import { FaChevronDown, FaTrophy, FaBullseye, FaFlagCheckered } from 'react-icons/fa';
import './SeasonSelection.css';

export default function SeasonSelection() {
    const navigate = useNavigate();
    
    // State to hold the list of available years and the currently selected one
    const [years, setYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | ''>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch the available seasons on mount
    useEffect(() => {
        async function loadSeasons() {
            try {
                const data = await fetchSeasons();
                if (data && data.championships) {
                    // Extract just the years and sort descending
                    const seasonYears = data.championships
                        .map(c => c.year)
                        .sort((a, b) => b - a);
                    
                    setYears(seasonYears);
                    
                    // Check local storage for a previously selected year, otherwise default to latest
                    const savedYear = localStorage.getItem('selectedSeason');
                    if (savedYear && seasonYears.includes(Number(savedYear))) {
                        setSelectedYear(Number(savedYear));
                    } else {
                        setSelectedYear(seasonYears[0]);
                        localStorage.setItem('selectedSeason', String(seasonYears[0]));
                    }
                } else {
                    throw new Error("Invalid season data format.");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load seasons.");
            } finally {
                setLoading(false);
            }
        }
        
        loadSeasons();
    }, []);

    // Handle dropdown changes
    const handleSeasonChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const year = Number(e.target.value);
        setSelectedYear(year);
        localStorage.setItem('selectedSeason', String(year));
    };

    // Handle navigation to different sections
    const handleNavigate = (path: string) => {
        if (!selectedYear) return;
        navigate(path);
    };

    // Define our navigation cards to map over them easily
    const navCards = [
        {
            title: "Season Overview",
            description: "Key stats and upcoming races for this season.",
            icon: <FaTrophy />,
            path: "/overview"
        },
        {
            title: "Races",
            description: "Calendar of all races, with detail for each grand prix.",
            icon: <FaBullseye />,
            path: "/races"
        },
        {
            title: "Drivers",
            description: "Profiles, stats, and results per season.",
            icon: <FaFlagCheckered />,
            path: "/drivers"
        }
    ];

    return (
        <main className="main-container">
            <div className="content-wrapper">
                <h1 className="page-title">Choose your season</h1>
                
                {/* Season Dropdown Section */}
                <div className="season-selector">
                    <label htmlFor="season-dropdown" className="season-label">Season</label>
                    <div className="dropdown-wrapper">
                        <select 
                            id="season-dropdown" 
                            className="season-dropdown"
                            value={selectedYear}
                            onChange={handleSeasonChange}
                            disabled={loading || !!error}
                            style={{ opacity: loading ? 0.5 : 1 }}
                        >
                            {loading && <option value="">Loading years...</option>}
                            {error && <option value="">Error loading</option>}
                            
                            {!loading && !error && years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <FaChevronDown className="dropdown-icon" />
                    </div>
                </div>
                
                {/* Navigation Cards Grid */}
                <div className="cards-grid">
                    {navCards.map((card, index) => (
                        <article 
                            key={card.title} 
                            className="nav-card"
                            style={{ animationDelay: `${index * 0.15}s` }} // Staggered entrance
                        >
                            <div className="card-icon">
                                {card.icon}
                            </div>
                            <h2 className="card-title">{card.title}</h2>
                            <p className="card-description">{card.description}</p>
                            <button 
                                className="btn-open"
                                onClick={() => handleNavigate(card.path)}
                            >
                                Open
                            </button>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}