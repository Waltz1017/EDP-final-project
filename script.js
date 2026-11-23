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
const detailDialog = document.getElementById("itemDetailDialog");
const closeDetailBtn = document.getElementById("closeDetail");
const detailTitle = document.getElementById("detailTitle");
const detailStatus = document.getElementById("detailStatus");
const detailCategory = document.getElementById("detailCategory");
const detailDescription = document.getElementById("detailDescription");
const detailName = document.getElementById("detailName");
const detailLocation = document.getElementById("detailLocation");
const detailDate = document.getElementById("detailDate");
const detailImages = document.getElementById("detailImages");
const detailClaimNotice = document.getElementById("detailClaimNotice");

const MIN_REPORT_DATE = "2026-01-01";
const MAX_REPORT_DATE = "2026-12-31";
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 
let selectedImages = [];
let selectionToken = 0;

const STORAGE_KEY = "traceback.items.v1";

const SAMPLE_ITEMS = [
    { id: 1, name: "Maria Santos", item: "Black Wallet", category: "Personal Item",
      description: "Black leather wallet with initials M.S.", location: "Canteen", dateLost: "2026-11-10", status: "Lost", images: [] },
    { id: 2, name: "Ana Cruz", item: "Wireless Earbuds", category: "Electronics",
      description: "White earbuds in a small charging case.", location: "Gym", dateLost: "2026-11-12", status: "Lost", images: [] },

    { id: 3, name: "Security Office", item: "iPhone with Blue Case", category: "Electronics",
      description: "Lock screen is a beach photo.", location: "Library", dateLost: "2026-11-11", status: "Found", images: [] },
    { id: 4, name: "Admin Office", item: "Set of Keys", category: "Personal Item",
      description: "Three keys on a red lanyard.", location: "Hallway, 2nd Floor", dateLost: "2026-11-12", status: "Found", images: [] },

    { id: 5, name: "Leo Garcia", item: "Power Bank", category: "Electronics",
      description: "10,000 mAh black power bank.", location: "Computer Lab", dateLost: "2026-11-05", status: "Claimed", images: [] },
    { id: 6, name: "Sofia Ramos", item: "Prescription Glasses", category: "Personal Item",
      description: "Black round frames in a gray case.", location: "Cafeteria", dateLost: "2026-11-06", status: "Claimed", images: [] },
];

function normalizeItem(item, fallbackId) {
    const id = Number(item?.id);
    return {
        id: Number.isFinite(id) && id > 0 ? id : fallbackId,
        name: String(item?.name ?? ""),
        item: String(item?.item ?? ""),
        category: String(item?.category ?? "Others"),
        description: String(item?.description ?? ""),
        location: String(item?.location ?? ""),
        dateLost: String(item?.dateLost ?? ""),
        status: ["Lost", "Found", "Claimed"].includes(item?.status) ? item.status : "Lost",
        images: Array.isArray(item?.images) ? item.images.filter((src) => typeof src === "string") : [],
    };
}

function loadItems() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return SAMPLE_ITEMS.map((item) => ({ ...item, images: [...item.images] }));
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Invalid stored items");
        return parsed.map((item, index) => normalizeItem(item, index + 1));
    } catch {
        return SAMPLE_ITEMS.map((item) => ({ ...item, images: [...item.images] }));
    }
}

function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lostItems));
        return true;
    } catch {
        showNotification("Could not save changes locally. Storage may be full.", "error");
        return false;
    }
}

let lostItems = loadItems();
let nextId = lostItems.reduce((max, item) => Math.max(max, item.id), 0) + 1;
let activeCategory = "All";
let activeStatus = "All";
let activeSearch = "";

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
    card.tabIndex = 0;
    card.dataset.id = String(report.id);
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View details for ${report.item}`);

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

    const hint = document.createElement("p");
    hint.className = "card-hint";
    hint.textContent = "Click to view details";
    card.appendChild(hint);

    card.addEventListener("click", () => openDetailDialog(report.id));
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetailDialog(report.id);
        }
    });

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

function openDetailDialog(id) {
    const report = lostItems.find((item) => item.id === id);
    if (!report) return;

    detailTitle.textContent = report.item;
    detailStatus.className = `status-badge status-${report.status.toLowerCase()}`;
    detailStatus.textContent = report.status;
    detailCategory.textContent = report.category;
    detailDescription.textContent = report.description || "No description provided.";
    detailName.textContent = report.name || "Not specified";
    detailLocation.textContent = report.location || "Not specified";
    detailDate.textContent = report.dateLost || "Not specified";
    detailClaimNotice.hidden = report.status !== "Found";

    detailImages.replaceChildren();
    if (report.images && report.images.length > 0) {
        report.images.forEach((src, index) => {
            const img = document.createElement("img");
            img.className = "detail-image";
            img.src = src;
            img.alt = `${report.item} photo ${index + 1}`;
            img.loading = "lazy";
            detailImages.appendChild(img);
        });
        detailImages.hidden = false;
    } else {
        const empty = document.createElement("p");
        empty.className = "detail-no-images";
        empty.textContent = "No photos attached.";
        detailImages.appendChild(empty);
        detailImages.hidden = false;
    }

    detailDialog.showModal();
}

closeDetailBtn.addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", (event) => {
    if (event.target === detailDialog) detailDialog.close();
});

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getMaxReportDate() {
    const today = formatLocalDate(new Date());
    if (today < MIN_REPORT_DATE) return MIN_REPORT_DATE;
    return today > MAX_REPORT_DATE ? MAX_REPORT_DATE : today;
}

function updateDateLimits() {
    dateInput.min = MIN_REPORT_DATE;
    dateInput.max = getMaxReportDate();
}

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
        if (token !== selectionToken) return; 

        selectedImages = images;
        renderImagePreview();
    } catch (error) {
        if (token === selectionToken) setImageError(error.message);
    }
});

dialog.addEventListener("close", () => {
    clearImages();
    setDateError("");
});

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

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, TOAST_DURATION);
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    nameInput.value = nameInput.value.replace(/\d/g, "");

    if (!validateDate()) return;

    const report = {
        id: nextId++,
        ...Object.fromEntries(new FormData(form)),
        images: selectedImages.map((image) => image.dataUrl),
        status: "Lost",
    };

    lostItems.push(report);
    const saved = saveItems();
    if (!saved && report.images.length > 0) {
        
        report.images = [];
        if (!saveItems()) {
            lostItems.pop();
            renderItems();
            return;
        }
        showNotification(`"${report.item}" was reported, but photos were not saved due to storage limits.`, "error");
    } else if (!saved) {
        lostItems.pop();
        renderItems();
        return;
    } else {
        showNotification(`"${report.item}" has been reported as lost.`);
    }

    renderItems();
    form.reset();
    clearImages();
    dialog.close();
});

renderItems();