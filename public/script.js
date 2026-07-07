// Crave Essa QR Discount Landing Page Controller

document.addEventListener("DOMContentLoaded", () => {
  // Ensure config is loaded
  const config = window.CRAVE_CONFIG || {
    brandName: "Craveessa",
    instagramUsername: "@craveessa",
    instagramLink: "https://www.instagram.com/craveessa",
    whatsappNumber: "9011560339",
    whatsappWelcomeMsg: "Hi Craveessa!",
    discountCodePrefix: "CRAVE50",
    baseDiscountPercent: "50%",
    initialCustomersCount: 14,
    googleForm: { actionUrl: "", fields: {} }
  };

  // --- Initialize Links and Strings from Config ---
  const whatsappBaseUrl = `https://wa.me/${config.whatsappNumber}`;
  
  // Set WhatsApp floating button link
  const floatingWa = document.getElementById("floating-wa");
  if (floatingWa) {
    floatingWa.href = `${whatsappBaseUrl}?text=Hi%20Craveessa!%20I%20have%20a%20question%20about%20ordering%20a%20custom%20cake%20🎂`;
  }

  // Set Footer WhatsApp link
  const footerWa = document.getElementById("footer-wa-link");
  if (footerWa) {
    footerWa.href = `${whatsappBaseUrl}?text=Hi%20Craveessa!%20I%20came%20from%20your%20landing%20page%20and%20want%20to%20chat.`;
  }

  // Set Referral link
  const referralWa = document.getElementById("referral-wa-link");
  if (referralWa) {
    const shareText = encodeURIComponent(`Hey! 🎂 If you want to order a custom cake for a birthday or anniversary, check out Craveessa! Fill their quick form to get up to 50% OFF: ${window.location.href}`);
    referralWa.href = `https://wa.me/?text=${shareText}`;
  }


  // --- 1. Floating Sprinkles Background ---
  const initFloatingSprinkles = () => {
    const container = document.getElementById("sprinkleCanvasContainer");
    if (!container) return;
    
    const colors = ["#4682b4", "#7fb0d6", "#f5f1e6", "#e8dcc8", "#213544"];
    const sprinkleCount = window.innerWidth < 768 ? 15 : 30;

    for (let i = 0; i < sprinkleCount; i++) {
      createSprinkle(container, colors);
    }
  };

  const createSprinkle = (container, colors) => {
    const sprinkle = document.createElement("div");
    sprinkle.classList.add("sprinkle");
    
    // Random styling
    const size = Math.random() * 8 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 12;
    const duration = Math.random() * 8 + 8;
    
    sprinkle.style.width = `${size}px`;
    sprinkle.style.height = `${size * (Math.random() > 0.5 ? 2.5 : 1)}px`; // Pills or squares
    sprinkle.style.backgroundColor = color;
    sprinkle.style.left = `${left}%`;
    sprinkle.style.animationDelay = `${delay}s`;
    sprinkle.style.animationDuration = `${duration}s`;
    
    container.appendChild(sprinkle);
    
    // Re-create after animation finishes
    sprinkle.addEventListener("animationiteration", () => {
      sprinkle.style.left = `${Math.random() * 100}%`;
    });
  };

  initFloatingSprinkles();


  // --- 2. Countdown Timer ---
  const initCountdown = () => {
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    
    if (!hoursEl || !minutesEl || !secondsEl) return;

    const updateTimer = () => {
      const now = new Date();
      // Set target to midnight tonight
      const target = new Date();
      target.setHours(23, 59, 59, 999);

      let diff = target - now;
      if (diff < 0) {
        // Reset to next day's midnight
        diff = 0;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      hoursEl.textContent = String(hours).padStart(2, "0");
      minutesEl.textContent = String(minutes).padStart(2, "0");
      secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  };

  initCountdown();


  // --- 3. Cake Size Grid Buttons ---
  const sizeBtns = document.querySelectorAll(".size-select-btn");
  const hiddenSizeInput = document.getElementById("cakeSize");
  
  sizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (hiddenSizeInput) {
        hiddenSizeInput.value = btn.getAttribute("data-val");
      }
    });
  });

  // Limit date picker to today or future
  const neededByInput = document.getElementById("neededBy");
  if (neededByInput) {
    const today = new Date().toISOString().split("T")[0];
    neededByInput.min = today;
  }


  // --- 4. Form Wizard (Multi-step quiz) ---
  const formSteps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".btn-next");
  const prevBtns = document.querySelectorAll(".btn-prev");
  const progressBar = document.getElementById("quiz-progress-bar");
  const progressText = document.getElementById("quiz-progress-text");

  const progressTitles = {
    1: { percent: "33.3%", label: "Mixing ingredients... 33%" },
    2: { percent: "66.6%", label: "Baking cake... 66%" },
    3: { percent: "100%", label: "Adding frosting... 100%" }
  };

  const updateProgress = (step) => {
    if (progressBar && progressText && progressTitles[step]) {
      progressBar.style.width = progressTitles[step].percent;
      progressText.textContent = progressTitles[step].label;
    }
  };

  const validateStep = (stepNum) => {
    let isValid = true;
    const currentStepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
    if (!currentStepEl) return false;

    // Find all required fields in the current step
    const requiredInputs = currentStepEl.querySelectorAll("[required]");
    
    requiredInputs.forEach(input => {
      const inputGroup = input.closest(".input-group");
      
      // WhatsApp verification (must be 10 digits)
      if (input.id === "whatsappNumber") {
        const val = input.value.trim().replace(/\D/g, "");
        if (val.length !== 10) {
          isValid = false;
          inputGroup.classList.add("invalid");
        } else {
          inputGroup.classList.remove("invalid");
        }
      } 
      // Email validation (optional but if filled must be valid)
      else if (input.type === "email" && input.value.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isValid = false;
          inputGroup.classList.add("invalid");
        } else {
          inputGroup.classList.remove("invalid");
        }
      }
      // Standard empty checks
      else {
        if (input.value.trim() === "") {
          isValid = false;
          inputGroup.classList.add("invalid");
        } else {
          inputGroup.classList.remove("invalid");
        }
      }
    });

    return isValid;
  };

  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const currentStep = parseInt(btn.closest(".form-step").getAttribute("data-step"));
      
      if (validateStep(currentStep)) {
        const nextStep = parseInt(btn.getAttribute("data-next"));
        
        // Transition steps
        formSteps.forEach(step => step.classList.remove("active"));
        const nextStepEl = document.querySelector(`.form-step[data-step="${nextStep}"]`);
        if (nextStepEl) {
          nextStepEl.classList.add("active");
          updateProgress(nextStep);
        }
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const prevStep = parseInt(btn.getAttribute("data-prev"));
      
      formSteps.forEach(step => step.classList.remove("active"));
      const prevStepEl = document.querySelector(`.form-step[data-step="${prevStep}"]`);
      if (prevStepEl) {
        prevStepEl.classList.add("active");
        updateProgress(prevStep);
      }
    });
  });

  // Remove invalid classes on input change
  const allInputs = document.querySelectorAll(".input-group input, .input-group select");
  allInputs.forEach(input => {
    input.addEventListener("input", () => {
      const inputGroup = input.closest(".input-group");
      if (inputGroup) {
        inputGroup.classList.remove("invalid");
      }
    });
  });


  // --- 5. Form Submission & Google Form POST ---
  const discountForm = document.getElementById("discountForm");
  const successModal = document.getElementById("successModal");
  const revealedCodeEl = document.getElementById("revealed-code");

  if (discountForm) {
    discountForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Validate last step before submitting
      if (!validateStep(3)) {
        
        return;
      }

      // Generate random discount code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like I, O, 0, 1
      let randomSuffix = "";
      for (let i = 0; i < 4; i++) {
        randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const discountCode = `${config.discountCodePrefix}-${randomSuffix}`;

      // Populate entry IDs on HTML inputs before POSTing to hidden iframe
      const fieldMappings = config.googleForm.fields;
      
      const setFieldName = (elementId, formFieldName) => {
        const el = document.getElementById(elementId);
        if (el && formFieldName) {
          el.name = formFieldName;
        }
      };

      setFieldName("fullName", fieldMappings.fullName);
      setFieldName("whatsappNumber", fieldMappings.whatsappNumber);
      setFieldName("email", fieldMappings.email);
      setFieldName("cakeSize", fieldMappings.cakeSize);
      setFieldName("flavor", fieldMappings.flavor);
      setFieldName("occasion", fieldMappings.occasion);
      setFieldName("neededBy", fieldMappings.neededBy);
      setFieldName("deliveryArea", fieldMappings.deliveryArea);
      
      // Instagram follow checkbox value map to "Yes" or "No"
      const igFollowCheck = document.getElementById("instagramFollowed");
      if (igFollowCheck) {
        igFollowCheck.name = fieldMappings.instagramFollowed;
        igFollowCheck.value = igFollowCheck.checked ? "Yes" : "No";
      }

      // Set action URL on the form
      discountForm.action = config.googleForm.actionUrl;

      // Prepare WhatsApp Order deep link parameters
      const name = document.getElementById("fullName").value.trim();
      const rawWaNumber = document.getElementById("whatsappNumber").value.trim().replace(/\D/g, "");
      const sizeVal = document.getElementById("cakeSize").value;
      const flavorVal = document.getElementById("flavor").value;
      const occasionVal = document.getElementById("occasion").value;
      const dateVal = document.getElementById("neededBy").value;
      const areaVal = document.getElementById("deliveryArea").value.trim();
      
      const orderedBeforeCheck = document.getElementById("orderedBefore");
      const isReturning = orderedBeforeCheck && orderedBeforeCheck.checked ? "Yes, I'm a returning customer!" : "No, first time ordering!";
      
      const igFollowBonus = igFollowCheck && igFollowCheck.checked ? "Yes (+5% IG Follower discount requested)" : "No";

      // Message text builder
      const orderMessage = `Hi Craveessa! 🎂
I filled out the form and unlocked my discount! Let's build my custom cake order:

- Name: ${name}
- WhatsApp: +91 ${rawWaNumber}
- Code: *${discountCode}*
- Size: ${sizeVal}
- Flavor: ${flavorVal}
- Occasion: ${occasionVal}
- Date Needed: ${dateVal}
- Delivery Area: ${areaVal}
- Returning Customer?: ${isReturning}
- Followed on IG?: ${igFollowBonus}

Looking forward to bakes! 💖`;

      const whatsappOrderUrl = `${whatsappBaseUrl}?text=${encodeURIComponent(orderMessage)}`;

      // Update success modal buttons
      const modalWaBtn = document.getElementById("modal-wa-order-btn");
      if (modalWaBtn) {
        modalWaBtn.href = whatsappOrderUrl;
      }

      // Populate text code in success dialog
      if (revealedCodeEl) {
        revealedCodeEl.textContent = discountCode;
      }

      // Show the success Modal
      if (successModal) {
        successModal.classList.add("active");
        
        // Trigger confetti burst
        if (typeof confetti === "function") {
          triggerConfettiBurst();
        }

        // Send submission to backend for storage/export
        try {
          const configApiUrl = window.CRAVE_CONFIG && window.CRAVE_CONFIG.apiBaseUrl;
          if (!configApiUrl) {
            console.error('❌ No API URL configured. Set window.__CRAVEESSA_API_URL__ or deploy with the correct env var.');
            return;
          }

          const submitUrl = `${configApiUrl}/submit`;
          console.log('📤 Sending submission to:', submitUrl);

          fetch(submitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: name,
              whatsappNumber: rawWaNumber,
              email: document.getElementById("email") ? document.getElementById("email").value.trim() : "",
              cakeSize: sizeVal,
              flavor: flavorVal,
              occasion: occasionVal,
              neededBy: dateVal,
              deliveryArea: areaVal,
              discountCode,
              createdAt: new Date().toISOString()
            })
          }).then(r => r.json()).then(data => {
            console.log('✅ Submission saved successfully:', data);
          }).catch(err => console.error('❌ Error saving submission:', err));
        } catch (err) {
          console.error('❌ Submit request failed:', err);
        }
      }
    });
  }

  // Confetti explosion logic
  const triggerConfettiBurst = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };


  // --- 6. Success Modal buttons (Copy, Close) ---
  const copyBtn = document.getElementById("copy-code-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (revealedCodeEl) {
        navigator.clipboard.writeText(revealedCodeEl.textContent).then(() => {
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = "✨ Copied!";
          setTimeout(() => {
            copyBtn.innerHTML = origText;
          }, 2000);
        }).catch(err => {
          console.error("Could not copy text: ", err);
        });
      }
    });
  }

  const closeModalBtn = document.getElementById("modal-close-btn");
  if (closeModalBtn && successModal) {
    closeModalBtn.addEventListener("click", () => {
      successModal.classList.remove("active");
      // Reset form and return to step 1
      if (discountForm) {
        discountForm.reset();
        
        // Reset sizes buttons
        sizeBtns.forEach(b => b.classList.remove("active"));
        const defaultSizeBtn = document.querySelector('.size-select-btn[data-val="1kg"]');
        if (defaultSizeBtn) defaultSizeBtn.classList.add("active");
        if (hiddenSizeInput) hiddenSizeInput.value = "1kg";

        // Go back to step 1 active
        formSteps.forEach(step => step.classList.remove("active"));
        const step1 = document.querySelector('.form-step[data-step="1"]');
        if (step1) step1.classList.add("active");
        updateProgress(1);
      }
    });
  }


  // --- 7. Urgency Counter ticking down ---
  const customersLeftEl = document.getElementById("customers-left");
  const urgencyBar = document.getElementById("urgency-bar");
  const closeUrgencyBtn = document.getElementById("close-urgency-btn");

  if (customersLeftEl) {
    // Get initial value or load from localStorage
    let currentCount = parseInt(localStorage.getItem("crave_customers_left"));
    if (isNaN(currentCount) || currentCount <= 2) {
      currentCount = config.initialCustomersCount;
    }
    
    customersLeftEl.textContent = currentCount;

    // Tick down slowly every 45-60 seconds for fake urgency, minimum of 3
    const tickCounter = () => {
      if (currentCount > 3) {
        currentCount -= 1;
        customersLeftEl.textContent = currentCount;
        localStorage.setItem("crave_customers_left", currentCount);
      }
    };
    
    // Check every 45 seconds
    setInterval(tickCounter, 45000);
  }

  if (closeUrgencyBtn && urgencyBar) {
    closeUrgencyBtn.addEventListener("click", () => {
      urgencyBar.classList.add("hidden");
    });
  }


  // --- 8. FAQ Accordion ---
  const faqToggles = document.querySelectorAll(".faq-toggle");
  faqToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest(".faq-item");
      const isActive = item.classList.contains("active");
      
      // Close all other FAQ items
      document.querySelectorAll(".faq-item").forEach(i => {
        i.classList.remove("active");
        const btn = i.querySelector(".faq-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        item.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });


  // --- 9. Carousel scroll assist (snap size buttons inside Form Step 2 if user snaps carousel size card) ---
  const pricingCards = document.querySelectorAll(".pricing-card");
  pricingCards.forEach(card => {
    card.addEventListener("click", () => {
      const selectedSize = card.getAttribute("data-size");
      
      // Highlight matching visual size selector button in form
      const matchingSizeBtn = document.querySelector(`.size-select-btn[data-val="${selectedSize}"]`);
      if (matchingSizeBtn) {
        matchingSizeBtn.click();
      }

      // Smooth scroll user down to the form
      const formSec = document.getElementById("form-section");
      if (formSec) {
        formSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // --- 14. Interactive Cake Building with Form ---
  const customForm = document.getElementById("customForm");
  const formInputs = document.querySelectorAll(".form-input");
  const formProgress = document.getElementById("formProgress");
  const cakeElements = document.querySelectorAll(".cake-element");

  if (customForm && formInputs.length > 0) {
    const totalSteps = 7; // Number of form fields
    let completedSteps = 0;

    // Function to update progress
    const updateFormProgress = () => {
      completedSteps = 0;
      
      formInputs.forEach((input, index) => {
        const isValid = input.value.trim() !== "";
        
        if (isValid) {
          completedSteps++;
          input.classList.add("filled");
        } else {
          input.classList.remove("filled");
        }
      });

      const progressPercent = (completedSteps / totalSteps) * 100;
      formProgress.style.width = progressPercent + "%";

      // Trigger cake layer animations based on progress
      triggerCakeLayers(completedSteps);
    };

    // Trigger specific cake layers
    const triggerCakeLayers = (steps) => {
      // Hide all cake elements first
      cakeElements.forEach(el => {
        el.style.animationPlayState = "paused";
        el.style.opacity = "0";
      });

      // Show layers based on completed steps
      const layerMap = {
        1: [".stand"], // Name entered - show stand
        2: [".stand", ".layer.bottom"], // Phone entered - add bottom layer
        3: [".stand", ".layer.bottom", ".cream.bottom"], // Email - add bottom cream
        4: [".stand", ".layer.bottom", ".cream.bottom", ".layer.middle"], // Size - add middle layer
        5: [".stand", ".layer.bottom", ".cream.bottom", ".layer.middle", ".cream.middle"], // Flavor - add middle cream
        6: [".stand", ".layer.bottom", ".cream.bottom", ".layer.middle", ".cream.middle", ".layer.top"], // Occasion - add top layer
        7: ".cake-element" // All fields - show entire cake fully assembled
      };

      if (steps === 7) {
        // Show final assembled cake
        cakeElements.forEach(el => {
          el.style.animation = "assembledCake 6s ease-in-out infinite";
          el.style.opacity = "1";
        });
      } else if (layerMap[steps]) {
        const elementsToShow = layerMap[steps];
        elementsToShow.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.animation = "none";
            el.style.opacity = "1";
          });
        });
      }
    };

    // Add event listeners to all inputs
    formInputs.forEach(input => {
      input.addEventListener("input", updateFormProgress);
      input.addEventListener("change", updateFormProgress);
      input.addEventListener("keyup", updateFormProgress);
    });

    // Form submission
    customForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (completedSteps === totalSteps) {
        // Show celebration
        showCakeCompletion();
      }
    });

    // Show cake completion celebration
    const showCakeCompletion = () => {
      // Trigger confetti or celebration effect
      if (typeof confetti === "function") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      alert("🎉 Your custom cake order is ready! We'll contact you shortly with design options and pricing. ✨");
    };
  }

  // --- Animation: Assembled Cake (final state) ---
  const style = document.createElement("style");
  style.textContent = `
    @keyframes assembledCake {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.02);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

});

/* ===== DREAM CAKE VISUALIZER — NEW SECTION START ===== */
document.addEventListener('DOMContentLoaded', () => {
  const visualizerSection = document.getElementById('dream-cake-visualizer');
  if (!visualizerSection) return;

  const cakeWeight = document.getElementById('visualCakeWeight');
  const tierButtons = Array.from(document.querySelectorAll('.tier-toggle-btn'));
  const themeInput = document.getElementById('visualTheme');
  const themeChips = Array.from(document.querySelectorAll('.theme-chip'));
  const flavorSelect = document.getElementById('visualFlavor');
  const occasionSelect = document.getElementById('visualOccasion');
  const colorPrefInput = document.getElementById('visualColorPref');
  const surpriseColorBtn = document.getElementById('surpriseColorBtn');
  const specialRequests = document.getElementById('visualSpecialRequests');
  const generateBtn = document.getElementById('generateVisualsBtn');
  const resultShell = document.getElementById('visualizerResult');
  const errorEl = document.getElementById('visualizerError');

  const colorOptions = [
    'blush pink & cream',
    'emerald green & gold',
    'midnight navy & silver',
    'sunset coral & peach',
    'lavender & champagne',
    'moody plum & copper',
    'pearl white & pale sage',
    'caramel & dusty rose',
    'smoked taupe & ivory',
    'bold fuchsia & metallic rose'
  ];
  const loadingTexts = [
    'Mixing ingredients...',
    'Layering the tiers...',
    'Adding the finishing touches...',
    'Your dream cake is almost ready...'
  ];

  let loadingInterval = null;
  let loadingIndex = 0;

  // --- Cooldown settings for Generate button ---
  const COOLDOWN_SECONDS = 60; // adjust as needed
  const COOLDOWN_KEY = 'cakeGenCooldownUntil';
  const generateBtnOriginalText = generateBtn ? (generateBtn.textContent || generateBtn.innerText) : '✨ Generate My Cake Designs';

  function startCooldown(button, seconds) {
    const until = Date.now() + seconds * 1000;
    try {
      localStorage.setItem(COOLDOWN_KEY, String(until));
    } catch (e) {
      // ignore localStorage errors
    }
    runCooldownTimer(button);
  }

  function runCooldownTimer(button) {
    if (!button) return;
    const until = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
    const remaining = Math.ceil((until - Date.now()) / 1000);

    if (remaining <= 0) {
      // No active cooldown
      try { localStorage.removeItem(COOLDOWN_KEY); } catch (e) {}
      // Only enable when not in loading state
      if (!loadingInterval) {
        button.disabled = false;
        button.textContent = generateBtnOriginalText;
      } else {
        // keep disabled while loading, but restore original text
        button.textContent = generateBtnOriginalText;
      }
      return;
    }

    // Active cooldown: show remaining seconds and disable
    button.disabled = true;
    button.textContent = `Please wait ${remaining}s...`;
    // Schedule next tick
    setTimeout(() => runCooldownTimer(button), 1000);
  }

  const buildPromptMeta = () => {
    return {
      weight: cakeWeight.value,
      theme: themeInput.value.trim() || 'elegant celebration',
      flavor: flavorSelect.value,
      occasion: occasionSelect.value,
      color: colorPrefInput.value.trim() || 'soft blush and cream',
      tier: getSelectedTier(),
      special: specialRequests.value.trim() || 'No special requests'
    };
  };

  const buildUserPrompt = (meta) => {
    return `Create three unique luxury cake design concepts for a premium cake studio. Use the following details in your response:
- Weight: ${meta.weight}
- Tiers: ${meta.tier}
- Theme: ${meta.theme}
- Flavor: ${meta.flavor}
- Occasion: ${meta.occasion}
- Colors: ${meta.color}
- Special requests: ${meta.special}

For each concept, provide:
1) A short concept title.
2) A concise design description.
3) A crisp image prompt in quotes suitable for studio-style AI cake rendering.

Return the response in JSON format with a top-level key named "concepts" and an array of three objects, each containing "title", "description", and "prompt".`;
  };

  const renderGeminiConcepts = (concepts) => {
    if (!resultShell) return;

    const html = concepts.map((concept) => `
      <div class="visualizer-concept-card">
        <div class="visualizer-concept-title">${escapeHtml(concept.title)}</div>
        <div class="visualizer-concept-description">${escapeHtml(concept.description)}</div>
        ${concept.imageUrl ? `
          <div class="visualizer-image-wrapper">
            <img src="${escapeHtml(concept.imageUrl)}" alt="${escapeHtml(concept.title)}" class="visualizer-generated-image" />
          </div>
        ` : ''}
        <div class="visualizer-prompt-block">
          <div class="prompt-label">AI image prompt</div>
          <div class="prompt-text">${escapeHtml(concept.prompt)}</div>
          <div class="prompt-actions">
            <button type="button" class="copy-prompt-btn">📋 Copy Image Prompt</button>
          </div>
        </div>
      </div>
    `).join('');

    const whatsappHref = buildWhatsAppLink(concepts[0]?.title || 'Concept 1');

    resultShell.innerHTML = `
      <div class="visualizer-result-card">
        ${html}
        <div class="visualizer-result-actions">
          <a id="visualizerWhatsAppBtn" class="visualizer-wa-share" target="_blank" rel="noopener" href="${escapeHtml(whatsappHref)}">📲 Send This Design to Craveessa on WhatsApp</a>
          <button type="button" id="visualizerTryAgain" class="visualizer-try-again">🔄 Try Again with Different Inputs</button>
        </div>
      </div>
    `;
  };

  const renderGeminiImages = (images) => {
    if (!resultShell) return;

    const html = images.map((image, index) => `
      <div class="visualizer-concept-card">
        <div class="visualizer-concept-title">Design ${index + 1}</div>
        <div class="visualizer-image-wrapper">
          <img src="${escapeHtml(image.url)}" alt="AI cake design ${index + 1}" class="visualizer-generated-image" />
        </div>
        <div class="visualizer-prompt-block">
          <div class="prompt-label">Generated prompt</div>
          <div class="prompt-text">${escapeHtml(image.prompt || '')}</div>
          <div class="prompt-actions">
            <button type="button" class="copy-prompt-btn">📋 Copy Prompt</button>
          </div>
        </div>
      </div>
    `).join('');

    const whatsappHref = buildWhatsAppLink('AI Cake Design');

    resultShell.innerHTML = `
      <div class="visualizer-result-card">
        ${html}
        <div class="visualizer-result-actions">
          <a id="visualizerWhatsAppBtn" class="visualizer-wa-share" target="_blank" rel="noopener" href="${escapeHtml(whatsappHref)}">📲 Send This Design to Craveessa on WhatsApp</a>
          <button type="button" id="visualizerTryAgain" class="visualizer-try-again">🔄 Try Again with Different Inputs</button>
        </div>
      </div>
    `;
  };

  const escapeHtml = (text) => {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const setActiveTier = (value) => {
    tierButtons.forEach((btn) => {
      const active = btn.dataset.value === value;
      btn.classList.toggle('active', active);
    });
  };

  tierButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveTier(button.dataset.value);
    });
  });

  themeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      themeInput.value = chip.textContent.replace(/^[^a-zA-Z0-9]+/, '').trim();
      themeInput.focus();
    });
  });

  surpriseColorBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * colorOptions.length);
    colorPrefInput.value = colorOptions[randomIndex];
  });

  const updateLoadingText = () => {
    if (!resultShell) return;
    const copy = loadingTexts[loadingIndex % loadingTexts.length];
    const loadingCopy = resultShell.querySelector('.loading-copy');
    if (loadingCopy) {
      loadingCopy.textContent = copy;
    }
    loadingIndex += 1;
  };

  const showLoadingState = () => {
    if (!resultShell) return;
    generateBtn.disabled = true;
    resultShell.innerHTML = `
      <div class="visualizer-loading">
        <div class="loading-emoji" aria-hidden="true">🎂</div>
        <div class="loading-copy">${loadingTexts[0]}</div>
      </div>
    `;
    loadingIndex = 0;
    if (loadingInterval) {
      clearInterval(loadingInterval);
    }
    loadingInterval = setInterval(updateLoadingText, 1500);
  };

  const hideLoadingState = () => {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    // Respect any active cooldown when enabling the button
    if (generateBtn) {
      runCooldownTimer(generateBtn);
    }
  };

  const getSelectedTier = () => {
    const active = tierButtons.find((btn) => btn.classList.contains('active'));
    return active ? active.dataset.value : '1 Tier';
  };

  const buildWhatsAppLink = (conceptTitle) => {
    const baseUrl = `https://wa.me/${window.CRAVE_CONFIG?.whatsappNumber || '9011560339'}`;
    const selectedConcept = conceptTitle || 'Concept 1';
    const themeText = themeInput.value.trim() || 'No theme specified';
    const occasionText = occasionSelect.value;
    const cakeSizeText = cakeWeight.value;
    const message = `Hi Craveessa! I used the AI cake designer and loved ${selectedConcept}. Here are my details: ${cakeSizeText}, ${themeText}, ${occasionText}. Can you make this for me?`;
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  };

  const renderVisualResponse = (text) => {
    const lines = text.split(/\r?\n/);
    let html = '';
    let inList = false;
    let promptActive = false;
    let currentPrompt = '';
    let selectedConceptName = 'Concept 1';

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += '<div class="visualizer-paragraph-break"></div>';
        return;
      }

      if (/^🎂 CONCEPT \[\d+\/3\] — /.test(line)) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        const match = line.match(/^🎂 CONCEPT \[\d+\/3\] — (.+)$/);
        if (match && !selectedConceptName) {
          selectedConceptName = match[1];
        }
        html += `<div class="visualizer-concept-title">${escapeHtml(line)}</div>`;
        return;
      }

      if (/^(👁️|🍰|🎨|🌈|✨|🍫|✅|🎉|📸|⭐|⏱️|💬)/.test(line)) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (line.startsWith('📸 IMAGE PROMPT')) {
          promptActive = true;
          html += `<div class="visualizer-section-title">${escapeHtml(line)}</div>`;
          return;
        }
        html += `<div class="visualizer-section-title">${escapeHtml(line)}</div>`;
        return;
      }

      if (promptActive && line.startsWith('"') && line.endsWith('"')) {
        currentPrompt = line.slice(1, -1);
        html += `
          <div class="visualizer-prompt-block">
            <div class="prompt-label">Prompt</div>
            <div class="prompt-text">${escapeHtml(currentPrompt)}</div>
            <div class="prompt-actions">
              <button type="button" class="copy-prompt-btn">📋 Copy Image Prompt</button>
            </div>
            <div class="prompt-links">
              <a class="prompt-link-btn" href="https://app.leonardo.ai" target="_blank" rel="noopener">🎨 Try on Leonardo.ai</a>
              <a class="prompt-link-btn" href="https://firefly.adobe.com" target="_blank" rel="noopener">🖼️ Try on Adobe Firefly</a>
              <a class="prompt-link-btn" href="https://ideogram.ai" target="_blank" rel="noopener">🤖 Try on Ideogram</a>
            </div>
          </div>
        `;
        promptActive = false;
        return;
      }

      if (/^-\s+/.test(line)) {
        if (!inList) {
          html += '<ul class="visualizer-bullet-list">';
          inList = true;
        }
        html += `<li>${escapeHtml(line.replace(/^-\s+/, ''))}</li>`;
        return;
      }

      html += `<p>${escapeHtml(line)}</p>`;
    });

    if (inList) {
      html += '</ul>';
    }

    const conceptMatch = text.match(/^🎂 CONCEPT \[1\/3\] — (.+)$/m);
    const conceptTitle = conceptMatch ? conceptMatch[1] : 'Concept 1';
    const whatsappHref = buildWhatsAppLink(conceptTitle);

    resultShell.innerHTML = `
      <div class="visualizer-result-card">
        ${html}
        <div class="visualizer-result-actions">
          <a id="visualizerWhatsAppBtn" class="visualizer-wa-share" target="_blank" rel="noopener" href="${escapeHtml(whatsappHref)}">📲 Send This Design to Craveessa on WhatsApp</a>
          <button type="button" id="visualizerTryAgain" class="visualizer-try-again">🔄 Try Again with Different Inputs</button>
        </div>
      </div>
    `;
  };

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const configured = window.CRAVE_API_BASE_URL || window.__CRAVEESSA_API_URL__;
      if (configured) return configured.replace(/\/$/, '');
      const currentOrigin = window.location.origin;
      if (currentOrigin.includes('vercel.app') || currentOrigin.includes('netlify.app')) {
        return 'https://crave-essa-discount-landing-production.up.railway.app';
      }
    }
    return '';
  };

  const apiUrl = (path) => {
    const base = getApiBaseUrl();
    return `${base}${path}`;
  };

  const clearVisualizerInputs = () => {
    setActiveTier('1 Tier');
    cakeWeight.value = '250g';
    themeInput.value = '';
    flavorSelect.value = 'Chocolate';
    occasionSelect.value = 'Birthday';
    colorPrefInput.value = '';
    specialRequests.value = '';
    if (resultShell) {
      resultShell.innerHTML = '';
    }
    if (errorEl) {
      errorEl.textContent = '';
    }
  };

  const showErrorMessage = (message) => {
    if (errorEl) {
      errorEl.textContent = message;
    }
    if (resultShell) {
      resultShell.innerHTML = `
        <div class="visualizer-result-card">
          <p>${escapeHtml(message)}</p>
        </div>
      `;
    }
  };

  // Resume any active cooldown on load
  try { runCooldownTimer(generateBtn); } catch (e) { /* ignore */ }

  generateBtn.addEventListener('click', async () => {
    if (!resultShell || !generateBtn) return;
    errorEl.textContent = '';
    showLoadingState();

    try {
      const meta = buildPromptMeta();
      const response = await fetch(apiUrl('/api/gemini-design'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meta)
      });

      let result = {};
      const responseText = await response.text();
      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          result = {
            error: responseText
          };
        }
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Unable to generate cake concepts');
      }

      if (result.images && Array.isArray(result.images)) {
        renderGeminiImages(result.images);
      } else if (result.concepts && Array.isArray(result.concepts)) {
        renderGeminiConcepts(result.concepts);
      } else {
        throw new Error(result.error || result.message || 'Invalid Gemini response');
      }
    } catch (err) {
      console.error(err);
      showErrorMessage('Something went wrong generating your cake concepts. Please try again or contact us directly on WhatsApp.');
    } finally {
      hideLoadingState();
      // Start cooldown after each attempt to prevent rapid re-tries
      try { startCooldown(generateBtn, COOLDOWN_SECONDS); } catch (e) { /* ignore */ }
    }
  });

  resultShell.addEventListener('click', (event) => {
    const copyBtn = event.target.closest('.copy-prompt-btn');
    if (copyBtn) {
      const promptBlock = copyBtn.closest('.visualizer-prompt-block');
      const promptText = promptBlock ? promptBlock.querySelector('.prompt-text')?.innerText : '';
      if (promptText) {
        navigator.clipboard.writeText(promptText).then(() => {
          const original = copyBtn.innerText;
          copyBtn.innerText = '✅ Copied!';
          setTimeout(() => {
            copyBtn.innerText = original;
          }, 1800);
        });
      }
      return;
    }

    if (event.target.id === 'visualizerTryAgain') {
      clearVisualizerInputs();
      visualizerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
