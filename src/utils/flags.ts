export const COUNTRY_FLAGS: Record<string, string> = {
    Bahrain: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Bahrain.svg",
    "Saudi Arabia": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg",
    Australia: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg",
    Japan: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg",
    China: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg",
    USA: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
    "United States": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
    Italy: "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg",
    Monaco: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Flag_of_Monaco.svg",
    Spain: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
    Canada: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg",
    Austria: "https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg",
    "Great Britain": "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
    Hungary: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Flag_of_Hungary.svg",
    Belgium: "https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_Belgium_%28civil%29.svg",
    Netherlands: "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg",
    Azerbaijan: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg",
    Singapore: "https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Singapore.svg",
    Mexico: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg",
    Brazil: "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg",
    Qatar: "https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Qatar.svg",
    "United Arab Emirates": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",
    Portugal: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg",
    Turkey: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg",
    France: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg",
    Russia: "https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg",
    Germany: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg",
    Argentina: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
    Malaysia: "https://upload.wikimedia.org/wikipedia/commons/6/66/Flag_of_Malaysia.svg",
    Korea: "https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg",
    India: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
};

const DEFAULT_FLAG = "https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_the_United_Nations.svg";

export function getCountryFlag(country: string): string {
    if (!country) return DEFAULT_FLAG;

    if (COUNTRY_FLAGS[country]) return COUNTRY_FLAGS[country];

    const key = Object.keys(COUNTRY_FLAGS).find(
        (k) => k.includes(country) || country.includes(k)
    );
    return key ? COUNTRY_FLAGS[key] : DEFAULT_FLAG;
}