// Raw data for the rivalry
const games = [
    { id: 121, year: 2025, date: "Nov 29", winner: "Ohio State", loser: "Michigan", wScore: 27, lScore: 9, location: "Ann Arbor", wRank: 1, lRank: 15 },
    { id: 120, year: 2024, date: "Nov 30", winner: "Michigan", loser: "Ohio State", wScore: 13, lScore: 10, location: "Columbus", wRank: null, lRank: 2 },
    { id: 119, year: 2023, date: "Nov 25", winner: "Michigan", loser: "Ohio State", wScore: 30, lScore: 24, location: "Ann Arbor", wRank: 3, lRank: 2 },
    { id: 118, year: 2022, date: "Nov 26", winner: "Michigan", loser: "Ohio State", wScore: 45, lScore: 23, location: "Columbus", wRank: 3, lRank: 2 },
    { id: 117, year: 2021, date: "Nov 27", winner: "Michigan", loser: "Ohio State", wScore: 42, lScore: 27, location: "Ann Arbor", wRank: 5, lRank: 2 },
    { id: 116, year: 2019, date: "Nov 30", winner: "Ohio State", loser: "Michigan", wScore: 56, lScore: 27, location: "Ann Arbor", wRank: 1, lRank: 13 },
    { id: 115, year: 2018, date: "Nov 24", winner: "Ohio State", loser: "Michigan", wScore: 62, lScore: 39, location: "Columbus", wRank: 10, lRank: 4 },
    { id: 114, year: 2017, date: "Nov 25", winner: "Ohio State", loser: "Michigan", wScore: 31, lScore: 20, location: "Ann Arbor", wRank: 9, lRank: null },
    { id: 113, year: 2016, date: "Nov 26", winner: "Ohio State", loser: "Michigan", wScore: 30, lScore: 27, location: "Columbus", wRank: 2, lRank: 3, notes: "2OT" },
    { id: 112, year: 2015, date: "Nov 28", winner: "Ohio State", loser: "Michigan", wScore: 42, lScore: 13, location: "Ann Arbor", wRank: 8, lRank: 10 },
    { id: 111, year: 2014, date: "Nov 29", winner: "Ohio State", loser: "Michigan", wScore: 42, lScore: 28, location: "Columbus", wRank: 6, lRank: null },
    { id: 110, year: 2013, date: "Nov 30", winner: "Ohio State", loser: "Michigan", wScore: 42, lScore: 41, location: "Ann Arbor", wRank: 3, lRank: null },
    { id: 109, year: 2012, date: "Nov 24", winner: "Ohio State", loser: "Michigan", wScore: 26, lScore: 21, location: "Columbus", wRank: 4, lRank: 20 },
    { id: 108, year: 2011, date: "Nov 26", winner: "Michigan", loser: "Ohio State", wScore: 40, lScore: 34, location: "Ann Arbor", wRank: 15, lRank: null },
    { id: 107, year: 2010, date: "Nov 27", winner: "Ohio State", loser: "Michigan", wScore: 37, lScore: 7, location: "Columbus", wRank: 12, lRank: null, notes: "Vacated" },
    { id: 106, year: 2009, date: "Nov 21", winner: "Ohio State", loser: "Michigan", wScore: 21, lScore: 10, location: "Ann Arbor", wRank: 9, lRank: null },
    { id: 105, year: 2008, date: "Nov 22", winner: "Ohio State", loser: "Michigan", wScore: 42, lScore: 7, location: "Columbus", wRank: 10, lRank: null },
    { id: 104, year: 2007, date: "Nov 17", winner: "Ohio State", loser: "Michigan", wScore: 14, lScore: 3, location: "Ann Arbor", wRank: 7, lRank: 23 },
    { id: 103, year: 2006, date: "Nov 18", winner: "Ohio State", loser: "Michigan", wScore: 42, lScore: 39, location: "Columbus", wRank: 1, lRank: 2 },
    { id: 102, year: 2005, date: "Nov 19", winner: "Ohio State", loser: "Michigan", wScore: 25, lScore: 21, location: "Ann Arbor", wRank: 9, lRank: 17 },
    { id: 101, year: 2004, date: "Nov 20", winner: "Ohio State", loser: "Michigan", wScore: 37, lScore: 21, location: "Columbus", wRank: null, lRank: 7 },
    { id: 100, year: 2003, date: "Nov 22", winner: "Michigan", loser: "Ohio State", wScore: 35, lScore: 21, location: "Ann Arbor", wRank: 5, lRank: 4 },
    { id: 99, year: 2002, date: "Nov 23", winner: "Ohio State", loser: "Michigan", wScore: 14, lScore: 9, location: "Columbus", wRank: 2, lRank: 12 },
    { id: 98, year: 2001, date: "Nov 24", winner: "Ohio State", loser: "Michigan", wScore: 26, lScore: 20, location: "Ann Arbor", wRank: null, lRank: 11 },
    { id: 97, year: 2000, date: "Nov 18", winner: "Michigan", loser: "Ohio State", wScore: 38, lScore: 26, location: "Columbus", wRank: 19, lRank: 12 },
    { id: 96, year: 1999, date: "Nov 20", winner: "Michigan", loser: "Ohio State", wScore: 24, lScore: 17, location: "Ann Arbor", wRank: 10, lRank: null },
    { id: 95, year: 1998, date: "Nov 21", winner: "Ohio State", loser: "Michigan", wScore: 31, lScore: 16, location: "Columbus", wRank: 7, lRank: 11 },
    { id: 94, year: 1997, date: "Nov 22", winner: "Michigan", loser: "Ohio State", wScore: 20, lScore: 14, location: "Ann Arbor", wRank: 1, lRank: 4 },
    { id: 93, year: 1996, date: "Nov 23", winner: "Michigan", loser: "Ohio State", wScore: 13, lScore: 9, location: "Columbus", wRank: 21, lRank: 2 },
    { id: 92, year: 1995, date: "Nov 25", winner: "Michigan", loser: "Ohio State", wScore: 31, lScore: 23, location: "Ann Arbor", wRank: 18, lRank: 2 },
    { id: 91, year: 1994, date: "Nov 19", winner: "Ohio State", loser: "Michigan", wScore: 22, lScore: 6, location: "Columbus", wRank: 22, lRank: 15 },
    { id: 90, year: 1993, date: "Nov 20", winner: "Michigan", loser: "Ohio State", wScore: 28, lScore: 0, location: "Ann Arbor", wRank: null, lRank: 5 },
    { id: 89, year: 1992, date: "Nov 21", winner: "Tie", loser: "Tie", wScore: 13, lScore: 13, location: "Columbus", wRank: null, lRank: null },
    { id: 88, year: 1991, date: "Nov 23", winner: "Michigan", loser: "Ohio State", wScore: 31, lScore: 3, location: "Ann Arbor", wRank: 4, lRank: 18 },
    { id: 87, year: 1990, date: "Nov 24", winner: "Michigan", loser: "Ohio State", wScore: 16, lScore: 13, location: "Columbus", wRank: 15, lRank: 19 },
    { id: 86, year: 1989, date: "Nov 25", winner: "Michigan", loser: "Ohio State", wScore: 28, lScore: 18, location: "Ann Arbor", wRank: 3, lRank: 20 },
    { id: 85, year: 1988, date: "Nov 19", winner: "Michigan", loser: "Ohio State", wScore: 34, lScore: 31, location: "Columbus", wRank: 12, lRank: null },
    { id: 84, year: 1987, date: "Nov 21", winner: "Ohio State", loser: "Michigan", wScore: 23, lScore: 20, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 83, year: 1986, date: "Nov 22", winner: "Michigan", loser: "Ohio State", wScore: 26, lScore: 24, location: "Columbus", wRank: 6, lRank: 7 },
    { id: 82, year: 1985, date: "Nov 23", winner: "Michigan", loser: "Ohio State", wScore: 27, lScore: 17, location: "Ann Arbor", wRank: 6, lRank: 12 },
    { id: 81, year: 1984, date: "Nov 17", winner: "Ohio State", loser: "Michigan", wScore: 21, lScore: 6, location: "Columbus", wRank: 11, lRank: null },
    { id: 80, year: 1983, date: "Nov 19", winner: "Michigan", loser: "Ohio State", wScore: 24, lScore: 21, location: "Ann Arbor", wRank: 8, lRank: 10 },
    { id: 79, year: 1982, date: "Nov 20", winner: "Ohio State", loser: "Michigan", wScore: 24, lScore: 14, location: "Columbus", wRank: null, lRank: 13 },
    { id: 78, year: 1981, date: "Nov 21", winner: "Ohio State", loser: "Michigan", wScore: 14, lScore: 9, location: "Ann Arbor", wRank: null, lRank: 7 },
    { id: 77, year: 1980, date: "Nov 22", winner: "Michigan", loser: "Ohio State", wScore: 9, lScore: 3, location: "Columbus", wRank: 10, lRank: 5 },
    { id: 76, year: 1979, date: "Nov 17", winner: "Ohio State", loser: "Michigan", wScore: 18, lScore: 15, location: "Ann Arbor", wRank: 2, lRank: 13 },
    { id: 75, year: 1978, date: "Nov 25", winner: "Michigan", loser: "Ohio State", wScore: 14, lScore: 3, location: "Columbus", wRank: 6, lRank: 16 },
    { id: 74, year: 1977, date: "Nov 19", winner: "Michigan", loser: "Ohio State", wScore: 14, lScore: 6, location: "Ann Arbor", wRank: 5, lRank: 4 },
    { id: 73, year: 1976, date: "Nov 20", winner: "Michigan", loser: "Ohio State", wScore: 22, lScore: 0, location: "Columbus", wRank: 4, lRank: 8 },
    { id: 72, year: 1975, date: "Nov 22", winner: "Ohio State", loser: "Michigan", wScore: 21, lScore: 14, location: "Ann Arbor", wRank: 1, lRank: 4 },
    { id: 71, year: 1974, date: "Nov 23", winner: "Ohio State", loser: "Michigan", wScore: 12, lScore: 10, location: "Columbus", wRank: 4, lRank: 3 },
    { id: 70, year: 1973, date: "Nov 24", winner: "Tie", loser: "Tie", wScore: 10, lScore: 10, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 69, year: 1972, date: "Nov 25", winner: "Ohio State", loser: "Michigan", wScore: 14, lScore: 11, location: "Columbus", wRank: 9, lRank: 3 },
    { id: 68, year: 1971, date: "Nov 20", winner: "Michigan", loser: "Ohio State", wScore: 10, lScore: 7, location: "Ann Arbor", wRank: 3, lRank: null },
    { id: 67, year: 1970, date: "Nov 21", winner: "Ohio State", loser: "Michigan", wScore: 20, lScore: 9, location: "Columbus", wRank: 5, lRank: 4 },
    { id: 66, year: 1969, date: "Nov 22", winner: "Michigan", loser: "Ohio State", wScore: 24, lScore: 12, location: "Ann Arbor", wRank: 12, lRank: 1 },
    { id: 65, year: 1968, date: "Nov 23", winner: "Ohio State", loser: "Michigan", wScore: 50, lScore: 14, location: "Columbus", wRank: 2, lRank: 4 },
    { id: 64, year: 1967, date: "Nov 25", winner: "Ohio State", loser: "Michigan", wScore: 24, lScore: 14, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 63, year: 1966, date: "Nov 19", winner: "Michigan", loser: "Ohio State", wScore: 17, lScore: 3, location: "Columbus", wRank: null, lRank: null },
    { id: 62, year: 1965, date: "Nov 20", winner: "Ohio State", loser: "Michigan", wScore: 9, lScore: 7, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 61, year: 1964, date: "Nov 21", winner: "Michigan", loser: "Ohio State", wScore: 10, lScore: 0, location: "Columbus", wRank: 6, lRank: 7 },
    { id: 60, year: 1963, date: "Nov 30", winner: "Ohio State", loser: "Michigan", wScore: 14, lScore: 10, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 59, year: 1962, date: "Nov 24", winner: "Ohio State", loser: "Michigan", wScore: 28, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 58, year: 1961, date: "Nov 25", winner: "Ohio State", loser: "Michigan", wScore: 50, lScore: 20, location: "Ann Arbor", wRank: 2, lRank: null },
    { id: 57, year: 1960, date: "Nov 19", winner: "Ohio State", loser: "Michigan", wScore: 7, lScore: 0, location: "Columbus", wRank: 10, lRank: null },
    { id: 56, year: 1959, date: "Nov 21", winner: "Michigan", loser: "Ohio State", wScore: 23, lScore: 14, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 55, year: 1958, date: "Nov 22", winner: "Ohio State", loser: "Michigan", wScore: 20, lScore: 14, location: "Columbus", wRank: 11, lRank: null },
    { id: 54, year: 1957, date: "Nov 23", winner: "Ohio State", loser: "Michigan", wScore: 31, lScore: 14, location: "Ann Arbor", wRank: 3, lRank: 19 },
    { id: 53, year: 1956, date: "Nov 24", winner: "Michigan", loser: "Ohio State", wScore: 19, lScore: 0, location: "Columbus", wRank: 9, lRank: 12 },
    { id: 52, year: 1955, date: "Nov 19", winner: "Ohio State", loser: "Michigan", wScore: 17, lScore: 0, location: "Ann Arbor", wRank: 9, lRank: 6 },
    { id: 51, year: 1954, date: "Nov 20", winner: "Ohio State", loser: "Michigan", wScore: 21, lScore: 7, location: "Columbus", wRank: 1, lRank: 12 },
    { id: 50, year: 1953, date: "Nov 21", winner: "Michigan", loser: "Ohio State", wScore: 20, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 49, year: 1952, date: "Nov 22", winner: "Ohio State", loser: "Michigan", wScore: 27, lScore: 7, location: "Columbus", wRank: null, lRank: 12 },
    { id: 48, year: 1951, date: "Nov 24", winner: "Michigan", loser: "Ohio State", wScore: 7, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 47, year: 1950, date: "Nov 25", winner: "Michigan", loser: "Ohio State", wScore: 9, lScore: 3, location: "Columbus", wRank: null, lRank: 8 },
    { id: 46, year: 1949, date: "Nov 19", winner: "Tie", loser: "Tie", wScore: 7, lScore: 7, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 45, year: 1948, date: "Nov 20", winner: "Michigan", loser: "Ohio State", wScore: 13, lScore: 3, location: "Columbus", wRank: 1, lRank: 18 },
    { id: 44, year: 1947, date: "Nov 22", winner: "Michigan", loser: "Ohio State", wScore: 21, lScore: 0, location: "Ann Arbor", wRank: 1, lRank: null },
    { id: 43, year: 1946, date: "Nov 23", winner: "Michigan", loser: "Ohio State", wScore: 58, lScore: 6, location: "Columbus", wRank: 8, lRank: null },
    { id: 42, year: 1945, date: "Nov 24", winner: "Michigan", loser: "Ohio State", wScore: 7, lScore: 3, location: "Ann Arbor", wRank: 8, lRank: 7 },
    { id: 41, year: 1944, date: "Nov 25", winner: "Ohio State", loser: "Michigan", wScore: 18, lScore: 14, location: "Columbus", wRank: 3, lRank: 6 },
    { id: 40, year: 1943, date: "Nov 20", winner: "Michigan", loser: "Ohio State", wScore: 45, lScore: 7, location: "Ann Arbor", wRank: 4, lRank: null },
    { id: 39, year: 1942, date: "Nov 21", winner: "Ohio State", loser: "Michigan", wScore: 21, lScore: 7, location: "Columbus", wRank: 5, lRank: 4 },
    { id: 38, year: 1941, date: "Nov 22", winner: "Tie", loser: "Tie", wScore: 20, lScore: 20, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 37, year: 1940, date: "Nov 23", winner: "Michigan", loser: "Ohio State", wScore: 40, lScore: 0, location: "Columbus", wRank: 7, lRank: null },
    { id: 36, year: 1939, date: "Nov 25", winner: "Michigan", loser: "Ohio State", wScore: 21, lScore: 14, location: "Ann Arbor", wRank: 25, lRank: 6 },
    { id: 35, year: 1938, date: "Nov 19", winner: "Michigan", loser: "Ohio State", wScore: 18, lScore: 0, location: "Columbus", wRank: 17, lRank: null },
    { id: 34, year: 1937, date: "Nov 20", winner: "Ohio State", loser: "Michigan", wScore: 21, lScore: 0, location: "Ann Arbor", wRank: 19, lRank: null },
    { id: 33, year: 1936, date: "Nov 21", winner: "Ohio State", loser: "Michigan", wScore: 21, lScore: 0, location: "Columbus", wRank: 18, lRank: null },
    { id: 32, year: 1935, date: "Nov 23", winner: "Ohio State", loser: "Michigan", wScore: 38, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 31, year: 1934, date: "Nov 17", winner: "Ohio State", loser: "Michigan", wScore: 34, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 30, year: 1933, date: "Oct 21", winner: "Michigan", loser: "Ohio State", wScore: 13, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 29, year: 1932, date: "Oct 15", winner: "Michigan", loser: "Ohio State", wScore: 14, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 28, year: 1931, date: "Oct 17", winner: "Ohio State", loser: "Michigan", wScore: 7, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 27, year: 1930, date: "Oct 18", winner: "Michigan", loser: "Ohio State", wScore: 13, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 26, year: 1929, date: "Oct 19", winner: "Ohio State", loser: "Michigan", wScore: 7, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 25, year: 1928, date: "Oct 20", winner: "Ohio State", loser: "Michigan", wScore: 19, lScore: 7, location: "Columbus", wRank: null, lRank: null },
    { id: 24, year: 1927, date: "Oct 22", winner: "Michigan", loser: "Ohio State", wScore: 21, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 23, year: 1926, date: "Nov 13", winner: "Michigan", loser: "Ohio State", wScore: 17, lScore: 16, location: "Columbus", wRank: null, lRank: null },
    { id: 22, year: 1925, date: "Nov 14", winner: "Michigan", loser: "Ohio State", wScore: 10, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 21, year: 1924, date: "Nov 15", winner: "Michigan", loser: "Ohio State", wScore: 16, lScore: 6, location: "Columbus", wRank: null, lRank: null },
    { id: 20, year: 1923, date: "Oct 20", winner: "Michigan", loser: "Ohio State", wScore: 23, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 19, year: 1922, date: "Oct 21", winner: "Michigan", loser: "Ohio State", wScore: 19, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 18, year: 1921, date: "Oct 22", winner: "Ohio State", loser: "Michigan", wScore: 14, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 17, year: 1920, date: "Nov 6", winner: "Ohio State", loser: "Michigan", wScore: 14, lScore: 7, location: "Columbus", wRank: null, lRank: null },
    { id: 16, year: 1919, date: "Oct 25", winner: "Ohio State", loser: "Michigan", wScore: 13, lScore: 3, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 15, year: 1918, date: "Nov 30", winner: "Michigan", loser: "Ohio State", wScore: 14, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 14, year: 1912, date: "Oct 19", winner: "Michigan", loser: "Ohio State", wScore: 14, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 13, year: 1911, date: "Oct 21", winner: "Michigan", loser: "Ohio State", wScore: 19, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 12, year: 1910, date: "Oct 22", winner: "Tie", loser: "Tie", wScore: 3, lScore: 3, location: "Columbus", wRank: null, lRank: null },
    { id: 11, year: 1909, date: "Oct 16", winner: "Michigan", loser: "Ohio State", wScore: 33, lScore: 6, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 10, year: 1908, date: "Oct 24", winner: "Michigan", loser: "Ohio State", wScore: 10, lScore: 6, location: "Columbus", wRank: null, lRank: null },
    { id: 9, year: 1907, date: "Oct 26", winner: "Michigan", loser: "Ohio State", wScore: 22, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 8, year: 1906, date: "Oct 20", winner: "Michigan", loser: "Ohio State", wScore: 6, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 7, year: 1905, date: "Nov 11", winner: "Michigan", loser: "Ohio State", wScore: 40, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 6, year: 1904, date: "Oct 15", winner: "Michigan", loser: "Ohio State", wScore: 31, lScore: 6, location: "Columbus", wRank: null, lRank: null },
    { id: 5, year: 1903, date: "Nov 7", winner: "Michigan", loser: "Ohio State", wScore: 36, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 4, year: 1902, date: "Oct 25", winner: "Michigan", loser: "Ohio State", wScore: 86, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 3, year: 1901, date: "Nov 9", winner: "Michigan", loser: "Ohio State", wScore: 21, lScore: 0, location: "Columbus", wRank: null, lRank: null },
    { id: 2, year: 1900, date: "Nov 24", winner: "Tie", loser: "Tie", wScore: 0, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null },
    { id: 1, year: 1897, date: "Oct 16", winner: "Michigan", loser: "Ohio State", wScore: 34, lScore: 0, location: "Ann Arbor", wRank: null, lRank: null }
];

// Counter update
function updateCounter() {
    const today = new Date();
    const lastLossGame = games.find(g => g.winner === 'Michigan' && g.year === 2024);
    const lastLossDate = new Date(`${lastLossGame.date}, ${lastLossGame.year}`);
    
    const diffTime = Math.abs(today - lastLossDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    document.getElementById('days-count').innerText = diffDays;
}

// Charts initialization
function initCharts() {
    const ctxCumulative = document.getElementById('cumulativeChart').getContext('2d');
    const ctxDecade = document.getElementById('decadeChart').getContext('2d');
    const ctxTop5 = document.getElementById('top5Chart').getContext('2d');

    // 1. Cumulative Data
    const years = games.map(g => g.year).sort((a,b) => a-b);
    let osuWins = 0;
    let michWins = 0;
    const osuData = [];
    const michData = [];

    const sortedGames = [...games].sort((a,b) => a.year - b.year);
    
    sortedGames.forEach(g => {
        if(g.winner === 'Ohio State') osuWins++;
        if(g.winner === 'Michigan') michWins++;
        osuData.push(osuWins);
        michData.push(michWins);
    });

    new Chart(ctxCumulative, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Ohio State Wins',
                    data: osuData,
                    borderColor: '#bb0000',
                    backgroundColor: '#bb0000',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Michigan Wins',
                    data: michData,
                    borderColor: '#00274c',
                    backgroundColor: '#00274c',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        title: (items) => `Year: ${items[0].label}` 
                    }
                }
            },
            scales: {
                x: { ticks: { maxTicksLimit: 10 } }
            }
        }
    });

    // 2. Decade Data
    const decades = {};
    sortedGames.forEach(g => {
        const dec = Math.floor(g.year / 10) * 10;
        if (!decades[dec]) decades[dec] = { osu: 0, mich: 0, tie: 0 };
        if (g.winner === 'Ohio State') decades[dec].osu++;
        else if (g.winner === 'Michigan') decades[dec].mich++;
        else decades[dec].tie++;
    });

    const decadeLabels = Object.keys(decades);
    const decOsu = decadeLabels.map(d => decades[d].osu);
    const decMich = decadeLabels.map(d => decades[d].mich);

    new Chart(ctxDecade, {
        type: 'bar',
        data: {
            labels: decadeLabels.map(d => d + "s"),
            datasets: [
                {
                    label: 'Ohio State',
                    data: decOsu,
                    backgroundColor: '#bb0000',
                },
                {
                    label: 'Michigan',
                    data: decMich,
                    backgroundColor: '#00274c',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    });

    // 3. Top 5 Matchups
    const top5Games = sortedGames.filter(g => {
        return g.wRank && g.wRank <= 5 && g.lRank && g.lRank <= 5;
    });

    let top5Osu = 0;
    let top5Mich = 0;
    let top5Tie = 0;

    top5Games.forEach(g => {
        if (g.winner === 'Ohio State') top5Osu++;
        else if (g.winner === 'Michigan') top5Mich++;
        else top5Tie++;
    });

    new Chart(ctxTop5, {
        type: 'doughnut',
        data: {
            labels: ['Ohio State Wins', 'Michigan Wins', 'Ties'],
            datasets: [{
                data: [top5Osu, top5Mich, top5Tie],
                backgroundColor: ['#bb0000', '#00274c', '#a8a29e'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Table rendering
function renderTable(data) {
    const tbody = document.getElementById('gameTableBody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        document.getElementById('noResults').style.display = 'block';
        return;
    } else {
        document.getElementById('noResults').style.display = 'none';
    }

    data.forEach(g => {
        const tr = document.createElement('tr');
        const winnerClass = g.winner === 'Ohio State' ? 'osu-win' : (g.winner === 'Michigan' ? 'mich-win' : '');
        
        tr.innerHTML = `
            <td>${g.year}</td>
            <td>${g.date}</td>
            <td class="${winnerClass}">${g.winner}</td>
            <td>${g.wScore} - ${g.lScore}</td>
            <td>${g.location}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterGames() {
    const query = document.getElementById('gameSearch').value.toLowerCase();
    const filtered = games.filter(g => 
        g.year.toString().includes(query) || 
        g.winner.toLowerCase().includes(query) || 
        g.location.toLowerCase().includes(query)
    );
    filtered.sort((a,b) => b.year - a.year);
    renderTable(filtered);
}


// Initialize
window.addEventListener('DOMContentLoaded', () => {
    updateCounter();
    initCharts();
    renderTable([...games].sort((a,b) => b.year - a.year));
    document.getElementById('gameSearch').addEventListener('input', filterGames);
});
