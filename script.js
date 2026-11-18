const reportBtn = document.getElementById("reportItem");
const dialog = document.getElementById("reportDialog");
const form = document.getElementById("reportForm");
const cancelBtn = document.getElementById("cancelReport");
const container = document.getElementById("lostItemsContainer");
const resultsHeading = document.getElementById("resultsHeading");
const categoryButtons = document.querySelectorAll("button[data-category]");
const statusButtons = document.querySelectorAll(".btn-group button[data-status]");

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
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "item-description";
    desc.textContent = report.description || "No description provided.";
    card.appendChild(desc);

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
            (activeStatus === "All" || item.status === activeStatus)
    );

    resultsHeading.textContent = `${visible.length} ${visible.length === 1 ? "item" : "items"} found`;

    if (visible.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No items match these filters.";
        container.appendChild(empty);
        return;
    }

    visible.forEach(renderItem);
}

// ---------- Filters ----------

function setupFilter(buttons, dataKey, onChange) {
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
            button.setAttribute("aria-pressed", "true");
            onChange(button.dataset[dataKey]);
            renderItems();
        });
    });
}

setupFilter(categoryButtons, "category", (value) => (activeCategory = value));
setupFilter(statusButtons, "status", (value) => (activeStatus = value));

// ---------- Report dialog ----------

reportBtn.addEventListener("click", () => {
    dialog.showModal();
});

cancelBtn.addEventListener("click", () => {
    form.reset();
    dialog.close();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const report = {
        id: nextId++,
        ...Object.fromEntries(new FormData(form)),
        status: "Lost",
    };

    lostItems.push(report);
    renderItems();

    form.reset();
    dialog.close();
});

renderItems();