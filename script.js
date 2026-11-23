const reportBtn = document.getElementById("reportItem");
const dialog = document.getElementById("reportDialog");
const form = document.getElementById("reportForm");
const cancelBtn = document.getElementById("cancelReport");
const nameInput = form.querySelector('input[name="name"]');
const container = document.getElementById("lostItemsContainer");
const resultsHeading = document.getElementById("resultsHeading");
const categoryFilter = document.getElementById("categoryFilter");
const statusButtons = document.querySelectorAll(".btn-group button[data-status]");
const searchInput = document.getElementById("itemSearch");
const clearSearchBtn = document.getElementById("clearSearch");
const imageInput = document.getElementById("reportImages");
const imagePreview = document.getElementById("imagePreview");
const imageError = document.getElementById("imageError");
const dateInput = document.getElementById("reportDate");
const dateError = document.getElementById("dateError");

const MIN_REPORT_DATE = "2026-01-01";
const MAX_REPORT_DATE = "2026-12-31";
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 
let selectedImages = [];
let selectionToken = 0;

// Sample items:
const lostItems = [
    // ----- LOST -----
    { id: 1, name: "Maria Santos", item: "Black Wallet", category: "Personal Item",
      description: "Black leather wallet with initials M.S.", location: "Canteen", dateLost: "2026-11-10", status: "Lost" },
    { id: 2, name: "Ana Cruz", item: "Wireless Earbuds", category: "Electronics",
      description: "White earbuds in a small charging case.", location: "Gym", dateLost: "2026-11-12", status: "Lost" },
    { id: 3, name: "Paolo Lim", item: "Blue Notebook", category: "School Item",
      description: "Blue spiral notebook with Chemistry notes.", location: "Room 101", dateLost: "2026-11-11", status: "Lost" },
    { id: 4, name: "Grace Tan", item: "Silver Water Bottle", category: "Others",
      description: "Silver tumbler with a sticker of a cat.", location: "Football Field", dateLost: "2026-11-13", status: "Lost" },

    // ----- FOUND -----
    { id: 5, name: "Security Office", item: "iPhone with Blue Case", category: "Electronics",
      description: "Lock screen is a beach photo.", location: "Library", dateLost: "2026-11-11", status: "Found" },
    { id: 6, name: "Admin Office", item: "Set of Keys", category: "Personal Item",
      description: "Three keys on a red lanyard.", location: "Hallway, 2nd Floor", dateLost: "2026-11-12", status: "Found" },
    { id: 7, name: "Library Staff", item: "Math Textbook", category: "School Item",
      description: "Grade 11 Algebra textbook, name erased on the cover.", location: "Library", dateLost: "2026-11-09", status: "Found" },
    { id: 8, name: "Admin Office", item: "Green Umbrella", category: "Others",
      description: "Large green umbrella with a wooden handle.", location: "Main Gate", dateLost: "2026-11-09", status: "Found" },

    // ----- CLAIMED -----
    { id: 9, name: "Leo Garcia", item: "Power Bank", category: "Electronics",
      description: "10,000 mAh black power bank.", location: "Computer Lab", dateLost: "2026-11-05", status: "Claimed" },
    { id: 10, name: "Sofia Ramos", item: "Prescription Glasses", category: "Personal Item",
      description: "Black round frames in a gray case.", location: "Cafeteria", dateLost: "2026-11-06", status: "Claimed" },
    { id: 11, name: "John Reyes", item: "Scientific Calculator", category: "School Item",
      description: "Casio fx-991, name written on the back.", location: "Room 204", dateLost: "2026-11-08", status: "Claimed" },
    { id: 12, name: "Mark Dizon", item: "Gray Hoodie", category: "Others",
      description: "Gray pullover hoodie, size M.", location: "Gym", dateLost: "2026-11-07", status: "Claimed" },
];

let nextId = lostItems.length + 1;
let activeCategory = "All";
let activeStatus = "All";
let activeSearch = "";

// ---------- Rendering ----------

const categoryIcons = {
    Electronics: "EL",
    "Personal Item": "PI",
    "School Item": "SC",
    Others: "OT",
};

function addLine(parent, label, value) {
    const p = document.createElement("p");
    p.className = "meta-line";

    const strong = document.createElement("strong");
    strong.textContent = label;

    const span = document.createElement("span");
    span.textContent = value || "Not specified";
    span.title = span.textContent;

    p.append(strong, span);
    parent.appendChild(p);
}

function renderItem(report) {
    const card = document.createElement("article");
    card.className = "item-card";

    const top = document.createElement("div");
    top.className = "card-top";

    const icon = document.createElement("div");
    icon.className = "category-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = categoryIcons[report.category] || "--";

    const badge = document.createElement("span");
    badge.className = "status-badge status-" + report.status.toLowerCase();
    badge.textContent = report.status;

    top.append(icon, badge);
    card.appendChild(top);

    const title = document.createElement("h3");
    title.textContent = report.item;
    title.title = title.textContent;
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "item-description";
    desc.textContent = report.description || "No description provided.";
    desc.title = desc.textContent;
    card.appendChild(desc);

    if (report.images && report.images.length > 0) {
        const images = document.createElement("div");
        images.className = "item-images";

        report.images.forEach((src, index) => {
            const img = document.createElement("img");
            img.className = "item-image";
            img.src = src;
            img.alt = `${report.item} photo ${index + 1}`;
            img.loading = "lazy";
            images.appendChild(img);
        });

        card.appendChild(images);
    }

    const meta = document.createElement("div");
    meta.className = "card-meta";
    addLine(meta, "Category:", report.category);
    addLine(meta, "Location:", report.location);
    addLine(meta, "Date:", report.dateLost);
    card.appendChild(meta);

    container.appendChild(card);
}

function renderItems() {
    container.replaceChildren();

    const visible = lostItems.filter(
        (item) =>
            (activeCategory === "All" || item.category === activeCategory) &&
            (activeStatus === "All" || item.status === activeStatus) &&
            item.item.toLowerCase().includes(activeSearch)
    );

    resultsHeading.textContent = `${visible.length} ${visible.length === 1 ? "item" : "items"} found`;

    if (visible.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No items match your search or these filters.";
        container.appendChild(empty);
        return;
    }

    visible.forEach(renderItem);
}

// ---------- Filters ----------

statusButtons.forEach((button) => {
    button.addEventListener("click", () => {
        statusButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        activeStatus = button.dataset.status;
        renderItems();
    });
});

categoryFilter.addEventListener("change", () => {
    activeCategory = categoryFilter.value;
    renderItems();
});

searchInput.addEventListener("input", () => {
    activeSearch = searchInput.value.trim().toLowerCase();
    clearSearchBtn.hidden = searchInput.value.length === 0;
    renderItems();
});

clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    activeSearch = "";
    clearSearchBtn.hidden = true;
    searchInput.focus();
    renderItems();
});

// ---------- Report dialog ----------

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// The latest allowed date is today, capped at the end of 2026.
// Recalculated when the dialog opens so the range grows as time passes.
function getMaxReportDate() {
    const today = formatLocalDate(new Date());
    if (today < MIN_REPORT_DATE) return MIN_REPORT_DATE;
    return today > MAX_REPORT_DATE ? MAX_REPORT_DATE : today;
}

function updateDateLimits() {
    dateInput.min = MIN_REPORT_DATE;
    dateInput.max = getMaxReportDate();
}

// ---------- Name input filtering (numbers are silently removed) ----------

const NAME_NUMBER_PATTERN = /\d/;

nameInput.addEventListener("input", () => {
    if (NAME_NUMBER_PATTERN.test(nameInput.value)) {
        nameInput.value = nameInput.value.replace(/\d/g, "");
        updateCharCounter(nameInput);
    }
});

function setDateError(message) {
    dateError.textContent = message;
}

function isDateAllowed(value) {
    return !value || (value >= MIN_REPORT_DATE && value <= getMaxReportDate());
}

function validateDate() {
    if (isDateAllowed(dateInput.value)) {
        setDateError("");
        return true;
    }

    dateInput.value = "";
    setDateError("Choose a date in 2026 that is not in the future.");
    return false;
}

updateDateLimits();

dateInput.addEventListener("change", validateDate);

// ---------- Character counters ----------

function updateCharCounter(field) {
    const counter = form.querySelector(`[data-count-for="${field.name}"]`);
    if (!counter) return;

    const length = field.value.length;
    counter.textContent = `${length} / ${field.maxLength}`;
    counter.classList.toggle("at-limit", length >= field.maxLength);
}

const limitedFields = Array.from(form.querySelectorAll("[maxlength]"));
limitedFields.forEach((field) => {
    field.addEventListener("input", () => updateCharCounter(field));
    updateCharCounter(field);
});

form.addEventListener("reset", () => {
    setDateError("");
    // Reset fires before field values are cleared, so refresh after the browser resets them.
    requestAnimationFrame(() => limitedFields.forEach(updateCharCounter));
});

function setImageError(message) {
    imageError.textContent = message;
}

function renderImagePreview() {
    imagePreview.replaceChildren();

    selectedImages.forEach((image, index) => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = image.dataUrl;
        img.alt = `Preview of ${image.name}`;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${image.name}`);
        remove.addEventListener("click", () => {
            selectedImages.splice(index, 1);
            imageInput.value = "";
            renderImagePreview();
        });

        figure.append(img, remove);
        imagePreview.appendChild(figure);
    });
}

function clearImages() {
    selectedImages = [];
    selectionToken++;
    imageInput.value = "";
    setImageError("");
    renderImagePreview();
}

function readImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    });
}

imageInput.addEventListener("change", async () => {
    const token = ++selectionToken;
    const files = Array.from(imageInput.files || []);
    setImageError("");

    if (files.some((file) => !file.type.startsWith("image/"))) {
        clearImages();
        setImageError("Only image files can be attached.");
        return;
    }

    if (files.length > MAX_IMAGES) {
        clearImages();
        setImageError(`You can attach up to ${MAX_IMAGES} images.`);
        return;
    }

    if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
        clearImages();
        setImageError("Each image must be 5 MB or smaller.");
        return;
    }

    try {
        const images = await Promise.all(files.map(readImage));
        if (token !== selectionToken) return; // A newer selection replaced this one.

        selectedImages = images;
        renderImagePreview();
    } catch (error) {
        if (token === selectionToken) setImageError(error.message);
    }
});

// Clear previews and errors whenever the dialog is dismissed.
dialog.addEventListener("close", () => {
    clearImages();
    setDateError("");
});

// Clicks on the backdrop are reported with the dialog itself as the target.
dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
});

reportBtn.addEventListener("click", () => {
    updateDateLimits();
    dialog.showModal();
});

cancelBtn.addEventListener("click", () => {
    form.reset();
    clearImages();
    dialog.close();
});

const TOAST_DURATION = 4000;

function showNotification(message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        container.setAttribute("aria-live", "polite");
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = type === "success" ? "✓" : "!";
    toast.appendChild(icon);

    const text = document.createElement("span");
    text.textContent = message;
    toast.appendChild(text);

    container.appendChild(toast);

    // Allow the entrance transition to run.
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, TOAST_DURATION);
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Keep the name free of numbers even if it was set programmatically.
    nameInput.value = nameInput.value.replace(/\d/g, "");

    if (!validateDate()) return;

    const report = {
        id: nextId++,
        ...Object.fromEntries(new FormData(form)),
        images: selectedImages.map((image) => image.dataUrl),
        status: "Lost",
    };

    lostItems.push(report);
    renderItems();

    showNotification(`"${report.item}" has been reported as lost.`);

    form.reset();
    clearImages();
    dialog.close();
});

renderItems();