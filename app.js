const reviewGrid = document.querySelector("#review-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#review-search");
const sourceSelect = document.querySelector("#review-source");
const reviewCount = document.querySelector("#review-count");
const ratingSummary = document.querySelector("#rating-summary");
const sharePageButton = document.querySelector("#share-page");
const referralForm = document.querySelector("#john-referral");
const textReferralButton = document.querySelector("#text-referral");
const reviewPrevButton = document.querySelector("#review-prev");
const reviewNextButton = document.querySelector("#review-next");
const reviewDots = document.querySelector("#review-dots");
const profilePhoto = document.querySelector("#profile-photo");
const visitRequestForm = document.querySelector("#visit-request");
let reviews = [];
let currentReviewPage = 0;
let reviewTimer;
let currentProfilePhoto = 0;
let profilePhotoTimer;

const shareUrl = "https://johnfritz322-png.github.io/John-Fritz-reviews-/";
const shareTitle = "John Fritz Reviews";
const shareText = "John Fritz at Lithia Chrysler Jeep Dodge Ram of Billings has helped a lot of customers. Here is his review page and contact info.";
const profilePhotos = [
  {
    src: "assets/john-fritz-slide-01.jpg",
    alt: "John Fritz standing in front of a red Dodge Challenger at Lithia"
  },
  {
    src: "assets/john-fritz-slide-02.jpg",
    alt: "John Fritz with family at Beartooth Pass"
  },
  {
    src: "assets/john-fritz-slide-04.jpg",
    alt: "John Fritz on a boat near a lighthouse"
  }
];

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

function referralTextUrl() {
  if (!referralForm) return "sms:+12695477312";
    const formData = new FormData(referralForm);
    const yourName = String(formData.get("your_name") || "").trim();
    const friendName = String(formData.get("friend_name") || "").trim();
    const friendContact = String(formData.get("friend_contact") || "").trim();
    const vehicleInterest = String(formData.get("vehicle_interest") || "").trim();
    const message = [
      yourName ? `Hi John! This is ${yourName}.` : "Hi John!",
      friendName
        ? `I'd like to refer my friend ${friendName} to you.`
        : "I'd like to refer a friend to you.",
      vehicleInterest ? `They're interested in ${vehicleInterest}.` : "",
      friendContact ? `You can reach them at ${friendContact}.` : "",
      "When you have a chance, could you get in touch with them? Thanks!"
    ].filter(Boolean).join(" ");
  const separator = /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent) ? "&" : "?";
  return `sms:+12695477312${separator}body=${encodeURIComponent(message)}`;
}

function textReferralToJohn() {
  window.location.href = referralTextUrl();
}

if (textReferralButton) {
  textReferralButton.addEventListener("click", textReferralToJohn);
}

if (referralForm) {
  referralForm.addEventListener("submit", (event) => {
    event.preventDefault();
    textReferralToJohn();
  });
}

if (visitRequestForm) {
  visitRequestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!visitRequestForm.reportValidity()) return;
    const formData = new FormData(visitRequestForm);
    const date = String(formData.get("visit_date") || "").trim();
    const formattedDate = date ? formatDate(date) : "";
    const time = String(formData.get("visit_time") || "").trim();
    const interest = String(formData.get("visit_interest") || "").trim();
    const message = [
      "Hi John! I'd like to plan a visit.",
      formattedDate ? `My preferred date is ${formattedDate}` : "",
      time ? `during the ${time.toLowerCase()}.` : ".",
      interest ? `I'm interested in: ${interest}.` : "",
      "Please let me know what works. Thanks!"
    ].filter(Boolean).join(" ").replace(" .", ".");
    const separator = /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent) ? "&" : "?";
    window.location.href = `sms:+12695477312${separator}body=${encodeURIComponent(message)}`;
  });
}

function renderProfilePhoto() {
  if (!profilePhoto || profilePhotos.length === 0) return;
  const photo = profilePhotos[currentProfilePhoto % profilePhotos.length];
  profilePhoto.src = photo.src;
  profilePhoto.alt = photo.alt;
}

function startProfilePhotoRotation() {
  clearInterval(profilePhotoTimer);
  renderProfilePhoto();
  profilePhotoTimer = setInterval(() => {
    if (profilePhotos.length <= 1) return;
    currentProfilePhoto = (currentProfilePhoto + 1) % profilePhotos.length;
    renderProfilePhoto();
  }, 6000);
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
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
  if (!sourceSelect) return;
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
  if (reviewCount) reviewCount.textContent = String(total);
  ratingSummary.textContent = total ? `${average.toFixed(1)} average from public reviews` : "Reviews coming soon";
}

function reviewsPerPage() {
  return 1;
}

function filteredReviews() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const source = sourceSelect ? sourceSelect.value : "all";
  return reviews.filter((review) => {
    const haystack = [
      review.name,
      review.source,
      review.visitType,
      review.text,
      review.workedWith
    ].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (source === "all" || review.source === source);
  });
}

function renderReviews() {
  const filtered = filteredReviews();
  const perPage = reviewsPerPage();
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  currentReviewPage = Math.min(currentReviewPage, totalPages - 1);
  const pageReviews = filtered.slice(currentReviewPage * perPage, (currentReviewPage + 1) * perPage);

  reviewGrid.innerHTML = pageReviews.map((review) => `
    <article class="review-card">
      <div class="review-top">
        <span class="stars" aria-label="${escapeHtml(review.rating)} stars">${stars(review.rating)}</span>
        <time datetime="${/^\d{4}-\d{2}-\d{2}$/.test(review.date || "") ? escapeHtml(review.date) : ""}">${escapeHtml(formatDate(review.date))}</time>
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
  if (reviewPrevButton) reviewPrevButton.disabled = currentReviewPage === 0 || filtered.length === 0;
  if (reviewNextButton) reviewNextButton.disabled = currentReviewPage >= totalPages - 1 || filtered.length === 0;
  if (reviewDots) {
    reviewDots.innerHTML = Array.from({ length: totalPages }, (_, index) => `
      <button class="carousel-dot${index === currentReviewPage ? " active" : ""}" type="button" aria-label="Show review page ${index + 1}" data-review-page="${index}"></button>
    `).join("");
  }
}

function startReviewRotation() {
  clearInterval(reviewTimer);
  reviewTimer = setInterval(() => {
    const totalPages = Math.max(1, Math.ceil(filteredReviews().length / reviewsPerPage()));
    if (totalPages <= 1) return;
    currentReviewPage = (currentReviewPage + 1) % totalPages;
    renderReviews();
  }, 6000);
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
  startReviewRotation();
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentReviewPage = 0;
    renderReviews();
    startReviewRotation();
  });
}
if (sourceSelect) {
  sourceSelect.addEventListener("change", () => {
    currentReviewPage = 0;
    renderReviews();
    startReviewRotation();
  });
}
if (reviewPrevButton) {
  reviewPrevButton.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredReviews().length / reviewsPerPage()));
    currentReviewPage = (currentReviewPage - 1 + totalPages) % totalPages;
    renderReviews();
    startReviewRotation();
  });
}
if (reviewNextButton) {
  reviewNextButton.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredReviews().length / reviewsPerPage()));
    currentReviewPage = (currentReviewPage + 1) % totalPages;
    renderReviews();
    startReviewRotation();
  });
}
if (reviewDots) {
  reviewDots.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-page]");
    if (!button) return;
    currentReviewPage = Number(button.dataset.reviewPage) || 0;
    renderReviews();
    startReviewRotation();
  });
}
window.addEventListener("resize", renderReviews);
startProfilePhotoRotation();
loadReviews();
