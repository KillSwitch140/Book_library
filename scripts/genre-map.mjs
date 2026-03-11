/**
 * Maps a Goodreads genre list (array of strings) + publication year
 * to one of the Athenaeum genre taxonomy values.
 */

const GENRE_RULES = [
  { matches: ["science fiction", "sci-fi", "space opera", "hard science fiction"], genre: "Sci-Fi" },
  { matches: ["fantasy", "magic", "dragon", "epic fantasy", "high fantasy", "urban fantasy", "sword and sorcery"], genre: "Fantasy" },
  { matches: ["mystery", "crime", "detective", "whodunit", "cozy mystery"], genre: "Mystery" },
  { matches: ["thriller", "suspense", "psychological thriller", "legal thriller"], genre: "Thriller" },
  { matches: ["romance", "love story", "chick lit", "contemporary romance"], genre: "Romance" },
  { matches: ["memoir", "biography", "autobiography", "true story", "nonfiction memoir"], genre: "Memoir" },
  { matches: ["historical fiction", "historical"], genre: "Historical Fiction" },
  { matches: ["dystopia", "dystopian", "post-apocalyptic", "post apocalyptic"], genre: "Dystopian" },
  { matches: ["horror", "gothic", "dark fiction"], genre: "Horror" },
  { matches: ["nonfiction", "non-fiction", "self-help", "business", "economics", "psychology", "philosophy", "science", "history", "politics", "true crime"], genre: "Non-Fiction" },
  { matches: ["classics", "classic literature", "literary fiction", "literature"], genre: "Literary Fiction" },
];

/**
 * @param {string[]} genres - parsed array from Goodreads genres column
 * @param {number | null} year - publication year (used for Classic detection)
 * @returns {string} genre taxonomy value
 */
export function classifyGenre(genres, year) {
  if (!genres || genres.length === 0) return "Fiction";

  const lowerGenres = genres.map((g) => g.toLowerCase().trim());

  // Check Classic: explicitly tagged AND old enough
  if (lowerGenres.some((g) => g.includes("classic")) && year && year < 1950) {
    return "Classic";
  }

  for (const rule of GENRE_RULES) {
    if (lowerGenres.some((g) => rule.matches.some((m) => g.includes(m)))) {
      return rule.genre;
    }
  }

  return "Fiction";
}
