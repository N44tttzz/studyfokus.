
// =====================================
// STUDY ISLAND
// Main JavaScript
// =====================================

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "studyIslandData";

const defaultData = {
  bells: 0,
  sessions: 0,
  minutes: 0,
  tasks: [],
  decorations: [],
  dailySessions: {},
  islandName: "Maple Island",
  islandItems: []
};

let data;

try {
  data = { ...defaultData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
} catch {
  data = { ...defaultData };
}

data.islandItems = Array.isArray(data.islandItems) ? data.islandItems : [];
data.islandName = typeof data.islandName === "string" && data.islandName.trim()
  ? data.islandName
  : "Maple Island";

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateDashboard();
}

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function updateDashboard() {
  const completedTasks = data.tasks.filter(task => task.done).length;

  $("sidebarBells").textContent = data.bells;
  $("sidebarSessions").textContent = data.sessions;
  $("topBells").textContent = data.bells;

  $("homeSessions").textContent = data.sessions;
  $("homeBells").textContent = data.bells;
  $("homeTasks").textContent = completedTasks;
  $("homeMinutes").textContent = data.minutes;

  $("rewardBells").textContent = data.bells;
  $("rewardSessions").textContent = data.sessions;

  renderHomeTasks();
  renderDeadlineReminders();
  renderTasks();
  renderWeeklyProgress();
  renderRewards();
  updateIslandProfileLabels();
  renderIslandEditor();
}

const islandDecorations = [
  { id: "tulips", name: "Tulip patch", icon: "🌷", cost: 20 },
  { id: "flowerbed", name: "Flower garden", icon: "🌼", cost: 35 },
  { id: "tree", name: "Apple tree", icon: "🌳", cost: 50 },
  { id: "pond", name: "Little pond", icon: "🪷", cost: 75 },
  { id: "cottage", name: "Cozy cottage", icon: "🏡", cost: 120 },
  { id: "lighthouse", name: "Lighthouse", icon: "🗼", cost: 180 }
];

let profile = {};
try {
  profile = JSON.parse(localStorage.getItem("studyIslandProfile") || "{}");
  if (!profile || typeof profile !== "object") profile = {};
} catch {
  profile = {};
}

let pendingProfilePicture = profile.picture || "";

function updateIslandProfileLabels() {
  const islandName = data.islandName || "Maple Island";
  $("islandNameDisplay").textContent = islandName;
  $("profileIsland").textContent = `Resident of ${islandName}`;
  const islandDecorDisplay = $("islandDecorDisplay");
  islandDecorDisplay.textContent = (data.islandItems || [])
    .filter(item => item && item.placed)
    .map(item => islandDecorations.find(option => option.id === item.id)?.icon || "")
    .join(" ");
  $("profileName").textContent = profile.username || "Island Student";
  const avatar = $("profileAvatar");
  if (profile.picture) {
    avatar.textContent = "";
    avatar.style.backgroundImage = `url("${profile.picture}")`;
    avatar.classList.add("has-profile-picture");
  } else {
    avatar.textContent = "🧑🏻‍🌾";
    avatar.style.backgroundImage = "";
    avatar.classList.remove("has-profile-picture");
  }
}

function renderIslandEditor() {
  const preview = $("islandPreview");
  const shop = $("islandShop");
  if (!preview || !shop) return;

  $("islandNameInput").value = data.islandName || "Maple Island";
  $("islandBells").textContent = data.bells;
  preview.innerHTML = "";

  const placedItems = (data.islandItems || []).filter(item => item && item.placed);
  if (!placedItems.length) {
    const empty = document.createElement("p");
    empty.className = "island-preview-empty";
    empty.textContent = "Your island is ready for its first decoration! 🌱";
    preview.appendChild(empty);
  } else {
    placedItems.forEach(item => {
      const decoration = islandDecorations.find(option => option.id === item.id);
      if (!decoration) return;
      const piece = document.createElement("span");
      piece.className = "island-preview-item";
      piece.textContent = decoration.icon;
      piece.title = decoration.name;
      preview.appendChild(piece);
    });
  }

  shop.innerHTML = "";
  islandDecorations.forEach(decoration => {
    const owned = (data.islandItems || []).find(item => item.id === decoration.id);
    const card = document.createElement("article");
    card.className = "island-shop-item";

    const icon = document.createElement("span");
    icon.className = "island-shop-icon";
    icon.textContent = decoration.icon;

    const details = document.createElement("div");
    details.className = "island-shop-details";
    const title = document.createElement("strong");
    title.textContent = decoration.name;
    const price = document.createElement("small");
    price.textContent = owned ? "Owned" : `🔔 ${decoration.cost} Bells`;
    details.append(title, price);

    const action = document.createElement("button");
    action.type = "button";
    if (!owned) {
      action.textContent = "Buy";
      action.disabled = data.bells < decoration.cost;
      action.addEventListener("click", () => {
        if (data.bells < decoration.cost) return;
        data.bells -= decoration.cost;
        data.islandItems.push({ id: decoration.id, placed: true });
        saveData();
        showToast(`${decoration.name} added to your island! ${decoration.icon}`);
      });
    } else {
      action.textContent = owned.placed ? "Take off" : "Place";
      action.addEventListener("click", () => {
        owned.placed = !owned.placed;
        saveData();
      });
    }
    card.append(icon, details, action);
    shop.appendChild(card);
  });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// =====================================
// DATE AND GREETING
// =====================================

function setDateAndGreeting() {
  const now = new Date();

  $("todayDate").textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).toUpperCase();

  $("dateChip").textContent = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });

  const hour = now.getHours();
  let greeting = "Good evening";

  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  $("greeting").textContent = `${greeting}, islander! 🌼`;
}

// =====================================
// PAGE NAVIGATION
// =====================================

function openPage(pageName) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const target = $(`${pageName}Page`);
  if (!target) return;

  target.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.go));
});

// =====================================
// TASK PLANNER
// =====================================

let currentFilter = "all";

$("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("taskTitle").value.trim();
  if (!title) return;

  data.tasks.unshift({
    id: Date.now(),
    title,
    subject: $("taskSubject").value,
    date: $("taskDate").value || todayKey(),
    done: false
  });

  $("taskForm").reset();
  $("taskDate").value = todayKey();

  saveData();
  showToast("A new mission was added! 🌱");
});

function toggleTask(id) {
  const task = data.tasks.find(item => item.id === id);
  if (!task) return;

  task.done = !task.done;
  saveData();

  if (task.done) showToast("Task completed! Well done! 🌷");
}

function deleteTask(id) {
  data.tasks = data.tasks.filter(task => task.id !== id);
  saveData();
  showToast("Task removed from your list.");
}

function renderTasks() {
  const container = $("taskList");
  const empty = $("emptyTasks");

  container.innerHTML = "";

  let tasks = data.tasks;

  if (currentFilter === "pending") {
    tasks = tasks.filter(task => !task.done);
  } else if (currentFilter === "done") {
    tasks = tasks.filter(task => task.done);
  }

  empty.style.display = tasks.length ? "none" : "block";

  tasks.forEach(task => {
    const row = document.createElement("div");
    row.className = `task-row ${task.done ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("strong");
    title.textContent = task.title;

    const detail = document.createElement("small");
    detail.textContent = `${task.subject} · ${task.date}`;

    info.append(title, detail);

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.textContent = "✕";
    remove.title = "Delete task";
    remove.addEventListener("click", () => deleteTask(task.id));

    row.append(checkbox, info, remove);
    container.appendChild(row);
  });
}

function renderHomeTasks() {
  const container = $("homeTaskList");
  container.innerHTML = "";

  const pending = data.tasks
    .filter(task => !task.done)
    .sort((a, b) => (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31"))
    .slice(0, 4);

  if (!pending.length) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "No pending tasks. Enjoy your peaceful island! 🌼";
    container.appendChild(message);
    return;
  }

  pending.forEach(task => {
    const row = document.createElement("div");
    row.className = "compact-task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "task-name";
    title.textContent = task.title;

    const subject = document.createElement("small");
    subject.textContent = `${task.subject} · Due ${task.date}`;

    row.append(checkbox, title, subject);
    container.appendChild(row);
  });
}

function renderDeadlineReminders() {
  const container = $("deadlineReminders");
  if (!container) return;

  container.innerHTML = "";

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const upcoming = data.tasks
    .filter(task => !task.done && task.date)
    .map(task => {
      const [year, month, day] = task.date.split("-").map(Number);
      const dueUtc = Date.UTC(year, month - 1, day);
      const daysLeft = Math.round((dueUtc - todayUtc) / 86400000);
      return { ...task, daysLeft };
    })
    .filter(task => task.daysLeft >= 1 && task.daysLeft <= 3)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (!upcoming.length) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "No deadlines coming up in the next 3 days. Keep enjoying your island! 🌱";
    container.appendChild(message);
    return;
  }

  upcoming.forEach(task => {
    const reminder = document.createElement("div");
    const urgent = task.daysLeft === 1;
    reminder.className = `deadline-reminder ${urgent ? "urgent" : "approaching"}`;

    const icon = document.createElement("span");
    icon.textContent = urgent ? "🔔" : "🌼";

    const details = document.createElement("div");
    details.className = "deadline-details";

    const title = document.createElement("strong");
    title.textContent = task.title;

    const subject = document.createElement("small");
    subject.textContent = `${task.subject} · Due ${task.date}`;

    const timing = document.createElement("b");
    timing.className = "deadline-timing";
    timing.textContent = urgent ? "1 day left · Urgent" : `${task.daysLeft} days left · Coming up`;

    details.append(title, subject);
    reminder.append(icon, details, timing);
    container.appendChild(reminder);
  });
}

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn === button);
    });

    renderTasks();
  });
});

// =====================================
// POMODORO TIMER
// =====================================

let timerMode = "focus";
let remainingSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let flowStartTime = null;

const modeNames = {
  focus: "TIME TO FOCUS",
  short: "TAKE A BREATHER",
  long: "LONG BREAK TIME"
};

function getModeDuration(mode) {
  if (mode === "focus") {
    return Math.max(1, Math.min(120, Number($("focusDuration").value) || 25)) * 60;
  }

  if (mode === "short") {
    return Math.max(1, Math.min(60, Number($("breakDuration").value) || 5)) * 60;
  }

  return 15 * 60;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  const time = formatTime(remainingSeconds);
  document.title = `${time} | FOKUS.`;
  $("timerDisplay").textContent = time;
  $("timerLabel").textContent = modeNames[timerMode];

  $("timerSubtext").textContent =
    timerMode === "focus" ? "You've got this 🌱" : "Rest is productive too 🌷";

  const total = getModeDuration(timerMode);
  const progress = total > 0 ? remainingSeconds / total : 0;
  const degrees = Math.max(0, Math.min(360, progress * 360));

  const color = timerMode === "focus" ? "#84a97b" : "#e4c77d";

  $("timerCircle").style.background =
    `conic-gradient(${color} ${degrees}deg, #edf1e9 ${degrees}deg)`;

  $("startTimer").textContent = timerRunning ? "Ⅱ Pause" :
    (remainingSeconds === 0 ? "▶ Start again" : "▶ Start focus");
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;

  updateTimerDisplay();
  updateRiverState();
}

function setTimerMode(mode) {
  stopTimer();

  timerMode = mode;
  remainingSeconds = getModeDuration(mode);

  document.querySelectorAll(".timer-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  updateTimerDisplay();
  updateRiverState();
}

function completeFocusSession() {
  const duration = Math.round(getModeDuration("focus") / 60);

  data.sessions += 1;
  data.minutes += duration;
  data.bells += 10;

  const key = todayKey();
  data.dailySessions[key] = (data.dailySessions[key] || 0) + 1;

  saveData();
  showToast("Focus session complete! +10 Bells 🔔");

  setTimerMode("short");
}

function timerTick() {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    updateTimerDisplay();
  }

  if (remainingSeconds <= 0) {
    stopTimer();

    if (timerMode === "focus") {
      completeFocusSession();
    } else {
      showToast("Break finished. Ready when you are! 🌿");
      setTimerMode("focus");
    }
  }
}

$("startTimer").addEventListener("click", () => {
  if (timerRunning) {
    stopTimer();
    return;
  }

  if (remainingSeconds <= 0) {
    remainingSeconds = getModeDuration(timerMode);
  }

timerRunning = true;

updateTimerDisplay();
updateRiverState();

  timerInterval = setInterval(timerTick, 1000);
});

$("resetTimer").addEventListener("click", () => {
  stopTimer();
  remainingSeconds = getModeDuration(timerMode);
  updateTimerDisplay();
});

$("skipTimer").addEventListener("click", () => {
  stopTimer();

  if (timerMode === "focus") {
    setTimerMode("short");
  } else {
    setTimerMode("focus");
  }

  showToast("Timer mode changed.");
});

document.querySelectorAll(".timer-tab").forEach(button => {
  button.addEventListener("click", () => setTimerMode(button.dataset.mode));
});

$("focusDuration").addEventListener("change", () => {
  if (!timerRunning && timerMode === "focus") {
    remainingSeconds = getModeDuration("focus");
    updateTimerDisplay();
  }
});

$("breakDuration").addEventListener("change", () => {
  if (!timerRunning && timerMode === "short") {
    remainingSeconds = getModeDuration("short");
    updateTimerDisplay();
  }
});

// =====================================
// STUDY METHODS
// =====================================

const methodInfo = {
  pomodoro: {
    title: "⏳ Pomodoro Technique",
    description: "Best for tasks that feel overwhelming or need steady concentration.",
    steps: [
      "Choose one specific task.",
      "Focus for 25 minutes without distractions.",
      "Take a 5-minute break.",
      "After four focus sessions, take a longer 15–30 minute break."
    ],
    tip: "Try this for homework, reading, or practice exercises."
  },
  flowtime: {
    title: "🌊 Flowtime Technique",
    description: "Best when you prefer flexible study sessions without a fixed timer.",
    steps: [
      "Choose one task and start working.",
      "Keep track of your start time.",
      "Stop when your concentration naturally drops.",
      "Take a break based on how long you worked."
    ],
    tip: "Try this for essays, projects, or creative assignments."
  },
  recall: {
    title: "🧠 Active Recall",
    description: "Best for remembering facts, definitions, and concepts.",
    steps: [
      "Read a small section of your notes.",
      "Close your book or hide your notes.",
      "Write or say everything you can remember.",
      "Check your notes and identify what you missed.",
      "Repeat after a short break."
    ],
    tip: "Try flashcards, blank-page summaries, or self-made questions."
  },
  spaced: {
    title: "🗓️ Spaced Repetition",
    description: "Best for information you need to remember over a longer period.",
    steps: [
      "Learn a topic today.",
      "Review it the next day.",
      "Review it again after a few days.",
      "Return to it after a week.",
      "Spend more time on information you find difficult."
    ],
    tip: "A flashcard app or a simple review calendar can help."
  },
  feynman: {
    title: "💬 Feynman Technique",
    description: "Best for understanding complicated ideas in simple language.",
    steps: [
      "Choose one concept.",
      "Explain it in simple words, as if teaching a beginner.",
      "Notice where your explanation becomes confusing.",
      "Return to your notes to fill the gaps.",
      "Explain it again using simpler words."
    ],
    tip: "If you cannot explain it simply, identify which part you still need to understand."
  }
};

document.querySelectorAll(".use-method").forEach(button => {
  button.addEventListener("click", () => {
    const method = methodInfo[button.dataset.method];

    if (button.dataset.method === "pomodoro") {
      openPage("focus");
      setTimerMode("focus");
      showToast("Pomodoro timer is ready! 🍅");
      return;
    }

    if (button.dataset.method === "flowtime") {
      openPage("focus");
      setTimerMode("focus");
      showToast("Use the timer as a flexible tracker for Flowtime.");
    }

    const detail = $("methodDetail");
    detail.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = method.title;

    const description = document.createElement("p");
    description.textContent = method.description;

    const list = document.createElement("ol");
    method.steps.forEach(step => {
      const item = document.createElement("li");
      item.textContent = step;
      list.appendChild(item);
    });

    const tip = document.createElement("p");
    tip.textContent = "🌱 " + method.tip;

    detail.append(heading, description, list, tip);
    detail.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

// =====================================
// WEEKLY PROGRESS
// =====================================

function renderWeeklyProgress() {
  const container = $("weeklyDays");
  container.innerHTML = "";

  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  labels.forEach((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const key = todayKey(date);
    const sessions = data.dailySessions[key] || 0;

    const card = document.createElement("div");
    card.className = "week-day";

    if (key === todayKey()) card.classList.add("today");

    const dayLabel = document.createElement("span");
    dayLabel.textContent = label;

    const dateNumber = document.createElement("strong");
    dateNumber.textContent = date.getDate();

    const flowers = document.createElement("small");
    flowers.className = "week-day-flowers";
    flowers.textContent = sessions ? "🌼".repeat(Math.min(sessions, 3)) : "·";

    const dueTasks = data.tasks.filter(task => task.date === key);
    const taskList = document.createElement("ul");
    taskList.className = "week-day-tasks";

    dueTasks.forEach(task => {
      const item = document.createElement("li");
      item.textContent = task.title;
      if (task.done) item.classList.add("done");
      taskList.appendChild(item);
    });

    if (!dueTasks.length) {
      const item = document.createElement("li");
      item.className = "no-week-tasks";
      item.textContent = "No tasks";
      taskList.appendChild(item);
    }

    card.append(dayLabel, dateNumber, flowers, taskList);
    container.appendChild(card);
  });
}

// =====================================
// ISLAND REWARDS
// =====================================

const rewards = [
  { id: "flower", name: "Flower Patch", icon: "🌼", cost: 20, description: "A cheerful little garden." },
  { id: "bench", name: "Garden Bench", icon: "🪑", cost: 50, description: "A cozy place to rest." },
  { id: "lamp", name: "Mushroom Lamp", icon: "🍄", cost: 75, description: "A warm island glow." },
  { id: "tree", name: "Fruit Tree", icon: "🍎", cost: 100, description: "A new tree for your island." },
  { id: "fountain", name: "Little Fountain", icon: "⛲", cost: 150, description: "A peaceful island corner." },
  { id: "house", name: "Cozy Cottage", icon: "🏡", cost: 200, description: "Your very own island home." },
  { id: "star", name: "Star Garden", icon: "🌟", cost: 300, description: "A special glowing garden." },
  { id: "castle", name: "Dreamy Island Castle", icon: "🏰", cost: 500, description: "A magical island landmark." }
];

function renderRewards() {
  const container = $("rewardsGrid");
  if (!container) return;

  container.innerHTML = "";

  rewards.forEach(reward => {
    const unlocked = data.decorations.includes(reward.id);
    const canAfford = data.bells >= reward.cost;

    const card = document.createElement("article");
    card.className = `reward-card ${unlocked ? "unlocked" : ""}`;

    const art = document.createElement("div");
    art.className = "reward-art";
    art.textContent = reward.icon;

    const title = document.createElement("h3");
    title.textContent = reward.name;

    const description = document.createElement("p");
    description.textContent = reward.description;

    const cost = document.createElement("div");
    cost.className = "cost";
    cost.textContent = unlocked ? "✓ Collected" : `🔔 ${reward.cost} Bells`;

    const button = document.createElement("button");

    if (unlocked) {
      button.textContent = "In your collection";
      button.disabled = true;
    } else {
      button.textContent = canAfford ? "Unlock reward" : "Keep collecting";
      button.disabled = !canAfford;

      button.addEventListener("click", () => {
        if (data.bells < reward.cost) return;

        data.bells -= reward.cost;
        data.decorations.push(reward.id);

        saveData();
        showToast(`${reward.name} added to your island! ${reward.icon}`);
      });
    }

    card.append(art, title, description, cost, button);
    container.appendChild(card);
  });
}

// =====================================
// FOCUS ATMOSPHERE
// =====================================


/* =====================================
   BACKGROUND AMBIENT SOUNDS
   Generated using Web Audio API
===================================== */

let audioContext = null;
let ambientNodes = [];
let ambientSound = "none";
let ambientVolume = 0.35;

function createAudioContext() {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      showToast("Your browser does not support audio.");
      return false;
    }

    audioContext = new AudioContextClass();
  }

  return true;
}

function stopAmbientSound() {
  ambientNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      node.disconnect();
    } catch {}
  });

  ambientNodes = [];
}

function makeNoise() {
  const length = audioContext.sampleRate * 3;
  const buffer = audioContext.createBuffer(
    1,
    length,
    audioContext.sampleRate
  );

  const channel = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    channel[i] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  return source;
}

function addNoise(filterType, frequency, volume, modulation = 0) {
  const source = makeNoise();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  filter.type = filterType;
  filter.frequency.value = frequency;

  gain.gain.value = volume * ambientVolume;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  source.start();

  ambientNodes.push(source, filter, gain);

  if (modulation > 0) {
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    lfo.frequency.value = modulation;
    lfoGain.gain.value = volume * ambientVolume * 0.35;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    lfo.start();
    ambientNodes.push(lfo, lfoGain);
  }
}

function addTone(frequency, volume, type = "sine") {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume * ambientVolume;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();

  ambientNodes.push(oscillator, gain);
}

function playAmbientSound(sound) {
  stopAmbientSound();

  ambientSound = sound;

  if (sound === "none") {
    return;
  }

  if (!createAudioContext()) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  switch (sound) {
    case "rain":
      // Soft rainfall
      addNoise("lowpass", 2200, 0.17, 0.15);
      addNoise("highpass", 4500, 0.035);
      break;

    case "cafe":
      // Warm café room atmosphere
      addNoise("lowpass", 500, 0.12, 0.08);
      addNoise("bandpass", 950, 0.025);
      addTone(110, 0.008, "sine");
      break;

    case "library":
      // Quiet indoor room ambience
      addNoise("lowpass", 350, 0.055);
      addNoise("highpass", 1600, 0.008);
      break;

    case "fireplace":
      // Gentle fire crackling approximation
      addNoise("lowpass", 700, 0.10, 0.6);
      addNoise("highpass", 3500, 0.025, 1.1);
      break;

    case "ocean":
      // Gentle flowing ocean water
      addNoise("lowpass", 800, 0.18, 0.09);
      addNoise("bandpass", 500, 0.055, 0.06);
      break;

    case "forest":
      // Soft wind with occasional birdlike tones
      addNoise("lowpass", 900, 0.08, 0.12);
      addTone(880, 0.006, "sine");
      break;
  }
}

function updateSoundVolume(value) {
  ambientVolume = Number(value) / 100;

  $("volumeValue").textContent = `${value}%`;

  if (ambientSound !== "none") {
    playAmbientSound(ambientSound);
  }
}

const soundMessages = {
  none: "Enjoy a peaceful, quiet session.",
  rain: "Rain is falling outside. 🌧️",
  forest: "Listen to the peaceful forest. 🐦",
  cafe: "Welcome to your cozy island café. ☕",
  library: "A peaceful library atmosphere. 📚",
  fireplace: "Get cozy by the fireplace. 🔥",
  ocean: "Listen to the gentle ocean waves. 🌊"
};

document.querySelectorAll(".sound-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".sound-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    const sound = button.dataset.sound;

    playAmbientSound(sound);

    $("soundNote").textContent = soundMessages[sound];
  });
});

const soundVolumeControl = $("soundVolume");
if (soundVolumeControl) {
  soundVolumeControl.addEventListener("input", event => {
    updateSoundVolume(event.target.value);
  });
}


/* =====================================
   LAZY RIVER CHARACTER
===================================== */

let selectedCharacter = localStorage.getItem("studyIslandCharacter") || "male";

const characters = {
  male: "👦",
  female: "👧"
};

if (characters[selectedCharacter]) {
  $("characterEmoji").textContent = characters[selectedCharacter];
  document.querySelectorAll(".character-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.character === selectedCharacter);
  });
} else {
  selectedCharacter = "male";
}

document.querySelectorAll(".character-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".character-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedCharacter = button.dataset.character;
    localStorage.setItem("studyIslandCharacter", selectedCharacter);

    $("characterEmoji").textContent =
      characters[selectedCharacter];

    showToast("Your new floatie character is ready! 🛟");
  });
});

// Toggle ocean ambience from the river

let riverSoundEnabled = false;

$("riverSound").addEventListener("click", () => {
  if (!riverSoundEnabled) {
    riverSoundEnabled = true;

    document.querySelectorAll(".sound-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sound === "ocean");
    });

    playAmbientSound("ocean");

    $("soundNote").textContent = soundMessages.ocean;
    $("riverSound").textContent = "🔕 Turn off ocean sounds";

    showToast("Ocean sounds enabled! 🌊");
  } else {
    riverSoundEnabled = false;

    playAmbientSound("none");

    document.querySelectorAll(".sound-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sound === "none");
    });

    $("soundNote").textContent = soundMessages.none;
    $("riverSound").textContent = "🌊 Enable ocean sounds";

    showToast("Ocean sounds turned off.");
  }
});

// Synchronize the river animation with the timer

function updateRiverState() {
  const river = $("lazyRiver");

  if (timerRunning && timerMode === "focus") {
    river.classList.add("running");
    $("riverStatus").textContent = "You're floating and focusing! 🌊";
  } else if (timerMode !== "focus") {
    river.classList.remove("running");
    $("riverStatus").textContent = "Enjoy your little break! 🌷";
  } else {
    river.classList.remove("running");
    $("riverStatus").textContent = "Your floatie is waiting! 🛟";
  }
}



/* =====================================
   CUSTOMIZABLE BANNER
===================================== */

const banner = document.querySelector(".welcome-banner");
const bannerEditor = $("bannerEditor");

const defaultBanner = {
  title: "Your island is waiting<br>for you! 🌴",
  subtitle: "Take a breath, grab your notes, and let's make today count."
};

let customBannerImage = "";

function applyBanner() {
  const saved = localStorage.getItem("studyIslandBanner");

  if (saved) {
    try {
      const settings = JSON.parse(saved);

      $("bannerTitle").value = settings.title || "";
      $("bannerSubtitle").value = settings.subtitle || "";
      customBannerImage = settings.image || "";

      if (customBannerImage) {
        banner.style.backgroundImage = `url("${customBannerImage}")`;
        banner.classList.add("custom-banner");
      }

      updateBannerText(settings.title, settings.subtitle);
    } catch {
      localStorage.removeItem("studyIslandBanner");
    }
  }
}

function updateBannerText(title, subtitle) {
  const heading = document.querySelector(".welcome-text h2");
  const description = document.querySelector(".welcome-text > p");

  if (heading) {
    heading.textContent = title;
  }

  if (description) {
    description.textContent = subtitle;
  }
}

$("openBannerEditor").addEventListener("click", () => {
  bannerEditor.hidden = !bannerEditor.hidden;
});

$("bannerUpload").addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file || !file.type.startsWith("image/")) {
    showToast("Please choose a valid picture.");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast("Please choose an image smaller than 10 MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = event => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 1200;

      const scale = Math.min(1, maxWidth / image.width);

      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      customBannerImage = canvas.toDataURL("image/jpeg", 0.78);

      banner.style.backgroundImage = `url("${customBannerImage}")`;
      banner.classList.add("custom-banner");

      showToast("Banner preview updated! 🌷");
    };

    image.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

$("saveBanner").addEventListener("click", () => {
  const title = $("bannerTitle").value.trim() || defaultBanner.title;
  const subtitle = $("bannerSubtitle").value.trim() || defaultBanner.subtitle;

  try {
    const settings = {
      title,
      subtitle,
      image: customBannerImage
    };

    localStorage.setItem("studyIslandBanner", JSON.stringify(settings));

    updateBannerText(title, subtitle);
    bannerEditor.hidden = true;

    showToast("Your island banner has been saved! 🌼");
  } catch {
    showToast("Image storage is full. Try a smaller image.");
  }
});

$("resetBanner").addEventListener("click", () => {
  localStorage.removeItem("studyIslandBanner");

  customBannerImage = "";
  banner.style.backgroundImage = "";
  banner.classList.remove("custom-banner");

  $("bannerUpload").value = "";
  $("bannerTitle").value = "Your island is waiting for you! 🌴";
  $("bannerSubtitle").value = defaultBanner.subtitle;

  updateBannerText(defaultBanner.title.replace("<br>", " "), defaultBanner.subtitle);

  bannerEditor.hidden = true;

  showToast("Your original banner is back! 🌱");
});


// =====================================
// PROFILE AND ISLAND CUSTOMIZATION
// =====================================

function openProfileEditor(isFirstVisit = false) {
  $("profileModalTitle").textContent = isFirstVisit ? "Welcome to FOKUS. 🌱" : "Edit your profile 🌼";
  $("profilePrompt").textContent = isFirstVisit
    ? "Write down your username to get started."
    : "Choose the name and picture shown on your island.";
  $("usernameInput").value = profile.username || "";
  $("cancelProfile").hidden = isFirstVisit;
  pendingProfilePicture = profile.picture || "";
  $("profilePictureInput").value = "";
  $("profileModal").hidden = false;
  $("usernameInput").focus();
}

$("openProfileEditor").addEventListener("click", () => openProfileEditor(false));
$("saveProfile").addEventListener("click", () => {
  const username = $("usernameInput").value.trim();
  if (!username) {
    showToast("Please enter a username first.");
    $("usernameInput").focus();
    return;
  }

  try {
    profile = { username, picture: pendingProfilePicture };
    localStorage.setItem("studyIslandProfile", JSON.stringify(profile));
    updateIslandProfileLabels();
    $("profileModal").hidden = true;
    showToast(`Welcome, ${username}! 🌱`);
  } catch {
    showToast("Could not save your profile picture. Try a smaller image.");
  }
});

$("cancelProfile").addEventListener("click", () => {
  $("profileModal").hidden = true;
});

$("profilePictureInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please choose a valid picture.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 400 / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      pendingProfilePicture = canvas.toDataURL("image/jpeg", 0.75);
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

$("openIslandEditor").addEventListener("click", () => {
  renderIslandEditor();
  $("islandModal").hidden = false;
});
$("closeIslandEditor").addEventListener("click", () => {
  $("islandModal").hidden = true;
});
$("islandModal").addEventListener("click", event => {
  if (event.target === $("islandModal")) $("islandModal").hidden = true;
});
$("saveIslandName").addEventListener("click", () => {
  const name = $("islandNameInput").value.trim();
  if (!name) {
    showToast("Give your island a name first.");
    $("islandNameInput").focus();
    return;
  }
  data.islandName = name;
  saveData();
  showToast(`Welcome to ${name}! 🏝️`);
});

// =====================================
// INITIALIZE
// =====================================

$("taskDate").value = todayKey();

setDateAndGreeting();
applyBanner();
updateDashboard();
setTimerMode("focus");
if (!profile.username || !profile.username.trim()) openProfileEditor(true);
