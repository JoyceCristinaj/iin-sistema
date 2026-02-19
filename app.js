"use strict";

if (!crypto.randomUUID) {
  crypto.randomUUID = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

const STORAGE_KEY = "iin-system-v8";
const SESSION_KEY = "iin-session-v8";

const PROJECTS = [
  { key: "light", label: "Light", processNumber: "SEI-300001/002142/2023", subtitle: "PROJETO: LUTA ESCOLA DA VIDA ANO 3 - LIGHT ANO 2" },
  { key: "enel", label: "Enel", processNumber: "SEI-300001/002142/2023", subtitle: "PROJETO: LUTA: ESCOLA DA VIDA ANO 4- ENEL ANO 2" },
  { key: "supergasbras", label: "Supergasbras", processNumber: "SEI-300001/002142/2023", subtitle: "PROJETO: LUTA: ESCOLA DA VIDA RIO DE JANEIRO - SUPERGASBRAS ANO 2" },
];

const PROJECT_NUCLEI = {
  light: ["Campo Grande", "Jacarezinho", "Penha", "Santa Cruz"],
  enel: ["Macaé"],
  supergasbras: ["Freguesia", "Realengo"],
};

const PROJECT_MODALITIES = {
  light: ["Boxe", "Muay Thai", "Jiu Jitso"],
  enel: ["Jiu Jitso", "Muay Thai"],
  supergasbras: ["Boxe", "Jiu Jitso"],
};

const STOCK_CATEGORIES = [
  { key: "camiseta", label: "Camiseta" },
  { key: "shorts", label: "Shorts" },
  { key: "kimono", label: "Kimono" },
  { key: "bandagem", label: "Bandagem" },
  { key: "protetor_bucal", label: "Protetor bucal" },
];

const MODALITY_ITEMS = {
  "Jiu Jitso": ["camiseta", "kimono"],
  Boxe: ["camiseta", "shorts", "bandagem", "protetor_bucal"],
  "Muay Thai": ["camiseta", "shorts", "bandagem", "protetor_bucal"],
};

const state = {
  students: [],
  visitors: [],
  users: [],
  history: [],

  uniformStockByProject: {},
  classDaysByProject: {},
  attendanceStaffByProject: {},
  planningByProject: {},
  classLocksByProject: {},

  sessionUserId: null,
  currentProjectKey: "light",
  search: "",
  attendanceFilter: "todos",
  uniformFilter: "todos",
  activeTab: "tab-dashboard",
};

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  appShell: document.getElementById("appShell"),

  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginProject: document.getElementById("loginProject"),
  loginMessage: document.getElementById("loginMessage"),

  logoutBtn: document.getElementById("logoutBtn"),
  welcomeTitle: document.getElementById("welcomeTitle"),
  projectSubtitle: document.getElementById("projectSubtitle"),

  tabsBar: document.getElementById("tabsBar"),
  tabPages: ["tab-dashboard","tab-professor","tab-gestao","tab-relatorios","tab-admin"]
    .map((id) => document.getElementById(id)),

  dashBadge: document.getElementById("dashBadge"),
  dashNucleusFilter: document.getElementById("dashNucleusFilter"),
  dashChart: document.getElementById("dashChart"),

  professorNucleusBadge: document.getElementById("professorNucleusBadge"),
  professorBoard: document.getElementById("professorBoard"),
  professorHistory: document.getElementById("professorHistory"),
  professorHistoryDate: document.getElementById("professorHistoryDate"),

  professorClassDate: document.getElementById("professorClassDate"),
  professorClassSchedule: document.getElementById("professorClassSchedule"),
  professorClassProfessorName: document.getElementById("professorClassProfessorName"),
  professorClassMonitorName: document.getElementById("professorClassMonitorName"),
  professorClassSave: document.getElementById("professorClassSave"),
  professorClassStatus: document.getElementById("professorClassStatus"),
  endClassBtn: document.getElementById("endClassBtn"),
  classLockBadge: document.getElementById("classLockBadge"),

  planningForm: document.getElementById("planningForm"),
  planningWeek: document.getElementById("planningWeek"),
  planningTheme: document.getElementById("planningTheme"),
  planningGoals: document.getElementById("planningGoals"),
  planningActivities: document.getElementById("planningActivities"),
  planningList: document.getElementById("planningList"),

  attendanceSearch: document.getElementById("attendanceSearch"),
  attendanceCardTemplate: document.getElementById("attendanceCardTemplate"),

  totalStudents: document.getElementById("totalStudents"),
  presentCount: document.getElementById("presentCount"),
  absentCount: document.getElementById("absentCount"),
  uniformDelivered: document.getElementById("uniformDelivered"),

  nucleusCounts: document.getElementById("nucleusCounts"),
  nucleusCountBadge: document.getElementById("nucleusCountBadge"),

  studentForm: document.getElementById("studentForm"),
  studentSchedule: document.getElementById("studentSchedule"),
  studentModality: document.getElementById("studentModality"),

  classCalendarForm: document.getElementById("classCalendarForm"),
  classCalendarBoard: document.getElementById("classCalendarBoard"),
  calendarStartTimes: Array.from({ length: 6 }, (_, i) => document.getElementById(`calendarStartTime${i + 1}`)),
  calendarEndTimes: Array.from({ length: 6 }, (_, i) => document.getElementById(`calendarEndTime${i + 1}`)),

  attendanceNucleusFilter: document.getElementById("attendanceNucleusFilter"),
  attendanceReportBoard: document.getElementById("attendanceReportBoard"),

  uniformNucleusFilter: document.getElementById("uniformNucleusFilter"),
  uniformTableBody: document.getElementById("uniformTableBody"),

  stockView: document.getElementById("stockView"),
  alertsBoard: document.getElementById("alertsBoard"),

  whatsForm: document.getElementById("whatsForm"),
  whatsStudent: document.getElementById("whatsStudent"),
  whatsMessage: document.getElementById("whatsMessage"),
  whatsStatus: document.getElementById("whatsStatus"),

  visitorsBadge: document.getElementById("visitorsBadge"),
  visitorForm: document.getElementById("visitorForm"),
  visitorName: document.getElementById("visitorName"),
  visitorNucleus: document.getElementById("visitorNucleus"),
  visitorDate: document.getElementById("visitorDate"),
  visitorContact: document.getElementById("visitorContact"),
  visitorNotes: document.getElementById("visitorNotes"),
  visitorsList: document.getElementById("visitorsList"),

  userForm: document.getElementById("userForm"),
  usersTableBody: document.getElementById("usersTableBody"),
  newRole: document.getElementById("newRole"),

  stockForm: document.getElementById("stockForm"),

  adminReportPeriod: document.getElementById("adminReportPeriod"),
  adminReportNucleusFilter: document.getElementById("adminReportNucleusFilter"),
  adminReportRangeInfo: document.getElementById("adminReportRangeInfo"),
  adminGenerateReportBtn: document.getElementById("adminGenerateReportBtn"),
  adminPrintReportBtn: document.getElementById("adminPrintReportBtn"),
  adminReportStatus: document.getElementById("adminReportStatus"),
};

init();

function init() {
  loadData();
  loadSession();

  hydrateProjectSelects();
  hydrateNucleusSelects();
  hydrateStudentScheduleOptions();
  hydrateStudentModalityOptions();

  bindEvents();
  render();
  updateReportRangeInfo();
}

function currentProject() {
  return PROJECTS.find((p) => p.key === state.currentProjectKey) || PROJECTS[0];
}

function getVisibleNuclei(projectKey = state.currentProjectKey) {
  return PROJECT_NUCLEI[projectKey] || [];
}

function labelRole(role) {
  if (role === "admin") return "Administrador";
  if (role === "gestao") return "Gestão Interna";
  return "Professor";
}

function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(iso) {
  if (!iso) return "-";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ========= FREQUÊNCIA ========= */
function ensureAttendanceLog(student) {
  if (!Array.isArray(student.attendanceLog)) student.attendanceLog = [];
  return student.attendanceLog;
}
function upsertAttendanceLog(student, dateISO, status) {
  const log = ensureAttendanceLog(student);
  const key = `${state.currentProjectKey}|${dateISO}`;
  const idx = log.findIndex((x) => x.key === key);
  const row = { key, project: state.currentProjectKey, date: dateISO, status };
  if (idx === -1) log.push(row);
  else log[idx] = row;
}
function frequencyOf(student) {
  const log = ensureAttendanceLog(student).filter((x) => x.project === state.currentProjectKey);
  const total = log.length;
  const present = log.filter((x) => x.status === "presente" || x.status === "justificado").length;
  const pct = total ? Math.round((present / total) * 100) : 0;
  return { present, total, pct };
}

/* ========= KIT ========= */
function labelStockCategory(categoryKey) {
  return STOCK_CATEGORIES.find((item) => item.key === categoryKey)?.label || categoryKey;
}
function getAllowedItemsByModality(modality) {
  return MODALITY_ITEMS[modality] || [];
}
function createEmptyDeliveryItems() {
  return Object.fromEntries(STOCK_CATEGORIES.map((item) => [item.key, false]));
}
function normalizeDeliveryItems(student) {
  const allowed = getAllowedItemsByModality(student.modality);
  const base = createEmptyDeliveryItems();
  const saved = student.uniform?.items || {};
  allowed.forEach((k) => (base[k] = Boolean(saved[k])));
  if (student.uniform?.delivered === true) allowed.forEach((k) => (base[k] = true));
  return base;
}
function isKitDelivered(student) {
  const allowed = getAllowedItemsByModality(student.modality);
  if (!allowed.length) return false;
  const items = student.uniform?.items || normalizeDeliveryItems(student);
  return allowed.every((k) => items[k] === true);
}
function formatAllowedItems(modality) {
  const items = getAllowedItemsByModality(modality);
  return items.length ? items.map(labelStockCategory).join(", ") : "Sem itens configurados";
}

/* ========= STORAGE HELPERS ========= */
function createDefaultUsersForProject(projectKey) {
  const base = [
    { username: "admin", password: "admin123", role: "admin", nucleus: null },
    { username: "gestao", password: "gestao123", role: "gestao", nucleus: null },
    { username: "nucleo_cg", password: "cg@2026", role: "professor", nucleus: "Campo Grande" },
    { username: "nucleo_real", password: "real@2026", role: "professor", nucleus: "Realengo" },
    { username: "nucleo_jacarezinho", password: "jac@2026", role: "professor", nucleus: "Jacarezinho" },
    { username: "nucleo_penha", password: "penha@2026", role: "professor", nucleus: "Penha" },
    { username: "nucleo_freguesia", password: "freg@2026", role: "professor", nucleus: "Freguesia" },
    { username: "nucleo_santacruz", password: "santacruz@2026", role: "professor", nucleus: "Santa Cruz" },
    { username: "nucleo_macae", password: "macae@2026", role: "professor", nucleus: "Macaé" },
  ];
  return base.map((u) => ({ id: crypto.randomUUID(), project: projectKey, ...u }));
}
function ensureRequiredUsers() {
  const allRequired = PROJECTS.flatMap((p) => createDefaultUsersForProject(p.key));
  allRequired.forEach((req) => {
    const idx = state.users.findIndex((u) => u.project === req.project && u.username === req.username);
    if (idx === -1) state.users.push(req);
    else state.users[idx] = { ...state.users[idx], role: req.role, nucleus: req.nucleus, password: req.password };
  });
}

function createEmptyStockByNucleus(projectKey) {
  const nuclei = getVisibleNuclei(projectKey);
  return Object.fromEntries(nuclei.map((nucleus) => [nucleus, Object.fromEntries(STOCK_CATEGORIES.map((i) => [i.key, 0]))]));
}
function createUniformStockByProject() {
  return Object.fromEntries(PROJECTS.map((p) => [p.key, createEmptyStockByNucleus(p.key)]));
}
function createEmptyCalendarByNucleus(projectKey) {
  const nuclei = getVisibleNuclei(projectKey);
  return Object.fromEntries(nuclei.map((n) => [n, { days: [], schedules: [] }]));
}
function createProjectCalendars() {
  return Object.fromEntries(PROJECTS.map((p) => [p.key, createEmptyCalendarByNucleus(p.key)]));
}
function createAttendanceStaffByProject() {
  return Object.fromEntries(
    PROJECTS.map((p) => [
      p.key,
      Object.fromEntries(getVisibleNuclei(p.key).map((n) => [n, { classDate: "", classSchedule: "", professorName: "", monitorName: "" }])),
    ])
  );
}
function createClassLocksByProject() {
  return Object.fromEntries(
    PROJECTS.map((p) => [
      p.key,
      Object.fromEntries(getVisibleNuclei(p.key).map((n) => [n, { locked: false, lockedAt: "", lockedDate: "" }])),
    ])
  );
}

function getProjectStudents(projectKey = state.currentProjectKey) {
  return state.students.filter((s) => s.project === projectKey);
}
function getProjectVisitors(projectKey = state.currentProjectKey) {
  return state.visitors.filter((v) => v.project === projectKey);
}
function getProjectUsers(projectKey = state.currentProjectKey) {
  return state.users.filter((u) => u.project === projectKey);
}
function getProjectStock(projectKey = state.currentProjectKey) {
  if (!state.uniformStockByProject[projectKey]) state.uniformStockByProject[projectKey] = createEmptyStockByNucleus(projectKey);
  return state.uniformStockByProject[projectKey];
}
function getProjectCalendar(projectKey = state.currentProjectKey) {
  if (!state.classDaysByProject[projectKey]) state.classDaysByProject[projectKey] = createEmptyCalendarByNucleus(projectKey);
  return state.classDaysByProject[projectKey];
}
function getProjectAttendanceStaff(projectKey = state.currentProjectKey) {
  if (!state.attendanceStaffByProject[projectKey]) state.attendanceStaffByProject[projectKey] = createAttendanceStaffByProject()[projectKey];
  return state.attendanceStaffByProject[projectKey];
}
function getAttendanceStaffByNucleus(nucleus) {
  const bag = getProjectAttendanceStaff();
  if (!bag[nucleus]) bag[nucleus] = { classDate: "", classSchedule: "", professorName: "", monitorName: "" };
  return bag[nucleus];
}
function getProjectPlanning(projectKey = state.currentProjectKey) {
  if (!state.planningByProject[projectKey]) state.planningByProject[projectKey] = [];
  return state.planningByProject[projectKey];
}
function getProjectLocks(projectKey = state.currentProjectKey) {
  if (!state.classLocksByProject[projectKey]) state.classLocksByProject[projectKey] = createClassLocksByProject()[projectKey];
  return state.classLocksByProject[projectKey];
}
function getLock(nucleus) {
  const locks = getProjectLocks();
  if (!locks[nucleus]) locks[nucleus] = { locked: false, lockedAt: "", lockedDate: "" };
  return locks[nucleus];
}

/* ========= LOAD / SAVE ========= */
function normalizeStudentNewFields(s) {
  return {
    guardian: {
      name: s.guardian?.name || "",
      phone: s.guardian?.phone || "",
      email: s.guardian?.email || "",
    },
    school: {
      name: s.school?.name || "",
      type: s.school?.type || "",
    },
    address: {
      street: s.address?.street || "",
      number: s.address?.number || "",
      district: s.address?.district || "",
      zip: s.address?.zip || "",
      complement: s.address?.complement || "",
    },
    sizes: {
      shirt: s.sizes?.shirt || "",
      short: s.sizes?.short || "",
      kimono: s.sizes?.kimono || "",
    },
  };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.users = PROJECTS.flatMap((p) => createDefaultUsersForProject(p.key));
    state.students = [];
    state.visitors = [];
    state.history = [];
    state.uniformStockByProject = createUniformStockByProject();
    state.classDaysByProject = createProjectCalendars();
    state.attendanceStaffByProject = createAttendanceStaffByProject();
    state.planningByProject = {};
    state.classLocksByProject = createClassLocksByProject();
    persist();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.students = Array.isArray(parsed.students)
      ? parsed.students.map((s) => ({
          ...s,
          uniform: { ...(s.uniform || {}), items: normalizeDeliveryItems(s) },
          attendanceLog: Array.isArray(s.attendanceLog) ? s.attendanceLog : [],
          ...normalizeStudentNewFields(s),
        }))
      : [];

    state.visitors = Array.isArray(parsed.visitors) ? parsed.visitors : [];
    state.users = Array.isArray(parsed.users) ? parsed.users : PROJECTS.flatMap((p) => createDefaultUsersForProject(p.key));
    state.history = Array.isArray(parsed.history) ? parsed.history : [];

    state.uniformStockByProject = parsed.uniformStockByProject || createUniformStockByProject();
    state.classDaysByProject = parsed.classDaysByProject || createProjectCalendars();
    state.attendanceStaffByProject = parsed.attendanceStaffByProject || createAttendanceStaffByProject();
    state.planningByProject = parsed.planningByProject || {};
    state.classLocksByProject = parsed.classLocksByProject || createClassLocksByProject();
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    loadData();
    return;
  }

  ensureRequiredUsers();
  persist();
}

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      students: state.students,
      visitors: state.visitors,
      users: state.users,
      history: state.history,
      uniformStockByProject: state.uniformStockByProject,
      classDaysByProject: state.classDaysByProject,
      attendanceStaffByProject: state.attendanceStaffByProject,
      planningByProject: state.planningByProject,
      classLocksByProject: state.classLocksByProject,
    })
  );
}

function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.sessionUserId = parsed?.sessionUserId || null;
    state.currentProjectKey = parsed?.currentProjectKey || state.currentProjectKey;
    state.activeTab = parsed?.activeTab || state.activeTab;
  } catch {
    state.sessionUserId = null;
  }
}

function persistSession() {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ sessionUserId: state.sessionUserId, currentProjectKey: state.currentProjectKey, activeTab: state.activeTab })
  );
}

/* ========= AUTH ========= */
function currentUser() {
  if (!state.sessionUserId) return null;
  return getProjectUsers().find((u) => u.id === state.sessionUserId) || null;
}

function onLogin(event) {
  event.preventDefault();
  const username = (ui.loginUsername?.value || "").trim();
  const password = ui.loginPassword?.value || "";
  const projectKey = ui.loginProject?.value || state.currentProjectKey;

  state.currentProjectKey = projectKey;

  const user = getProjectUsers(projectKey).find((u) => u.username === username && u.password === password);
  if (!user) {
    ui.loginMessage.textContent = "Usuário ou senha inválidos.";
    ui.loginMessage.classList.remove("report-status-success");
    return;
  }

  state.sessionUserId = user.id;
  state.activeTab = "tab-dashboard";
  persistSession();

  ui.loginMessage.textContent = "Acesso liberado.";
  ui.loginMessage.classList.add("report-status-success");

  hydrateNucleusSelects();
  hydrateStudentScheduleOptions();
  hydrateStudentModalityOptions();
  render();
}

function onLogout() {
  state.sessionUserId = null;
  persistSession();
  render();
}

/* ========= HYDRATE ========= */
function hydrateProjectSelects() {
  ui.loginProject.innerHTML = "";
  PROJECTS.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.key;
    opt.textContent = p.label;
    ui.loginProject.appendChild(opt);
  });
  ui.loginProject.value = state.currentProjectKey;
}

function hydrateNucleusSelects() {
  const ids = [
    "studentNucleus","calendarNucleus","newNucleus","attendanceNucleusFilter","uniformNucleusFilter","adminReportNucleusFilter","visitorNucleus","dashNucleusFilter"
  ];
  const visible = getVisibleNuclei();

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const needsTodos = id.endsWith("Filter") || id.includes("ReportNucleusFilter") || id === "dashNucleusFilter";
    el.innerHTML = needsTodos ? `<option value="todos">Todos os núcleos</option>` : "";

    visible.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      el.appendChild(opt);
    });

    if (!needsTodos && visible.length) el.value = visible[0];
  });
}

function hydrateStudentScheduleOptions() {
  const nucleus = document.getElementById("studentNucleus")?.value;
  const projectCalendar = getProjectCalendar();
  const schedules = projectCalendar?.[nucleus]?.schedules || [];

  ui.studentSchedule.innerHTML = `<option value="">Selecione (opcional)</option>`;
  schedules.forEach((slot) => {
    const value = `${slot.start} às ${slot.end}`;
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    ui.studentSchedule.appendChild(opt);
  });
}

function hydrateStudentModalityOptions() {
  const modalities = PROJECT_MODALITIES[state.currentProjectKey] || [];
  ui.studentModality.innerHTML = "";
  modalities.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    ui.studentModality.appendChild(opt);
  });
}

/* ========= TABS ========= */
function setActiveTab(tabId) {
  state.activeTab = tabId;
  persistSession();

  ui.tabPages.forEach((page) => {
    if (!page) return;
    page.classList.toggle("hidden", page.id !== tabId);
  });

  ui.tabsBar?.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  render();
}

/* ========= EVENTS ========= */
function bindEvents() {
  ui.loginForm.addEventListener("submit", onLogin);
  ui.logoutBtn.addEventListener("click", onLogout);

  ui.loginProject.addEventListener("change", (e) => {
    state.currentProjectKey = e.target.value;
    persistSession();
    hydrateNucleusSelects();
    hydrateStudentScheduleOptions();
    hydrateStudentModalityOptions();
    render();
    updateReportRangeInfo();
  });

  document.getElementById("studentNucleus")?.addEventListener("change", hydrateStudentScheduleOptions);

  ui.tabsBar?.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    setActiveTab(btn.dataset.tab);
  });

  ui.attendanceSearch?.addEventListener("input", (e) => {
    state.search = (e.target.value || "").trim().toLowerCase();
    const user = currentUser();
    if (user?.role === "professor") renderProfessorArea(user);
  });

  ui.professorClassSave?.addEventListener("click", () => {
    const user = currentUser();
    if (user?.role !== "professor") return;
    saveAttendanceStaff(user.nucleus);
  });

  ui.endClassBtn?.addEventListener("click", () => {
    const user = currentUser();
    if (user?.role !== "professor") return;
    lockClass(user.nucleus);
  });

  ui.planningForm?.addEventListener("submit", onSavePlanning);
  ui.professorHistoryDate?.addEventListener("change", () => {
    const user = currentUser();
    if (user?.role !== "professor") return;
    renderProfessorHistory(user.nucleus);
  });

  ui.studentForm?.addEventListener("submit", onAddStudent);

  ui.classCalendarForm?.addEventListener("submit", onSaveClassCalendar);

  ui.attendanceNucleusFilter?.addEventListener("change", () => {
    state.attendanceFilter = ui.attendanceNucleusFilter.value;
    renderAttendanceReport();
  });

  ui.uniformNucleusFilter?.addEventListener("change", () => {
    state.uniformFilter = ui.uniformNucleusFilter.value;
    renderUniformTable();
  });

  ui.visitorForm?.addEventListener("submit", onAddVisitor);

  ui.whatsForm?.addEventListener("submit", onOpenWhatsapp);

  ui.userForm?.addEventListener("submit", onCreateUser);
  ui.newRole?.addEventListener("change", () => {
    const nuc = document.getElementById("newNucleus");
    if (nuc) nuc.disabled = ui.newRole.value !== "professor";
  });

  ui.stockForm?.addEventListener("submit", onAdjustStock);

  ui.adminReportNucleusFilter?.addEventListener("change", updateReportRangeInfo);
  ui.adminReportPeriod?.addEventListener("change", updateReportRangeInfo);

  ui.adminGenerateReportBtn?.addEventListener("click", () => {
    const period = ui.adminReportPeriod?.value || "semanal";
    const nucleusFilter = ui.adminReportNucleusFilter?.value || "todos";
    const content = buildReport(period, nucleusFilter);
    downloadReport(content, period, nucleusFilter);
    ui.adminReportStatus.textContent = "Relatório TXT baixado com sucesso.";
  });

  ui.adminPrintReportBtn?.addEventListener("click", () => {
    const period = ui.adminReportPeriod?.value || "semanal";
    const nucleusFilter = ui.adminReportNucleusFilter?.value || "todos";
    printReport(period, nucleusFilter);
  });

  ui.dashNucleusFilter?.addEventListener("change", renderDashboardChart);
}

/* ========= PROFESSOR: TRAVA + ENCERRAR AULA ========= */
function saveAttendanceStaff(nucleus) {
  const staff = getAttendanceStaffByNucleus(nucleus);
  const lock = getLock(nucleus);

  if (lock.locked) {
    ui.professorClassStatus.textContent = "Aula já foi encerrada.";
    return;
  }

  staff.classDate = ui.professorClassDate?.value || staff.classDate || "";
  staff.classSchedule = ui.professorClassSchedule?.value?.trim() || staff.classSchedule || "";
  staff.professorName = ui.professorClassProfessorName?.value?.trim() || staff.professorName || "";
  staff.monitorName = ui.professorClassMonitorName?.value?.trim() || staff.monitorName || "";

  persist();
  ui.professorClassStatus.textContent = "Dados da aula salvos. Agora você pode marcar presença.";
  render();
}

function lockClass(nucleus) {
  const staff = getAttendanceStaffByNucleus(nucleus);
  if (!staff.classDate) {
    ui.professorClassStatus.textContent = "⚠️ Defina a DATA DA AULA e salve antes de encerrar.";
    return;
  }

  const lock = getLock(nucleus);
  lock.locked = true;
  lock.lockedAt = new Date().toISOString();
  lock.lockedDate = staff.classDate;

  persist();
  ui.professorClassStatus.textContent = "Aula encerrada. Presenças congeladas para esta data.";
  render();
}

/* ========= PROFESSOR: PLANNING + HISTORY ========= */
function onSavePlanning(event) {
  event.preventDefault();
  const user = currentUser();
  if (!user || user.role !== "professor") return;

  const weekStart = ui.planningWeek?.value || "";
  const theme = ui.planningTheme?.value?.trim() || "";
  if (!weekStart || !theme) return;

  getProjectPlanning().unshift({
    id: crypto.randomUUID(),
    nucleus: user.nucleus,
    professor: user.username,
    weekStart,
    theme,
    goals: ui.planningGoals?.value?.trim() || "",
    activities: ui.planningActivities?.value?.trim() || "",
    createdAt: new Date().toISOString(),
  });

  persist();
  ui.planningForm.reset();
  renderPlanningList(user.nucleus);
}

function renderPlanningList(nucleus) {
  ui.planningList.innerHTML = "";
  const items = getProjectPlanning().filter((p) => p.nucleus === nucleus).slice(0, 12);
  if (!items.length) {
    ui.planningList.innerHTML = `<li class="empty">Sem planejamento semanal cadastrado.</li>`;
    return;
  }
  items.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${formatDateLabel(p.weekStart)} • Tema: ${p.theme} • Momento do Mestre: ${p.goals || "-"} • Atividades: ${p.activities || "-"}`;
    ui.planningList.appendChild(li);
  });
}

function renderProfessorHistory(nucleus) {
  ui.professorHistory.innerHTML = "";
  const selectedDate = ui.professorHistoryDate?.value || "";
  const entries = state.history
    .filter((h) => h.project === state.currentProjectKey && h.nucleus === nucleus)
    .filter((h) => (selectedDate ? h.timestamp.startsWith(selectedDate) : true))
    .slice(0, 80);

  if (!entries.length) {
    ui.professorHistory.innerHTML = `<li class="empty">Sem histórico da turma.</li>`;
    return;
  }

  entries.forEach((h) => {
    const li = document.createElement("li");
    li.textContent = `${new Date(h.timestamp).toLocaleString("pt-BR")} • ${h.studentName} • ${h.detail}`;
    ui.professorHistory.appendChild(li);
  });
}

/* ========= MANAGEMENT: ADD STUDENT (NOVOS CAMPOS) ========= */
function onAddStudent(event) {
  event.preventDefault();
  const user = currentUser();
  if (!user || (user.role !== "gestao" && user.role !== "admin")) return;

  const name = document.getElementById("studentName")?.value?.trim() || "";
  const nucleus = document.getElementById("studentNucleus")?.value || "";
  const schedule = ui.studentSchedule?.value?.trim() || "";
  const modality = ui.studentModality?.value?.trim() || "";
  const contact = document.getElementById("studentContact")?.value?.trim() || "";

  if (!name) return;
  if (!getVisibleNuclei().includes(nucleus)) return;

  const guardianName = document.getElementById("guardianName")?.value?.trim() || "";
  const guardianPhone = document.getElementById("guardianPhone")?.value?.trim() || "";
  const guardianEmail = document.getElementById("guardianEmail")?.value?.trim() || "";

  const schoolName = document.getElementById("studentSchoolName")?.value?.trim() || "";
  const schoolType = document.getElementById("studentSchoolType")?.value || "";

  const address = {
    street: document.getElementById("addrStreet")?.value?.trim() || "",
    number: document.getElementById("addrNumber")?.value?.trim() || "",
    district: document.getElementById("addrDistrict")?.value?.trim() || "",
    zip: document.getElementById("addrZip")?.value?.trim() || "",
    complement: document.getElementById("addrComplement")?.value?.trim() || "",
  };

  const sizes = {
    shirt: document.getElementById("sizeShirt")?.value || "",
    short: document.getElementById("sizeShort")?.value || "",
    kimono: document.getElementById("sizeKimono")?.value || "",
  };

  const student = {
    id: crypto.randomUUID(),
    name,
    nucleus,
    contact,
    modality,
    classSchedule: schedule,
    birthDate: document.getElementById("studentBirthDate")?.value || "",
    startDate: document.getElementById("studentStartDate")?.value || "",
    requirements: document.getElementById("studentRequirements")?.value?.trim() || "",

    guardian: { name: guardianName, phone: guardianPhone, email: guardianEmail },
    school: { name: schoolName, type: schoolType },
    address,
    sizes,

    uniform: { notes: "", items: createEmptyDeliveryItems() },
    attendance: "não registrado",
    attendanceLog: [],

    project: state.currentProjectKey,
  };

  state.students.unshift(student);
  persist();

  ui.studentForm.reset();
  hydrateStudentScheduleOptions();
  hydrateStudentModalityOptions();
  render();
}

/* ========= CALENDAR ========= */
function getSchedulesFromForm() {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    const start = ui.calendarStartTimes[i]?.value || "";
    const end = ui.calendarEndTimes[i]?.value || "";
    if (!start || !end) continue;
    slots.push({ start, end });
  }
  return slots;
}
function formatSchedules(schedules = []) {
  if (!Array.isArray(schedules) || !schedules.length) return "não definidos";
  return schedules.map((s, idx) => `${idx + 1}) ${s.start} às ${s.end}`).join(" • ");
}
function onSaveClassCalendar(event) {
  event.preventDefault();
  const user = currentUser();
  if (!user || (user.role !== "gestao" && user.role !== "admin")) return;

  const nucleus = document.getElementById("calendarNucleus")?.value || "";
  if (!getVisibleNuclei().includes(nucleus)) return;

  const date = document.getElementById("calendarDate")?.value || "";
  const schedules = getSchedulesFromForm();

  const calendar = getProjectCalendar();
  const nuc = calendar[nucleus] || { days: [], schedules: [] };
  calendar[nucleus] = nuc;

  let changed = false;
  if (date && !nuc.days.includes(date)) {
    nuc.days.push(date);
    nuc.days.sort((a, b) => b.localeCompare(a));
    changed = true;
  }
  if (schedules.length) {
    nuc.schedules = schedules;
    changed = true;
  }
  if (!changed) return;

  persist();
  ui.classCalendarForm.reset();
  renderClassDays();
  hydrateStudentScheduleOptions();
}

/* ========= VISITANTES ========= */
function onAddVisitor(event) {
  event.preventDefault();
  const user = currentUser();
  if (!user || (user.role !== "gestao" && user.role !== "admin")) return;

  const name = ui.visitorName?.value?.trim() || "";
  const nucleus = ui.visitorNucleus?.value || "";
  const date = ui.visitorDate?.value || "";
  if (!name || !nucleus || !date) return;

  const visitor = {
    id: crypto.randomUUID(),
    project: state.currentProjectKey,
    name,
    nucleus,
    date,
    contact: ui.visitorContact?.value?.trim() || "",
    notes: ui.visitorNotes?.value?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  state.visitors.unshift(visitor);
  persist();

  ui.visitorForm.reset();
  renderVisitors();
}

function renderVisitors() {
  const list = getProjectVisitors().slice(0, 40);
  ui.visitorsBadge.textContent = String(getProjectVisitors().length);
  ui.visitorsList.innerHTML = "";

  if (!list.length) {
    ui.visitorsList.innerHTML = `<li class="empty">Sem visitantes cadastrados.</li>`;
    return;
  }
  list.forEach((v) => {
    const li = document.createElement("li");
    li.textContent = `${formatDateLabel(v.date)} • ${v.name} • ${v.nucleus}${v.contact ? " • " + v.contact : ""}${v.notes ? " • " + v.notes : ""}`;
    ui.visitorsList.appendChild(li);
  });
}

/* ========= ATTENDANCE UI ========= */
function attendanceCode(attendance) {
  if (attendance === "presente") return "P";
  if (attendance === "falta") return "F";
  if (attendance === "justificado") return "J";
  return "-";
}
function attendanceCodePrint(attendance) {
  const code = attendanceCode(attendance);
  if (code === "F") return `<span class="status-f">F</span>`;
  if (code === "J") return `<span class="status-j">J</span>`;
  if (code === "P") return `<span class="status-p">P</span>`;
  return code;
}

function pushHistory(student, user, type, detail) {
  state.history.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    nucleus: student.nucleus,
    studentName: student.name,
    by: user.username,
    type,
    detail,
    project: state.currentProjectKey,
  });
}

function renderBoard(target, students, actor) {
  target.innerHTML = "";
  const nuclei = actor.role === "professor" ? [actor.nucleus] : getVisibleNuclei();

  nuclei.forEach((nucleus) => {
    let grouped = students.filter((s) => s.nucleus === nucleus);
    if (state.search) grouped = grouped.filter((s) => s.name.toLowerCase().includes(state.search));

    const staff = getAttendanceStaffByNucleus(nucleus);
    const lock = getLock(nucleus);

    const classDateLabel = staff.classDate ? formatDateLabel(staff.classDate) : "não definida";
    const classScheduleLabel = staff.classSchedule || "horário não definido";
    const instructorLabel = staff.professorName || "não informado";
    const monitorLabel = staff.monitorName || "não informado";

    const column = document.createElement("article");
    column.className = "nucleus-column";
    column.innerHTML = `
      <div class="nucleus-header">
        <h3>${nucleus}</h3>
        <span class="badge">${grouped.length}</span>
      </div>
      <p class="class-meta">
        Data: ${classDateLabel} • Turma: ${escapeHtml(classScheduleLabel)} • Instrutor: ${escapeHtml(instructorLabel)} • Monitor: ${escapeHtml(monitorLabel)}
        ${lock.locked ? " • ✅ Aula encerrada" : ""}
      </p>
    `;

    if (!grouped.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Sem alunos neste filtro.";
      column.appendChild(empty);
    }

    grouped
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      .forEach((student) => {
        const card = ui.attendanceCardTemplate.content.firstElementChild.cloneNode(true);

        const f = frequencyOf(student);
        card.querySelector(".student-name").textContent = student.name;
        card.querySelector(".freq-pill").textContent = `${f.pct}% (${f.present}/${f.total || 0})`;

        const contactLineParts = [];
        if (student.contact) contactLineParts.push(`Aluno: ${student.contact}`);
        if (student.guardian?.phone) contactLineParts.push(`Resp: ${student.guardian.phone}`);
        if (student.guardian?.email) contactLineParts.push(student.guardian.email);
        card.querySelector(".student-contact").textContent = contactLineParts.length ? contactLineParts.join(" • ") : "Contato não informado";

        const schedule = staff.classSchedule || student.classSchedule || "horário não informado";
        card.querySelector(".student-class-info").textContent = `Turma/Horário: ${student.nucleus} • ${schedule}`;
        card.querySelector(".student-status").textContent = `Status (último): ${student.attendance}`;

        const classDate = staff.classDate || "";

        const enforceRules = () => {
          if (!classDate) {
            ui.professorClassStatus.textContent = "⚠️ Para marcar presença, defina e SALVE a DATA DA AULA primeiro.";
            return false;
          }
          if (lock.locked && lock.lockedDate === classDate) {
            ui.professorClassStatus.textContent = "⚠️ Aula encerrada. Não é possível alterar presenças para esta data.";
            return false;
          }
          return true;
        };

        card.querySelector(".btn-present").addEventListener("click", () => {
          if (actor.role === "professor" && !enforceRules()) return;
          student.attendance = "presente";
          upsertAttendanceLog(student, classDate || isoToday(), "presente");
          pushHistory(student, actor, "chamada", `Marcado como presente (${formatDateLabel(classDate || isoToday())})`);
          persist();
          render();
        });

        card.querySelector(".btn-absent").addEventListener("click", () => {
          if (actor.role === "professor" && !enforceRules()) return;
          student.attendance = "falta";
          upsertAttendanceLog(student, classDate || isoToday(), "falta");
          pushHistory(student, actor, "chamada", `Marcado como falta (${formatDateLabel(classDate || isoToday())})`);
          persist();
          render();
        });

        card.querySelector(".btn-justified").addEventListener("click", () => {
          if (actor.role === "professor" && !enforceRules()) return;
          student.attendance = "justificado";
          upsertAttendanceLog(student, classDate || isoToday(), "justificado");
          pushHistory(student, actor, "chamada", `Marcado como justificado (${formatDateLabel(classDate || isoToday())})`);
          persist();
          render();
        });

        column.appendChild(card);
      });

    target.appendChild(column);
  });
}

/* ========= METRICS / COUNTS ========= */
function renderMetrics() {
  const students = getProjectStudents();
  ui.totalStudents.textContent = String(students.length);
  ui.presentCount.textContent = String(students.filter((s) => s.attendance === "presente").length);
  ui.absentCount.textContent = String(students.filter((s) => s.attendance === "falta").length);
  ui.uniformDelivered.textContent = String(students.filter((s) => isKitDelivered(s)).length);
}

function renderNucleusCounts() {
  const nuclei = getVisibleNuclei();
  const students = getProjectStudents();
  ui.nucleusCounts.innerHTML = "";

  nuclei.forEach((n) => {
    const count = students.filter((s) => s.nucleus === n).length;
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<span>${n}</span> <b>${count}</b>`;
    ui.nucleusCounts.appendChild(chip);
  });

  ui.nucleusCountBadge.textContent = `${nuclei.length} núcleos`;
}

function renderClassDays() {
  ui.classCalendarBoard.innerHTML = "";
  const calendar = getProjectCalendar();

  getVisibleNuclei().forEach((nucleus) => {
    const data = calendar[nucleus] || { days: [], schedules: [] };
    const days = data.days || [];
    const card = document.createElement("article");
    card.className = "calendar-card";
    card.innerHTML = `
      <div class="calendar-header">
        <h3>${nucleus}</h3>
        <span class="badge">${days.length} aulas</span>
      </div>
      <p class="muted">Horários: ${escapeHtml(formatSchedules(data.schedules))}</p>
    `;

    if (!days.length) {
      card.innerHTML += `<p class="empty">Sem aulas registradas.</p>`;
    } else {
      const list = document.createElement("ul");
      list.className = "history-list";
      days.slice(0, 12).forEach((d) => {
        const li = document.createElement("li");
        li.textContent = formatDateLabel(d);
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    ui.classCalendarBoard.appendChild(card);
  });
}

/* ========= REPORT (tempo real) ========= */
function renderAttendanceReport() {
  ui.attendanceReportBoard.innerHTML = "";

  const nuclei = state.attendanceFilter === "todos" ? getVisibleNuclei() : [state.attendanceFilter];

  nuclei.forEach((nucleus) => {
    const students = getProjectStudents()
      .filter((s) => s.nucleus === nucleus)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    const staff = getAttendanceStaffByNucleus(nucleus);
    const classDateLabel = staff.classDate ? formatDateLabel(staff.classDate) : "não definida";

    const present = students.filter((s) => s.attendance === "presente").length;
    const absent = students.filter((s) => s.attendance === "falta").length;
    const justified = students.filter((s) => s.attendance === "justificado").length;
    const pct = students.length ? Math.round((present / students.length) * 100) : 0;

    const card = document.createElement("article");
    card.className = "calendar-card";
    card.innerHTML = `
      <div class="calendar-header">
        <h3>${nucleus}</h3>
        <span class="badge">${students.length} alunos</span>
      </div>
      <p><strong>Data da aula:</strong> ${classDateLabel}</p>
      <p><strong>Turma/horário:</strong> ${escapeHtml(staff.classSchedule || "-")}</p>
      <p><strong>Professor:</strong> ${escapeHtml(staff.professorName || "-")}</p>
      <p><strong>Monitor:</strong> ${escapeHtml(staff.monitorName || "-")}</p>
      <p><strong>Resumo do dia:</strong> ${present} presentes • ${absent} faltas • ${justified} justificados • ${pct}% presença</p>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Status</th>
              <th>Frequência</th>
              <th>Responsável</th>
              <th>Escola</th>
              <th>Endereço</th>
              <th>Tamanhos</th>
            </tr>
          </thead>
          <tbody>
            ${
              students.map((s) => {
                const f = frequencyOf(s);
                const resp = s.guardian?.name
                  ? `${escapeHtml(s.guardian.name)}${s.guardian.phone ? " • " + escapeHtml(s.guardian.phone) : ""}${s.guardian.email ? " • " + escapeHtml(s.guardian.email) : ""}`
                  : "-";

                const escola = s.school?.name
                  ? `${escapeHtml(s.school.name)}${s.school.type ? " • " + escapeHtml(s.school.type) : ""}`
                  : "-";

                const end = s.address?.street
                  ? `${escapeHtml(s.address.street)}, ${escapeHtml(s.address.number || "s/n")} • ${escapeHtml(s.address.district || "-")} • CEP ${escapeHtml(s.address.zip || "-")}${s.address.complement ? " • " + escapeHtml(s.address.complement) : ""}`
                  : "-";

                const sizes = [
                  s.sizes?.shirt ? `Cam: ${escapeHtml(s.sizes.shirt)}` : "",
                  s.sizes?.short ? `Short: ${escapeHtml(s.sizes.short)}` : "",
                  s.sizes?.kimono ? `Kim: ${escapeHtml(s.sizes.kimono)}` : "",
                ].filter(Boolean).join(" • ") || "-";

                return `<tr>
                  <td>${escapeHtml(s.name)}</td>
                  <td>${attendanceCodePrint(s.attendance)}</td>
                  <td>${f.present}/${f.total || 0} (${f.pct}%)</td>
                  <td>${resp}</td>
                  <td>${escola}</td>
                  <td>${end}</td>
                  <td>${sizes}</td>
                </tr>`;
              }).join("") ||
              `<tr><td colspan="7" class="empty">Sem alunos.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;

    ui.attendanceReportBoard.appendChild(card);
  });
}

/* ========= ALERTAS ========= */
function renderAlerts() {
  ui.alertsBoard.innerHTML = "";
  const students = getProjectStudents();
  const low = students
    .map((s) => ({ s, f: frequencyOf(s) }))
    .filter(({ f }) => f.total >= 5 && f.pct < 60)
    .sort((a, b) => a.f.pct - b.f.pct)
    .slice(0, 25);

  if (!low.length) {
    ui.alertsBoard.innerHTML = `<li class="empty">Sem alertas no momento.</li>`;
    return;
  }

  low.forEach(({ s, f }) => {
    const li = document.createElement("li");
    li.textContent = `${s.name} (${s.nucleus}) • frequência ${f.pct}% (${f.present}/${f.total})`;
    ui.alertsBoard.appendChild(li);
  });
}

/* ========= WHATS ========= */
function hydrateWhatsStudents() {
  const students = getProjectStudents().sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  ui.whatsStudent.innerHTML = "";
  students.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.nucleus})`;
    ui.whatsStudent.appendChild(opt);
  });
}

function onOpenWhatsapp(event) {
  event.preventDefault();
  const student = getProjectStudents().find((s) => s.id === ui.whatsStudent?.value);
  if (!student) return;

  const rawPhone = student.contact || student.guardian?.phone || "";
  const phone = rawPhone.replace(/\D/g, "");
  const msg = encodeURIComponent(ui.whatsMessage?.value?.trim() || `Olá ${student.name}, lembramos da sua próxima aula no IIN.`);

  if (!phone) {
    ui.whatsStatus.textContent = "Contato sem número de telefone válido.";
    return;
  }

  window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  ui.whatsStatus.textContent = `WhatsApp aberto para ${student.name}.`;
}

/* ========= UNIFORM TABLE ========= */
function renderItemDeliveryControls(container, student) {
  container.innerHTML = "";
  const allowed = getAllowedItemsByModality(student.modality);
  if (!allowed.length) {
    container.textContent = "Sem itens configurados";
    return null;
  }

  const delivered = allowed.filter((k) => student.uniform?.items?.[k]);
  const p = document.createElement("p");
  p.className = "item-delivery-current";
  p.textContent = delivered.length ? `Recebido: ${delivered.map(labelStockCategory).join(", ")}` : "Recebido: nenhum item";

  const select = document.createElement("select");
  select.className = "item-delivery-select";
  select.innerHTML = `<option value="">Selecionar item entregue</option>`;

  allowed.forEach((k) => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = `${labelStockCategory(k)}${student.uniform?.items?.[k] ? " (já entregue)" : ""}`;
    select.appendChild(opt);
  });

  container.appendChild(p);
  container.appendChild(select);
  return { select };
}

function applyUniformUpdate(student, nextItems) {
  const stockByNucleus = getProjectStock();
  const nucleusStock =
    stockByNucleus[student.nucleus] ||
    (stockByNucleus[student.nucleus] = Object.fromEntries(STOCK_CATEGORIES.map((i) => [i.key, 0])));

  const allowed = getAllowedItemsByModality(student.modality);
  const prev = student.uniform.items || createEmptyDeliveryItems();
  const merged = { ...prev, ...nextItems };

  for (const key of allowed) {
    const was = prev[key] === true;
    const will = merged[key] === true;

    if (!was && will) {
      if ((nucleusStock[key] || 0) <= 0) {
        merged[key] = false;
        continue;
      }
      nucleusStock[key] = Math.max(0, (nucleusStock[key] || 0) - 1);
    }

    if (was && !will) nucleusStock[key] = (nucleusStock[key] || 0) + 1;
  }

  student.uniform.items = merged;
  persist();
  render();
}

function renderUniformTable() {
  const user = currentUser();
  if (!user) return;

  const canDelete = user.role === "admin";
  const students = getProjectStudents().filter((s) => state.uniformFilter === "todos" || s.nucleus === state.uniformFilter);

  ui.uniformTableBody.innerHTML = "";

  if (!students.length) {
    ui.uniformTableBody.innerHTML = `<tr><td colspan="7" class="empty">Sem alunos para o filtro.</td></tr>`;
    return;
  }

  students.forEach((student) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.nucleus)}</td>
      <td>${escapeHtml(student.modality || "-")}</td>
      <td>${escapeHtml(formatAllowedItems(student.modality))}</td>
      <td data-role="items"></td>
      <td><button data-role="save" class="small-btn" type="button">Salvar</button></td>
      <td><button data-role="delete" class="ghost" type="button" ${canDelete ? "" : "disabled"}>Excluir</button></td>
    `;

    const itemsCell = tr.querySelector('[data-role="items"]');
    const controls = renderItemDeliveryControls(itemsCell, student);

    tr.querySelector('[data-role="save"]').addEventListener("click", () => {
      const next = { ...(student.uniform.items || createEmptyDeliveryItems()) };
      if (controls?.select?.value) next[controls.select.value] = true;
      applyUniformUpdate(student, next);
    });

    tr.querySelector('[data-role="delete"]').addEventListener("click", () => {
      if (!canDelete) return;
      state.students = state.students.filter((x) => x.id !== student.id);
      persist();
      render();
    });

    ui.uniformTableBody.appendChild(tr);
  });
}

/* ========= STOCK VIEW ========= */
function renderStock() {
  ui.stockView.innerHTML = "";
  const stockByNucleus = getProjectStock();
  const totals = Object.fromEntries(STOCK_CATEGORIES.map((i) => [i.key, 0]));

  Object.values(stockByNucleus).forEach((nucStock) => {
    STOCK_CATEGORIES.forEach((i) => (totals[i.key] += Number(nucStock?.[i.key] || 0)));
  });

  STOCK_CATEGORIES.forEach((item) => {
    const card = document.createElement("article");
    card.className = "stock-card";
    card.innerHTML = `<h4>${item.label}</h4><p>${totals[item.key] || 0} unidades</p>`;
    ui.stockView.appendChild(card);
  });
}

function onAdjustStock(event) {
  event.preventDefault();
  const user = currentUser();
  if (!user || user.role !== "admin") return;

  const itemKey = document.getElementById("stockSize")?.value;
  const delta = Number(document.getElementById("stockDelta")?.value || 0);

  const nucleus = getVisibleNuclei()[0];
  const stockByNucleus = getProjectStock();
  if (!stockByNucleus[nucleus]) stockByNucleus[nucleus] = Object.fromEntries(STOCK_CATEGORIES.map((i) => [i.key, 0]));

  stockByNucleus[nucleus][itemKey] = Math.max(0, Number(stockByNucleus[nucleus][itemKey] || 0) + delta);

  persist();
  render();
}

/* ========= ADMIN USERS ========= */
function onCreateUser(event) {
  event.preventDefault();
  const user = currentUser();
  if (!user || user.role !== "admin") return;

  const username = document.getElementById("newUsername")?.value?.trim() || "";
  const password = document.getElementById("newPassword")?.value || "";
  const role = document.getElementById("newRole")?.value || "professor";
  const nucleus = document.getElementById("newNucleus")?.value || "";

  if (!username || !password) return;
  if (getProjectUsers().some((u) => u.username === username)) return;

  state.users.push({ id: crypto.randomUUID(), project: state.currentProjectKey, username, password, role, nucleus: role === "professor" ? nucleus : null });
  persist();
  ui.userForm.reset();
  renderUsersTable();
}

function renderUsersTable() {
  const user = currentUser();
  if (!user || user.role !== "admin") return;

  ui.usersTableBody.innerHTML = "";
  getProjectUsers().forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(u.username)}</td>
      <td>${escapeHtml(labelRole(u.role))}</td>
      <td>${escapeHtml(u.nucleus || "-")}</td>
      <td>
        <div class="pass-wrap">
          <input data-role="pass" type="password" value="${escapeHtml(u.password)}" />
          <button data-role="toggle-pass" class="ghost eye-btn" type="button">👁</button>
        </div>
      </td>
      <td>
        <button data-role="reset" class="small-btn" type="button">Salvar senha</button>
        <button data-role="delete" class="ghost" type="button" ${u.id === user.id ? "disabled" : ""}>Excluir</button>
      </td>
    `;

    tr.querySelector('[data-role="toggle-pass"]').addEventListener("click", () => {
      const input = tr.querySelector('[data-role="pass"]');
      input.type = input.type === "password" ? "text" : "password";
    });

    tr.querySelector('[data-role="reset"]').addEventListener("click", () => {
      const newPass = tr.querySelector('[data-role="pass"]').value;
      u.password = newPass;
      persist();
    });

    tr.querySelector('[data-role="delete"]').addEventListener("click", () => {
      if (u.id === user.id) return;
      state.users = state.users.filter((x) => x.id !== u.id);
      persist();
      renderUsersTable();
    });

    ui.usersTableBody.appendChild(tr);
  });
}

/* ========= REPORTS (TXT + PRINT/SAVE PDF) ========= */
function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getPeriodRange(period) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "diario") return { start: new Date(end), end, label: "Diário" };
  if (period === "mensal") return { start: new Date(now.getFullYear(), now.getMonth(), 1), end, label: "Mensal" };
  if (period === "trimestral") return { start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1), end, label: "Trimestral" };
  if (period === "semestral") return { start: new Date(now.getFullYear(), now.getMonth() < 6 ? 0 : 6, 1), end, label: "Semestral" };
  if (period === "anual") return { start: new Date(now.getFullYear(), 0, 1), end, label: "Anual" };
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end, label: "Semanal" };
}

function getReportNuclei(nucleusFilter = "todos") {
  if (nucleusFilter && nucleusFilter !== "todos") {
    return getVisibleNuclei().includes(nucleusFilter) ? [nucleusFilter] : [];
  }
  return getVisibleNuclei();
}

function updateReportRangeInfo() {
  const period = ui.adminReportPeriod?.value || "semanal";
  const { start, end, label } = getPeriodRange(period);
  ui.adminReportRangeInfo.textContent = `Período selecionado (${label}): ${start.toLocaleDateString("pt-BR")} até ${end.toLocaleDateString("pt-BR")}.`;
}

function buildReport(period, nucleusFilter = "todos") {
  const { start, end, label } = getPeriodRange(period);
  const startIso = toIsoDate(start);
  const endIso = toIsoDate(end);
  const generatedAt = new Date();
  const project = currentProject();

  const lines = [
    "INSTITUTO IRMÃOS NOGUEIRA",
    `PROJETO: ${project.label.toUpperCase()}`,
    `PROCESSO: ${project.processNumber || "A definir"}`,
    "E-mail institucional: contato@iinbrasil.org",
    `RELATÓRIO ${label.toUpperCase()}`,
    `Gerado em: ${generatedAt.toLocaleString("pt-BR")}`,
    `Período: ${start.toLocaleDateString("pt-BR")} até ${end.toLocaleDateString("pt-BR")}`,
    "",
  ];

  const nuclei = getReportNuclei(nucleusFilter);
  const planning = getProjectPlanning();
  const calendar = getProjectCalendar();

  nuclei.forEach((nucleus) => {
    const students = getProjectStudents()
      .filter((s) => s.nucleus === nucleus)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    const staff = getAttendanceStaffByNucleus(nucleus);
    const nucData = calendar[nucleus] || { days: [], schedules: [] };
    const days = (nucData.days || []).filter((d) => d >= startIso && d <= endIso);

    lines.push(`TURMA/NÚCLEO: ${nucleus}`);
    lines.push(project.subtitle || "");
    lines.push(`Dados da chamada: Data ${staff.classDate ? formatDateLabel(staff.classDate) : "-"} | Turma ${staff.classSchedule || "-"} | Professor ${staff.professorName || "-"} | Monitor ${staff.monitorName || "-"}`);
    lines.push(`Horários da turma: ${formatSchedules(nucData.schedules)}`);
    lines.push(`Dias com aula no período: ${days.length ? days.map(formatDateLabel).join(", ") : "nenhum"}`);

    const planningItems = planning.filter((p) => p.nucleus === nucleus && p.weekStart >= startIso && p.weekStart <= endIso);
    lines.push(`Planejamento semanal: ${planningItems.length ? planningItems.map((p) => `${formatDateLabel(p.weekStart)} - ${p.theme}`).join(" | ") : "sem planejamento no período"}`);

    lines.push("Alunos (freq + responsável + escola + endereço + tamanhos):");
    if (!students.length) {
      lines.push("- Nenhum aluno cadastrado nesta turma.");
    } else {
      students.forEach((s) => {
        const f = frequencyOf(s);
        const resp = s.guardian?.name
          ? `${s.guardian.name}${s.guardian.phone ? " • " + s.guardian.phone : ""}${s.guardian.email ? " • " + s.guardian.email : ""}`
          : "-";

        const escola = s.school?.name ? `${s.school.name}${s.school.type ? " • " + s.school.type : ""}` : "-";

        const end = s.address?.street
          ? `${s.address.street}, ${s.address.number || "s/n"} • ${s.address.district || "-"} • CEP ${s.address.zip || "-"}${s.address.complement ? " • " + s.address.complement : ""}`
          : "-";

        const sizes = [
          s.sizes?.shirt ? `Cam: ${s.sizes.shirt}` : "",
          s.sizes?.short ? `Short: ${s.sizes.short}` : "",
          s.sizes?.kimono ? `Kim: ${s.sizes.kimono}` : "",
        ].filter(Boolean).join(" • ") || "-";

        lines.push(`- ${s.name} | Horário: ${s.classSchedule || "-"} | Modalidade: ${s.modality || "-"} | Freq: ${f.present}/${f.total || 0} (${f.pct}%) | Resp: ${resp} | Escola: ${escola} | End: ${end} | Tam: ${sizes} | Status: ${attendanceCode(s.attendance)}`);
      });
    }
    lines.push("");
  });

  return lines.join("\n");
}

function buildPrintableReportHTML(period, nucleusFilter = "todos") {
  const generatedAt = new Date().toLocaleString("pt-BR");
  const project = currentProject();
  const nuclei = getReportNuclei(nucleusFilter);
  const { start, end, label } = getPeriodRange(period);
  const calendar = getProjectCalendar();

  const sections = nuclei.map((nucleus) => {
    const students = getProjectStudents()
      .filter((s) => s.nucleus === nucleus)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    const staff = getAttendanceStaffByNucleus(nucleus);
    const nucData = calendar[nucleus] || { days: [], schedules: [] };

    const rows = students.map((s) => {
      const f = frequencyOf(s);
      const resp = s.guardian?.name
        ? `${escapeHtml(s.guardian.name)}${s.guardian.phone ? " • " + escapeHtml(s.guardian.phone) : ""}${s.guardian.email ? " • " + escapeHtml(s.guardian.email) : ""}`
        : "-";

      const escola = s.school?.name ? `${escapeHtml(s.school.name)}${s.school.type ? " • " + escapeHtml(s.school.type) : ""}` : "-";

      const endr = s.address?.street
        ? `${escapeHtml(s.address.street)}, ${escapeHtml(s.address.number || "s/n")} • ${escapeHtml(s.address.district || "-")} • CEP ${escapeHtml(s.address.zip || "-")}${s.address.complement ? " • " + escapeHtml(s.address.complement) : ""}`
        : "-";

      const sizes = [
        s.sizes?.shirt ? `Cam: ${escapeHtml(s.sizes.shirt)}` : "",
        s.sizes?.short ? `Short: ${escapeHtml(s.sizes.short)}` : "",
        s.sizes?.kimono ? `Kim: ${escapeHtml(s.sizes.kimono)}` : "",
      ].filter(Boolean).join(" • ") || "-";

      return `
        <tr>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(staff.classSchedule || s.classSchedule || "-")}</td>
          <td class="center">${attendanceCodePrint(s.attendance)}</td>
          <td class="center">${f.present}/${f.total || 0} (${f.pct}%)</td>
          <td>${resp}</td>
          <td>${escola}</td>
          <td>${endr}</td>
          <td>${sizes}</td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="8">Sem alunos cadastrados.</td></tr>`;

    return `
      <section class="sheet-block">
        <div class="sheet-head">
          <h3>${escapeHtml(nucleus)}</h3>
          <div class="sheet-meta">
            <span><strong>Data:</strong> ${staff.classDate ? formatDateLabel(staff.classDate) : "-"}</span>
            <span><strong>Professor:</strong> ${escapeHtml(staff.professorName || "-")}</span>
            <span><strong>Monitor:</strong> ${escapeHtml(staff.monitorName || "-")}</span>
          </div>
          <div class="sheet-meta">
            <span><strong>Horários:</strong> ${escapeHtml(formatSchedules(nucData.schedules))}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Turma/Horário</th>
              <th class="center">Status</th>
              <th class="center">Frequência</th>
              <th>Responsável</th>
              <th>Escola</th>
              <th>Endereço</th>
              <th>Tamanhos</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `;
  }).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Relatório IIN</title>
<style>
  *{box-sizing:border-box}
  body{font-family: Arial, sans-serif;color:#111;margin:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .top{display:flex;align-items:center;gap:16px;border-bottom:3px solid #8f1422;padding-bottom:10px;margin-bottom:14px;}
  .top img{width:84px;height:auto}
  .top h2{margin:0;color:#8f1422}
  .addr{font-size:13px;line-height:1.4;color:#333}
  .meta{font-size:13px;margin:0 0 10px;padding:10px 12px;border:1px solid #ead9dc;background:#fdecef;border-radius:10px;}
  .sheet-block{margin:0 0 16px;page-break-inside:avoid;border:1px solid #ead9dc;border-radius:12px;overflow:hidden;}
  .sheet-head{padding:10px 12px;background:linear-gradient(180deg,#fff,#fdecef);border-bottom:1px solid #ead9dc;}
  .sheet-head h3{margin:0 0 6px;color:#6f101b}
  .sheet-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#333}
  table{width:100%;border-collapse:collapse}
  th,td{border-bottom:1px solid #ead9dc;padding:8px 9px;font-size:12px;vertical-align:top}
  th{background:#fdf5f7;text-align:left;color:#5e1620}
  tbody tr:nth-child(even){background:#fafafa}
  .center{text-align:center}
  .status-f{color:#b31d2f;font-weight:700}
  .status-j{color:#2c3f8f;font-weight:700}
  .status-p{color:#111;font-weight:700}
</style>
</head>
<body>
  <div class="top">
    <img src="logo.png" alt="IIN" />
    <div>
      <h2>Instituto Irmãos Nogueira (IIN)</h2>
      <div class="addr">E-mail institucional: contato@iinbrasil.org</div>
    </div>
  </div>

  <div class="meta">
    <strong>Projeto:</strong> ${escapeHtml(project.label)}
    &nbsp;|&nbsp; <strong>Processo:</strong> ${escapeHtml(project.processNumber || "-")}
    &nbsp;|&nbsp; <strong>Relatório:</strong> ${escapeHtml(label)}
    &nbsp;|&nbsp; <strong>Núcleo:</strong> ${escapeHtml(nucleusFilter === "todos" ? "Todos" : nucleusFilter)}
    <br/>
    <strong>Período:</strong> ${start.toLocaleDateString("pt-BR")} até ${end.toLocaleDateString("pt-BR")}
    &nbsp;|&nbsp; <strong>Gerado em:</strong> ${escapeHtml(generatedAt)}
  </div>

  ${sections}
</body>
</html>`;
}

function printReport(period, nucleusFilter = "todos") {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildPrintableReportHTML(period, nucleusFilter));
  w.document.close();
  w.focus();
  w.print();
}

function downloadReport(content, period, nucleusFilter = "todos") {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const nucleusSlug = (nucleusFilter || "todos").toLowerCase().replaceAll(" ", "-");
  a.download = `relatorio-${state.currentProjectKey}-${nucleusSlug}-${period}-${toIsoDate(new Date())}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ========= DASHBOARD CHART ========= */
function renderDashboardChart() {
  const canvas = ui.dashChart;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const nuclei = getVisibleNuclei();

  const selected = ui.dashNucleusFilter?.value || "todos";
  const focusNuclei = selected === "todos" ? nuclei : [selected];

  const data = focusNuclei.map((n) => {
    const students = getProjectStudents().filter((s) => s.nucleus === n);
    const p = students.filter((s) => s.attendance === "presente").length;
    const f = students.filter((s) => s.attendance === "falta").length;
    const j = students.filter((s) => s.attendance === "justificado").length;
    return { nucleus: n, total: students.length, present: p, absent: f, justified: j };
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pad = 50;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;

  ctx.strokeStyle = "#c8c8c8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad + h);
  ctx.lineTo(pad + w, pad + h);
  ctx.stroke();

  const max = Math.max(1, ...data.map((d) => d.total));
  const barW = (w / Math.max(1, data.length)) * 0.6;
  const gap = (w / Math.max(1, data.length)) * 0.4;

  ctx.font = "14px Arial";
  ctx.fillStyle = "#111";

  data.forEach((d, i) => {
    const x = pad + i * (barW + gap) + gap * 0.5;
    const totalH = (d.total / max) * h;

    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(x, pad + (h - totalH), barW, totalH);

    const presentH = d.total ? (d.present / max) * h : 0;
    ctx.fillStyle = "#1f8a57";
    ctx.fillRect(x, pad + h - presentH, barW, presentH);

    const absentH = d.total ? (d.absent / max) * h : 0;
    ctx.fillStyle = "#b31d2f";
    ctx.fillRect(x, pad + h - presentH - absentH, barW, absentH);

    ctx.fillStyle = "#111";
    ctx.fillText(d.nucleus, x, pad + h + 18);

    const pct = d.total ? Math.round(((d.present + d.justified) / d.total) * 100) : 0;
    ctx.fillStyle = "#333";
    ctx.fillText(`${pct}%`, x, pad + (h - totalH) - 8);
  });
}

/* ========= DASHBOARD SELECT ========= */
function ensureDashNucleusOptions() {
  const el = ui.dashNucleusFilter;
  if (!el) return;
  const nuclei = getVisibleNuclei();
  el.innerHTML = `<option value="todos">Todos os núcleos</option>`;
  nuclei.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    el.appendChild(opt);
  });
}

/* ========= RELATÓRIO RANGE ========= */
function updateReportRangeInfoSafe() {
  if (!ui.adminReportRangeInfo) return;
  updateReportRangeInfo();
}

/* ========= WHATS HYDRATE ========= */
function hydrateWhatsStudentsSafe() {
  if (!ui.whatsStudent) return;
  hydrateWhatsStudents();
}

/* ========= RENDER ========= */
function render() {
  const user = currentUser();

  ui.loginScreen.classList.toggle("hidden", Boolean(user));
  ui.appShell.classList.toggle("hidden", !user);
  ui.logoutBtn.classList.toggle("hidden", !user);

  if (!user) return;

  ui.welcomeTitle.textContent = `Painel • ${labelRole(user.role)} • ${currentProject().label}`;
  ui.projectSubtitle.textContent = currentProject().subtitle || "";

  ui.tabsBar.querySelectorAll(".tab-btn").forEach((btn) => {
    const tab = btn.dataset.tab;
    if (tab === "tab-admin") btn.classList.toggle("hidden", user.role !== "admin");
    if (tab === "tab-gestao") btn.classList.toggle("hidden", !(user.role === "gestao" || user.role === "admin"));
    if (tab === "tab-professor") btn.classList.toggle("hidden", user.role !== "professor");
  });

  if (user.role === "professor" && !["tab-professor","tab-relatorios","tab-dashboard"].includes(state.activeTab)) state.activeTab = "tab-professor";
  if (user.role === "gestao" && state.activeTab === "tab-admin") state.activeTab = "tab-dashboard";

  ui.tabPages.forEach((page) => page.classList.toggle("hidden", page.id !== state.activeTab));
  ui.tabsBar.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === state.activeTab));

  if (ui.dashBadge) ui.dashBadge.textContent = `${getProjectStudents().length} alunos`;

  ensureDashNucleusOptions();

  renderMetrics();
  renderNucleusCounts();
  renderVisitors();
  renderClassDays();
  renderAttendanceReport();
  renderUniformTable();
  renderStock();
  renderAlerts();
  hydrateWhatsStudentsSafe();
  renderDashboardChart();

  if (user.role === "professor") renderProfessorArea(user);
  if (user.role === "admin") renderUsersTable();

  updateReportRangeInfoSafe();
}

function renderProfessorArea(user) {
  ui.professorNucleusBadge.textContent = `Turma: ${user.nucleus}`;

  const staff = getAttendanceStaffByNucleus(user.nucleus);
  ui.professorClassDate.value = staff.classDate || "";
  ui.professorClassSchedule.value = staff.classSchedule || "";
  ui.professorClassProfessorName.value = staff.professorName || "";
  ui.professorClassMonitorName.value = staff.monitorName || "";

  const lock = getLock(user.nucleus);
  ui.classLockBadge.classList.toggle("hidden", !lock.locked);

  const students = getProjectStudents().filter((s) => s.nucleus === user.nucleus);
  renderBoard(ui.professorBoard, students, user);

  renderPlanningList(user.nucleus);
  renderProfessorHistory(user.nucleus);
}

function onSaveClassCalendar(){ /* já definido acima */ }
function onAddVisitor(){ /* já definido acima */ }
function onOpenWhatsapp(){ /* já definido acima */ }
function onCreateUser(){ /* já definido acima */ }
function onAdjustStock(){ /* já definido acima */ } 
