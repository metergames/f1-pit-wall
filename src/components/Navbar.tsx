import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { fetchSeasons } from '../services/f1-api';
import { FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

interface NavbarProps {
    selectedYear: number;
    onSeasonChange: (year: number) => void;
}

export default function Navbar({ selectedYear, onSeasonChange }: NavbarProps) {
    const [seasons, setSeasons] = useState<number[]>([]);

    useEffect(() => {
        fetchSeasons().then(data => {
            const years = data.championships.map(c => c.year).sort((a, b) => b - a);
            setSeasons(years);
        });
    }, []);

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const year = Number(e.target.value);
        localStorage.setItem('selectedSeason', String(year));
        onSeasonChange(year);
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <div className="nav-brand">
                    <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                        <h1 className="brand-name">Pit Wall</h1>
                    </Link>
                </div>

                <ul className="nav-links">
                    <li><NavLink to="/overview" className={({isActive}) => isActive ? "active" : ""}>Overview</NavLink></li>
                    <li><NavLink to="/races" className={({isActive}) => isActive ? "active" : ""}>Races</NavLink></li>
                    <li><NavLink to="/drivers" className={({isActive}) => isActive ? "active" : ""}>Drivers</NavLink></li>
                </ul>

                <div className="season-dropdown-container">
                    <select className="season-dropdown" value={selectedYear} onChange={handleChange}>
                        {seasons.map(y => <option key={y} value={y}>{y} Season</option>)}
                    </select>
                    <FaChevronDown className="dropdown-icon" />
                </div>
            </div>
        </nav>
    );
}