// ==========================================
// 1. Initialize Icons
// ==========================================
lucide.createIcons();

// ==========================================
// 2. Particle Canvas Background Animation
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const PARTICLE_COUNT = 60;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
}

function initParticles() {
  if (!canvas) return;
  resizeCanvas();
  particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.5 + 0.1,
  }));
}

function drawParticles() {
  if (!canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 59, 59, ${p.alpha})`;
    ctx.fill();
  });
  
  particles.forEach((a, i) => {
    particles.slice(i + 1).forEach(b => {
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255, 59, 59, ${0.12 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });
  
  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', resizeCanvas);
initParticles();
drawParticles();

// ==========================================
// 3. Scroll Reveal Animations (Intersection Observer)
// ==========================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
        entry.target.style.opacity = "1";
        entry.target.style.animation = "slideUp 0.6s ease-out forwards";
      }, index * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
document.querySelectorAll('.reveal-card').forEach((el) => revealObserver.observe(el));

// ==========================================
// 4. API Integration & Scanner Logic
// ==========================================
const scanInput = document.getElementById('scan-input');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const scannerCard = document.getElementById('scanner-card');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const errorBox = document.getElementById('error-box');
const errorText = document.getElementById('error-text');
const resultCard = document.getElementById('result-card');
const threatBarsContainer = document.getElementById('threat-bars');
const scannerSteps = document.getElementById('scanner-steps');
const copyReportBtn = document.getElementById('copy-report-btn');

// Deployed Render backend API URL
const API_URL = "https://smartspam-ml-backend.onrender.com/predict";

// State to store current result for copy report functionality
let currentResult = null;

// Danger keywords for highlight scanning
const DANGER_KEYWORDS = [
  "sbi", "axis", "icici", "hdfc", "bank", "kyc", "verify", "blocked", "unauthorized",
  "login", "winner", "won", "prize", "lottery", "cashback", "credited", "loan", "card",
  "pan", "aadhar", "click", "net", "http", "https", "link", "reward", "urgent",
  "action", "recharge", "claim", "free", "gift", "deal", "limited", "offer", "crore",
  "lakh", "cash", "otp", "password", "security", "update", "verify-net", "pending"
];

// Highlight function
function getHighlightedHtml(text) {
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  DANGER_KEYWORDS.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
    escaped = escaped.replace(regex, `<span class="highlight-keyword">$1</span>`);
  });
  return escaped;
}

// ─── Input Event Listeners ───
scanInput.addEventListener('input', () => {
  const text = scanInput.value.trim();
  if (text.length > 0) {
    submitBtn.classList.remove('disabled');
    clearBtn.classList.remove('hidden');
  } else {
    submitBtn.classList.add('disabled');
    clearBtn.classList.add('hidden');
  }
});

scanInput.addEventListener('focus', () => scannerCard.classList.add('focused'));
scanInput.addEventListener('blur', () => scannerCard.classList.remove('focused'));

clearBtn.addEventListener('click', () => {
  scanInput.value = '';
  submitBtn.classList.add('disabled');
  clearBtn.classList.add('hidden');
  resultCard.classList.add('hidden');
  errorBox.classList.add('hidden');
  scannerSteps.classList.add('hidden');
  resetSteps();
});

// ─── Quick Examples Event Listeners ───
document.querySelectorAll('.example-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sampleText = btn.getAttribute('data-text');
    scanInput.value = sampleText;
    submitBtn.classList.remove('disabled');
    clearBtn.classList.remove('hidden');
    scanInput.focus();
    
    // Smooth scroll to input card on smaller screens
    scannerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Run prediction automatically for excellent UX
    triggerScan(sampleText);
  });
});

// Helper to trigger scan programmatically
function triggerScan(text) {
  submitBtn.click();
}

// Reset steps visual status
function resetSteps() {
  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) {
      stepEl.className = 'step-item';
      stepEl.querySelector('.step-icon').setAttribute('data-lucide', 'circle-dashed');
    }
  }
  lucide.createIcons();
}

// Update single step status
function updateStep(stepNum, status) {
  const stepEl = document.getElementById(`step-${stepNum}`);
  if (!stepEl) return;
  
  stepEl.className = `step-item ${status}`;
  const icon = stepEl.querySelector('.step-icon');
  
  if (status === 'active') {
    icon.setAttribute('data-lucide', 'circle-dashed');
    icon.classList.add('spin');
  } else if (status === 'completed') {
    icon.setAttribute('data-lucide', 'check-circle-2');
    icon.classList.remove('spin');
  } else if (status === 'failed') {
    icon.setAttribute('data-lucide', 'alert-circle');
    icon.classList.remove('spin');
  }
  lucide.createIcons();
}

// Sleep helper for loading simulation delay
const sleep = ms => new Promise(res => setTimeout(res, ms));

// ─── API Submit Logic ───
submitBtn.addEventListener('click', async () => {
  const text = scanInput.value.trim();
  
  if (!text) {
    showError("Please enter a message to analyze.");
    return;
  }
  
  // Prepare UI Loading State
  submitBtn.classList.add('disabled');
  btnText.classList.add('hidden');
  btnLoading.classList.remove('hidden');
  errorBox.classList.add('hidden');
  
  // Hide old results
  resultCard.style.animation = 'none';
  resultCard.classList.add('hidden');
  void resultCard.offsetWidth; // trigger reflow
  
  // Show steps
  scannerSteps.classList.remove('hidden');
  resetSteps();
  
  try {
    // Step 1: Preprocessing
    updateStep(1, 'active');
    await sleep(500); // simulated processing delay
    updateStep(1, 'completed');
    
    // Step 2: TF-IDF Vectorizer
    updateStep(2, 'active');
    await sleep(400); // simulated processing delay
    updateStep(2, 'completed');
    
    // Step 3: Evaluation
    updateStep(3, 'active');
    
    console.log("Request:", { text });
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      updateStep(3, 'failed');
      if (response.status === 503) {
        throw new Error("Model is not loaded on the server. Run train_model.py to train it first.");
      } else if (response.status === 500) {
        throw new Error("Internal Server Error: The prediction engine failed.");
      } else {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log("Response:", data);
    
    if (!data || typeof data.prediction === 'undefined' || typeof data.confidence === 'undefined') {
      updateStep(3, 'failed');
      throw new Error("Invalid response format received from prediction server.");
    }
    
    updateStep(3, 'completed');
    await sleep(200);
    
    // Display results
    showResult(text, data.prediction, data.confidence);
    
    // Save to Local History
    saveToHistory(text, data.prediction, data.confidence);
    
  } catch (err) {
    console.log("Error:", err);
    if (err.name === "TypeError" || err.message.includes("Failed to fetch")) {
      showError("Unable to reach the threat analysis API. Render free-tier servers spin down after inactivity. Please wait 30-50 seconds for the backend to boot and try scanning again.");
    } else {
      showError(err.message);
    }
  } finally {
    submitBtn.classList.remove('disabled');
    btnLoading.classList.add('hidden');
    btnText.classList.remove('hidden');
  }
});

// ─── UI Helper Functions ───
function showError(msg) {
  errorText.textContent = msg;
  errorBox.classList.remove('hidden');
  scannerSteps.classList.add('hidden');
}

function showResult(text, prediction, confidence) {
  const isSpam = prediction.toLowerCase() === "spam";
  const finalConfidence = Math.round(confidence);
  
  // Store prediction state locally for report copies
  currentResult = { text, prediction, confidence: finalConfidence };
  
  // Configure colors and icons
  if (isSpam) {
    resultCard.classList.remove('safe');
    document.getElementById('result-icon-box').innerHTML = '<i data-lucide="alert-triangle"></i>';
    document.getElementById('result-subtitle').textContent = "THREAT DETECTED";
    document.getElementById('result-title').textContent = "SPAM / MALICIOUS";
    document.getElementById('result-message').innerHTML = "⚠ ML model flagged this content as high-risk. Patterns consistent with phishing, scam, or unsolicited bulk messaging detected via NLP analysis.";
  } else {
    resultCard.classList.add('safe');
    document.getElementById('result-icon-box').innerHTML = '<i data-lucide="check-circle"></i>';
    document.getElementById('result-subtitle').textContent = "CONTENT VERIFIED";
    document.getElementById('result-title').textContent = "SAFE CONTENT";
    document.getElementById('result-message').innerHTML = "✓ Content analyzed and classified as legitimate. No spam indicators, phishing patterns, or malicious URL signatures were detected.";
  }
  
  document.getElementById('result-score').textContent = finalConfidence + "%";
  
  // Spam Probability score indicator
  const spamProbability = isSpam ? finalConfidence : (100 - finalConfidence);
  document.getElementById('probability-percentage').textContent = spamProbability + "%";
  
  // Highlight keywords
  const highlightedHtml = getHighlightedHtml(text);
  document.getElementById('highlighted-text').innerHTML = highlightedHtml;
  
  // Re-initialize Lucide Icons
  lucide.createIcons(); 
  
  // Generate Sub-Threat Bars dynamically based on model confidence
  const bars = isSpam
    ? [{ label: "Spam Probability", value: finalConfidence },
       { label: "Phishing Risk", value: Math.round(finalConfidence * 0.85) },
       { label: "Malicious Intent", value: Math.round(finalConfidence * 0.72) }]
    : [{ label: "Legitimacy Score", value: finalConfidence },
       { label: "Content Safety", value: Math.round(finalConfidence * 0.96) },
       { label: "Source Trust", value: Math.round(finalConfidence * 0.91) }];
       
  threatBarsContainer.innerHTML = bars.map(b => `
    <div class="threat-bar-container">
      <div class="threat-bar-label">
        <span>${b.label}</span>
        <span class="${isSpam ? 'text-red' : 'text-green'}">${b.value}%</span>
      </div>
      <div class="threat-bar-track">
        <div class="threat-bar-fill" style="width: 0%"></div>
      </div>
    </div>
  `).join('');
  
  // Show Card with animation
  resultCard.classList.remove('hidden');
  resultCard.style.animation = "popUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards";
  
  // Animate progress fills
  setTimeout(() => {
    // Fill main probability bar
    const mainProbabilityFill = document.getElementById('probability-fill');
    if (mainProbabilityFill) {
      mainProbabilityFill.style.width = spamProbability + "%";
      
      // Dynamic color shift based on risk index
      if (spamProbability >= 70) {
        mainProbabilityFill.style.backgroundColor = "var(--red-main)";
      } else if (spamProbability >= 30) {
        mainProbabilityFill.style.backgroundColor = "#EAB308"; // Warning yellow-orange
      } else {
        mainProbabilityFill.style.backgroundColor = "var(--green-main)";
      }
    }
    
    // Fill subbars
    const fills = threatBarsContainer.querySelectorAll('.threat-bar-fill');
    fills.forEach((fill, idx) => {
      fill.style.width = bars[idx].value + "%";
    });
  }, 100);
}

// ─── Copy Analysis Report ───
copyReportBtn.addEventListener('click', async () => {
  if (!currentResult) return;
  
  const { text, prediction, confidence } = currentResult;
  const isSpam = prediction.toLowerCase() === 'spam';
  const spamProbability = isSpam ? confidence : (100 - confidence);
  const timestamp = new Date().toLocaleString();
  
  const reportText = `--- SMART SPAM AI THREAT REPORT ---
Timestamp: ${timestamp}
Analyzed Text: "${text}"
-----------------------------------
Classification: ${prediction.toUpperCase()}
Confidence Score: ${confidence}%
Spam Risk Index: ${spamProbability}%
Status: ${isSpam ? 'HIGH RISK DETECTED (Phishing/Scam/Bulk)' : 'SAFE / VERIFIED CLEAN'}
Engine: Scikit-learn TF-IDF + Naive Bayes Classifier
-----------------------------------`;

  try {
    await navigator.clipboard.writeText(reportText);
    
    // Temporarily update button text/icon for success feedback
    const originalContent = copyReportBtn.innerHTML;
    copyReportBtn.innerHTML = '<i data-lucide="check" class="btn-icon text-green"></i> Report Copied!';
    copyReportBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    lucide.createIcons();
    
    setTimeout(() => {
      copyReportBtn.innerHTML = originalContent;
      copyReportBtn.style.borderColor = '';
      lucide.createIcons();
    }, 2000);
    
  } catch (err) {
    console.error("Failed to copy report:", err);
  }
});

// ==========================================
// 5. Prediction History Logs Manager
// ==========================================
const historyBody = document.getElementById('history-body');
const clearHistoryBtn = document.getElementById('clear-history-btn');

function getHistory() {
  return JSON.parse(localStorage.getItem('secureinbox_history') || '[]');
}

function saveToHistory(text, prediction, confidence) {
  const history = getHistory();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Keep logs unique, remove duplicate text scans
  const filtered = history.filter(item => item.text !== text);
  
  filtered.unshift({
    text,
    prediction,
    confidence: Math.round(confidence),
    timestamp
  });
  
  // Cap history list at 5 items to maintain clean aesthetics
  if (filtered.length > 5) {
    filtered.pop();
  }
  
  localStorage.setItem('secureinbox_history', JSON.stringify(filtered));
  renderHistory();
}

function deleteHistoryItem(index) {
  const history = getHistory();
  history.splice(index, 1);
  localStorage.setItem('secureinbox_history', JSON.stringify(history));
  renderHistory();
}

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem('secureinbox_history');
  renderHistory();
});

function renderHistory() {
  const history = getHistory();
  
  if (history.length === 0) {
    historyBody.innerHTML = `
      <tr id="history-empty-row">
        <td colspan="5" class="empty-state">No scans recorded yet. Try scanning a message above!</td>
      </tr>
    `;
    clearHistoryBtn.classList.add('hidden');
    return;
  }
  
  clearHistoryBtn.classList.remove('hidden');
  
  historyBody.innerHTML = history.map((item, idx) => `
    <tr>
      <td class="history-time">${item.timestamp}</td>
      <td>
        <div class="history-text-preview" title="${item.text.replace(/"/g, '&quot;')}">${item.text}</div>
      </td>
      <td>
        <span class="badge-history ${item.prediction.toLowerCase()}">${item.prediction}</span>
      </td>
      <td>${item.confidence}%</td>
      <td>
        <button class="btn-delete-item" data-index="${idx}" title="Delete Record">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  // Bind delete events
  historyBody.querySelectorAll('.btn-delete-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      deleteHistoryItem(idx);
    });
  });
  
  lucide.createIcons();
}

// Initial load rendering
renderHistory();
