export const TEAM_COLORS: Record<string, string> = {
    mclaren: "#F47600",
    red_bull: "#4781D7",
    mercedes: "#00D7B6",
    ferrari: "#ED1131",
    aston_martin: "#229971",
    alpine: "#00A1E8",
    williams: "#1868DB",
    rb: "#6C98FF",
    sauber: "#01C00E",
    haas: "#9C9FA2"
};

const DEFAULT_COLOR = "#9C9FA2";

export function getTeamColor(teamId?: string): string {
    if (!teamId) return DEFAULT_COLOR;
    return TEAM_COLORS[teamId.toLowerCase()] || DEFAULT_COLOR;
}