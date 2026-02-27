import data from "@/oscars_2026_nominees.json";

export type RawNominee = {
  film?: string;
  name?: string;
  song?: string;
  country?: string;
  writers?: string[];
  directors?: string[];
  producers?: string[];
  filmmakers?: string[];
  editors?: string[];
  artists?: string[];
  sound_team?: string[];
  vfx_team?: string[];
  casting_director?: string;
  cinematographer?: string;
  composer?: string;
  designer?: string;
  production_designer?: string;
  set_decorator?: string;
  songwriters?: string[];
};

export type Category = {
  category: string;
  nominees: RawNominee[];
};

export type NomineesData = {
  ceremony: string;
  year: number;
  date: string;
  venue: string;
  host: string;
  categories: Category[];
};

export type DisplayNominee = {
  pickKey: string;
  primaryLine: string;
  secondaryLine: string;
};

export function formatNominee(nominee: RawNominee): DisplayNominee {
  // Original Song: "Song Title" / film
  if (nominee.song) {
    return {
      pickKey: nominee.song,
      primaryLine: `"${nominee.song}"`,
      secondaryLine: nominee.film ?? "",
    };
  }

  // Person + film (Acting, Directing, Casting, Cinematography, Score, Costume)
  if (nominee.name) {
    return {
      pickKey: nominee.name,
      primaryLine: nominee.name,
      secondaryLine: nominee.film ?? "",
    };
  }

  const film = nominee.film ?? "Unknown";

  // International Feature: film / country
  if (nominee.country) {
    return { pickKey: film, primaryLine: film, secondaryLine: nominee.country };
  }

  // Screenplay writers
  if (nominee.writers) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: nominee.writers.join(", "),
    };
  }

  // Animated / Documentary Feature: directors
  if (nominee.directors) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: `Dir. ${nominee.directors.join(", ")}`,
    };
  }

  // Short films: filmmakers
  if (nominee.filmmakers) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: nominee.filmmakers.join(", "),
    };
  }

  // Film Editing: editors
  if (nominee.editors) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: nominee.editors.join(", "),
    };
  }

  // Makeup and Hairstyling: artists
  if (nominee.artists) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: nominee.artists.join(", "),
    };
  }

  // Sound: sound_team (truncate for space)
  if (nominee.sound_team) {
    const team = nominee.sound_team;
    const display = team.length > 2 ? `${team[0]}, ${team[1]}…` : team.join(", ");
    return { pickKey: film, primaryLine: film, secondaryLine: display };
  }

  // Visual Effects: vfx_team
  if (nominee.vfx_team) {
    const team = nominee.vfx_team;
    const display = team.length > 2 ? `${team[0]}, ${team[1]}…` : team.join(", ");
    return { pickKey: film, primaryLine: film, secondaryLine: display };
  }

  // Casting
  if (nominee.casting_director) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: nominee.casting_director,
    };
  }

  // Cinematography
  if (nominee.cinematographer) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: nominee.cinematographer,
    };
  }

  // Original Score
  if (nominee.composer) {
    return { pickKey: film, primaryLine: film, secondaryLine: nominee.composer };
  }

  // Costume Design
  if (nominee.designer) {
    return { pickKey: film, primaryLine: film, secondaryLine: nominee.designer };
  }

  // Production Design
  if (nominee.production_designer) {
    return {
      pickKey: film,
      primaryLine: film,
      secondaryLine: `${nominee.production_designer} / ${nominee.set_decorator ?? ""}`,
    };
  }

  // Best Picture / bare { film }
  return { pickKey: film, primaryLine: film, secondaryLine: "" };
}

export const categories: Category[] = (data as NomineesData).categories;
export const TOTAL_CATEGORIES = categories.length;
export const ceremonyInfo = {
  ceremony: (data as NomineesData).ceremony,
  year: (data as NomineesData).year,
  date: (data as NomineesData).date,
  venue: (data as NomineesData).venue,
  host: (data as NomineesData).host,
};
