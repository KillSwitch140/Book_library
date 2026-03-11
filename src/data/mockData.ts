import midnightLibrary from "@/assets/covers/midnight-library.jpg";
import projectHailMary from "@/assets/covers/project-hail-mary.jpg";
import klaraSun from "@/assets/covers/klara-sun.jpg";
import dune from "@/assets/covers/dune.jpg";
import songAchilles from "@/assets/covers/song-achilles.jpg";
import circe from "@/assets/covers/circe.jpg";
import educated from "@/assets/covers/educated.jpg";
import greatGatsby from "@/assets/covers/great-gatsby.jpg";
import nineteen84 from "@/assets/covers/1984.jpg";
import becoming from "@/assets/covers/becoming.jpg";
import crawdads from "@/assets/covers/crawdads.jpg";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  rating: number;
  available: boolean;
  copies: number;
  availableCopies: number;
  isbn: string;
  year: number;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  activeLoans: number;
  status: "active" | "suspended" | "expired";
}

export interface Loan {
  id: string;
  bookTitle: string;
  memberName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "active" | "overdue" | "returned";
}

export interface Reservation {
  id: string;
  bookTitle: string;
  bookCover: string;
  reservedDate: string;
  position: number;
  estimatedAvailable: string;
  status: "waiting" | "ready" | "expired";
}

export const books: Book[] = [
  { id: "1", title: "The Midnight Library", author: "Matt Haig", cover: midnightLibrary, genre: "Fiction", rating: 4.5, available: true, copies: 5, availableCopies: 2, isbn: "978-0525559474", year: 2020, description: "Between life and death there is a library, and within that library, the shelves go on forever." },
  { id: "2", title: "Project Hail Mary", author: "Andy Weir", cover: projectHailMary, genre: "Sci-Fi", rating: 4.8, available: true, copies: 3, availableCopies: 1, isbn: "978-0593135204", year: 2021, description: "A lone astronaut must save the earth from disaster in this propulsive interstellar adventure." },
  { id: "3", title: "Klara and the Sun", author: "Kazuo Ishiguro", cover: klaraSun, genre: "Literary Fiction", rating: 4.2, available: false, copies: 4, availableCopies: 0, isbn: "978-0571364879", year: 2021, description: "A luminous novel about an artificial friend observing the human heart." },
  { id: "4", title: "Dune", author: "Frank Herbert", cover: dune, genre: "Sci-Fi", rating: 4.7, available: true, copies: 6, availableCopies: 3, isbn: "978-0441013593", year: 1965, description: "Set on the desert planet Arrakis, this is the story of Paul Atreides." },
  { id: "5", title: "The Song of Achilles", author: "Madeline Miller", cover: songAchilles, genre: "Historical Fiction", rating: 4.6, available: true, copies: 4, availableCopies: 2, isbn: "978-0062060624", year: 2012, description: "A tale of gods, kings, immortal fame, and the human heart." },
  { id: "6", title: "Circe", author: "Madeline Miller", cover: circe, genre: "Fantasy", rating: 4.5, available: true, copies: 3, availableCopies: 1, isbn: "978-0316556347", year: 2018, description: "In the house of Helios, god of the sun, a daughter is born." },
  { id: "7", title: "Educated", author: "Tara Westover", cover: educated, genre: "Memoir", rating: 4.7, available: false, copies: 5, availableCopies: 0, isbn: "978-0399590504", year: 2018, description: "A memoir about a young girl who leaves her survivalist family to go to university." },
  { id: "8", title: "The Great Gatsby", author: "F. Scott Fitzgerald", cover: greatGatsby, genre: "Classic", rating: 4.3, available: true, copies: 8, availableCopies: 5, isbn: "978-0743273565", year: 1925, description: "The story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan." },
  { id: "9", title: "1984", author: "George Orwell", cover: nineteen84, genre: "Dystopian", rating: 4.7, available: true, copies: 7, availableCopies: 4, isbn: "978-0451524935", year: 1949, description: "A dystopian novel set in a totalitarian society ruled by Big Brother." },
  { id: "10", title: "Becoming", author: "Michelle Obama", cover: becoming, genre: "Memoir", rating: 4.6, available: true, copies: 4, availableCopies: 2, isbn: "978-1524763138", year: 2018, description: "An intimate, powerful, and inspiring memoir by the former First Lady." },
  { id: "11", title: "Where the Crawdads Sing", author: "Delia Owens", cover: crawdads, genre: "Mystery", rating: 4.4, available: true, copies: 5, availableCopies: 3, isbn: "978-0735219090", year: 2018, description: "A novel about a young woman who raised herself in the marshes of the deep South." },
];

export const members: Member[] = [
  { id: "1", name: "Elena Rodriguez", email: "elena@example.com", memberSince: "2022-03-15", activeLoans: 3, status: "active" },
  { id: "2", name: "James Chen", email: "james.c@example.com", memberSince: "2021-08-22", activeLoans: 1, status: "active" },
  { id: "3", name: "Sarah Mitchell", email: "s.mitchell@example.com", memberSince: "2023-01-10", activeLoans: 0, status: "expired" },
  { id: "4", name: "David Park", email: "d.park@example.com", memberSince: "2020-11-05", activeLoans: 2, status: "active" },
  { id: "5", name: "Aisha Patel", email: "aisha.p@example.com", memberSince: "2023-06-18", activeLoans: 4, status: "active" },
  { id: "6", name: "Marcus Johnson", email: "m.johnson@example.com", memberSince: "2022-09-30", activeLoans: 0, status: "suspended" },
];

export const loans: Loan[] = [
  { id: "1", bookTitle: "The Midnight Library", memberName: "Elena Rodriguez", borrowDate: "2026-02-15", dueDate: "2026-03-15", returnDate: null, status: "active" },
  { id: "2", bookTitle: "Dune", memberName: "James Chen", borrowDate: "2026-01-20", dueDate: "2026-02-20", returnDate: null, status: "overdue" },
  { id: "3", bookTitle: "Circe", memberName: "David Park", borrowDate: "2026-02-28", dueDate: "2026-03-28", returnDate: null, status: "active" },
  { id: "4", bookTitle: "Educated", memberName: "Aisha Patel", borrowDate: "2026-01-10", dueDate: "2026-02-10", returnDate: "2026-02-08", status: "returned" },
  { id: "5", bookTitle: "1984", memberName: "Elena Rodriguez", borrowDate: "2026-02-01", dueDate: "2026-03-01", returnDate: null, status: "overdue" },
  { id: "6", bookTitle: "Project Hail Mary", memberName: "Aisha Patel", borrowDate: "2026-03-01", dueDate: "2026-03-31", returnDate: null, status: "active" },
];

export const reservations: Reservation[] = [
  { id: "1", bookTitle: "Klara and the Sun", bookCover: klaraSun, reservedDate: "2026-03-01", position: 2, estimatedAvailable: "2026-03-20", status: "waiting" },
  { id: "2", bookTitle: "Educated", bookCover: educated, reservedDate: "2026-02-28", position: 1, estimatedAvailable: "2026-03-12", status: "ready" },
  { id: "3", bookTitle: "The Midnight Library", bookCover: midnightLibrary, reservedDate: "2026-02-20", position: 3, estimatedAvailable: "2026-04-01", status: "waiting" },
];

export const genres = ["All", "Fiction", "Sci-Fi", "Literary Fiction", "Fantasy", "Historical Fiction", "Memoir", "Classic", "Dystopian", "Mystery"];
