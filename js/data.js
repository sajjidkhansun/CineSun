/* CineSun — catalog data. Edit SOURCES / CATALOG freely. */
"use strict";

/* Verified from the live web (probed Nov 2026). Netflix & Prime Video removed on request.
   NightFlix(.vg→.st), NovaShow, ArrowTV, CineGram: alive sites — site-level links only
   (their per-title deep links are not verifiable, so they are not offered as watch chips). */
const SOURCES = {
  nightflix: { name: "NightFlix",   short: "NightFlix", color: "#7C3AED", home: "https://nightflix.st" },
  novashow:  { name: "NovaShow",    short: "NovaShow",  color: "#F97316", home: "https://novashow.live" },
  arrowtv:   { name: "ArrowTV",     short: "ArrowTV",   color: "#22C55E", home: "https://arrowtv.net" },
  cinegram:  { name: "CineGram",    short: "CineGram",  color: "#EC4899", home: "https://cinegram.tv/home" }
};

const SOURCE_ORDER = ["nightflix", "novashow", "arrowtv", "cinegram"];

/* Open-source, keyless players — verified at STREAM level in a live browser (Nov 2026):
   each player's own source-resolution API answered 200 with real media URLs, and
   Mapple's <video> even reached readyState 4 pulling HLS playlists.
     VidLink : movies keyed by IMDb id, series keyed by TMDB id (VidFast-style /tv/{id}/{s}/{e} is dead there)
     Mapple  : movies + series keyed by TMDB id   (mappletv.uk redirects to mapple.fun)
   Probed and EXCLUDED as dead: Videasy (redirects to videasy.to → 403 blank page) and
   VidFast (stuck forever on "FETCHING, ONE MOMENT…", zero source traffic).
   Mapple's old /watch/tv/{id}/{s}/{e} path is gone — the live format is /watch/tv/{tmdb}-{s}-{e}. */
const PLAY_SERVERS = [
  { name: "VidLink", color: "#38BDF8", key: "imdb", tvKey: "tmdb",
    movie:  ids => `https://vidlink.pro/movie/${ids.imdb}`,
    series: (ids, s, e) => `https://vidlink.pro/tv/${ids.tmdb}/${s}/${e}` },
  { name: "Mapple", color: "#FF5A4E", key: "tmdb", tvKey: "tmdb",
    movie:  ids => `https://mapple.fun/watch/movie/${ids.tmdb}`,
    series: (ids, s, e) => `https://mapple.fun/watch/tv/${ids.tmdb}-${s}-${e}` }
];

/* Genre rows appear in this top-to-bottom popularity order. */
const GENRE_ORDER = ["Anime", "Action", "Sci-Fi", "Comedy", "Drama", "Thriller", "Crime", "Adventure", "Fantasy", "Animation", "Romance", "Horror", "Mystery"];

const TRENDING_SERIES = ["Stranger Things", "The Boys", "House of the Dragon", "The Last of Us", "Fallout", "One Piece", "Reacher", "Severance", "Wednesday", "Squid Game", "Arcane", "The Bear", "3 Body Problem", "Andor"];

const CATALOG = [
  /* ── Movies ── */
  { t: "The Shawshank Redemption", type: "movie", y: 1994, r: 9.3, g: ["Drama", "Crime"], s: ["prime"], d: "Two imprisoned men build an unbreakable friendship and a quiet plan for hope." },
  { t: "The Godfather", type: "movie", y: 1972, r: 9.2, g: ["Crime", "Drama"], s: ["netflix"], d: "A family saga of power, loyalty and betrayal at the top of the underworld." },
  { t: "The Godfather Part II", type: "movie", y: 1974, r: 9.0, g: ["Crime", "Drama"], s: ["netflix"], d: "The empire expands while a young don rises from nothing in two woven timelines." },
  { t: "The Lord of the Rings: The Return of the King", type: "movie", y: 2003, r: 9.0, g: ["Adventure", "Fantasy"], s: ["prime"], d: "The final march to Mordor decides the fate of every living thing." },
  { t: "The Dark Knight", type: "movie", y: 2008, r: 9.0, g: ["Action", "Crime"], s: ["nightflix"], d: "A masked vigilante faces an anarchic genius who wants to watch the city burn." },
  { t: "Pulp Fiction", type: "movie", y: 1994, r: 8.9, g: ["Crime", "Comedy"], s: ["arrowtv"], d: "Hitmen, a boxer and a briefcase collide in a looping crime story." },
  { t: "Schindler's List", type: "movie", y: 1993, r: 8.9, g: ["Drama", "History"], s: ["netflix"], d: "A businessman risks everything to save lives during humanity's darkest chapter." },
  { t: "The Lord of the Rings: The Fellowship of the Ring", type: "movie", y: 2001, r: 8.9, g: ["Adventure", "Fantasy"], s: ["prime"], d: "A humbled ring-bearer sets out with nine companions toward impossible odds." },
  { t: "Fight Club", type: "movie", y: 1999, r: 8.8, g: ["Drama", "Thriller"], s: ["novashow"], d: "An insomniac office worker spirals into a secret society with a dangerous philosophy." },
  { t: "Inception", type: "movie", y: 2010, r: 8.8, g: ["Sci-Fi", "Thriller"], s: ["netflix"], d: "Dream architects steal secrets — and must plant one idea deep inside a mind." },
  { t: "Forrest Gump", type: "movie", y: 1994, r: 8.8, g: ["Drama", "Romance"], s: ["prime"], d: "A simple-hearted man stumbles through decades of history with unwavering love." },
  { t: "The Lord of the Rings: The Two Towers", type: "movie", y: 2002, r: 8.8, g: ["Adventure", "Fantasy"], s: ["prime"], d: "Two journeys divide the fellowship as war brews across kingdoms." },
  { t: "Interstellar", type: "movie", y: 2014, r: 8.7, g: ["Sci-Fi", "Adventure"], s: ["nightflix"], d: "A pilot leaves his family behind to find a new home among the stars." },
  { t: "The Matrix", type: "movie", y: 1999, r: 8.7, g: ["Sci-Fi", "Action"], s: ["prime"], d: "A hacker learns his world is a simulation — and chooses the red pill." },
  { t: "Spirited Away", type: "movie", y: 2001, r: 8.6, g: ["Anime", "Fantasy"], s: ["cinegram"], d: "A girl wanders into a spirit world and must work to save her parents." },
  { t: "Se7en", type: "movie", y: 1995, r: 8.6, g: ["Crime", "Thriller"], s: ["arrowtv"], d: "Two detectives hunt a killer staging murders around the seven sins." },
  { t: "Terminator 2: Judgment Day", type: "movie", y: 1991, r: 8.6, g: ["Action", "Sci-Fi"], s: ["nightflix"], d: "A reprogrammed machine protects a boy from a deadlier model of itself." },
  { t: "Parasite", type: "movie", y: 2019, r: 8.5, g: ["Thriller", "Drama"], s: ["prime"], d: "One family cons its way into a wealthy household — then the basement answers." },
  { t: "Gladiator", type: "movie", y: 2000, r: 8.5, g: ["Action", "Drama"], s: ["nightflix"], d: "A betrayed Roman general fights arena by arena to reach revenge and honour." },
  { t: "Django Unchained", type: "movie", y: 2012, r: 8.5, g: ["Action", "Drama"], s: ["netflix"], d: "A freed slave partners with a bounty hunter to tear across the South for love." },
  { t: "Whiplash", type: "movie", y: 2014, r: 8.5, g: ["Drama", "Family"], s: ["novashow"], d: "A young drummer is pushed to the brink by a teacher who accepts nothing less." },
  { t: "The Departed", type: "movie", y: 2006, r: 8.5, g: ["Crime", "Thriller"], s: ["netflix"], d: "A mole in the police and a cop undercover race to unmask each other." },
  { t: "The Lion King", type: "movie", y: 1994, r: 8.5, g: ["Animation", "Adventure"], s: ["prime"], d: "A young lion runs from his past and must return to claim his roar." },
  { t: "Dune: Part Two", type: "movie", y: 2024, r: 8.5, g: ["Sci-Fi", "Adventure"], s: ["cinegram"], d: "A scattered heir rides with desert warriors to answer a galaxy-spanning destiny." },
  { t: "The Prestige", type: "movie", y: 2006, r: 8.5, g: ["Mystery", "Drama"], s: ["cinegram"], d: "Two stage magicians escalate a rivalry built on secrets and sacrifice." },
  { t: "Alien", type: "movie", y: 1979, r: 8.5, g: ["Sci-Fi", "Horror"], s: ["novashow"], d: "Deep-space crew answers a distress call and invites something aboard." },
  { t: "Coco", type: "movie", y: 2017, r: 8.4, g: ["Animation", "Family"], s: ["prime"], d: "A boy crosses into the land of the dead to unlock his family's music." },
  { t: "Spider-Man: Into the Spider-Verse", type: "movie", y: 2018, r: 8.4, g: ["Animation", "Action"], s: ["netflix"], d: "Miles Morales meets spider-heroes from other dimensions and finds his swing." },
  { t: "Avengers: Infinity War", type: "movie", y: 2018, r: 8.4, g: ["Action", "Sci-Fi"], s: ["nightflix"], d: "Every hero converges to stop a titan from snapping half of all life away." },
  { t: "3 Idiots", type: "movie", y: 2009, r: 8.4, g: ["Comedy", "Drama"], s: ["prime"], d: "Three engineering students learn all is well when they pursue excellence, not marks." },
  { t: "Your Name", type: "movie", y: 2016, r: 8.4, g: ["Anime", "Romance"], s: ["cinegram"], d: "Two strangers begin swapping bodies — and racing to meet before time forgets." },
  { t: "Inglourious Basterds", type: "movie", y: 2009, r: 8.4, g: ["Drama", "Action"], s: ["novashow"], d: "A cinema owner and soldier squad plot a premiere that changes history." },
  { t: "Joker", type: "movie", y: 2019, r: 8.4, g: ["Crime", "Drama"], s: ["nightflix"], d: "A struggling clown's fall through neglect lights the fuse of a city's chaos." },
  { t: "K.G.F: Chapter 2", type: "movie", y: 2022, r: 8.3, g: ["Action", "Drama"], s: ["prime"], d: "A blood-soaked throne in the gold fields demands an even heavier crown." },
  { t: "Oppenheimer", type: "movie", y: 2023, r: 8.3, g: ["Drama", "History"], s: ["arrowtv"], d: "The mind behind the atomic bomb reckon with the fire he must carry forever." },
  { t: "Taare Zameen Par", type: "movie", y: 2007, r: 8.3, g: ["Drama", "Family"], s: ["netflix"], d: "A dyslexic child's colours return when an art teacher finally sees him." },
  { t: "Toy Story 3", type: "movie", y: 2010, r: 8.3, g: ["Animation", "Family"], s: ["prime"], d: "Outgrown toys face a daycare that's too good — and too strange — to be true." },
  { t: "Up", type: "movie", y: 2009, r: 8.3, g: ["Animation", "Adventure"], s: ["prime"], d: "A balloon-lifted house carries a grieving widower and an eager wilderness scout." },
  { t: "The Wolf of Wall Street", type: "movie", y: 2013, r: 8.2, g: ["Crime", "Comedy"], s: ["netflix"], d: "A stockbroker's greed-fuelled rocket ride ends exactly as regulators expect." },
  { t: "Shutter Island", type: "movie", y: 2010, r: 8.2, g: ["Thriller", "Mystery"], s: ["netflix"], d: "A US marshal probes an island asylum where the truth hides in plain sight." },
  { t: "Prisoners", type: "movie", y: 2013, r: 8.2, g: ["Mystery", "Thriller"], s: ["netflix"], d: "When two girls vanish, a desperate father acts outside the law to find them." },
  { t: "Andhadhun", type: "movie", y: 2018, r: 8.2, g: ["Crime", "Thriller"], s: ["netflix"], d: "A 'blind' pianist witnesses a murder and plays the deadliest note of his life." },
  { t: "Spider-Man: No Way Home", type: "movie", y: 2021, r: 8.2, g: ["Action", "Adventure"], s: ["prime"], d: "A broken spell cracks open the multiverse and drags old enemies home." },
  { t: "Baahubali 2: The Conclusion", type: "movie", y: 2017, r: 8.2, g: ["Action", "Drama"], s: ["nightflix"], d: "The question echoes across kingdoms: why did Kattappa kill Baahubali?" },
  { t: "Top Gun: Maverick", type: "movie", y: 2022, r: 8.2, g: ["Action", "Drama"], s: ["cinegram"], d: "A test pilot returns to train one last impossible mission into the sky." },
  { t: "Jurassic Park", type: "movie", y: 1993, r: 8.2, g: ["Adventure", "Sci-Fi"], s: ["netflix"], d: "Dinosaurs return from extinction and very quickly remember the food chain." },
  { t: "Inside Out", type: "movie", y: 2015, r: 8.2, g: ["Animation", "Comedy"], s: ["prime"], d: "A girl's emotions fight for the console as her family uproots her world." },
  { t: "The Truman Show", type: "movie", y: 1998, r: 8.2, g: ["Drama", "Comedy"], s: ["prime"], d: "A man discovers his entire life is a broadcast — then sails for the edge." },
  { t: "Mad Max: Fury Road", type: "movie", y: 2015, r: 8.1, g: ["Action", "Adventure"], s: ["cinegram"], d: "Two rebels flee a warlord across the wasteland in one endless chase." },
  { t: "The Grand Budapest Hotel", type: "movie", y: 2014, r: 8.1, g: ["Comedy", "Drama"], s: ["nightflix"], d: "A concierge and his lobby boy chase a stolen painting across a vanished era." },
  { t: "Gone Girl", type: "movie", y: 2014, r: 8.1, g: ["Mystery", "Thriller"], s: ["nightflix"], d: "A wife disappears and every diary page turns the suspicion sharper." },
  { t: "Before Sunrise", type: "movie", y: 1995, r: 8.1, g: ["Romance", "Drama"], s: ["prime"], d: "Two strangers share one night of Vienna and walk away changed forever." },
  { t: "Casino Royale", type: "movie", y: 2006, r: 8.0, g: ["Action", "Thriller"], s: ["prime"], d: "A freshly minted agent bets everything — and his heart — at one poker table." },
  { t: "La La Land", type: "movie", y: 2016, r: 8.0, g: ["Romance", "Drama"], s: ["netflix"], d: "A pianist and an actress chase Los Angeles dreams in step and song." },
  { t: "Deadpool", type: "movie", y: 2016, r: 8.0, g: ["Comedy", "Action"], s: ["novashow"], d: "A mercenary with a mouth takes a healing factor, a famine of manners, revenge." },
  { t: "How to Train Your Dragon", type: "movie", y: 2010, r: 8.0, g: ["Animation", "Adventure"], s: ["nightflix"], d: "A viking boy befriends the one creature his village was built to slay." },
  { t: "Dune", type: "movie", y: 2021, r: 8.0, g: ["Sci-Fi", "Adventure"], s: ["netflix"], d: "A ducal heir walks into desert politics, spice prophecies and giant shadows." },
  { t: "Blade Runner 2049", type: "movie", y: 2017, r: 8.0, g: ["Sci-Fi", "Drama"], s: ["arrowtv"], d: "A replicant blade runner unearths a secret capable of breaking the world." },
  { t: "The Notebook", type: "movie", y: 2004, r: 7.9, g: ["Romance", "Drama"], s: ["novashow"], d: "Summer love writes itself into letters, lakes and a lifetime of war." },
  { t: "Dilwale Dulhania Le Jayenge", type: "movie", y: 1995, r: 7.9, g: ["Romance", "Drama"], s: ["prime"], d: "A train, a hand and the most famous chase in Bollywood romance." },
  { t: "Arrival", type: "movie", y: 2016, r: 7.9, g: ["Sci-Fi", "Drama"], s: ["netflix"], d: "A linguist must speak to visitors whose language rewires time itself." },
  { t: "Avatar", type: "movie", y: 2009, r: 7.9, g: ["Sci-Fi", "Adventure"], s: ["cinegram"], d: "A marine's borrowed body teaches him which side of Pandora he belongs to." },
  { t: "Life of Pi", type: "movie", y: 2012, r: 7.9, g: ["Adventure", "Drama"], s: ["arrowtv"], d: "A shipwrecked boy shares one lifeboat with a very hungry tiger." },
  { t: "Knives Out", type: "movie", y: 2019, r: 7.9, g: ["Mystery", "Comedy"], s: ["prime"], d: "A novelist's death leaves a fortune, a family full of knives and one blunt detective." },
  { t: "Edge of Tomorrow", type: "movie", y: 2014, r: 7.9, g: ["Sci-Fi", "Action"], s: ["nightflix"], d: "A reluctant officer relives the same losing battle until he learns to win." },
  { t: "RRR", type: "movie", y: 2022, r: 7.8, g: ["Action", "Drama"], s: ["cinegram"], d: "Two revolutionaries bond over fire, water and one impossible promise." },
  { t: "The Batman", type: "movie", y: 2022, r: 7.8, g: ["Crime", "Mystery"], s: ["nightflix"], d: "A young detective Batman follows riddles into the rot beneath Gotham." },
  { t: "Get Out", type: "movie", y: 2017, r: 7.8, g: ["Horror", "Thriller"], s: ["novashow"], d: "A weekend with the girlfriend's family curdles into something unspeakable." },
  { t: "Pride & Prejudice", type: "movie", y: 2005, r: 7.8, g: ["Romance", "Drama"], s: ["cinegram"], d: "First impressions sharpen into love across misty fields and drawing rooms." },
  { t: "Mission: Impossible – Fallout", type: "movie", y: 2018, r: 7.7, g: ["Action", "Thriller"], s: ["cinegram"], d: "Three plutonium cores and one relentlessly falling helicopter define physics." },
  { t: "The Hangover", type: "movie", y: 2009, r: 7.7, g: ["Comedy", "Crime"], s: ["prime"], d: "A bachelor party loses the groom, the memories and possibly a tiger." },
  { t: "Rush Hour", type: "movie", y: 1998, r: 7.6, g: ["Comedy", "Action"], s: ["arrowtv"], d: "Two mismatched cops argue their way through a kidnapping case in kung fu." },
  { t: "Moana", type: "movie", y: 2016, r: 7.6, g: ["Animation", "Adventure"], s: ["prime"], d: "A island chief's daughter sails beyond the reef to restore a stolen heart." },
  { t: "Sherlock Holmes", type: "movie", y: 2009, r: 7.6, g: ["Action", "Mystery"], s: ["netflix"], d: "The deduction legend trades drawing rooms for bare-knuckle chess." },
  { t: "Sonic the Hedgehog 3", type: "movie", y: 2024, r: 7.5, g: ["Comedy", "Adventure"], s: ["cinegram"], d: "A blue blur races a shadowy new rival across rooftops and bad memories." },
  { t: "Wicked", type: "movie", y: 2024, r: 7.5, g: ["Fantasy", "Drama"], s: ["prime"], d: "Two students at Shiz University become the witch history mislabels." },
  { t: "Furiosa: A Mad Max Saga", type: "movie", y: 2024, r: 7.5, g: ["Action", "Adventure"], s: ["prime"], d: "A young warrior claws across the wasteland back to the green she remembers." },
  { t: "The Conjuring", type: "movie", y: 2013, r: 7.5, g: ["Horror", "Thriller"], s: ["nightflix"], d: "Paranormal investigators face a farmhouse that claps in the dark." },
  { t: "John Wick", type: "movie", y: 2014, r: 7.4, g: ["Action", "Thriller"], s: ["nightflix"], d: "A retired hitman's grief over a puppy starts a city-wide symphony of guns." },
  { t: "Frozen", type: "movie", y: 2013, r: 7.4, g: ["Animation", "Family"], s: ["prime"], d: "Two sisters learn that love — frozen or otherwise — thaws in acts." },
  { t: "Wonder Woman", type: "movie", y: 2017, r: 7.4, g: ["Action", "Fantasy"], s: ["nightflix"], d: "An Amazon leaves her island for the trenches and discovers her lasso is not enough." },
  { t: "Hereditary", type: "movie", y: 2018, r: 7.3, g: ["Horror", "Drama"], s: ["arrowtv"], d: "A family's grief opens doors a late grandmother kept conveniently unlabeled." },
  { t: "It", type: "movie", y: 2017, r: 7.3, g: ["Horror", "Drama"], s: ["cinegram"], d: "Seven outcast kids promise to return for the fear feeding on their town." },
  { t: "Tenet", type: "movie", y: 2020, r: 7.3, g: ["Sci-Fi", "Action"], s: ["prime"], d: "An operative learns bullets can travel backwards — so must the mission." },
  { t: "Wonka", type: "movie", y: 2023, r: 7.2, g: ["Fantasy", "Comedy"], s: ["prime"], d: "A young chocolatier arrives with a hat, a dream and unusually persuasive chocolate." },
  { t: "Mufasa: The Lion King", type: "movie", y: 2024, r: 7.2, g: ["Animation", "Adventure"], s: ["netflix"], d: "The lion king's own rise begins as an orphan story told to a curious cub." },
  { t: "Moana 2", type: "movie", y: 2024, r: 7.0, g: ["Animation", "Adventure"], s: ["prime"], d: "New oceans pull the wayfinder beyond the far reef with old friends aboard." },
  { t: "Hotel Transylvania", type: "movie", y: 2012, r: 7.0, g: ["Animation", "Comedy"], s: ["novashow"], d: "Dracula's monster resort meets its worst guest: a boy on a backpacking trip." },
  { t: "Aquaman", type: "movie", y: 2018, r: 6.9, g: ["Action", "Fantasy"], s: ["arrowtv"], d: "A half-Atlantean drifter inherits an underwater throne and an orange jump of confidence." },
  { t: "Gladiator II", type: "movie", y: 2024, r: 6.8, g: ["Action", "Drama"], s: ["arrowtv"], d: "Rome's arena consumes another angry man with a familiar family tree." },
  { t: "Kung Fu Panda 4", type: "movie", y: 2024, r: 6.7, g: ["Animation", "Comedy"], s: ["netflix"], d: "The Dragon Warrior must train a successor before his own usurper finishes the job." },
  { t: "Venom: The Last Dance", type: "movie", y: 2024, r: 6.5, g: ["Action", "Sci-Fi"], s: ["cinegram"], d: "Eddie and his symbiote fugitive across a country that wants both molecules back." },
  { t: "Godzilla x Kong: The New Empire", type: "movie", y: 2024, r: 6.4, g: ["Action", "Sci-Fi"], s: ["nightflix"], d: "The Titans team up glove-first against a tyrant from a hidden world." },

  /* ── Series ── */
  { t: "Breaking Bad", type: "series", y: 2008, r: 9.5, g: ["Crime", "Drama"], s: ["netflix"], d: "A chemistry teacher's diagnosis cooks into the Southwest's blue empire." },
  { t: "Chernobyl", type: "series", y: 2019, r: 9.3, g: ["Drama", "History"], s: ["prime"], d: "The cost of lies is measured in overnight firemen and counted decades." },
  { t: "Scam 1992: The Harshad Mehta Story", type: "series", y: 2020, r: 9.3, g: ["Drama", "Crime"], s: ["cinegram"], d: "The rise of the Big Bull turns Dalal Street into his personal chequing account." },
  { t: "Game of Thrones", type: "series", y: 2011, r: 9.2, g: ["Fantasy", "Drama"], s: ["nightflix"], d: "Nine noble houses play a game where winter always collects its debt." },
  { t: "Aspirants", type: "series", y: 2021, r: 9.2, g: ["Comedy", "Drama"], s: ["prime"], d: "Three friends chase the UPSC dream and the year that decides who they become." },
  { t: "Attack on Titan", type: "series", y: 2013, r: 9.1, g: ["Anime", "Action"], s: ["cinegram"], d: "Humanity's last walls fall to giants and one boy vows to see them all gone." },
  { t: "Rick and Morty", type: "series", y: 2013, r: 9.1, g: ["Animation", "Comedy"], s: ["netflix"], d: "A nihilist genius drags his grandson across dimensions and dinner-table psychology." },
  { t: "Sherlock", type: "series", y: 2010, r: 9.1, g: ["Crime", "Mystery"], s: ["netflix"], d: "The deduction machine texts his way through modern London's impossible crimes." },
  { t: "Better Call Saul", type: "series", y: 2015, r: 9.0, g: ["Crime", "Drama"], s: ["netflix"], d: "Slippin' Jimmy bends every rule southward toward the name Saul Goodman." },
  { t: "Arcane", type: "series", y: 2021, r: 9.0, g: ["Animation", "Action"], s: ["netflix"], d: "Two sisters land on opposite sides of a city split by progress and powder." },
  { t: "Gullak", type: "series", y: 2019, r: 9.0, g: ["Comedy", "Drama"], s: ["novashow"], d: "The Mishra family's middle-class roof holds up roast, rain and unreasonable love." },
  { t: "The Office", type: "series", y: 2005, r: 9.0, g: ["Comedy", "Drama"], s: ["prime"], d: "A paper company's camera crew records the world's most confident boss." },
  { t: "Death Note", type: "series", y: 2006, r: 9.0, g: ["Anime", "Mystery"], s: ["arrowtv"], d: "A notebook that kills anyone by name turns a student into a god-adjacent suspect." },
  { t: "Panchayat", type: "series", y: 2020, r: 8.9, g: ["Comedy", "Drama"], s: ["prime"], d: "An engineer's village posting measures every problem in litres and words." },
  { t: "True Detective", type: "series", y: 2014, r: 8.9, g: ["Crime", "Drama"], s: ["arrowtv"], d: "Two detectives chase one case across seventeen years of Louisiana dark." },
  { t: "Friends", type: "series", y: 1994, r: 8.9, g: ["Comedy", "Romance"], s: ["prime"], d: "Six friends in New York trade couches, coffee and a lot of 'we were on a break!'" },
  { t: "Rocket Boys", type: "series", y: 2022, r: 8.9, g: ["Drama", "History"], s: ["cinegram"], d: "Two scientists build a nation's space-age and nuclear dream from zero." },
  { t: "Peaky Blinders", type: "series", y: 2013, r: 8.8, g: ["Crime", "Drama"], s: ["netflix"], d: "Birmingham's razor-capped family sews itself into empire, horse racing and war." },
  { t: "Narcos", type: "series", y: 2015, r: 8.8, g: ["Crime", "Drama"], s: ["netflix"], d: "A drug empire outsells the law until the law outsells its patience." },
  { t: "The Boys", type: "series", y: 2019, r: 8.7, g: ["Action", "Comedy"], s: ["prime"], d: "Corporate superheroes meet the dirty crew with the leverage to expose them." },
  { t: "Dark", type: "series", y: 2017, r: 8.7, g: ["Sci-Fi", "Mystery"], s: ["netflix"], d: "A German town's cave loops four generations into one missing-children knot." },
  { t: "The Last of Us", type: "series", y: 2023, r: 8.7, g: ["Drama", "Thriller"], s: ["nightflix"], d: "A smuggler walks the apocalypse escorting the girl immune to its end." },
  { t: "One Punch Man", type: "series", y: 2015, r: 8.7, g: ["Anime", "Action"], s: ["cinegram"], d: "The strongest hero wins every fight with one punch — and finds that boring." },
  { t: "Invincible", type: "series", y: 2021, r: 8.7, g: ["Animation", "Action"], s: ["prime"], d: "A teen hero's powers arrive the same week his father's secrets don't." },
  { t: "Severance", type: "series", y: 2022, r: 8.7, g: ["Sci-Fi", "Thriller"], s: ["novashow"], d: "Office minds split in half learn that work-life balance can be surgery." },
  { t: "Fleabag", type: "series", y: 2016, r: 8.7, g: ["Comedy", "Drama"], s: ["prime"], d: "A woman narrates her grief to camera and misplaces her heart near a priest." },
  { t: "The Family Man", type: "series", y: 2019, r: 8.7, g: ["Action", "Drama"], s: ["prime"], d: "A middle-class dad by morning protects the nation by every other hour." },
  { t: "Suits", type: "series", y: 2011, r: 8.7, g: ["Drama", "Comedy"], s: ["nightflix"], d: "A legal genius hires a college dropout with a photographic memory and no degree." },
  { t: "College Romance", type: "series", y: 2018, r: 8.7, g: ["Comedy", "Romance"], s: ["novashow"], d: "Three friends make every campus disaster sound like a group call." },
  { t: "Stranger Things", type: "series", y: 2016, r: 8.6, g: ["Sci-Fi", "Horror"], s: ["netflix"], d: "A town's missing boy leads lab secrets, dragons and one girl with a shaved head." },
  { t: "The Mandalorian", type: "series", y: 2019, r: 8.6, g: ["Sci-Fi", "Adventure"], s: ["nightflix"], d: "A lone bounty hunter's helmet code meets one very interesting green child." },
  { t: "Jujutsu Kaisen", type: "series", y: 2020, r: 8.6, g: ["Anime", "Action"], s: ["nightflix"], d: "A teen eats a cursed finger and joins the school that hunts what curses him." },
  { t: "Demon Slayer: Kimetsu no Yaiba", type: "series", y: 2019, r: 8.6, g: ["Anime", "Action"], s: ["cinegram"], d: "A boy waters his sword and sister's humanity through every blood art." },
  { t: "Dexter", type: "series", y: 2006, r: 8.6, g: ["Crime", "Thriller"], s: ["arrowtv"], d: "Miami's blood analyst gives repeat offenders their own code and last nights." },
  { t: "The Legend of Hanuman", type: "series", y: 2021, r: 8.6, g: ["Animation", "Adventure"], s: ["prime"], d: "A humble vanara discovers the mountain-sized strength sleeping inside him." },
  { t: "One Piece", type: "series", y: 2023, r: 8.5, g: ["Adventure", "Fantasy"], s: ["netflix"], d: "A straw-hat dreamer assembles a crew toward the ocean's unclaimed throne." },
  { t: "Lucifer", type: "series", y: 2016, r: 8.5, g: ["Fantasy", "Crime"], s: ["netflix"], d: "The devil vacations in Los Angeles as a nightclub-owning police consultant." },
  { t: "Mirzapur", type: "series", y: 2018, r: 8.5, g: ["Action", "Crime"], s: ["prime"], d: "Guns, carpets and dynasties: two brothers enter a town ruled by thrones." },
  { t: "Sacred Games", type: "series", y: 2018, r: 8.5, g: ["Crime", "Drama"], s: ["netflix"], d: "A Mumbai cop answers a godfather's call: save the city in twenty-five days." },
  { t: "Delhi Crime", type: "series", y: 2019, r: 8.5, g: ["Crime", "Drama"], s: ["netflix"], d: "A Delhi Police unit races red tape to bring a city's worst night to justice." },
  { t: "Ozark", type: "series", y: 2017, r: 8.5, g: ["Crime", "Drama"], s: ["netflix"], d: "A money-laundering family discovers the Ozarks already have a board of directors." },
  { t: "The Bear", type: "series", y: 2022, r: 8.5, g: ["Drama", "Comedy"], s: ["cinegram"], d: "A fine-dining chef inherits a chaotic family sandwich shop and a new family." },
  { t: "Bandish Bandits", type: "series", y: 2020, r: 8.5, g: ["Drama", "Romance"], s: ["prime"], d: "Classical legacy meets pop playlists and one duet nobody planned." },
  { t: "Brooklyn Nine-Nine", type: "series", y: 2013, r: 8.4, g: ["Comedy", "Crime"], s: ["netflix"], d: "A Brooklyn precinct solves crime with pranks, spreadsheets and one hoping-nothing captain." },
  { t: "Naruto", type: "series", y: 2002, r: 8.4, g: ["Anime", "Adventure"], s: ["novashow"], d: "The village's loudest outcast carries a dream the size of a mountain." },
  { t: "Andor", type: "series", y: 2022, r: 8.4, g: ["Sci-Fi", "Drama"], s: ["novashow"], d: "A thief learns rebellion is paperwork, patience and one very long station." },
  { t: "House of the Dragon", type: "series", y: 2022, r: 8.3, g: ["Fantasy", "Drama"], s: ["arrowtv"], d: "The Targaryen court learns dragons are easier to hatch than heirs." },
  { t: "Fallout", type: "series", y: 2024, r: 8.3, g: ["Sci-Fi", "Action"], s: ["prime"], d: "A vault girl walks the wasteland learning the world above kept worse secrets." },
  { t: "Farzi", type: "series", y: 2023, r: 8.3, g: ["Thriller", "Drama"], s: ["prime"], d: "An artist's counterfeit genius meets a currency taskforce with sharper instincts." },
  { t: "Prison Break", type: "series", y: 2005, r: 8.3, g: ["Thriller", "Drama"], s: ["novashow"], d: "A structural engineer tattoos the escape plan onto his body and his brother's hope." },
  { t: "How I Met Your Mother", type: "series", y: 2005, r: 8.3, g: ["Comedy", "Romance"], s: ["nightflix"], d: "A father's nine-season detour to the yellow umbrella is worth every yellow taxi." },
  { t: "The Big Bang Theory", type: "series", y: 2007, r: 8.2, g: ["Comedy"], s: ["prime"], d: "Two physicists meet the girl across the hall and recalibrate the universe." },
  { t: "Money Heist", type: "series", y: 2017, r: 8.2, g: ["Crime", "Thriller"], s: ["netflix"], d: "The Professor's red-jumpsuit crew prints money and prints resistance songs." },
  { t: "Loki", type: "series", y: 2021, r: 8.2, g: ["Sci-Fi", "Fantasy"], s: ["nightflix"], d: "The god of mischief clocks in for the bureau that polices the timeline." },
  { t: "Paatal Lok", type: "series", y: 2020, r: 8.2, g: ["Crime", "Thriller"], s: ["prime"], d: "A washed-up Delhi inspector catches a case with three underworlds attached." },
  { t: "Squid Game", type: "series", y: 2021, r: 8.0, g: ["Thriller", "Drama"], s: ["netflix"], d: "Debtors play childhood games where the exit is the scoreboard." },
  { t: "The Witcher", type: "series", y: 2019, r: 8.0, g: ["Fantasy", "Action"], s: ["nightflix"], d: "A monster hunter's coin fate tangles with a runaway princess and a mage." },
  { t: "Reacher", type: "series", y: 2022, r: 8.0, g: ["Action", "Thriller"], s: ["prime"], d: "A 250-pound drifter reads a town's corruption in one folded napkin." },
  { t: "Kota Factory", type: "series", y: 2019, r: 8.0, g: ["Drama", "Comedy"], s: ["prime"], d: "A coaching town in black-and-white turns a boy's scaffold into his spine." },
  { t: "Doraemon", type: "series", y: 2005, r: 7.9, g: ["Anime", "Comedy"], s: ["cinegram"], d: "A robotic cat's fourth-dimensional pocket keeps one boy's week impossible." },
  { t: "Shinchan", type: "series", y: 1992, r: 7.9, g: ["Anime", "Comedy"], s: ["novashow"], d: "The naughtiest five-year-old in kasukabe narrates family chaos, unfiltered." },
  { t: "Alice in Borderland", type: "series", y: 2020, r: 7.7, g: ["Thriller", "Sci-Fi"], s: ["netflix"], d: "An empty Tokyo hands out survival games with increasingly personal stakes." },
  { t: "Young Sheldon", type: "series", y: 2017, r: 7.7, g: ["Comedy", "Drama"], s: ["netflix"], d: "A nine-year-old genius college-proofs a small Texas town, briefly." },
  { t: "The Night Manager", type: "series", y: 2023, r: 7.6, g: ["Thriller", "Action"], s: ["arrowtv"], d: "A hotelier infiltrates an arms dealer's dinner table and his trust." },
  { t: "3 Body Problem", type: "series", y: 2024, r: 7.5, g: ["Sci-Fi", "Drama"], s: ["netflix"], d: "A physicist's countdown begins the moment the stars start answering." },
  { t: "The Umbrella Academy", type: "series", y: 2019, r: 7.5, g: ["Action", "Sci-Fi"], s: ["netflix"], d: "Six adopted super-siblings reunite over one dead father and one deadline." },
  { t: "The Rookie", type: "series", y: 2018, r: 7.5, g: ["Crime", "Comedy"], s: ["nightflix"], d: "The LAPD's oldest rookie earns his badge one unhurried beat at a time." },

  /* ── Anime ── */
  { t: "Fullmetal Alchemist: Brotherhood", type: "series", y: 2009, r: 9.1, g: ["Anime", "Action"], s: ["nightflix"], d: "Two brothers hunt the philosopher's stone to undo a forbidden transmutation." },
  { t: "Hunter x Hunter", type: "series", y: 2011, r: 9.0, g: ["Anime", "Adventure"], s: ["novashow"], d: "A boy trains to earn a hunter's licence and find the father who left him." },
  { t: "Cowboy Bebop", type: "series", y: 1998, r: 8.8, g: ["Anime", "Sci-Fi"], s: ["arrowtv"], d: "Bounty hunters drift through space chasing paydays and the pasts they dodge." },
  { t: "Dragon Ball Z", type: "series", y: 1989, r: 8.8, g: ["Anime", "Action"], s: ["novashow"], d: "Goku's Earth keeps drawing stronger invaders — so the power-ups get louder." },
  { t: "Steins;Gate", type: "series", y: 2011, r: 8.8, g: ["Anime", "Sci-Fi"], s: ["cinegram"], d: "A self-styled mad scientist's microwave starts texting the past." },
  { t: "Vinland Saga", type: "series", y: 2019, r: 8.8, g: ["Anime", "Action"], s: ["nightflix"], d: "A revenge-bound boy sells his sword to the mercenary who killed his father." },
  { t: "Chainsaw Man", type: "series", y: 2022, r: 8.6, g: ["Anime", "Action"], s: ["cinegram"], d: "A debt-saddled teen fuses with his chainsaw dog and hunts devils for a living." },
  { t: "Spy x Family", type: "series", y: 2022, r: 8.4, g: ["Anime", "Comedy"], s: ["nightflix"], d: "A spy, an assassin and a telepath play house — none knowing the others' secret." },
  { t: "Bleach", type: "series", y: 2004, r: 8.2, g: ["Anime", "Action"], s: ["novashow"], d: "A teen inherits a soul reaper's blade and starts dispatching hungry spirits." },
  { t: "My Hero Academia", type: "series", y: 2016, r: 8.0, g: ["Anime", "Action"], s: ["arrowtv"], d: "In a world of superpowers, the quirkless kid enrolls to become the greatest hero." },
  { t: "Grave of the Fireflies", type: "movie", y: 1988, r: 8.5, g: ["Anime", "Drama"], s: ["cinegram"], d: "Two siblings fight to stay fed, warm and together as war takes everything else." },
  { t: "Princess Mononoke", type: "movie", y: 1997, r: 8.3, g: ["Anime", "Fantasy"], s: ["cinegram"], d: "A cursed prince walks between iron-towns and forest gods to stop a war of nature." },
  { t: "Howl's Moving Castle", type: "movie", y: 2004, r: 8.2, g: ["Anime", "Fantasy"], s: ["cinegram"], d: "A hatmaker cursed with old age takes shelter in a wizard's walking castle." },
  { t: "A Silent Voice", type: "movie", y: 2016, r: 8.1, g: ["Anime", "Drama"], s: ["cinegram"], d: "A former bully learns sign language to face the girl he once silenced." }
];

/* Stable top-10 sort: rating desc, then newer first, then title. */
function topSorted(list) {
  return [...list].sort((a, b) => (b.r - a.r) || (b.y - a.y) || a.t.localeCompare(b.t));
}

/* Hero carousel picks */
const FEATURED = [
  "The Dark Knight",
  "Stranger Things",
  "Interstellar",
  "Arcane",
  "Dune: Part Two",
  "The Last of Us",
  "Breaking Bad",
  "RRR"
];

CATALOG.forEach((it, i) => { it.id = "t" + i; });
