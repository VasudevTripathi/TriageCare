// TriageCare State Manager & Shared Logic
(function() {
  // 1. Initial Default State Database
  const DEFAULT_PATIENTS = [
    { id: 'P001', name: 'Rahul Sharma', age: 34, severity: 10, status: 'Critical' },
    { id: 'P003', name: 'Sneha Patel', age: 28, severity: 9, status: 'Critical' },
    { id: 'P005', name: 'Amit Verma', age: 45, severity: 7, status: 'High' },
    { id: 'P002', name: 'Priya Singh', age: 22, severity: 5, status: 'Medium' },
    { id: 'P004', name: 'Vikram Joshi', age: 30, severity: 4, status: 'Low' },
    { id: 'P006', name: 'Rohan Das', age: 38, severity: 3, status: 'Low' },
    { id: 'P007', name: 'Neha Gupta', age: 25, severity: 2, status: 'Low' }
  ];

  // 2. Initialize localStorage keys if not present
  if (!localStorage.getItem('tc_patients')) {
    localStorage.setItem('tc_patients', JSON.stringify(DEFAULT_PATIENTS));
  }
  if (!localStorage.getItem('tc_total_patients')) {
    localStorage.setItem('tc_total_patients', '12');
  }
  if (!localStorage.getItem('tc_treated_patients')) {
    localStorage.setItem('tc_treated_patients', '5');
  }

  // 3. State accessors
  window.TriageState = {
    getPatients: function() {
      return JSON.parse(localStorage.getItem('tc_patients')) || [];
    },
    savePatients: function(patients) {
      localStorage.setItem('tc_patients', JSON.stringify(patients));
      // Trigger a visual update
      this.syncUI();
    },
    getStats: function() {
      const patients = this.getPatients();
      const total = parseInt(localStorage.getItem('tc_total_patients'), 10) || 0;
      const treated = parseInt(localStorage.getItem('tc_treated_patients'), 10) || 0;
      return {
        total: total,
        waiting: patients.length,
        treated: treated
      };
    },
    addPatient: function(name, age, severity) {
      const patients = this.getPatients();
      const totalCount = parseInt(localStorage.getItem('tc_total_patients'), 10) || 0;
      
      // Calculate next patient ID
      const nextNum = totalCount + 1;
      const nextId = 'P' + String(nextNum).padStart(3, '0');
      
      // Map severity score to status string
      let status = 'Low';
      if (severity >= 9) status = 'Critical';
      else if (severity >= 7) status = 'High';
      else if (severity >= 5) status = 'Medium';

      // Insert new patient
      const newPatient = {
        id: nextId,
        name: name,
        age: parseInt(age, 10),
        severity: parseInt(severity, 10),
        status: status
      };

      patients.push(newPatient);

      // Re-order queue based on severity score (descending)
      patients.sort((a, b) => b.severity - a.severity);

      // Update local storage
      localStorage.setItem('tc_total_patients', String(nextNum));
      this.savePatients(patients);
      return newPatient;
    },
    treatNextPatient: function() {
      const patients = this.getPatients();
      if (patients.length === 0) return null;

      // Remove the highest priority patient (first element after sorting)
      const treatedPatient = patients.shift();
      
      // Increment treated count
      const treatedCount = (parseInt(localStorage.getItem('tc_treated_patients'), 10) || 0) + 1;
      localStorage.setItem('tc_treated_patients', String(treatedCount));
      
      this.savePatients(patients);
      return treatedPatient;
    },
    
    // Status Badge generator
    getStatusBadgeClass: function(status) {
      switch (status) {
        case 'Critical': return 'tc-badge-danger';
        case 'High': return 'tc-badge-warning';
        case 'Medium': return 'tc-badge-info';
        default: return 'tc-badge-neutral';
      }
    },

    // Avatar styling generator based on status
    getAvatarStyle: function(status) {
      switch (status) {
        case 'Critical':
          return 'background-color: var(--tc-color-danger-bg); color: var(--tc-color-danger); border-color: var(--tc-color-danger-border);';
        case 'High':
          return 'background-color: var(--tc-color-warning-bg); color: var(--tc-color-warning); border-color: var(--tc-color-warning-border);';
        case 'Medium':
          return 'background-color: var(--tc-color-info-bg); color: var(--tc-color-info); border-color: var(--tc-color-info-border);';
        default:
          return ''; // Use defaults
      }
    },

    // 4. Synchronize HTML elements
    syncUI: function() {
      const stats = this.getStats();
      const patients = this.getPatients();

      // Update sidebar queue badge if present
      document.querySelectorAll('.tc-sidebar-nav a').forEach(a => {
        if (a.innerText.includes('Waiting Queue')) {
          const badge = a.querySelector('.tc-badge');
          if (badge) badge.textContent = String(stats.waiting);
        }
      });

      // Update summary metric cards if they exist on the page
      document.querySelectorAll('.tc-card').forEach(card => {
        const titleEl = card.querySelector('.tc-card-title');
        if (!titleEl) return;
        const titleText = titleEl.textContent.trim();
        const valueEl = card.querySelector('.tc-card-body p');
        if (!valueEl) return;

        if (titleText.includes('Total Patients')) {
          valueEl.textContent = String(stats.total);
        } else if (titleText.includes('Waiting Patients')) {
          valueEl.textContent = String(stats.waiting);
        } else if (titleText.includes('Treated Patients')) {
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

      // Render Large Waiting Queue Page Table (All patients)
      const queueTableBody = document.querySelector('.queue-table-card tbody');
      if (queueTableBody) {
        queueTableBody.innerHTML = '';
        // Update total cases text counter badge
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

      // Sync Next Patient display components on Dashboard
      const nextPatientCard = document.querySelector('.tc-card-glass');
      if (nextPatientCard) {
        const nextPatientProfile = nextPatientCard.querySelector('.next-patient-profile');
        const nextPatientFooter = nextPatientCard.nextElementSibling || nextPatientCard.querySelector('.tc-card-footer');
        
        if (patients.length === 0) {
          // Empty state
          if (nextPatientProfile) {
            nextPatientProfile.innerHTML = `
              <div style="padding: var(--tc-space-4) 0; color: var(--tc-color-text-muted);">
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
          
          // Sync header severity badge
          const levelBadge = nextPatientCard.querySelector('.tc-card-header .tc-badge-danger');
          if (levelBadge) levelBadge.textContent = `Level ${topPatient.severity}`;

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

      // Sync Next Patient Card on Treat Patient page
      const treatCard = document.querySelector('.treat-card');
      if (treatCard) {
        const hasExitModal = document.querySelector('.modal-backdrop');
        // Check that this is indeed the treat-card page, not the exit card
        if (!hasExitModal || treatCard.id !== 'exitModalCard') {
          if (patients.length === 0) {
            treatCard.innerHTML = `
              <h2 class="tc-text-main" style="font-size: var(--tc-font-2xl); margin-bottom: var(--tc-space-6); font-weight: var(--tc-weight-bold); letter-spacing: -0.02em;">Next Patient To Treat</h2>
              <div style="padding: var(--tc-space-10) 0; text-align: center; color: var(--tc-color-text-muted);">
                <p class="tc-text-semibold" style="font-size: var(--tc-font-lg);">Queue Fully Clear</p>
                <span class="tc-text-xs">There are no patients awaiting treatment in the priority queue.</span>
              </div>
              <a href="index.html" class="tc-btn tc-btn-secondary" style="width: 100%; justify-content: center; margin-top: var(--tc-space-4);">Go To Dashboard</a>
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

            // Setup Treat button handler
            const btn = document.getElementById('pageTreatPatientBtn');
            if (btn) {
              btn.addEventListener('click', () => {
                const treated = window.TriageState.treatNextPatient();
                if (treated) {
                  alert(`${treated.name} (ID: ${treated.id}) has been treated and removed from the active queue.`);
                }
              });
            }
          }
        }
      }

      // Sync Add Patient ID preview
      const addPatientForm = document.getElementById('addPatientForm');
      if (addPatientForm) {
        const idInput = document.getElementById('patientId');
        if (idInput) {
          idInput.value = 'P' + String(stats.total + 1).padStart(3, '0');
        }
      }
    }
  };

  // 5. Setup Event Listeners & Initialize
  document.addEventListener('DOMContentLoaded', () => {
    // A. Sync correct navigation links across sidebar of all pages
    document.querySelectorAll('.tc-sidebar-nav a').forEach(a => {
      const label = a.querySelector('span') ? a.querySelector('span').innerText.trim() : a.innerText.trim();
      if (label === 'Dashboard') {
        a.setAttribute('href', 'index.html');
        a.removeAttribute('onclick');
      } else if (label === 'Add Patient') {
        a.setAttribute('href', 'add-patient.html');
        a.removeAttribute('onclick');
      } else if (label === 'Waiting Queue') {
        a.setAttribute('href', 'waiting-queue.html');
        a.removeAttribute('onclick');
      } else if (label === 'Treat Patient') {
        a.setAttribute('href', 'treat-patient.html');
        a.removeAttribute('onclick');
      } else if (label === 'Exit') {
        a.setAttribute('href', 'exit.html');
        a.removeAttribute('onclick');
      }
    });

    // B. Fix Quick Actions button links on Dashboard
    document.querySelectorAll('.quick-actions-stack button, .quick-actions-stack a').forEach(el => {
      const span = el.querySelector('span');
      if (!span) return;
      const label = span.innerText.trim();
      
      // If it is a button, convert to anchor link or set onclick redirection
      if (label === 'Add Patient') {
        el.setAttribute('onclick', "window.location.href='add-patient.html';");
      } else if (label === 'Queue') {
        el.setAttribute('onclick', "window.location.href='waiting-queue.html';");
      } else if (label === 'Treat') {
        el.setAttribute('onclick', "window.location.href='treat-patient.html';");
      } else if (label === 'Exit') {
        el.setAttribute('onclick', "window.location.href='exit.html';");
      }
    });

    // C. Theme toggler persistent sync
    const savedTheme = localStorage.getItem('tc_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) {
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />`;
      }
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const themeIcon = document.getElementById('themeIcon');
        
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('tc_theme', 'light');
          if (themeIcon) {
            themeIcon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
          }
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('tc_theme', 'dark');
          if (themeIcon) {
            themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />`;
          }
        }
      });
    }

    // D. Add Patient Form submit logic
    const addPatientForm = document.getElementById('addPatientForm');
    if (addPatientForm) {
      addPatientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('patientName');
        const ageInput = document.getElementById('patientAge');
        const severitySelect = document.getElementById('patientSeverity');

        if (nameInput && ageInput && severitySelect) {
          const newP = window.TriageState.addPatient(
            nameInput.value.trim(),
            ageInput.value,
            severitySelect.value
          );
          alert(`Patient ${newP.name} (ID: ${newP.id}) has been added to the queue under Severity level ${newP.severity}.`);
          window.location.href = 'index.html'; // Redirect to dashboard
        }
      });
    }

    // E. Treat Now button on Dashboard right-sidebar
    const nextPatientCard = document.querySelector('.tc-card-glass');
    if (nextPatientCard) {
      const treatNowBtn = nextPatientCard.querySelector('.tc-card-footer .tc-btn');
      if (treatNowBtn) {
        treatNowBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const treated = window.TriageState.treatNextPatient();
          if (treated) {
            alert(`${treated.name} (ID: ${treated.id}) has been treated and removed from the active queue.`);
          }
        });
      }
    }

    // F. Final sync UI render
    window.TriageState.syncUI();
  });
})();
