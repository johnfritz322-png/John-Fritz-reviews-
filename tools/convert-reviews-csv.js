const fs = require("fs");
const path = require("path");

const input = process.argv[2];
const output = process.argv[3] || "reviews.json";

if (!input) {
  console.error("Usage: node tools/convert-reviews-csv.js google-reviews.csv reviews.json");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function value(record, names) {
  for (const name of names) {
    const found = record[normalizeKey(name)];
    if (found) return found.trim();
  }
  return "";
}

const csv = fs.readFileSync(input, "utf8");
const [headers, ...rows] = parseCsv(csv);
const normalizedHeaders = headers.map(normalizeKey);

const reviews = rows.map((row) => {
  const record = {};
  normalizedHeaders.forEach((header, index) => {
    record[header] = row[index] || "";
  });

  return {
    name: value(record, ["name", "reviewer", "author", "displayName"]) || "Google Customer",
    rating: Number(value(record, ["rating", "starRating", "stars"])) || 5,
    date: value(record, ["date", "createTime", "reviewDate"]).slice(0, 10),
    source: "Google",
    visitType: "Customer Review",
    text: value(record, ["review", "comment", "text", "reviewText"]),
    workedWith: "John Fritz"
  };
}).filter((review) => review.text);

fs.writeFileSync(output, JSON.stringify(reviews, null, 2));
console.log(`Wrote ${reviews.length} reviews to ${path.resolve(output)}`);
