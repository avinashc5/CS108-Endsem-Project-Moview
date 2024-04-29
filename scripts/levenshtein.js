function levenshteinDistance(s, t) {
    const dp = Array.from(Array(s.length + 1), () => Array(t.length + 1).fill(0));

    for (let i = 0; i <= s.length; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= t.length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= s.length; i++) {
        for (let j = 1; j <= t.length; j++) {
            const cost = s[i - 1] === t[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }

    return dp[s.length][t.length];
}

// List of strings to compare against
const strings = ["The Shawshank Redemption", "Dune: Part 2", "cherry", "grape", "orange"];

const query = "the shawshank redemption"; // Input string to find closest match

let closestMatch = strings[0];
let minDistance = levenshteinDistance(query, strings[0]);

for (const str of strings) {
    const distance = levenshteinDistance(query, str);
    if (distance < minDistance) {
        minDistance = distance;
        closestMatch = str;
    }
}

console.log("Closest match:", closestMatch);