John Fritz Reviews Website

Files to upload:
- index.html
- styles.css
- app.js
- reviews.json
- assets/dealership-hero.png

How reviews work:
- The page reads review cards from reviews.json.
- Add real reviews to reviews.json using the same fields as the examples.
- Do not add made-up names or review text. Use public reviews or reviews you have permission to publish.

Google reviews:
- Google Places API usually returns only a small sample of reviews.
- To export many real reviews, use the Google Business Profile API if you have access to the verified business profile.
- If you can download or copy your Google reviews into a CSV, use tools/convert-reviews-csv.js to convert them into reviews.json.

Local preview note:
- You can open index.html directly for a quick preview.
- For the most accurate preview, use a small local server from this folder:
  python -m http.server 8080
- Then open: http://localhost:8080
