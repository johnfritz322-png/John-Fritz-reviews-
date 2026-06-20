const reviewGrid = document.querySelector("#review-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#review-search");
const sourceSelect = document.querySelector("#review-source");
const reviewCount = document.querySelector("#review-count");
const ratingSummary = document.querySelector("#rating-summary");
const sharePageButton = document.querySelector("#share-page");
let reviews = [];

const shareUrl = "https://johnfritz322-png.github.io/John-Fritz-reviews-/";
const shareTitle = "John Fritz Reviews";
const shareText = "John Fritz at Lithia Chrysler Jeep Dodge Ram of Billings has helped a lot of customers. Here is his review page and contact info.";

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (sharePageButton) {
  sharePageButton.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      sharePageButton.textContent = "Link Copied";
      setTimeout(() => {
        sharePageButton.textContent = "Share This Page";
      }, 1800);
    } catch (error) {
      window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function stars(rating) {
  const count = Math.max(0, Math.min(5, Number(rating) || 0));
  return "\u2605\u2605\u2605\u2605\u2605".slice(0, count);
}

function initials(name) {
  return String(name || "Customer").trim().charAt(0).toUpperCase() || "C";
}

function updateSources() {
  const sources = [...new Set(reviews.map((review) => review.source).filter(Boolean))].sort();
  sourceSelect.innerHTML = '<option value="all">All sources</option>' + sources.map((source) => (
    `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`
  )).join("");
}

function updateSummary() {
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / total
    : 0;
  reviewCount.textContent = String(total);
  ratingSummary.textContent = total ? `${average.toFixed(1)} average from public reviews` : "Reviews coming soon";
}

function renderReviews() {
  const query = searchInput.value.trim().toLowerCase();
  const source = sourceSelect.value;
  const filtered = reviews.filter((review) => {
    const haystack = [
      review.name,
      review.source,
      review.visitType,
      review.text,
      review.workedWith
    ].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (source === "all" || review.source === source);
  });

  reviewGrid.innerHTML = filtered.map((review) => `
    <article class="review-card">
      <div class="review-top">
        <span class="stars" aria-label="${escapeHtml(review.rating)} stars">${stars(review.rating)}</span>
        <time datetime="${escapeHtml(review.date)}">${escapeHtml(formatDate(review.date))}</time>
      </div>
      <blockquote>&ldquo;${escapeHtml(review.text)}&rdquo;</blockquote>
      <div class="reviewer">
        <div class="avatar">${escapeHtml(initials(review.name))}</div>
        <div>
          <strong>${escapeHtml(review.name || "Customer")}</strong>
          <small>${escapeHtml(review.visitType || "Customer Review")}</small>
        </div>
      </div>
      <p class="worked-with">Employees worked with: ${escapeHtml(review.workedWith || "John Fritz")}</p>
      <p class="source-note">Source: ${escapeHtml(review.source || "Public review")}</p>
    </article>
  `).join("");

  emptyState.hidden = filtered.length !== 0;
}

async function loadReviews() {
  try {
    const response = await fetch("reviews.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load reviews.json");
    reviews = await response.json();
  } catch (error) {
    const fallback = document.querySelector("#reviews-data");
    reviews = fallback ? JSON.parse(fallback.textContent) : [];
    console.error(error);
  }
  updateSources();
  updateSummary();
  renderReviews();
}

searchInput.addEventListener("input", renderReviews);
sourceSelect.addEventListener("change", renderReviews);
loadReviews();
