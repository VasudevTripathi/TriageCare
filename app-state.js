// TriageCare State Manager & Shared Logic (Pure In-Memory URL State Propagation with LocalStorage Fallback)
(function() {
  // 1. Initial Default State Database
  const DEFAULT_PATIENTS = [
    { id: 'P001', name: 'Rahul Sharma', age: 34, severity: 10, status: 'Critical', arrivalOrder: 1 },
    { id: 'P003', name: 'Sneha Patel', age: 28, severity: 9, status: 'Critical', arrivalOrder: 3 },
    { id: 'P005', name: 'Amit Verma', age: 45, severity: 7, status: 'High', arrivalOrder: 5 },
    { id: 'P002', name: 'Priya Singh', age: 22, severity: 5, status: 'Medium', arrivalOrder: 2 },
    { id: 'P004', name: 'Vikram Joshi', age: 30, severity: 4, status: 'Low', arrivalOrder: 4 },
    { id: 'P006', name: 'Rohan Das', age: 38, severity: 3, status: 'Low', arrivalOrder: 6 },
    { id: 'P007', name: 'Neha Gupta', age: 25, severity: 2, status: 'Low', arrivalOrder: 7 }
  ];

  // 2. In-Memory State Variables
  let currentPatients = [];
  let totalPatientsCount = 12;
  let treatedPatientsCount = 5;
  let currentTheme = 'light';

  // Helper: Map severity score to status string
  function getStatusString(severity) {
    if (severity >= 9) return 'Critical';
    if (severity >= 7) return 'High';
    if (severity >= 5) return 'Medium';
    return 'Low';
  }

  // 3. Base64 State Serialization & Deserialization
  function serializeState() {
    const data = {
      p: currentPatients.map(p => [p.id, p.name, p.age, p.severity, p.arrivalOrder]),
      tot: totalPatientsCount,
      tr: treatedPatientsCount,
      th: currentTheme
    };
    try {
      const jsonStr = JSON.stringify(data);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      return encodeURIComponent(base64);
    } catch (e) {
      console.error("Serialization failed", e);
      return '';
    }
  }

  function deserializeState(str) {
    if (!str) return null;
    try {
      const base64 = decodeURIComponent(str);
      const jsonStr = decodeURIComponent(escape(atob(base64)));
      const data = JSON.parse(jsonStr);
      return {
        patients: data.p.map(arr => ({
          id: arr[0],
          name: arr[1],
          age: parseInt(arr[2], 10),
          severity: parseInt(arr[3], 10),
          status: getStatusString(parseInt(arr[3], 10)),
          arrivalOrder: parseInt(arr[4] !== undefined ? arr[4] : arr[0].substring(1), 10)
        })),
        total: parseInt(data.tot, 10),
        treated: parseInt(data.tr, 10),
        theme: data.th || 'light'
      };
    } catch (e) {
      console.error("Deserialization failed", e);
      return null;
    }
  }

  // Save state helper to write to localStorage as fallback
  function saveToLocalStorage() {
    const s = serializeState();
    if (s) {
      try {
        localStorage.setItem('tc_state', s);
      } catch (e) {
        // Ignore restricted storage errors
      }
    }
  }

  // Initialize state from URL or LocalStorage fallback
  const urlParams = new URLSearchParams(window.location.search);
  const stateStr = urlParams.get('s');
  let parsedState = deserializeState(stateStr);

  if (!parsedState) {
    try {
      const localStr = localStorage.getItem('tc_state');
      if (localStr) {
        parsedState = deserializeState(localStr);
      }
    } catch (e) {
      // Ignore errors
    }
  }

  if (parsedState) {
    currentPatients = parsedState.patients;
    totalPatientsCount = parsedState.total;
    treatedPatientsCount = parsedState.treated;
    currentTheme = parsedState.theme;
  } else {
    currentPatients = DEFAULT_PATIENTS.map(p => ({ ...p }));
    totalPatientsCount = 12;
    treatedPatientsCount = 5;
    currentTheme = 'light';
    saveToLocalStorage();
  }

  // 4. State Controller API
  window.TriageState = {
    getPatients: function() {
      return currentPatients;
    },
    
    getStats: function() {
      return {
        total: totalPatientsCount,
        waiting: currentPatients.length,
        treated: treatedPatientsCount
      };
    },

    navigateTo: function(url) {
      const s = serializeState();
      const separator = url.includes('?') ? '&' : '?';
      window.location.href = url + separator + 's=' + s;
    },

    addPatient: function(name, age, severity) {
      const parsedAge = parseInt(age, 10);
      const parsedSeverity = parseInt(severity, 10);
      
      if (!name || isNaN(parsedAge) || parsedAge <= 0 || isNaN(parsedSeverity) || parsedSeverity < 1 || parsedSeverity > 10) {
        return null;
      }

      totalPatientsCount++;
      const nextId = 'P' + String(totalPatientsCount).padStart(3, '0');
      
      const newPatient = {
        id: nextId,
        name: name,
        age: parsedAge,
        severity: parsedSeverity,
        status: getStatusString(parsedSeverity),
        arrivalOrder: totalPatientsCount
      };

      currentPatients.push(newPatient);

      // Sort by highest severity first. If equal, sort by arrivalOrder ascending.
      currentPatients.sort((a, b) => {
        if (b.severity !== a.severity) {
          return b.severity - a.severity;
        }
        return a.arrivalOrder - b.arrivalOrder;
      });

      saveToLocalStorage();
      return newPatient;
    },

    treatNextPatient: function() {
      if (currentPatients.length === 0) return null;
      const treatedPatient = currentPatients.shift();
      treatedPatientsCount++;
      saveToLocalStorage();
      this.syncUI();
      return treatedPatient;
    },

    getStatusBadgeClass: function(status) {
      switch (status) {
        case 'Critical': return 'tc-badge-danger';
        case 'High': return 'tc-badge-warning';
        case 'Medium': return 'tc-badge-info';
        default: return 'tc-badge-neutral';
      }
    },

    getAvatarStyle: function(status) {
      switch (status) {
        case 'Critical':
          return 'background-color: var(--tc-color-danger-bg); color: var(--tc-color-danger); border-color: var(--tc-color-danger-border);';
        case 'High':
          return 'background-color: var(--tc-color-warning-bg); color: var(--tc-color-warning); border-color: var(--tc-color-warning-border);';
        case 'Medium':
          return 'background-color: var(--tc-color-info-bg); color: var(--tc-color-info); border-color: var(--tc-color-info-border);';
        default:
          return '';
      }
    },

    // Synchronize DOM elements to current state
    syncUI: function() {
      const stats = this.getStats();
      const patients = this.getPatients();

      // Update sidebar queue badge counter
      document.querySelectorAll('.tc-sidebar-nav a').forEach(a => {
        const span = a.querySelector('span');
        if (span && span.textContent.trim() === 'Waiting Queue') {
          const badge = a.querySelector('.tc-badge');
          if (badge) badge.textContent = String(stats.waiting);
        }
      });

      // Update total patients, waiting patients, treated patients summary cards
      document.querySelectorAll('.tc-card').forEach(card => {
        const titleEl = card.querySelector('.tc-card-title');
        if (!titleEl) return;
        const titleText = titleEl.textContent.trim();
        const valueEl = card.querySelector('.tc-card-body p');
        if (!valueEl) return;

        if (titleText === 'Total Patients') {
          valueEl.textContent = String(stats.total);
        } else if (titleText === 'Waiting Patients') {
          valueEl.textContent = String(stats.waiting);
        } else if (titleText === 'Treated Patients') {
          valueEl.textContent = String(stats.treated);
        }
      });

      // Render Dashboard Queue Table (Top 5 only)
      const dashboardTableBody = document.querySelector('#dashboardQueueTable tbody');
      if (dashboardTableBody) {
        dashboardTableBody.innerHTML = '';
        if (patients.length === 0) {
          dashboardTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--tc-color-text-muted); padding: var(--tc-space-6);">No patients currently in the queue.</td></tr>`;
        } else {
          patients.slice(0, 5).forEach((p, idx) => {
            const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const avatarStyle = this.getAvatarStyle(p.status);
            const badgeClass = this.getStatusBadgeClass(p.status);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td style="padding-left: 24px;"><span class="tc-text-semibold tc-text-main">${idx + 1}</span></td>
              <td><span class="tc-text-semibold tc-text-primary">${p.id}</span></td>
              <td>
                <div class="tc-table-cell-profile">
                  <div class="tc-table-avatar" style="${avatarStyle}">${initials}</div>
                  <span class="tc-text-main tc-text-semibold">${p.name}</span>
                </div>
              </td>
              <td>${p.age}</td>
              <td><span class="tc-text-semibold tc-text-main">${p.severity}</span></td>
              <td style="padding-right: 24px;"><span class="tc-badge ${badgeClass}">${p.status}</span></td>
            `;
            dashboardTableBody.appendChild(tr);
          });
        }
      }

      // Render Waiting Queue Table (All patients)
      const queueTableBody = document.querySelector('.queue-table-card tbody');
      if (queueTableBody) {
        queueTableBody.innerHTML = '';
        const casesCountBadge = document.querySelector('.queue-table-card .tc-badge-primary');
        if (casesCountBadge) {
          casesCountBadge.textContent = `${stats.waiting} Active Cases`;
        }
        
        if (patients.length === 0) {
          queueTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--tc-color-text-muted); padding: var(--tc-space-6);">No patients currently in the queue.</td></tr>`;
        } else {
          patients.forEach((p, idx) => {
            const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const avatarStyle = this.getAvatarStyle(p.status);
            const badgeClass = this.getStatusBadgeClass(p.status);

            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td class="tc-text-semibold tc-text-main">${idx + 1}</td>
              <td class="tc-text-primary tc-text-semibold">${p.id}</td>
              <td>
                <div class="tc-table-cell-profile">
                  <div class="tc-table-avatar" style="${avatarStyle}">${initials}</div>
                  <span class="tc-text-main tc-text-medium">${p.name}</span>
                </div>
              </td>
              <td>${p.age}</td>
              <td class="tc-text-semibold tc-text-main">${p.severity}</td>
              <td><span class="tc-badge ${badgeClass}">${p.status}</span></td>
            `;
            queueTableBody.appendChild(tr);
          });
        }
      }

      // Render Next Patient card on Dashboard
      const nextPatientCard = document.querySelector('.tc-card-glass');
      if (nextPatientCard) {
        const nextPatientProfile = nextPatientCard.querySelector('.next-patient-profile');
        const nextPatientFooter = nextPatientCard.querySelector('.tc-card-footer');
        const levelBadge = nextPatientCard.querySelector('.tc-card-header .tc-badge-danger');
        
        if (patients.length === 0) {
          if (levelBadge) levelBadge.style.display = 'none';
          if (nextPatientProfile) {
            nextPatientProfile.innerHTML = `
              <div style="padding: var(--tc-space-6) 0; color: var(--tc-color-text-muted);">
                <p class="tc-text-semibold">Queue Empty</p>
                <span class="tc-text-xs">No patients waiting.</span>
              </div>
            `;
          }
          if (nextPatientFooter) {
            const btn = nextPatientFooter.querySelector('.tc-btn');
            if (btn) btn.disabled = true;
          }
        } else {
          const topPatient = patients[0];
          const initials = topPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          if (levelBadge) {
            levelBadge.style.display = 'inline-flex';
            levelBadge.textContent = `Level ${topPatient.severity}`;
          }

          if (nextPatientProfile) {
            nextPatientProfile.innerHTML = `
              <div class="next-patient-avatar">${initials}</div>
              <div>
                <h4 class="tc-text-main" style="margin-bottom: 2px;">${topPatient.name}</h4>
                <span class="tc-badge-dot tc-badge-dot-danger tc-text-xs">${topPatient.status} Admission</span>
              </div>
              <div class="next-patient-vitals">
                <div class="vital-stat-box" style="border-right: 1px solid var(--tc-color-divider);">
                  <span class="vital-stat-label">Patient ID</span>
                  <span class="vital-stat-value">${topPatient.id}</span>
                </div>
                <div class="vital-stat-box">
                  <span class="vital-stat-label">Age</span>
                  <span class="vital-stat-value">${topPatient.age} yrs</span>
                </div>
              </div>
            `;
          }
          if (nextPatientFooter) {
            const btn = nextPatientFooter.querySelector('.tc-btn');
            if (btn) btn.disabled = false;
          }
        }
      }

      // Render Treat Patient card page
      const treatCard = document.querySelector('.treat-card');
      if (treatCard) {
        // Exclude the exitModalCard
        if (treatCard.id !== 'exitModalCard') {
          if (patients.length === 0) {
            treatCard.innerHTML = `
              <h2 class="tc-text-main" style="font-size: var(--tc-font-2xl); margin-bottom: var(--tc-space-6); font-weight: var(--tc-weight-bold); letter-spacing: -0.02em;">Next Patient To Treat</h2>
              <div style="padding: var(--tc-space-10) 0; text-align: center; color: var(--tc-color-text-muted);">
                <p class="tc-text-semibold" style="font-size: var(--tc-font-lg); margin-bottom: var(--tc-space-2);">No patients waiting.</p>
                <span class="tc-text-xs">There are no patients awaiting treatment in the priority queue.</span>
              </div>
              <button id="pageTreatPatientBtn" class="tc-btn tc-btn-primary" style="width: 100%; padding: 14px 20px; font-size: var(--tc-font-base); justify-content: center; margin-bottom: var(--tc-space-3);" disabled>
                Treat Patient
              </button>
              <span class="tc-text-muted tc-text-xs">Highest priority patient will always be treated first.</span>
            `;
          } else {
            const topPatient = patients[0];
            const initials = topPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const avatarStyle = this.getAvatarStyle(topPatient.status);
            const badgeClass = this.getStatusBadgeClass(topPatient.status);

            treatCard.innerHTML = `
              <h2 class="tc-text-main" style="font-size: var(--tc-font-2xl); margin-bottom: var(--tc-space-6); font-weight: var(--tc-weight-bold); letter-spacing: -0.02em;">Next Patient To Treat</h2>
              
              <!-- Large Avatar -->
              <div class="avatar-large-wrapper">
                <div class="avatar-large-circle" style="${avatarStyle}">${initials}</div>
              </div>

              <!-- Patient Identity Details -->
              <h3 class="tc-text-main" style="font-size: var(--tc-font-xl); font-weight: var(--tc-weight-semibold); margin-bottom: 2px;">${topPatient.name}</h3>
              <span class="tc-badge ${badgeClass}" style="margin-bottom: var(--tc-space-4);">${topPatient.status} Admission</span>

              <!-- Vitals and parameters grid -->
              <div class="patient-vitals-grid">
                <div class="vital-item" style="border-right: 1px solid var(--tc-color-border);">
                  <span class="vital-label">Patient ID</span>
                  <span class="vital-value">${topPatient.id}</span>
                </div>
                <div class="vital-item" style="border-right: 1px solid var(--tc-color-border);">
                  <span class="vital-label">Age</span>
                  <span class="vital-value">${topPatient.age} yrs</span>
                </div>
                <div class="vital-item">
                  <span class="vital-label">Severity</span>
                  <span class="vital-value" style="color: var(--tc-color-danger);">${topPatient.severity} / 10</span>
                </div>
              </div>

              <!-- Large treatment CTA button -->
              <button id="pageTreatPatientBtn" type="button" class="tc-btn tc-btn-primary" style="width: 100%; padding: 14px 20px; font-size: var(--tc-font-base); justify-content: center; margin-bottom: var(--tc-space-3);">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right: var(--tc-space-1);"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Treat Patient
              </button>

              <!-- Disclaimer caption footer -->
              <span class="tc-text-muted tc-text-xs">Highest priority patient will always be treated first.</span>
            `;

            // Bind treat button
            const btn = document.getElementById('pageTreatPatientBtn');
            if (btn) {
              btn.addEventListener('click', () => {
                window.TriageState.treatNextPatient();
              });
            }
          }
        }
      }

      // Sync Add Patient ID preview
      const idInput = document.getElementById('patientId');
      if (idInput) {
        idInput.value = 'P' + String(totalPatientsCount + 1).padStart(3, '0');
      }
    }
  };

  // 5. Setup DOM Event Listeners & Initialize
  document.addEventListener('DOMContentLoaded', () => {
    // Apply Theme
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      if (currentTheme === 'dark') {
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />`;
      } else {
        themeIcon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
      }
    }

    // A. Intercept vertical sidebar navigation links
    document.querySelectorAll('.tc-sidebar-nav a').forEach(a => {
      const span = a.querySelector('span');
      if (!span) return;
      const label = span.textContent.trim();
      
      let target = '';
      if (label === 'Dashboard') target = 'index.html';
      else if (label === 'Add Patient') target = 'add-patient.html';
      else if (label === 'Waiting Queue') target = 'waiting-queue.html';
      else if (label === 'Treat Patient') target = 'treat-patient.html';
      else if (label === 'Exit') target = 'exit.html';

      if (target) {
        a.removeAttribute('href');
        a.style.cursor = 'pointer';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          window.TriageState.navigateTo(target);
        });
      }
    });

    // B. Intercept Dashboard Quick Action items
    document.querySelectorAll('.quick-actions-stack button, .quick-actions-stack a').forEach(el => {
      const span = el.querySelector('span');
      if (!span) return;
      const label = span.textContent.trim();
      
      let target = '';
      if (label === 'Add Patient') target = 'add-patient.html';
      else if (label === 'Queue') target = 'waiting-queue.html';
      else if (label === 'Treat') target = 'treat-patient.html';
      else if (label === 'Exit') target = 'exit.html';

      if (target) {
        el.removeAttribute('onclick');
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.preventDefault();
          window.TriageState.navigateTo(target);
        });
      }
    });

    // C. Theme toggler
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          currentTheme = 'light';
          if (themeIcon) {
            themeIcon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
          }
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          currentTheme = 'dark';
          if (themeIcon) {
            themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />`;
          }
        }
        saveToLocalStorage();
      });
    }

    // D. Add Patient Form submit logic with explicit frontend validation
    const addPatientForm = document.getElementById('addPatientForm');
    if (addPatientForm) {
      addPatientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('patientName');
        const ageInput = document.getElementById('patientAge');
        const severitySelect = document.getElementById('patientSeverity');

        if (!nameInput || !ageInput || !severitySelect) return;

        const name = nameInput.value.trim();
        const ageVal = ageInput.value.trim();
        const severityVal = severitySelect.value;

        // Validation checks
        if (!name || !ageVal || !severityVal) {
          alert("All fields are required.");
          return;
        }

        const age = parseInt(ageVal, 10);
        const severity = parseInt(severityVal, 10);

        if (isNaN(age) || age <= 0) {
          alert("Age must be greater than 0.");
          return;
        }

        if (isNaN(severity) || severity < 1 || severity > 10) {
          alert("Severity must be between 1 and 10.");
          return;
        }

        // Add the patient
        const newP = window.TriageState.addPatient(name, age, severity);
        if (newP) {
          // Navigate back to Dashboard with state
          window.TriageState.navigateTo('index.html');
        }
      });
    }

    // E. Treat Now button on Dashboard right-sidebar card
    const nextPatientCard = document.querySelector('.tc-card-glass');
    if (nextPatientCard) {
      const treatNowBtn = nextPatientCard.querySelector('.tc-card-footer button.tc-btn-primary');
      if (treatNowBtn) {
        treatNowBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.TriageState.treatNextPatient();
        });
      }
    }

    // F. Exit Modal confirmation actions
    const confirmExitBtn = document.getElementById('confirmExitBtn');
    if (confirmExitBtn) {
      confirmExitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.TriageState.navigateTo('index.html');
      });
    }
    const cancelExitBtn = document.querySelector('.modal-actions .tc-btn-outline');
    if (cancelExitBtn) {
      cancelExitBtn.removeAttribute('href');
      cancelExitBtn.style.cursor = 'pointer';
      cancelExitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.TriageState.navigateTo('index.html');
      });
    }

    // Initial Sync
    window.TriageState.syncUI();
  });
})();
