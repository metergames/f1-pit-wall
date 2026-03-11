const BASE_URL = "https://f1api.dev/api";
const cache = new Map<string, any>();

export interface Championship {
    championshipId: string;
    championshipName: string;
    year: number;
    url: string;
}

export interface SeasonsResponse {
    championships: Championship[];
}

export interface Driver {
    name: string;
    surname: string;
    nationality: string;
    number: number;
    shortName: string;
}

export interface DriverStanding {
    position: number;
    points: number;
    driverId: string;
    teamId: string;
    team: { teamId: string; teamName: string };
    wins: number;
    driver: Driver;
}

export interface DriverStandingsResponse {
    drivers_championship: DriverStanding[];
}

export interface Circuit {
    circuitId: string;
    circuitName: string;
    country: string;
    city: string;
}

export interface Race {
    round: number;
    raceName: string;
    circuit: Circuit;
    schedule: {
        race: { date: string; time?: string };
    };
}

export interface RaceResult {
    position: number;
    points: number;
    driver: Driver;
    team: { teamId: string; teamName: string };
}

export interface DriverResult {
    race: {
        round: number;
        name: string;
        date: string;
    };
    result: {
        finishingPosition: number | null;
        retired: boolean;
        pointsObtained: number;
    };
}

export interface DriverDetailResponse {
    results: DriverResult[];
}

function buildUrl(endpoint: string, params: Record<string, string | number> = {}): string {
    const url = new URL(`${BASE_URL}/${endpoint.replace(/^\/+/, "")}`);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, String(value));
    }
    return url.toString();
}

async function getJson<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = buildUrl(path, params);
    if (cache.has(url)) return cache.get(url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

    const data = await response.json();
    cache.set(url, data);
    return data;
}

export async function fetchSeasons(): Promise<SeasonsResponse> {
    return getJson<SeasonsResponse>("seasons");
}

export async function fetchDriverStandings(year: number, limit: number = 5, offset: number = 0): Promise<DriverStandingsResponse> {
    return getJson<DriverStandingsResponse>(`${year}/drivers-championship`, { limit, offset });
}

export async function fetchSeasonRaces(year: number): Promise<{ races: Race[] }> {
    return getJson<{ races: Race[] }>(`${year}`);
}

export async function fetchRaceResults(year: number, round: number): Promise<{ races: { results: RaceResult[] } }> {
    return getJson<{ races: { results: RaceResult[] } }>(`${year}/${round}/race`);
}

export async function fetchDriverDetail(year: number, driverId: string): Promise<DriverDetailResponse> {
    return getJson<DriverDetailResponse>(`${year}/drivers/${driverId}`);
}