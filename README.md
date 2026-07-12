# 🏥 TriageCare: Emergency Room Patient Triage System

[![C++ Version](https://img.shields.io/badge/C%2B%2B-17-blue.svg?style=for-the-badge&logo=c%2B%2B)](https://en.cppreference.com/w/cpp/17)
[![Frontend Stack](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-orange.svg?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/)
[![Style System](https://img.shields.io/badge/Design_System-Custom_Vanilla_CSS-violet.svg?style=for-the-badge)](design-system-spec.md)
[![Theme Support](https://img.shields.io/badge/Themes-Light%20%26%20Dark-success.svg?style=for-the-badge)](#-ui-preview)

**TriageCare** is an emergency room triage and patient management system. It simulates clinical triage operations through a dual-channel architecture: a high-fidelity **Vanilla Web Dashboard** and a corresponding **C++ CLI Backend Application**. 

Both systems implement a priority-based queue where incoming patients are triaged dynamically based on the clinical severity of their vitals, ensuring critical cases receive immediate medical attention.

---

## 📸 UI Preview

TriageCare features a premium, responsive layout that supports both light and dark modes with glassmorphic cards, smooth hover lift actions, and reactive status indications.

### Dark Theme Dashboard
![TriageCare Light Mode Dashboard](assets/dashboard-light.png)

### Treat Patient
![TriageCare Dark Mode Dashboard](assets/dashboard-dark.png)

### Dynamic Patient Admission
![TriageCare Patient Admission Form](assets/add-patient-light.png)

---

## 🛠️ System Architecture

TriageCare runs a deterministic sorting algorithm on both platforms to model emergency triage queues:

```mermaid
graph TD
    A[New Patient Admission] --> B{Determine Severity Level}
    B -->|1 - 10 Scale| C[Assign Triage Status Class]
    C --> D[Push to Priority Queue]
    D --> E{Check Queue Priority}
    E -->|Higher Severity Level| F[Move to Front of Queue]
    E -->|Equal Severity Level| G{Compare Arrival Order}
    G -->|Arrived Earlier| H[Position at Top of Group]
    G -->|Arrived Later| I[Position behind Existing Patient]
    F --> J[Treat Patient - Pop from Queue]
    H --> J
    I --> J
```

### Key Technical Pillars

1. **Deterministic Triage Logic**: Patients are sorted by severity score ($10 \rightarrow \text{most critical}$, $1 \rightarrow \text{least critical}$). In the event of matching severity scores, priority is given to the patient with the earlier arrival order (FCFS - First Come, First Served).
2. **Stateless Frontend Synchronization**: Since the web pages are separate static HTML files, they share state via **Base64-serialized URL parameters** (`?s=...`) coupled with a **LocalStorage fallback**, allowing full navigation consistency without a stateful server.
3. **Responsive CSS Design Token System**: Outlined in `design-system-spec.md`, the UI uses CSS variable tokens for radius, padding, elevation, and theme-dependent color scales to support seamless theme toggling.

---

## 🎨 Premium UI/UX & Motion System

TriageCare integrates a premium interface standard matching the aesthetic design systems of modern products like Linear, Stripe, and Vercel.

### 1. Lottie Micro-interactions
* **ECG Heartbeat Animation**: A subtle, low-opacity (`28%`) vector animation (`heartbeat ECG.json`) continuously looping in the Dashboard header. It auto-blends into light/dark themes with hardware-accelerated glows.
* **Success Feedback Animation**: Displays a dynamic overlay sequence (`Success.json`) on cards upon successful actions (e.g., admitting or treating patients) before fading out and transitioning the page state.
* **Lazy Loading**: The Lottie runtime library is lazily loaded via CDN only when animations are triggered, keeping the initial payload lightweight.
* **Accessibility**: Skip rules detect user `prefers-reduced-motion` settings to immediately execute state updates and bypass transitions.

### 2. Atmospheric Background Image
* **Global Mesh Background**: Uses a subtle mesh background image (`assets/subtle_mesh_bg.png`) applied to the body.
* **Readability Overlays**: Blended with translucent overlays (`rgba(9, 9, 11, 0.82)` in dark mode and `rgba(248, 250, 252, 0.90)` in light mode) to preserve clear readability.
* **Sidebar Masking**: Sidebar panels are styled with 100% solid, opaque backgrounds (`#FFFFFF` in light mode, `#0c0c0e` in dark mode) to keep navigation focus distinct and clean.

### 3. Viewport Transitions & Card Staggering
* **Fade-and-Slide Transitions**: Navigating between pages triggers a smooth 220ms–300ms transition. Active viewports translate upwards and scale down, while incoming contents slide up using a spring curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
* **Sequential Staggering**: Cards animate sequentially into view with a `45ms` stagger multiplier on page load.

---

## 🖥️ C++ Core Engine (CLI Backend)

The C++ source in `main.cpp` represents a object-oriented implementation matching the frontend logic exactly.

### Classes Implemented

- **`Patient`**: Encapsulates clinical variables including Patient ID, Name, Age, Severity Score, and Arrival Order index. It overloads the standard `operator<` to determine custom queue hierarchy:
  ```cpp
  bool operator<(const Patient& other) const {
      if (this->severity != other.severity) {
          return this->severity < other.severity; // Max-heap: Higher severity at top
      }
      return this->arrivalOrder > other.arrivalOrder; // Min-heap: Smaller arrival order at top
  }
  ```
- **`Hospital`**: Manages the `std::priority_queue<Patient>` container, tracks overall admitted/treated statistics, and exposes operational methods.
- **`Doctor` & `Ward`**: Placeholder objects modeling emergency medical resources (e.g. Lead Surgeon and bed availability).

### Compilation & Running (C++ CLI)

Compile the C++ source using `g++` or any C++17 compatible compiler:

```bash
# Compile
g++ -std=c++17 main.cpp -o TriageCareBackend

# Execute
./TriageCareBackend
```

#### Interactive CLI Controls
1. **`1. Add Patient`**: Input patient demographics and vital severity (1-10) to insert them into the queue.
2. **`2. Waiting Queue`**: Print the current priority sorted queue.
3. **`3. Treat Patient`**: Treats the patient at the top of the queue.
4. **`4. Exit`**: Exit confirmation sub-menu.

---

## 🌐 Web Dashboard (Frontend)

The frontend is built on vanilla web standards without external dependencies, focusing on micro-animations and accessibility.

### Page Routes

- **`index.html` (Dashboard)**: Displays primary emergency metrics, quick shortcuts, the current Top 5 emergency list, and detailed vital information for the next patient in queue.
- **`add-patient.html`**: Clean administrative admission intake form with input constraints.
- **`waiting-queue.html`**: A full tabular view of all patients currently waiting in the ward, including visual capsule badges.
- **`treat-patient.html`**: The physician command room. Features a focal patient avatar layout and treatment controls.
- **`exit.html`**: Interactive confirmation dialog simulation.

### Stateless Base64 State Manager

In `app-state.js`, the state is serialized into a lightweight JSON string, compressed, and encoded into Base64 format. Navigating between views calls `TriageState.navigateTo(url)`, appending the payload:

$$\text{URL} \rightarrow \text{page.html?s=e30...}$$

If the query string is absent, the system restores the state from `localStorage` or seeds default metrics.

---

## 📁 Repository Structure

```markdown
TriageCare/
├── assets/                    # Project UI screenshots & assets
│   ├── dashboard-light.png
│   ├── dashboard-dark.png
│   ├── add-patient-light.png
│   ├── subtle_mesh_bg.png     # Premium application background mesh
│   ├── avatar_placeholder.png # Silhouette avatar placeholder
│   ├── heartbeat ECG.json     # Lottie ECG heartbeat decoration
│   └── Success.json           # Lottie success feedback overlay
├── design-system.css          # Core CSS variables, classes, and layouts
├── design-system-spec.md      # Detailed documentation of HTML/CSS code tokens
├── app-state.js               # In-memory JS controller & state parser
├── main.cpp                   # C++ Backend Priority Queue CLI Application
├── index.html                 # Dashboard main screen
├── add-patient.html           # Admission form screen
├── waiting-queue.html         # Active queue list screen
├── treat-patient.html         # Patient treatment panel
├── exit.html                  # Log out / Exit confirmation page
└── README.md                  # This project overview document
```

---

## 🎨 Theme & Customization Specs

TriageCare uses standard CSS custom properties (`--tc-color-*`) mapping to the theme context. Switching attributes toggles light/dark values:

```js
// Toggle theme dynamically from JavaScript
document.documentElement.setAttribute('data-theme', 'dark');  // Switch to Dark Theme
document.documentElement.removeAttribute('data-theme');       // Switch to Light Theme
```

> [!NOTE]
> The custom variables auto-adjust properties such as `box-shadow` values, borders, text color weightings, and card backgrounds dynamically to preserve premium readability.

---

> Created for TriageCare emergency room simulations. Distributed under educational license agreements.
