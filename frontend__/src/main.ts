import { CelestialCanvasEngine } from './utils/canvas';
import { lofiMoodEngine } from './utils/audio';
import {
  ACADEMIC_PRESETS,
  HUMOROUS_LOADING_STEPS,
  DRYNESS_TRANSFORMATIONS,
  TOASTS,
  generateAcademicSleepText,
} from './utils/academicEngine';
import { GeneratedSleepContent } from './types';

// DOM Elements
const canvasEl = document.getElementById('bg-canvas') as HTMLCanvasElement;
const btnSetMood = document.getElementById('btn-set-mood') as HTMLButtonElement;
const setMoodIcon = document.getElementById('set-mood-icon') as HTMLElement;
const setMoodLabel = document.getElementById('set-mood-label') as HTMLElement;
const moodToast = document.getElementById('mood-toast') as HTMLElement;

// Sound Volume Controller Elements
const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
const volumeLabel = document.getElementById('volume-label') as HTMLElement;
const btnVolumeMute = document.getElementById('btn-volume-mute') as HTMLButtonElement;
const volumeIcon = document.getElementById('volume-icon') as unknown as SVGElement;

const btnStartOver = document.getElementById('btn-start-over') as HTMLButtonElement;
const headerLogo = document.getElementById('header-logo') as HTMLElement;
const mainHeader = document.getElementById('main-header') as HTMLElement;

// Views
const views: Record<string, HTMLElement> = {
  landing: document.getElementById('view-landing') as HTMLElement,
  input: document.getElementById('view-input') as HTMLElement,
  loading: document.getElementById('view-loading') as HTMLElement,
  result: document.getElementById('view-result') as HTMLElement,
  'sleep-mode': document.getElementById('view-sleep-mode') as HTMLElement,
};

// Landing View Elements
const btnStartGenerator = document.getElementById('btn-start-generator') as HTMLButtonElement;
const btnOpenPillModal = document.getElementById('btn-open-pill-modal') as HTMLButtonElement;
const btnExamineVangogh = document.getElementById('btn-examine-vangogh') as HTMLButtonElement;

// Input View Elements
const btnBackLanding = document.getElementById('btn-back-landing') as HTMLButtonElement;
const academicForm = document.getElementById('academic-form') as HTMLFormElement;
const inputDegree = document.getElementById('input-degree') as HTMLInputElement;
const inputSubject = document.getElementById('input-subject') as HTMLInputElement;
const inputTopic = document.getElementById('input-topic') as HTMLInputElement;
const presetButtons = document.querySelectorAll<HTMLButtonElement>('.btn-preset');

// Loading View Elements
const loadingStatusText = document.getElementById('loading-status-text') as HTMLElement;
const loadingProgressBar = document.getElementById('loading-progress-bar') as HTMLElement;

// Result View Elements
const resultTitle = document.getElementById('result-title') as HTMLElement;
const drynessLevelText = document.getElementById('dryness-level-text') as HTMLElement;
const resultContentBody = document.getElementById('result-content-body') as HTMLElement;
const drierCountTag = document.getElementById('drier-count-tag') as HTMLElement;
const btnMakeDrier = document.getElementById('btn-make-drier') as HTMLButtonElement;
const btnMakeDrierText = document.getElementById('btn-make-drier-text') as HTMLElement;
const btnResultPill = document.getElementById('btn-result-pill') as HTMLButtonElement;
const btnFsSm = document.getElementById('btn-fs-sm') as HTMLButtonElement;
const btnFsBase = document.getElementById('btn-fs-base') as HTMLButtonElement;
const btnFsLg = document.getElementById('btn-fs-lg') as HTMLButtonElement;
const btnCopyText = document.getElementById('btn-copy-text') as HTMLButtonElement;
const copyIcon = document.getElementById('copy-icon') as unknown as SVGElement;
const btnDistractionFree = document.getElementById('btn-distraction-free') as HTMLButtonElement;
const resultActionsBar = document.getElementById('result-actions-bar') as HTMLElement;

// Sleep Mode Elements
const btnExitSleepMode = document.getElementById('btn-exit-sleep-mode') as HTMLButtonElement;

// Modals
const modalVangogh = document.getElementById('modal-vangogh') as HTMLElement;
const btnCloseModalVangogh = document.getElementById('btn-close-modal-vangogh') as HTMLButtonElement;
const btnDismissModalVangogh = document.getElementById('btn-dismiss-modal-vangogh') as HTMLButtonElement;

const modalPill = document.getElementById('modal-pill') as HTMLElement;
const btnCloseModalPill = document.getElementById('btn-close-modal-pill') as HTMLButtonElement;
const btnCancelModalPill = document.getElementById('btn-cancel-modal-pill') as HTMLButtonElement;
const btnConfirmModalPill = document.getElementById('btn-confirm-modal-pill') as HTMLButtonElement;

// Toast
const toast = document.getElementById('toast') as HTMLElement;
const toastMessage = document.getElementById('toast-message') as HTMLElement;
let toastTimeout: number | null = null;
let moodToastTimeout: number | null = null;

// Application State
let currentView: 'landing' | 'input' | 'loading' | 'result' | 'sleep-mode' = 'landing';
let generatedData: GeneratedSleepContent | null = null;
let distractionFree = false;

// Audio & Acoustic State
let currentVolume = 1.0;
let previousVolume = 1.0;

// 1. Initialize Celestial Canvas Engine
let canvasEngine: CelestialCanvasEngine | null = null;
if (canvasEl) {
  canvasEngine = new CelestialCanvasEngine(canvasEl);
  canvasEngine.setView('landing');
}

// 2. View Switcher
function switchView(viewName: 'landing' | 'input' | 'loading' | 'result' | 'sleep-mode') {
  currentView = viewName;

  // Toggle active class on view sections
  Object.keys(views).forEach((key) => {
    if (key === viewName) {
      views[key].classList.add('active');
    } else {
      views[key].classList.remove('active');
    }
  });

  // Update background canvas mode:
  // Page 1: Van Gogh Starry Night
  // Page 2+: Good Night Sky with Crescent Moon, Meteors & Twinkling Stars
  if (canvasEngine) {
    canvasEngine.setView(viewName === 'landing' ? 'landing' : 'goodnight');
  }

  // Update Start Over button in Header
  if (btnStartOver) {
    if (viewName === 'landing') {
      btnStartOver.classList.add('hidden');
      btnStartOver.classList.remove('flex');
    } else {
      btnStartOver.classList.remove('hidden');
      btnStartOver.classList.add('flex');
    }
  }

  // Reset distraction-free if leaving result view
  if (viewName !== 'result' && distractionFree) {
    toggleDistractionFree(false);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Toast Helper
function showToast(msg: string) {
  if (!toast || !toastMessage) return;
  toastMessage.textContent = msg;
  toast.classList.remove('opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  if (toastTimeout !== null) {
    window.clearTimeout(toastTimeout);
  }
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4');
  }, 3000);
}

// 4. Set Mood Feature (Sleepy Lofi Music Engine)
function updateSetMoodUI(isPlaying: boolean) {
  if (!btnSetMood || !setMoodIcon || !setMoodLabel) return;

  if (isPlaying) {
    btnSetMood.className =
      'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-600 bg-slate-800 text-white transition-all cursor-pointer shadow-sm';

    setMoodIcon.innerHTML = `
      <span class="flex items-center gap-0.5 h-3 text-slate-300">
        <span class="w-0.5 h-3 bg-slate-200 rounded-full animate-pulse" style="animation-duration: 0.8s;"></span>
        <span class="w-0.5 h-2 bg-slate-300 rounded-full animate-pulse" style="animation-duration: 1.1s;"></span>
        <span class="w-0.5 h-3 bg-slate-200 rounded-full animate-pulse" style="animation-duration: 0.6s;"></span>
      </span>
    `;
    setMoodLabel.textContent = 'Playing Sleepy Lofi';

    // Show Mood Notification Toast
    if (moodToast) {
      moodToast.classList.remove('opacity-0', '-translate-y-2');
      moodToast.classList.add('opacity-100', 'translate-y-0');
      if (moodToastTimeout !== null) {
        window.clearTimeout(moodToastTimeout);
      }
      moodToastTimeout = window.setTimeout(() => {
        moodToast.classList.remove('opacity-100', 'translate-y-0');
        moodToast.classList.add('opacity-0', '-translate-y-2');
      }, 3400);
    }
  } else {
    btnSetMood.className =
      'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700/80 bg-slate-900/80 text-slate-200 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all cursor-pointer shadow-sm';

    setMoodIcon.innerHTML = `
      <svg class="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
    setMoodLabel.textContent = 'Set Mood';

    if (moodToast) {
      moodToast.classList.remove('opacity-100', 'translate-y-0');
      moodToast.classList.add('opacity-0', '-translate-y-2');
    }
  }
}

btnSetMood?.addEventListener('click', () => {
  const isPlaying = lofiMoodEngine.toggle();
  updateSetMoodUI(isPlaying);
});

// 5. Responsive Sound Volume Controller
function setVolumeLevel(level: number) {
  currentVolume = Math.max(0.0, Math.min(1.0, level));
  lofiMoodEngine.setVolume(currentVolume);

  const percent = Math.round(currentVolume * 100);

  // Update slider position & CSS gradient fill track
  if (volumeSlider) {
    volumeSlider.value = String(percent);
    volumeSlider.style.setProperty('--volume-percent', `${percent}%`);
  }

  // Update Numeric Readout
  if (volumeLabel) {
    if (currentVolume <= 0) {
      volumeLabel.textContent = 'Mute';
      volumeLabel.className = 'text-[11px] text-slate-500 font-medium min-w-[32px] text-right select-none';
    } else {
      volumeLabel.textContent = `${percent}%`;
      volumeLabel.className = 'text-[11px] text-slate-300 font-medium min-w-[32px] text-right select-none';
    }
  }

  // Update Volume Icon
  if (volumeIcon) {
    if (currentVolume <= 0) {
      volumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
    } else if (currentVolume < 0.5) {
      volumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      `;
    } else {
      volumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      `;
    }
  }
}

// Immediate, zero-lag input handler on volume slider
volumeSlider?.addEventListener('input', () => {
  const val = parseFloat(volumeSlider.value) / 100;
  if (val > 0) {
    previousVolume = val;
  }
  setVolumeLevel(val);
});

// Click on Mute / Unmute Button
btnVolumeMute?.addEventListener('click', () => {
  if (currentVolume > 0) {
    previousVolume = currentVolume;
    setVolumeLevel(0);
  } else {
    setVolumeLevel(previousVolume > 0 ? previousVolume : 1.0);
  }
});

// 6. Landing Navigation
btnStartGenerator?.addEventListener('click', () => {
  switchView('input');
});

btnOpenPillModal?.addEventListener('click', () => {
  openModal(modalPill);
});

btnBackLanding?.addEventListener('click', () => {
  switchView('landing');
});

btnStartOver?.addEventListener('click', () => {
  switchView('landing');
});

headerLogo?.addEventListener('click', () => {
  switchView('landing');
});

// 7. Van Gogh Painting Modal
btnExamineVangogh?.addEventListener('click', () => {
  openModal(modalVangogh);
});

btnCloseModalVangogh?.addEventListener('click', () => {
  closeModal(modalVangogh);
});

btnDismissModalVangogh?.addEventListener('click', () => {
  closeModal(modalVangogh);
});

// 8. Academic Presets Selection
presetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-preset');
    let preset = ACADEMIC_PRESETS[0];
    if (key === 'cse') preset = ACADEMIC_PRESETS[0];
    if (key === 'mbbs') preset = ACADEMIC_PRESETS[1];
    if (key === 'law') preset = ACADEMIC_PRESETS[2];
    if (key === 'mba') preset = ACADEMIC_PRESETS[3];
    if (key === 'physics') preset = ACADEMIC_PRESETS[4];

    if (inputDegree) inputDegree.value = preset.className;
    if (inputSubject) inputSubject.value = preset.subject;
    if (inputTopic) inputTopic.value = preset.hatedTopic;
  });
});

// 9. Academic Form Submission & Loading Sequence
academicForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const className = inputDegree.value.trim() || 'BTech CSE';
  const subject = inputSubject.value.trim() || 'Theoretical Mechanics';
  const hatedTopic = inputTopic.value.trim();

  switchView('loading');

  let stepIdx = 0;
  let progress = 0;

  const interval = window.setInterval(() => {
    stepIdx = (stepIdx + 1) % HUMOROUS_LOADING_STEPS.length;
    if (loadingStatusText) {
      loadingStatusText.textContent = HUMOROUS_LOADING_STEPS[stepIdx];
    }

    progress += 20;
    if (loadingProgressBar) {
      loadingProgressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    if (progress >= 100) {
      window.clearInterval(interval);
      setTimeout(() => {
        renderResult(className, subject, hatedTopic);
      }, 350);
    }
  }, 420);
});

// 10. Render Result View


async function generateRes(className, subject, hatedTopic) {
  const response = await fetch("http://localhost:8080/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      level: className,
      subject,
      hatedTopic
    })
  });
  console.log("STATUS:", response.status);

  const data = await response.json();

  console.log("BACKEND RESPONSE:", data);

  return data;
}

async function renderResult(
  className: string,
  subject: string,
  hatedTopic: string
) {
  const result = await generateRes(className, subject, hatedTopic);

  generatedData = {
    className,
    subject,
    hatedTopic,
    title: result.topic,
    paragraphs: result.description.split("\n\n"),
    drynessLevel: 100,
    drynessClicks: 0,
  };

  if (resultTitle) {
    resultTitle.textContent = result.topic;
  }

  if (drynessLevelText) {
    drynessLevelText.textContent = "Standard (100%)";
  }

  if (drierCountTag) {
    drierCountTag.textContent = "0/5";
  }

  if (btnMakeDrier) {
    btnMakeDrier.disabled = false;
    btnMakeDrier.classList.remove("opacity-50", "cursor-not-allowed");
    btnMakeDrier.classList.add(
      "cursor-pointer",
      "hover:border-slate-700",
      "hover:text-white"
    );
    btnMakeDrier.title = "Increase academic monotony (Limit: 5 uses)";
  }

  if (btnMakeDrierText) {
    btnMakeDrierText.textContent = "🥱 Make It Drier";
  }

  renderParagraphs(generatedData.paragraphs);

  switchView("result");
}

function renderParagraphs(paragraphs: string[]) {
  if (!resultContentBody) return;
  resultContentBody.innerHTML = paragraphs
    .map((p) => `<p class="transition-all duration-300 leading-relaxed font-serif">${escapeHtml(p)}</p>`)
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 11. Make It Drier Feature (Limit: 5 uses)
// 11. Make It Drier Feature (Limit: 5 uses)
const MAX_DRYNESS_USES = 5;

btnMakeDrier?.addEventListener('click', async () => {
  if (!generatedData) return;

  if (generatedData.drynessClicks >= MAX_DRYNESS_USES) {
    showToast(
      'Maximum academic dryness reached (5/5). Further reduction in curiosity is impossible.'
    );
    return;
  }

  // Prevent multiple requests while API call is running
  btnMakeDrier.disabled = true;

  try {
    const response = await fetch("http://localhost:8080/make-it-drier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description: generatedData.paragraphs.join("\n\n")
      })
    });

    console.log("DRYER STATUS:", response.status);

    const data = await response.json();

    console.log("DRYER RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to make paragraph drier"
      );
    }

    // Backend returns:
    // { description: "paragraph 1\n\nparagraph 2..." }

    if (!data.description) {
      throw new Error("Backend did not return a description");
    }

    // Convert description back into paragraph array
    const updatedParagraphs = data.description
      .split(/\n\s*\n/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    const newDryness =
      generatedData.drynessLevel + 25;

    const newClicks =
      generatedData.drynessClicks + 1;

    // Update generated data
    generatedData.paragraphs = updatedParagraphs;
    generatedData.drynessLevel = newDryness;
    generatedData.drynessClicks = newClicks;

    // Update dryness level text
    if (drynessLevelText) {
      drynessLevelText.textContent =
        newClicks >= MAX_DRYNESS_USES
          ? `Maximum Monotony (${newDryness}%)`
          : `Ultra-Monotonous (${newDryness}%)`;
    }

    // Update counter
    if (drierCountTag) {
      drierCountTag.textContent =
        `${newClicks}/${MAX_DRYNESS_USES}`;
    }

    // Render new AI-generated paragraphs
    renderParagraphs(updatedParagraphs);

    // Maximum dryness reached
    if (newClicks >= MAX_DRYNESS_USES) {
      btnMakeDrier.disabled = true;

      btnMakeDrier.classList.add(
        'opacity-50',
        'cursor-not-allowed'
      );

      btnMakeDrier.classList.remove(
        'cursor-pointer',
        'hover:border-slate-700',
        'hover:text-white'
      );

      btnMakeDrier.title =
        'Maximum academic dryness reached (5/5 uses used)';

      if (btnMakeDrierText) {
        btnMakeDrierText.textContent =
          '🥱 Max Dryness';
      }

      showToast(
        'Maximum academic dryness reached (5/5). The prose has reached peak scholarly inertia.'
      );

    } else {
      // Re-enable button for next request
      btnMakeDrier.disabled = false;

      btnMakeDrier.classList.remove(
        'opacity-50',
        'cursor-not-allowed'
      );

      btnMakeDrier.classList.add(
        'cursor-pointer',
        'hover:border-slate-700',
        'hover:text-white'
      );

      const toastMessageText =
        TOASTS[newClicks % TOASTS.length];

      showToast(toastMessageText);
    }

  } catch (error) {
    console.error("DRYER ERROR:", error);

    // Allow retry if API fails
    btnMakeDrier.disabled = false;

    showToast(
      "Failed to make the paragraph drier."
    );
  }
});

// 12. Font Size Controls
btnFsSm?.addEventListener('click', () => setFontSize('fs-sm'));
btnFsBase?.addEventListener('click', () => setFontSize('fs-base'));
btnFsLg?.addEventListener('click', () => setFontSize('fs-lg'));

function setFontSize(sizeClass: 'fs-sm' | 'fs-base' | 'fs-lg') {
  if (!resultContentBody) return;
  resultContentBody.classList.remove('fs-sm', 'fs-base', 'fs-lg');
  resultContentBody.classList.add(sizeClass);

  [btnFsSm, btnFsBase, btnFsLg].forEach((btn) => {
    btn.className =
      'px-2 py-0.5 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer';
  });

  const activeBtn = sizeClass === 'fs-sm' ? btnFsSm : sizeClass === 'fs-base' ? btnFsBase : btnFsLg;
  if (activeBtn) {
    activeBtn.className =
      'px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-100 font-medium transition-colors cursor-pointer';
  }
}

// 13. Copy Text Feature
btnCopyText?.addEventListener('click', () => {
  if (!generatedData) return;
  const textToCopy = `${generatedData.title}\n\n${generatedData.paragraphs.join('\n\n')}`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('Academic text copied to clipboard.');
    if (copyIcon) {
      copyIcon.innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`;
      setTimeout(() => {
        copyIcon.innerHTML = `
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
        `;
      }, 2000);
    }
  });
});

// 14. Distraction-Free Reading Mode
btnDistractionFree?.addEventListener('click', () => {
  toggleDistractionFree(!distractionFree);
});

function toggleDistractionFree(enable: boolean) {
  distractionFree = enable;
  if (mainHeader) {
    mainHeader.style.opacity = enable ? '0.15' : '1';
    mainHeader.style.pointerEvents = enable ? 'none' : 'auto';
  }
  if (resultActionsBar) {
    resultActionsBar.style.opacity = enable ? '0.25' : '1';
  }
  showToast(enable ? 'Distraction-free mode enabled' : 'Standard view restored');
}

// 15. Sleep Pill Modals & Maximum Sleep Mode
btnResultPill?.addEventListener('click', () => openModal(modalPill));
btnCloseModalPill?.addEventListener('click', () => closeModal(modalPill));
btnCancelModalPill?.addEventListener('click', () => closeModal(modalPill));

btnConfirmModalPill?.addEventListener('click', async () => {
  if (!generatedData) return;

  try {
    const response = await fetch("http://localhost:8080/sleeping-pill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description: generatedData.paragraphs.join("\n\n")
      })
    });

    console.log("SLEEP PILL STATUS:", response.status);

    const data = await response.json();

    console.log("SLEEP PILL RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to activate sleep pill"
      );
    }

    if (!data.description) {
      throw new Error("Backend did not return a description");
    }

    // Replace current description with Sleep Pill version
    generatedData.title = data.topic;

    if (resultTitle) {
      resultTitle.textContent = data.topic;
    }

    generatedData.paragraphs = data.description
      .split(/\n\s*\n/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    // Render the new description
    renderParagraphs(generatedData.paragraphs);

    // Close modal
    closeModal(modalPill);

    // Stay/show the normal description page
    switchView('result');

  } catch (error) {
    console.error("SLEEP PILL ERROR:", error);
    showToast("Failed to activate Sleep Pill.");
  }
});


btnExitSleepMode?.addEventListener('click', () => {
  switchView('landing');
});

// Modal Helpers
function openModal(modal: HTMLElement | null) {
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal(modal: HTMLElement | null) {
  if (!modal) return;
  modal.classList.remove('flex');
  modal.classList.add('hidden');
}

// Fallback for image loading error
const vangoghImg = document.getElementById('vangogh-img') as HTMLImageElement;
if (vangoghImg) {
  vangoghImg.onerror = () => {
    // Fallback to high-res Wikimedia Van Gogh Starry Night if local file path is disrupted
    vangoghImg.src =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg';
  };
}

// Fallback for logo crest image loading
const appLogoImg = document.getElementById('app-logo-img') as HTMLImageElement;
if (appLogoImg) {
  appLogoImg.onerror = () => {
    // Fallback to embedded SVG data URI if image file is not found
    appLogoImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23090d16"/><circle cx="20" cy="18" r="9" fill="none" stroke="%23cbd5e1" stroke-width="1.8"/><path d="M12 28c3-1.5 5.5-1 8 0 2.5-1 5-1.5 8 0" stroke="%23cbd5e1" stroke-width="1.8" fill="none"/></svg>';
  };
}

// Initialize volume level at 100% on start
setVolumeLevel(1.0);
