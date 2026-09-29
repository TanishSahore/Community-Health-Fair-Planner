/* ============================================
   MEDISCAN AI — COMPLETE APPLICATION LOGIC
   ============================================ */

'use strict';

// ============================================
// STATE
// ============================================
let currentUser = null;
let lastResult  = null;
let selectedTime = '';
let selectedConsultType = 'online';
let currentDocIndex = null;
let isLightMode = false;

const APP_USERS = [
  { email:'patient@mediscan.ai', password:'password123', role:'patient', name:'John Doe' },
  { email:'doctor@mediscan.ai',  password:'password123', role:'doctor',  name:'Dr. Smith' },
  { email:'admin@mediscan.ai',   password:'password123', role:'admin',   name:'Admin User' }
];

// ============================================
// DOCTORS DATA
// ============================================
const DOCTORS = [
  { id:1, name:'Dr. Aisha Patel',    spec:'Diabetologist',   exp:12, rating:4.9, reviews:284, avatar:'AP', color:'#06B6D4', available:true,  tags:['Diabetes','Endocrinology','Metabolic Disorders'], fee:800  },
  { id:2, name:'Dr. Raj Mehta',      spec:'Cardiologist',    exp:18, rating:4.8, reviews:412, avatar:'RM', color:'#EF4444', available:true,  tags:['Heart Disease','Hypertension','ECG'], fee:1200 },
  { id:3, name:'Dr. Priya Nair',     spec:'Hepatologist',    exp:10, rating:4.7, reviews:198, avatar:'PN', color:'#FACC15', available:false, tags:['Liver Disease','Fatty Liver','Hepatitis'], fee:900  },
  { id:4, name:'Dr. Kiran Reddy',    spec:'Nephrologist',    exp:14, rating:4.8, reviews:231, avatar:'KR', color:'#6366F1', available:true,  tags:['Kidney Disease','CKD','Dialysis'], fee:1000 },
  { id:5, name:'Dr. Sanjay Gupta',   spec:'Pulmonologist',   exp:16, rating:4.6, reviews:319, avatar:'SG', color:'#22C55E', available:true,  tags:['Lung Disease','COPD','Asthma'], fee:850  },
  { id:6, name:'Dr. Meera Iyer',     spec:'Neurologist',     exp:20, rating:4.9, reviews:507, avatar:'MI', color:'#F97316', available:false, tags:["Parkinson's","Tremors","Movement Disorders"], fee:1500 },
  { id:7, name:'Dr. Vikram Singh',   spec:'Cardiologist',    exp:22, rating:4.7, reviews:389, avatar:'VS', color:'#EF4444', available:true,  tags:['Heart Disease','Chest Pain','Arrhythmia'], fee:1300 },
  { id:8, name:'Dr. Lakshmi Kumar',  spec:'Diabetologist',   exp:8,  rating:4.5, reviews:156, avatar:'LK', color:'#06B6D4', available:true,  tags:['Diabetes Type 2','Obesity','Diet'], fee:700  }
];

// ============================================
// DISEASE MODEL DATA
// ============================================
const DISEASE_ICONS = {
  'Diabetes':       '🩸',
  'Heart Disease':  '❤️',
  'Liver Disease':  '🫁',
  'Kidney Disease': '🫘',
  'Lung Disease':   '🌬️',
  "Parkinson's":    '🧠'
};
const DISEASE_COLORS = {
  'Diabetes':       '#06B6D4',
  'Heart Disease':  '#EF4444',
  'Liver Disease':  '#FACC15',
  'Kidney Disease': '#6366F1',
  'Lung Disease':   '#22C55E',
  "Parkinson's":    '#F97316'
};
const DISEASE_PRECAUTIONS = {
  'Diabetes':       ['🥗 Follow a low-glycemic diet','🏃 Exercise 30 min daily','💊 Monitor blood glucose regularly','🩺 Annual HbA1c test recommended','🚰 Stay well hydrated'],
  'Heart Disease':  ['❤️ Maintain healthy weight','🚭 Avoid smoking and alcohol','🧘 Manage stress levels','💊 Cardiac medications as prescribed','🏥 Regular ECG checkups'],
  'Liver Disease':  ['🚫 Avoid alcohol completely','💊 Consult hepatologist immediately','🥗 Low-fat diet recommended','💧 Stay hydrated','🩺 Monthly liver function tests'],
  'Kidney Disease': ['💧 Limit fluid intake','🧂 Reduce sodium and protein','💊 Blood pressure management crucial','🔬 Regular creatinine/BUN tests','🏥 Nephrology consultation needed'],
  'Lung Disease':   ['🚭 Quit smoking immediately','😷 Wear mask in polluted areas','💨 Breathing exercises daily','💊 Inhaler use as directed','🩺 Pulmonary function test needed'],
  "Parkinson's":    ['🧘 Physical therapy exercises','💊 Neurologist consultation urgent','🏃 Regular movement therapy','🧠 Cognitive exercises recommended','👨‍⚕️ Specialist care required']
};
const DISEASE_EXPLANATIONS = {
  'Diabetes':       ['Elevated glucose level detected','High BMI increases insulin resistance','Age is a contributing risk factor','Family history raises susceptibility','Frequent urination and thirst symptoms noted'],
  'Heart Disease':  ['High blood pressure recorded','Elevated cholesterol detected','Chest pain reported as symptom','Age and lifestyle are contributing factors','Sedentary behavior increases risk'],
  'Liver Disease':  ['Elevated bilirubin indicators detected','Nausea and jaundice symptoms noted','Elevated liver enzymes suspected','Alcohol or dietary factors contributing','Body weight and toxin exposure considered'],
  'Kidney Disease': ['High blood pressure affects kidneys','Swelling in extremities detected','Fatigue and back pain symptoms noted','Glucose levels impact kidney function','Age-related kidney decline assessed'],
  'Lung Disease':   ['Chronic cough symptom detected','Shortness of breath reported','Smoking history significantly increases risk','Oxygen saturation below optimal range','Wheezing or breathing difficulty indicators'],
  "Parkinson's":    ['Tremor symptom reported','Muscle rigidity indicators present','Age is a primary risk factor','Neurological movement pattern assessed','Gait and coordination factors analyzed']
};

// ============================================
// CHATBOT KNOWLEDGE BASE
// ============================================
const CHATBOT_KB = [
  { keys:['diabetes','blood sugar','glucose'],        ans:'🩸 <b>Diabetes</b> occurs when blood glucose is too high. Key symptoms: frequent urination, excessive thirst, blurred vision, fatigue. Normal fasting glucose: 70–100 mg/dL.' },
  { keys:['heart','cardiac','chest pain','ecg'],      ans:'❤️ <b>Heart Disease</b> includes conditions affecting the heart muscle, valves, and vessels. Warning signs: chest pain, shortness of breath, palpitations. Risk factors: high BP, high cholesterol, smoking.' },
  { keys:['liver','hepatitis','jaundice'],            ans:'🫁 <b>Liver Disease</b> signs include jaundice (yellow skin/eyes), abdominal swelling, dark urine, and fatigue. Causes include alcohol, hepatitis, and fatty liver disease.' },
  { keys:['kidney','renal','creatinine'],             ans:'🫘 <b>Kidney Disease</b> symptoms: swelling in legs, foamy urine, fatigue, decreased urination. Key markers: creatinine, BUN. Maintain hydration and control blood pressure.' },
  { keys:['lung','breath','cough','respiratory'],     ans:'🌬️ <b>Lung Disease</b> includes COPD, asthma, and pneumonia. Key signs: chronic cough, shortness of breath, wheezing. Avoid smoking; lung function tests recommended.' },
  { keys:['parkinson','tremor','shake','tremors'],    ans:"🧠 <b>Parkinson's Disease</b> is a neurological disorder. Symptoms: tremors, slow movement, stiffness, balance issues. It progresses slowly; early detection helps management." },
  { keys:['bp','blood pressure','hypertension'],      ans:'💉 Normal blood pressure is below 120/80 mmHg. Hypertension (high BP) is 130/80+. It is a major risk factor for heart disease, stroke, and kidney problems.' },
  { keys:['bmi','weight','obesity'],                  ans:'⚖️ BMI (Body Mass Index) measures body fat. Normal: 18.5–24.9. Overweight: 25–29.9. Obese: 30+. High BMI increases risk of diabetes, heart disease, and joint problems.' },
  { keys:['cholesterol','ldl','hdl','lipid'],         ans:'🧪 Cholesterol: Total should be <200 mg/dL. LDL (bad): <100. HDL (good): >60. High cholesterol increases arterial plaque and heart disease risk.' },
  { keys:['symptom','signs','feeling'],               ans:'🩺 Common disease warning signs include: persistent fatigue, unexplained weight loss, shortness of breath, chest pain, swelling, and changes in urination. Early detection saves lives!' },
  { keys:['diet','food','eat','nutrition'],           ans:'🥗 A healthy diet includes: vegetables, fruits, whole grains, lean proteins, and low-fat dairy. Limit: sugar, salt, saturated fats, and processed foods. Hydration is key!' },
  { keys:['exercise','workout','fitness','physical'], ans:'🏃 Regular exercise (150 min/week) reduces risk of diabetes, heart disease, and depression. Include: aerobic activity, strength training, and flexibility exercises.' },
  { keys:['hi','hello','hey','help'],                 ans:"👋 Hi! I'm <b>MediBot AI</b>, your health assistant. Ask me about diseases, symptoms, medications, or healthy lifestyle tips. I'm here to help!" },
  { keys:['appointment','book','doctor','consult'],   ans:"👨‍⚕️ To book a doctor appointment, navigate to the <b>Doctors</b> section from the sidebar. You can filter by specialization, availability, and book online or in-person consultations!" },
  { keys:['report','history','past','records'],       ans:"📋 Your health prediction history is saved in the <b>Reports</b> section. You can view past analyses and download PDF reports anytime." }
];

// ============================================
// INIT
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  setMinDate();
  renderDoctors(DOCTORS);
  loadDashboard();
  loadReports();
  checkSessionUser();
});

function checkSessionUser() {
  const saved = localStorage.getItem('mediscan_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    applyUser();
    showSection('dashboard');
    document.querySelector('.main-wrapper').style.display = 'flex';
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('section-login').classList.remove('active');
    document.getElementById('section-dashboard').classList.add('active');
  } else {
    document.querySelector('.main-wrapper').style.display = 'flex';
    document.getElementById('sidebar').style.display = 'none';
    document.querySelector('.header').style.display = 'none';
    document.getElementById('section-login').classList.add('active');
  }
}

// ============================================
// AUTH
// ============================================
function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const role     = document.getElementById('login-role').value;

  if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }

  const user = APP_USERS.find(u => u.email === email && u.password === password);
  if (!user) { showToast('Invalid email or password', 'error'); return; }
  if (user.role !== role) { showToast(`This account is not registered as a ${role}`, 'warning'); return; }

  currentUser = { ...user, initials: getInitials(user.name) };
  localStorage.setItem('mediscan_user', JSON.stringify(currentUser));
  applyUser();
  document.getElementById('sidebar').style.display = 'flex';
  document.querySelector('.header').style.display = 'flex';
  showSection('dashboard');
  showToast(`Welcome back, ${user.name}! 👋`, 'success');
}

function handleSignup() {
  const fname = document.getElementById('signup-fname').value.trim();
  const lname = document.getElementById('signup-lname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-password').value;
  const role  = document.getElementById('signup-role').value;

  if (!fname || !lname || !email || !pass) { showToast('Please fill all fields', 'error'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

  const name = `${fname} ${lname}`;
  currentUser = { email, name, role, initials: getInitials(name) };
  localStorage.setItem('mediscan_user', JSON.stringify(currentUser));
  applyUser();
  document.getElementById('sidebar').style.display = 'flex';
  document.querySelector('.header').style.display = 'flex';
  showSection('dashboard');
  showToast(`Account created! Welcome, ${fname}! 🎉`, 'success');
}

function logout() {
  localStorage.removeItem('mediscan_user');
  currentUser = null;
  document.getElementById('sidebar').style.display = 'none';
  document.querySelector('.header').style.display = 'none';
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-login').classList.add('active');
  showToast('Logged out successfully', 'info');
}

function applyUser() {
  if (!currentUser) return;
  const initials = currentUser.initials || getInitials(currentUser.name);
  document.getElementById('header-avatar').textContent  = initials;
  document.getElementById('sidebar-avatar').textContent = initials;
  document.getElementById('dd-avatar').textContent      = initials;
  document.getElementById('sidebar-name').textContent   = currentUser.name;
  document.getElementById('sidebar-role').textContent   = capitalize(currentUser.role);
  document.getElementById('dd-name').textContent        = currentUser.name;
  document.getElementById('dd-role').textContent        = capitalize(currentUser.role);
  document.getElementById('settings-name').value        = currentUser.name;
  document.getElementById('settings-email').value       = currentUser.email;
  updateWelcomeMsg();
}

function showSignup() {
  document.getElementById('login-card').style.display  = 'none';
  document.getElementById('signup-card').style.display = 'block';
}
function showLogin() {
  document.getElementById('signup-card').style.display = 'none';
  document.getElementById('login-card').style.display  = 'block';
}

// ============================================
// NAVIGATION
// ============================================
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const section = document.getElementById(`section-${name}`);
  const navItem = document.getElementById(`nav-${name}`);
  if (section) section.classList.add('active');
  if (navItem)  navItem.classList.add('active');
  if (name === 'reports')   loadReports();
  if (name === 'dashboard') loadDashboard();
  if (name === 'doctors')   filterDoctors();
  closeProfileMenu();
  return false;
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const mw = document.querySelector('.main-wrapper');
  if (window.innerWidth <= 768) {
    sb.classList.toggle('mobile-open');
  } else {
    sb.classList.toggle('collapsed');
    mw.classList.toggle('expanded');
  }
}

// ============================================
// DASHBOARD
// ============================================
function loadDashboard() {
  updateWelcomeMsg();
  const history = getHistory();
  document.getElementById('total-checks').textContent = history.length;
  document.getElementById('total-appts').textContent  = getAppointments().length;

  if (history.length > 0) {
    const last = history[history.length - 1];
    document.getElementById('risk-level-dash').textContent = last.topRisk + ' Risk';
    document.getElementById('risk-level-dash').style.color  =
      last.topRisk === 'High' ? 'var(--danger)' :
      last.topRisk === 'Medium' ? 'var(--warning)' : 'var(--success)';
    const score = Math.max(10, 100 - Math.round(last.scores['Diabetes'] * 0.15 + last.scores['Heart Disease'] * 0.2));
    document.getElementById('health-score').textContent = score;
  }

  renderRecentPredictions(history);
  if (history.length > 0) renderDashboardChart(history[history.length - 1].scores);
}

function updateWelcomeMsg() {
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = currentUser ? currentUser.name.split(' ')[0] : 'User';
  document.getElementById('welcome-msg').textContent = `${greeting}, ${name} 👋`;
}

function renderRecentPredictions(history) {
  const el = document.getElementById('recent-predictions-list');
  if (history.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🩺</div><p>No predictions yet. Run your first health check!</p><button class="btn btn-primary" onclick="showSection('detect')">Start Health Check</button></div>`;
    document.getElementById('dash-chart-header').style.display = 'none';
    document.getElementById('dash-chart-card').style.display   = 'none';
    return;
  }
  document.getElementById('dash-chart-header').style.display = 'flex';
  document.getElementById('dash-chart-card').style.display   = 'block';
  const recent = history.slice(-5).reverse();
  el.innerHTML = `<div class="prediction-timeline">${recent.map(p => `
    <div class="pred-item">
      <div class="pred-icon">${DISEASE_ICONS[p.topDisease] || '🩺'}</div>
      <div class="pred-info">
        <div class="pred-disease">${p.topDisease} (${p.topScore}%)</div>
        <div class="pred-date">${formatDate(p.date)}</div>
      </div>
      <span class="pred-badge badge-${p.topRisk.toLowerCase()}">${p.topRisk} Risk</span>
    </div>`).join('')}</div>`;
}

function renderDashboardChart(scores) {
  const canvas = document.getElementById('dashboard-chart');
  if (!canvas) return;
  drawBarChart(canvas, scores, 300);
}

// ============================================
// DISEASE DETECTION
// ============================================
function runPrediction() {
  const age         = parseInt(document.getElementById('input-age').value)         || 0;
  const bp          = parseInt(document.getElementById('input-bp').value)          || 0;
  const glucose     = parseInt(document.getElementById('input-glucose').value)     || 0;
  const cholesterol = parseInt(document.getElementById('input-cholesterol').value) || 0;
  const bmi         = parseFloat(document.getElementById('input-bmi').value)       || 22;
  const hr          = parseInt(document.getElementById('input-hr').value)          || 75;
  const o2          = parseInt(document.getElementById('input-o2').value)          || 98;
  const gender      = document.getElementById('input-gender').value;
  const smoking     = document.getElementById('input-smoking').value;
  const family      = document.getElementById('input-family').value;

  if (!age || !bp || !glucose || !cholesterol) {
    showToast('Please fill in Age, BP, Glucose, and Cholesterol', 'error');
    return;
  }
  if (age < 1 || age > 120)         { showToast('Age must be between 1–120', 'error'); return; }
  if (bp < 60 || bp > 200)          { showToast('Blood pressure must be 60–200 mmHg', 'error'); return; }
  if (glucose < 50 || glucose > 500){ showToast('Glucose must be 50–500 mg/dL', 'error'); return; }
  if (cholesterol < 100)             { showToast('Cholesterol must be above 100', 'error'); return; }

  const syms = getCheckedSymptoms();

  /* ---- SIMULATED ML MODELS ---- */
  const scores = {};

  // DIABETES MODEL (glucose + bmi + age + family + symptoms)
  let d = 0;
  d += normalize(glucose, 70, 300) * 35;
  d += normalize(bmi, 18, 50)      * 20;
  d += normalize(age, 20, 80)      * 15;
  if (syms.includes('frequent_urination')) d += 12;
  if (syms.includes('excessive_thirst'))   d += 10;
  if (syms.includes('blurred_vision'))     d += 8;
  if (syms.includes('fatigue'))            d += 5;
  if (family === 'diabetes')               d += 15;
  scores['Diabetes'] = clamp(Math.round(d), 2, 97);

  // HEART DISEASE MODEL (bp + cholesterol + age + chest pain + gender)
  let h = 0;
  h += normalize(bp, 80, 200)          * 30;
  h += normalize(cholesterol, 100, 400)* 25;
  h += normalize(age, 30, 80)          * 15;
  if (syms.includes('chest_pain'))        h += 18;
  if (syms.includes('shortness_breath'))  h += 12;
  if (syms.includes('fatigue'))           h += 6;
  if (gender === 'male')                  h += 5;
  if (family === 'heart')                 h += 12;
  if (hr > 100 || hr < 50)               h += 10;
  scores['Heart Disease'] = clamp(Math.round(h), 2, 97);

  // LIVER DISEASE MODEL (bmi + symptoms)
  let l = 0;
  l += normalize(bmi, 18, 50)     * 20;
  l += normalize(age, 20, 80)     * 10;
  if (syms.includes('jaundice'))   l += 25;
  if (syms.includes('nausea'))     l += 15;
  if (syms.includes('fatigue'))    l += 10;
  if (syms.includes('loss_appetite')) l += 12;
  if (syms.includes('weight_loss'))l += 8;
  l += Math.random() * 8;
  scores['Liver Disease'] = clamp(Math.round(l), 2, 88);

  // KIDNEY DISEASE MODEL (bp + glucose + age + swelling)
  let k = 0;
  k += normalize(bp, 80, 200)          * 25;
  k += normalize(glucose, 70, 300)     * 15;
  k += normalize(age, 30, 80)          * 10;
  if (syms.includes('swelling'))        k += 20;
  if (syms.includes('fatigue'))         k += 10;
  if (syms.includes('back_pain'))       k += 12;
  if (family === 'diabetes')            k += 8;
  k += Math.random() * 8;
  scores['Kidney Disease'] = clamp(Math.round(k), 2, 88);

  // LUNG DISEASE MODEL (o2 + smoking + cough + breath)
  let ln = 0;
  ln += (100 - normalize(o2, 80, 100) * 100) * 0.3;
  if (smoking === 'current')             ln += 30;
  if (smoking === 'former')              ln += 15;
  if (syms.includes('cough'))            ln += 25;
  if (syms.includes('shortness_breath')) ln += 20;
  ln += normalize(age, 30, 80) * 15;
  ln += Math.random() * 8;
  scores['Lung Disease'] = clamp(Math.round(ln), 2, 92);

  // PARKINSON'S MODEL (age + tremor + muscle pain)
  let p = 0;
  p += normalize(age, 40, 85) * 30;
  if (syms.includes('tremor'))      p += 35;
  if (syms.includes('muscle_pain')) p += 15;
  if (syms.includes('headache'))    p += 8;
  if (syms.includes('fatigue'))     p += 5;
  p += Math.random() * 10;
  scores["Parkinson's"] = clamp(Math.round(p), 2, 88);

  /* ---- FIND TOP DISEASE ---- */
  const topDisease = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const topScore   = scores[topDisease];
  const topRisk    = topScore >= 65 ? 'High' : topScore >= 40 ? 'Medium' : 'Low';

  lastResult = { scores, topDisease, topScore, topRisk, age, bp, glucose, cholesterol, bmi, date: new Date().toISOString() };

  /* ---- SAVE TO HISTORY ---- */
  const history = getHistory();
  history.push(lastResult);
  localStorage.setItem('mediscan_history', JSON.stringify(history));

  showResults(lastResult);
  showSection('results');
  showToast(`Analysis complete! Highest risk: ${topDisease}`, topRisk === 'High' ? 'error' : topRisk === 'Medium' ? 'warning' : 'success');
}

function showResults(res) {
  /* PRIMARY CARD */
  const riskClass = `risk-${res.topRisk.toLowerCase()}`;
  const barColor  = res.topRisk === 'High' ? '#EF4444' : res.topRisk === 'Medium' ? '#FACC15' : '#22C55E';
  document.getElementById('primary-result').className = `primary-result-card ${riskClass}`;
  document.getElementById('primary-result').innerHTML = `
    <div class="primary-result-inner">
      <div class="result-disease-icon">${DISEASE_ICONS[res.topDisease]}</div>
      <div class="result-info">
        <div class="result-disease-name">${res.topDisease}</div>
        <div class="result-confidence">Confidence: <strong>${res.topScore}%</strong> · Analyzed on ${formatDate(res.date)}</div>
        <div class="result-meta">
          <span class="risk-pill ${riskClass}">
            ${res.topRisk === 'High' ? '🔴' : res.topRisk === 'Medium' ? '🟡' : '🟢'} ${res.topRisk} Risk
          </span>
          <div class="confidence-bar-wrap">
            <div class="confidence-bar-label"><span>Probability</span><span>${res.topScore}%</span></div>
            <div class="confidence-bar-track">
              <div class="confidence-bar-fill" style="width:${res.topScore}%;background:${barColor};"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  /* DISEASE CARDS */
  const dEl = document.getElementById('disease-cards');
  dEl.innerHTML = Object.entries(res.scores).sort((a,b)=>b[1]-a[1]).map(([disease, pct]) => {
    const color = DISEASE_COLORS[disease];
    const isTop = disease === res.topDisease;
    return `<div class="disease-card${isTop?' highlight':''}">
      <div class="dc-top">
        <span style="font-size:1.3rem;">${DISEASE_ICONS[disease]}</span>
        <span class="dc-name">${disease}</span>
      </div>
      <div class="dc-pct" style="color:${color}">${pct}%</div>
      <div class="dc-bar">
        <div class="dc-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
    </div>`;
  }).join('');

  /* EXPLANATION */
  const expls = DISEASE_EXPLANATIONS[res.topDisease] || [];
  document.getElementById('explanation-content').innerHTML = expls.map(e => `
    <div class="explanation-item">
      <div class="expl-dot"></div>
      <div class="expl-text">${e}</div>
    </div>`).join('');

  /* PRECAUTIONS */
  const precs = DISEASE_PRECAUTIONS[res.topDisease] || [];
  document.getElementById('precautions-content').innerHTML = precs.map(p => `
    <div class="precaution-item">
      <span class="prec-icon">${p.substring(0,2)}</span>
      <span class="prec-text">${p.substring(2)}</span>
    </div>`).join('');

  /* CHART */
  setTimeout(() => {
    const canvas = document.getElementById('results-chart');
    if (canvas) drawBarChart(canvas, res.scores, 350);
  }, 100);
}

// ============================================
// CANVAS BAR CHART
// ============================================
function drawBarChart(canvas, scores, height) {
  const ctx    = canvas.getContext('2d');
  const w      = canvas.offsetWidth  || 800;
  const h      = height;
  canvas.width  = w;
  canvas.height = h;

  const diseases = Object.keys(scores);
  const values   = Object.values(scores);
  const maxVal   = 100;
  const pad      = { top:40, right:30, bottom:80, left:60 };
  const chartW   = w - pad.left - pad.right;
  const chartH   = h - pad.top - pad.bottom;
  const barW     = Math.floor(chartW / diseases.length * 0.55);
  const gap      = Math.floor(chartW / diseases.length);

  const isDark = !document.body.classList.contains('light-mode');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94A3B8' : '#475569';
  const bg        = isDark ? '#1E293B' : '#FFFFFF';

  /* BG */
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  /* GRID LINES */
  ctx.strokeStyle = gridColor;
  ctx.lineWidth   = 1;
  [0, 25, 50, 75, 100].forEach(v => {
    const y = pad.top + chartH - (v / maxVal) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(v + '%', pad.left - 8, y + 4);
  });

  /* BARS */
  diseases.forEach((d, i) => {
    const val    = values[i];
    const color  = DISEASE_COLORS[d] || '#06B6D4';
    const barH   = (val / maxVal) * chartH;
    const x      = pad.left + i * gap + (gap - barW) / 2;
    const y      = pad.top + chartH - barH;

    /* Shadow */
    ctx.shadowColor = color + '55';
    ctx.shadowBlur  = 12;

    /* Gradient */
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '55');
    ctx.fillStyle  = grad;
    ctx.shadowBlur = 0;

    /* Rounded bar */
    roundRect(ctx, x, y, barW, barH, 6);
    ctx.fill();

    /* Value label on top */
    ctx.fillStyle  = color;
    ctx.font       = 'bold 12px Inter, sans-serif';
    ctx.textAlign  = 'center';
    ctx.fillText(val + '%', x + barW / 2, y - 8);

    /* Disease label */
    ctx.save();
    ctx.translate(x + barW / 2, pad.top + chartH + 14);
    ctx.rotate(-Math.PI / 6);
    ctx.fillStyle  = textColor;
    ctx.font       = '11px Inter, sans-serif';
    ctx.textAlign  = 'right';
    ctx.fillText(d, 0, 0);
    ctx.restore();
  });

  /* TITLE */
  ctx.fillStyle  = isDark ? '#F1F5F9' : '#0F172A';
  ctx.font       = 'bold 14px Inter, sans-serif';
  ctx.textAlign  = 'center';
  ctx.fillText('Disease Probability Analysis (%)', w / 2, 20);
}

function roundRect(ctx, x, y, w, h, r) {
  if (h < r * 2) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================
// DOCTORS
// ============================================
function renderDoctors(list) {
  const grid = document.getElementById('doctors-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🔍</div><p>No doctors found matching your search.</p></div>`;
    return;
  }
  grid.innerHTML = list.map((doc, idx) => `
    <div class="doctor-card">
      <div class="doc-top">
        <div class="doc-avatar" style="background:${doc.color}22;color:${doc.color};">${doc.avatar}</div>
        <div class="doc-info">
          <div class="doc-name">${doc.name}</div>
          <div class="doc-spec">${doc.spec}</div>
          <span class="doc-avail ${doc.available ? 'avail-yes' : 'avail-no'}">
            ${doc.available ? '● Available Today' : '○ Not Available'}
          </span>
        </div>
      </div>
      <div class="doc-stats">
        <div class="doc-stat">
          <span class="doc-stat-val">${doc.exp}+</span>
          <span class="doc-stat-lbl">Years Exp</span>
        </div>
        <div class="doc-stat">
          <div class="doc-stars">${renderStars(doc.rating)}</div>
          <span class="doc-stat-lbl">${doc.rating} (${doc.reviews})</span>
        </div>
        <div class="doc-stat">
          <span class="doc-stat-val">₹${doc.fee}</span>
          <span class="doc-stat-lbl">Per Visit</span>
        </div>
      </div>
      <div class="doc-tags">${doc.tags.map(t => `<span class="doc-tag">${t}</span>`).join('')}</div>
      <button class="btn btn-primary btn-full" onclick="openAppointment(${idx})">
        📅 Book Appointment
      </button>
    </div>`).join('');
}

function filterDoctors() {
  const specFilter  = document.getElementById('doctor-filter').value;
  const availFilter = document.getElementById('avail-filter').value;
  const search      = (document.getElementById('doctor-search').value || '').toLowerCase();

  const filtered = DOCTORS.filter(doc => {
    const matchSpec  = specFilter  === 'all' || doc.spec.toLowerCase().includes(specFilter);
    const matchAvail = availFilter === 'all' || (availFilter === 'available' ? doc.available : !doc.available);
    const matchSearch= !search     || doc.name.toLowerCase().includes(search) || doc.spec.toLowerCase().includes(search);
    return matchSpec && matchAvail && matchSearch;
  });
  renderDoctors(filtered);
}

function renderStars(rating) {
  return Array.from({length:5}, (_, i) =>
    `<span style="color:${i < Math.round(rating) ? '#FACC15' : '#334155'}">★</span>`
  ).join('');
}

// ============================================
// APPOINTMENTS
// ============================================
function openAppointment(idx) {
  currentDocIndex = idx;
  const doc = DOCTORS[idx];
  document.getElementById('modal-doc-name').textContent = doc.name;
  document.getElementById('modal-doc-spec').textContent = doc.spec;
  document.getElementById('modal-doc-avatar').textContent = doc.avatar;
  document.getElementById('modal-doc-avatar').style.background = doc.color + '33';
  document.getElementById('modal-doc-avatar').style.color = doc.color;
  document.getElementById('appt-date').value  = '';
  document.getElementById('appt-notes').value = '';
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  selectedTime = '';
  document.getElementById('appointment-modal').classList.add('show');
}

function confirmAppointment() {
  const date  = document.getElementById('appt-date').value;
  const notes = document.getElementById('appt-notes').value;
  if (!date)         { showToast('Please select a date', 'error'); return; }
  if (!selectedTime) { showToast('Please select a time slot', 'error'); return; }

  const doc = DOCTORS[currentDocIndex];
  const appt = { docName:doc.name, spec:doc.spec, date, time:selectedTime, type:selectedConsultType, notes, bookedAt:new Date().toISOString() };
  const appts = getAppointments();
  appts.push(appt);
  localStorage.setItem('mediscan_appts', JSON.stringify(appts));

  document.getElementById('appointment-modal').classList.remove('show');
  showToast(`✅ Appointment booked with ${doc.name} on ${formatDate(date)} at ${selectedTime}`, 'success');
  document.getElementById('total-appts').textContent = appts.length;
}

function closeAppointmentModal() { document.getElementById('appointment-modal').classList.remove('show'); }
function closeModal(event) {
  if (event.target.classList.contains('modal-overlay')) closeAppointmentModal();
}
function selectTime(btn) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  btn.classList.add('selected');
  selectedTime = btn.textContent;
}
function selectConsultType(btn, type) {
  document.querySelectorAll('.consult-type').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedConsultType = type;
}
function setMinDate() {
  const d = document.getElementById('appt-date');
  if (d) d.min = new Date().toISOString().split('T')[0];
}

// ============================================
// REPORTS / HISTORY
// ============================================
function loadReports() {
  const history = getHistory();
  const el = document.getElementById('reports-content');
  if (history.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No health reports found. Complete a disease check to see results here.</p><button class="btn btn-primary" onclick="showSection('detect')">Start Health Check</button></div>`;
    return;
  }
  el.innerHTML = `<div class="reports-timeline">${history.slice().reverse().map((item, idx) => {
    const riskClass = item.topRisk === 'High' ? 'badge-high' : item.topRisk === 'Medium' ? 'badge-medium' : 'badge-low';
    return `<div class="report-item">
      <div class="report-num">#${history.length - idx}</div>
      <div class="report-body">
        <div class="report-disease">${DISEASE_ICONS[item.topDisease] || '🩺'} ${item.topDisease} &nbsp;<span class="pred-badge ${riskClass}">${item.topRisk} Risk ${item.topScore}%</span></div>
        <div class="report-date">${formatDate(item.date)}</div>
        <div class="report-params">
          <span class="param-chip">Age: ${item.age}</span>
          <span class="param-chip">BP: ${item.bp} mmHg</span>
          <span class="param-chip">Glucose: ${item.glucose} mg/dL</span>
          <span class="param-chip">Cholesterol: ${item.cholesterol} mg/dL</span>
          ${item.bmi ? `<span class="param-chip">BMI: ${item.bmi}</span>` : ''}
        </div>
      </div>
      <button class="btn btn-outline" style="font-size:0.78rem;padding:6px 14px;" onclick="viewReport(${history.length - 1 - idx})">View →</button>
    </div>`;
  }).join('')}</div>`;
}

function viewReport(idx) {
  const history = getHistory();
  lastResult = history[idx];
  showResults(lastResult);
  showSection('results');
}

function clearHistory() {
  if (!confirm('Clear all prediction history? This cannot be undone.')) return;
  localStorage.removeItem('mediscan_history');
  showToast('History cleared', 'info');
  loadReports();
  loadDashboard();
}

// ============================================
// PDF DOWNLOAD (print)
// ============================================
function downloadReport() {
  if (!lastResult) { showToast('No result to download', 'error'); return; }
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head>
  <title>MediScan AI Report</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#1e293b;padding:20px;}
    h1{color:#06B6D4;margin-bottom:4px;}
    h2{color:#334155;border-bottom:2px solid #e2e8f0;padding-bottom:8px;}
    .tag{display:inline-block;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:bold;margin:4px;}
    .high{background:#fef2f2;color:#ef4444;}
    .medium{background:#fffbeb;color:#f59e0b;}
    .low{background:#f0fdf4;color:#22c55e;}
    table{width:100%;border-collapse:collapse;margin:12px 0;}
    th,td{padding:10px;border:1px solid #e2e8f0;text-align:left;}
    th{background:#f8fafc;font-weight:600;}
    .header{display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;}
    .logo{font-size:1.5rem;font-weight:800;}
    .logo span{color:#06B6D4;}
  </style></head><body>
  <div class="header">
    <div><div class="logo">MediScan<span>AI</span></div><p>AI-Powered Healthcare Report</p></div>
    <div><p><b>Date:</b> ${formatDate(lastResult.date)}</p><p><b>Patient:</b> ${currentUser?.name || 'Patient'}</p></div>
  </div>
  <h2>Primary Diagnosis</h2>
  <p><b>Most Likely Disease:</b> ${lastResult.topDisease} ${DISEASE_ICONS[lastResult.topDisease]}</p>
  <p><b>Confidence Score:</b> ${lastResult.topScore}%</p>
  <p><b>Risk Level:</b> <span class="tag ${lastResult.topRisk.toLowerCase()}">${lastResult.topRisk} Risk</span></p>
  <h2>Health Parameters</h2>
  <table><tr><th>Parameter</th><th>Value</th><th>Normal Range</th></tr>
    <tr><td>Age</td><td>${lastResult.age} years</td><td>—</td></tr>
    <tr><td>Blood Pressure</td><td>${lastResult.bp} mmHg</td><td>90–120 mmHg</td></tr>
    <tr><td>Glucose Level</td><td>${lastResult.glucose} mg/dL</td><td>70–100 mg/dL</td></tr>
    <tr><td>Cholesterol</td><td>${lastResult.cholesterol} mg/dL</td><td>&lt;200 mg/dL</td></tr>
    <tr><td>BMI</td><td>${lastResult.bmi || '—'}</td><td>18.5–24.9</td></tr>
  </table>
  <h2>All Disease Probabilities</h2>
  <table><tr><th>Disease</th><th>Probability</th><th>Risk</th></tr>
  ${Object.entries(lastResult.scores).sort((a,b)=>b[1]-a[1]).map(([d,s]) =>
    `<tr><td>${DISEASE_ICONS[d]} ${d}</td><td>${s}%</td><td class="tag ${s>=65?'high':s>=40?'medium':'low'}">${s>=65?'High':s>=40?'Medium':'Low'}</td></tr>`
  ).join('')}
  </table>
  <h2>Recommended Precautions</h2>
  <ul>${(DISEASE_PRECAUTIONS[lastResult.topDisease] || []).map(p => `<li>${p}</li>`).join('')}</ul>
  <hr/><p style="font-size:0.75rem;color:#94a3b8;">⚠️ This report is generated by MediScan AI for informational purposes only. Always consult a qualified healthcare professional for medical advice.</p>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

// ============================================
// EMERGENCY
// ============================================
function showEmergency() { document.getElementById('emergency-modal').classList.add('show'); }
function closeEmergencyModal(event) {
  if (event.target === document.getElementById('emergency-modal'))
    document.getElementById('emergency-modal').classList.remove('show');
}

// ============================================
// CHATBOT
// ============================================
function toggleChatbot() {
  const win = document.getElementById('chatbot-window');
  win.style.display = win.style.display === 'none' ? 'flex' : 'none';
}

function sendChat() {
  const input = document.getElementById('chatbot-input');
  const query = input.value.trim();
  if (!query) return;

  addChatMsg(query, 'user');
  input.value = '';

  setTimeout(() => {
    const ans = getChatResponse(query.toLowerCase());
    addChatMsg(ans, 'bot');
  }, 600);
}

function addChatMsg(text, who) {
  const msgs = document.getElementById('chatbot-messages');
  const div  = document.createElement('div');
  div.className = `chat-msg ${who}`;
  div.innerHTML = `<span>${text}</span>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function getChatResponse(q) {
  for (const item of CHATBOT_KB) {
    if (item.keys.some(k => q.includes(k))) return item.ans;
  }
  return "🤔 I'm not sure about that. Try asking about specific diseases like diabetes, heart disease, or symptoms. You can also explore the <b>Detect Disease</b> section for a full health check!";
}

// ============================================
// SETTINGS
// ============================================
function saveSettings() {
  const name = document.getElementById('settings-name').value.trim();
  const email= document.getElementById('settings-email').value.trim();
  if (!name || !email) { showToast('Name and Email are required', 'error'); return; }
  if (currentUser) {
    currentUser.name  = name;
    currentUser.email = email;
    currentUser.initials = getInitials(name);
    localStorage.setItem('mediscan_user', JSON.stringify(currentUser));
    applyUser();
  }
  showToast('Settings saved successfully! ✅', 'success');
}

// ============================================
// THEME
// ============================================
function toggleTheme() {
  isLightMode = !isLightMode;
  document.body.classList.toggle('light-mode', isLightMode);
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) toggle.checked = !isLightMode;
  localStorage.setItem('mediscan_theme', isLightMode ? 'light' : 'dark');

  // Redraw chart if visible
  if (lastResult) {
    const rc = document.getElementById('results-chart');
    const dc = document.getElementById('dashboard-chart');
    if (rc && rc.closest('.section.active')) drawBarChart(rc, lastResult.scores, 350);
    if (dc && dc.closest('.section.active')) drawBarChart(dc, lastResult.scores, 300);
  }
}

// Apply saved theme
(function() {
  const saved = localStorage.getItem('mediscan_theme');
  if (saved === 'light') {
    isLightMode = true;
    document.body.classList.add('light-mode');
    const t = document.getElementById('dark-mode-toggle');
    if (t) t.checked = false;
  }
})();

// ============================================
// PROFILE DROPDOWN
// ============================================
function toggleProfileMenu() {
  document.getElementById('profile-dropdown').classList.toggle('open');
}
function closeProfileMenu() {
  document.getElementById('profile-dropdown').classList.remove('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.profile-menu')) closeProfileMenu();
});

// ============================================
// NOTIFICATIONS
// ============================================
function toggleNotifications() {
  showToast('📬 You have 3 health reminders: Annual checkup, Blood test due, Follow-up appointment', 'info');
  document.getElementById('notif-badge').style.display = 'none';
}

// ============================================
// FORM HELPERS
// ============================================
function clearForm() {
  ['input-age','input-bp','input-glucose','input-cholesterol','input-bmi','input-hr','input-o2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.symptom-cb input[type=checkbox]').forEach(cb => cb.checked = false);
  document.getElementById('input-smoking').value = 'never';
  document.getElementById('input-family').value  = 'none';
  document.getElementById('input-gender').value  = 'male';
  showToast('Form cleared', 'info');
}

function getCheckedSymptoms() {
  return Array.from(document.querySelectorAll('.symptom-cb input[type=checkbox]:checked')).map(cb => cb.value);
}

// ============================================
// STORAGE HELPERS
// ============================================
function getHistory()      { return JSON.parse(localStorage.getItem('mediscan_history') || '[]'); }
function getAppointments() { return JSON.parse(localStorage.getItem('mediscan_appts')   || '[]'); }

// ============================================
// MATH HELPERS
// ============================================
function normalize(val, min, max) { return Math.min(1, Math.max(0, (val - min) / (max - min))); }
function clamp(val, lo, hi)       { return Math.min(hi, Math.max(lo, val)); }

// ============================================
// STRING HELPERS
// ============================================
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Handle Enter on chatbot input
document.addEventListener('DOMContentLoaded', () => {
  const ci = document.getElementById('chatbot-input');
  if (ci) ci.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
});
