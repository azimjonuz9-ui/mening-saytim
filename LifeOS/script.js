/* ============================
   NAVIGATSIYA (Sidebar / Pages)
============================ */
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const pageName = document.getElementById("pageName");

function openPage(pageId) {
    pages.forEach(page => {
        page.classList.remove("active");
    });

    navButtons.forEach(btn => {
        btn.classList.remove("active");
    });

    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add("active");
    }

    const button = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
    if (button) {
        button.classList.add("active");
        pageName.textContent = button.textContent.trim();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const page = button.dataset.page;
        openPage(page);

        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.classList.remove("show");
        }
    });
});

const mobileMenu = document.getElementById("mobileMenu");
if (mobileMenu) {
    mobileMenu.addEventListener("click", () => {
        document.querySelector(".sidebar").classList.toggle("show");
    });
}

/* ============================
   AI CHAT (Pollinations.ai — bepul, kalit shart emas)
============================ */
const chatInput = document.getElementById("chatInput");

if (chatInput) {
    chatInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatInput.value = "";

    const typingId = showTyping();

    try {
        const answer = await getAIResponse(text);
        removeTyping(typingId);
        addMessage(answer, "ai");
    } catch (err) {
        removeTyping(typingId);
        addMessage("Xatolik yuz berdi. Internet aloqasini tekshiring va qayta urinib ko'ring.", "ai");
    }
}

async function getAIResponse(text) {
    const prompt = encodeURIComponent(text);
    const url = `https://text.pollinations.ai/${prompt}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("AI response failed");
    }

    const answer = await response.text();
    return answer.trim();
}

function showTyping() {
    const messages = document.getElementById("chatMessages");
    const div = document.createElement("div");
    const id = "typing-" + Date.now();

    div.className = "message ai";
    div.id = id;
    div.innerHTML = `
        <div class="message-avatar">✦</div>
        <div class="message-content">
            <b>LifeOS AI</b>
            <p>Yozmoqda...</p>
        </div>
    `;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function addMessage(text, type) {
    const messages = document.getElementById("chatMessages");

    const div = document.createElement("div");
    div.className = `message ${type}`;

    div.innerHTML = `
        <div class="message-avatar">
            ${type === "ai" ? "✦" : "A"}
        </div>
        <div class="message-content">
            <b>${type === "ai" ? "LifeOS AI" : "You"}</b>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/* ============================
   FAYL / PDF ANALYZER
============================ */
const fileInput = document.getElementById("fileInput");

if (fileInput) {
    fileInput.addEventListener("change", function () {
        if (!this.files.length) return;

        const file = this.files[0];

        document.getElementById("fileResult").innerHTML = `
            <p><b>${escapeHTML(file.name)}</b> yuklandi.</p>
            <p>Hajmi: ${(file.size / 1024).toFixed(1)} KB</p>
            <p>Turi: ${escapeHTML(file.type || "noma'lum")}</p>
        `;
    });
}

/* ============================
   TRANSLATOR (MyMemory API — bepul, kalit shart emas)
============================ */
const LANG_CODES = {
    "Uzbek": "uz",
    "English": "en",
    "Russian": "ru",
    "Turkish": "tr"
};

async function translateText() {
    const input = document.getElementById("translateInput").value;
    const from = document.getElementById("fromLang").value;
    const to = document.getElementById("toLang").value;
    const output = document.getElementById("translateOutput");

    if (!input.trim()) {
        output.value = "Avval matn kiriting.";
        return;
    }

    if (from === to) {
        output.value = input;
        return;
    }

    output.value = "Tarjima qilinmoqda...";

    const fromCode = LANG_CODES[from] || "en";
    const toCode = LANG_CODES[to] || "en";
    const langpair = `${fromCode}|${toCode}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=${langpair}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Translation failed");
        }

        const data = await response.json();

        if (data && data.responseData && data.responseData.translatedText) {
            output.value = data.responseData.translatedText;
        } else {
            throw new Error("No translation returned");
        }
    } catch (err) {
        output.value = "Tarjima qilishda xatolik yuz berdi. Internet aloqasini tekshiring.";
    }
}

/* ============================
   CALCULATOR
============================ */
let calcExpression = "";

function calcInput(value) {
    if (calcExpression === "" && ["+", "*", "/"].includes(value)) {
        return;
    }

    calcExpression += value;
    document.getElementById("calcDisplay").value = calcExpression;
}

function clearCalc() {
    calcExpression = "";
    document.getElementById("calcDisplay").value = "0";
}

function calculate() {
    try {
        if (!/^[0-9+\-*/().\s]+$/.test(calcExpression)) {
            throw new Error("Invalid expression");
        }

        const result = Function(`"use strict"; return (${calcExpression})`)();

        calcExpression = String(result);
        document.getElementById("calcDisplay").value = result;

    } catch {
        document.getElementById("calcDisplay").value = "Error";
        calcExpression = "";
    }
}

/* ============================
   AI VISION
============================ */
const imageInput = document.getElementById("imageInput");

if (imageInput) {
    imageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const image = document.getElementById("previewImage");
        image.src = URL.createObjectURL(file);
        image.style.display = "block";
    });
}

/* ============================
   YOLO DETECTION
============================ */
function startDetection() {
    const result = document.getElementById("detectionResult");
    result.textContent = "Detection engine ishga tushdi. Real YOLO modelini backend orqali ulash mumkin.";
}

/* ============================
   SECURITY CHECK
============================ */
function securityScan() {
    const result = document.getElementById("securityResult");
    result.textContent = "✓ Basic security diagnostic completed. Real vulnerability scanner hali ulanmagan.";
}

/* ============================
   PLANNER
============================ */
let tasks = [];

function addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (!text) return;

    tasks.push(text);
    input.value = "";
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const div = document.createElement("div");
        div.className = "task";

        div.innerHTML = `
            <span>${escapeHTML(task)}</span>
            <button onclick="deleteTask(${index})">Delete</button>
        `;

        list.appendChild(div);
    });
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}
