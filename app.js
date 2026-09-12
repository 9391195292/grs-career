/**
 * GRS CAREER INTELLIGENCE | INTERACTIVE ENGINE
 * Three.js 3D Scene + Matter.js 2D Physics + GSAP Animations + Klausen/Illoca Aesthetics
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initPreloader();
  initCoordinateTracker();
  initThreeJSScene();
  initMatterPhysics();
  initTabs();
  initQuizModal();
  initMobileDrawer();
  initGSAPScroll();
});

/* ==========================================================================
   1. KLAUSEN-STYLE PRELOADER & APERTURE
   ========================================================================== */
function initPreloader() {
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progressBar');
  const progressNum = document.getElementById('progressNum');
  const canvas = document.getElementById('loaderCanvas');
  const ctx = canvas.getContext('2d');

  let progress = 0;
  let angle = 0;

  function renderLoaderAperture() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Outer rotating ticks
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.4)';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.lineTo(48, 0);
      ctx.stroke();
      ctx.rotate((Math.PI * 2) / 16);
    }
    ctx.restore();

    // Inner pulsating iris
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-angle * 1.5);
    ctx.strokeStyle = '#CCFF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -18, 36, 36);
    ctx.restore();

    angle += 0.03;
  }

  const loaderInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4;
    if (progress > 100) progress = 100;

    progressBar.style.width = progress + '%';
    progressNum.innerText = (progress < 10 ? '0' : '') + progress + '%';
    renderLoaderAperture();

    if (progress >= 100) {
      clearInterval(loaderInterval);
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            triggerHeroEntrance();
          }
        });
      }, 300);
    }
  }, 35);
}

/* ==========================================================================
   2. ILLOCA-STYLE COORDINATE TRACKER & HUD
   ========================================================================== */
function initCoordinateTracker() {
  const coordX = document.getElementById('coordX');
  const coordY = document.getElementById('coordY');

  window.addEventListener('mousemove', (e) => {
    const normX = ((e.clientX / window.innerWidth) * 2 - 1).toFixed(2);
    const normY = (-(e.clientY / window.innerHeight) * 2 + 1).toFixed(2);
    if (coordX) coordX.innerText = normX;
    if (coordY) coordY.innerText = normY;
  });
}

/* ==========================================================================
   3. THREE.JS 3D WEBGL CAREER PRISM / GYRO COMPASS
   ========================================================================== */
function initThreeJSScene() {
  const container = document.getElementById('threeCanvas');
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group to hold our 3D Career Compass
  const compassGroup = new THREE.Group();
  scene.add(compassGroup);

  // 1. Core Polyhedron (Icosahedron wireframe + translucent inner core)
  const icoGeometry = new THREE.IcosahedronGeometry(6.5, 1);
  const icoWireMat = new THREE.MeshBasicMaterial({
    color: 0xCCFF00,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const icoMesh = new THREE.Mesh(icoGeometry, icoWireMat);
  compassGroup.add(icoMesh);

  // Inner Solid Crystal
  const innerGeo = new THREE.OctahedronGeometry(3.8, 0);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x101512,
    emissive: 0x223512,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: false
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  compassGroup.add(innerMesh);

  // 2. Orbital Rings
  const ringGeo1 = new THREE.RingGeometry(8.5, 8.6, 64);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00F0FF, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 2.5;
  compassGroup.add(ring1);

  const ringGeo2 = new THREE.RingGeometry(10.2, 10.3, 64);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xE5C378, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 3;
  compassGroup.add(ring2);

  // 3. Floating Star Particles
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 180;
  const posArray = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 50;
    posArray[i + 1] = (Math.random() - 0.5) * 50;
    posArray[i + 2] = (Math.random() - 0.5) * 30;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xCCFF00,
    transparent: true,
    opacity: 0.6
  });
  const particleMesh = new THREE.Points(particleGeo, particleMat);
  scene.add(particleMesh);

  // 4. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xCCFF00, 2, 50);
  pointLight.position.set(10, 15, 15);
  scene.add(pointLight);

  // Mouse Interaction Variables
  let targetRotationX = 0;
  let targetRotationY = 0;

  window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = mouseX * 0.8;
    targetRotationX = -mouseY * 0.8;
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Smooth rotation lerp
    compassGroup.rotation.y += (targetRotationY - compassGroup.rotation.y) * 0.05 + 0.003;
    compassGroup.rotation.x += (targetRotationX - compassGroup.rotation.x) * 0.05;

    ring1.rotation.z += 0.005;
    ring2.rotation.z -= 0.004;
    innerMesh.rotation.y -= 0.01;

    particleMesh.rotation.y += 0.0008;

    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/* ==========================================================================
   5. MATTER.JS 2D RIGID-BODY CAREER PHYSICS PLAYGROUND
   ========================================================================== */
function initMatterPhysics() {
  const container = document.getElementById('physicsCanvas');
  if (!container) return;

  // Career Badges Data
  const careerTags = [
    { text: 'AI & ROBOTICS', color: '#CCFF00', textCol: '#000000', w: 145, h: 42 },
    { text: 'QUANT FINANCE', color: '#BAE6FD', textCol: '#000000', w: 140, h: 42 },
    { text: 'PRODUCT DESIGN', color: '#FEF08A', textCol: '#000000', w: 145, h: 42 },
    { text: 'BIOTECH & GENETICS', color: '#A7F3D0', textCol: '#000000', w: 165, h: 42 },
    { text: 'CORPORATE LAW', color: '#FED7AA', textCol: '#000000', w: 145, h: 42 },
    { text: 'COGNITIVE PSYCH', color: '#E9D5FF', textCol: '#000000', w: 155, h: 42 },
    { text: 'CYBERSECURITY', color: '#CCFF00', textCol: '#000000', w: 140, h: 42 },
    { text: 'DATA SCIENCE', color: '#FBCFE8', textCol: '#000000', w: 135, h: 42 },
    { text: 'VENTURE CAPITAL', color: '#FEF08A', textCol: '#000000', w: 150, h: 42 },
    { text: 'NEUROSCIENCE', color: '#BAE6FD', textCol: '#000000', w: 140, h: 42 }
  ];

  if (!window.Matter) {
    // Fallback: render tags as interactive pill flex items inside container
    const fallbackWrap = document.createElement('div');
    fallbackWrap.className = 'physics-fallback-wrap';
    careerTags.forEach(tag => {
      const pill = document.createElement('div');
      pill.className = 'physics-fallback-pill';
      pill.style.backgroundColor = tag.color;
      pill.style.color = tag.textCol;
      pill.textContent = tag.text;
      fallbackWrap.appendChild(pill);
    });
    container.appendChild(fallbackWrap);
    return;
  }

  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

  // Create engine
  const engine = Engine.create({
    gravity: { x: 0, y: 0.9 }
  });

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 250;
  const isMobile = window.innerWidth <= 768;
  const scale = isMobile ? 0.72 : 1.0;

  // Create renderer
  const render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent'
    }
  });

  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  // Static Boundaries (Floor & Walls)
  const wallThickness = 60;
  const floor = Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, {
    isStatic: true,
    render: { visible: false }
  });
  const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    render: { visible: false }
  });
  const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    render: { visible: false }
  });

  Composite.add(engine.world, [floor, leftWall, rightWall]);

  // Spawn career bodies
  const bodies = careerTags.map((tag, idx) => {
    const bw = Math.round(tag.w * scale);
    const bh = Math.round(tag.h * scale);
    const spawnX = Math.max(bw / 2 + 10, Math.min(width - bw / 2 - 10, 40 + (idx * (isMobile ? 32 : 75)) % Math.max(60, width - bw)));
    const spawnY = -20 - (idx * (isMobile ? 22 : 35));

    const body = Bodies.rectangle(spawnX, spawnY, bw, bh, {
      chamfer: { radius: isMobile ? 10 : 14 },
      restitution: 0.65,
      friction: 0.12,
      density: 0.002,
      render: {
        fillStyle: tag.color,
        strokeStyle: '#000000',
        lineWidth: 2
      }
    });

    body.customData = { ...tag, bw, bh };
    return body;
  });

  Composite.add(engine.world, bodies);

  // Custom label drawing over Matter.js bodies
  Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.font = isMobile ? 'bold 9.5px "Space Grotesk", sans-serif' : 'bold 11.5px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    bodies.forEach((body) => {
      const { x, y } = body.position;
      const angle = body.angle;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = body.customData.textCol;
      ctx.fillText(body.customData.text, 0, 0);
      ctx.restore();
    });
  });

  // Mouse drag & fling control
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });

  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  // Responsive canvas resizing
  window.addEventListener('resize', () => {
    if (!container) return;
    const newW = container.clientWidth;
    const newH = container.clientHeight;

    render.canvas.width = newW;
    render.canvas.height = newH;
    render.options.width = newW;
    render.options.height = newH;

    Matter.Body.setPosition(floor, { x: newW / 2, y: newH + wallThickness / 2 });
    Matter.Body.setPosition(rightWall, { x: newW + wallThickness / 2, y: newH / 2 });
  });
}

/* ==========================================================================
   6. GSAP ENTRANCE & SCROLL TRIGGERS
   ========================================================================== */
function triggerHeroEntrance() {
  if (!window.gsap) return;

  const tl = gsap.timeline();
  tl.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' })
    .from('.word-split', {
      opacity: 0,
      y: 50,
      stagger: 0.12,
      duration: 0.8,
      ease: 'back.out(1.4)'
    }, '-=0.4')
    .from('.hero-subtext', { opacity: 0, y: 25, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .from('.hero-cta-group', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .from('.hero-proof-bar', { opacity: 0, scale: 0.95, duration: 0.6, ease: 'power2.out' }, '-=0.3');
}

function initGSAPScroll() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Stagger dimension cards on scroll
  gsap.from('.dimension-card', {
    scrollTrigger: {
      trigger: '.pentagon-interactive-wrap',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Stagger vision metric cards
  gsap.from('.v-card', {
    scrollTrigger: {
      trigger: '.vision-metric-cards',
      start: 'top 85%'
    },
    x: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power2.out'
  });
}

/* ==========================================================================
   7. TABS NAVIGATION (Streams & Pathways)
   ========================================================================== */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      const activeContent = document.getElementById(target);
      if (activeContent) activeContent.classList.add('active');
    });
  });
}

/* ==========================================================================
   8. INTERACTIVE 60-SEC CAREER QUIZ MODAL & FORM VALIDATION
   ========================================================================== */
function initQuizModal() {
  const quizModal = document.getElementById('quizModal');
  const openBtns = [
    document.getElementById('openQuizBtn'),
    document.getElementById('openQuizBtn2'),
    document.getElementById('heroStartBtn'),
    document.getElementById('drawerQuizBtn')
  ];
  const closeBtn = document.getElementById('closeQuizBtn');

  openBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        // If mobile drawer was open, close it
        const drawer = document.getElementById('mobileNavDrawer');
        const toggle = document.getElementById('mobileMenuToggle');
        if (drawer && drawer.classList.contains('is-open')) {
          drawer.classList.remove('is-open');
          drawer.setAttribute('aria-hidden', 'true');
          if (toggle) toggle.classList.remove('is-active');
        }
        quizModal.classList.add('open');
      });
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      quizModal.classList.remove('open');
    });
  }

  // Quiz Option Click Handling
  const step1Opts = document.querySelectorAll('#qStep1 .q-opt');
  const step2Opts = document.querySelectorAll('#qStep2 .q-opt');
  const qStep1 = document.getElementById('qStep1');
  const qStep2 = document.getElementById('qStep2');
  const qStep3 = document.getElementById('qStep3');
  const qSuccess = document.getElementById('qSuccess');
  const leadForm = document.getElementById('leadForm');

  let selectedStage = 'class_11_12';
  let selectedChallenge = 'paralysis';

  step1Opts.forEach((opt) => {
    opt.addEventListener('click', () => {
      selectedStage = opt.getAttribute('data-val') || 'class_11_12';
      qStep1.classList.add('hidden');
      qStep2.classList.remove('hidden');
    });
  });

  step2Opts.forEach((opt) => {
    opt.addEventListener('click', () => {
      selectedChallenge = opt.getAttribute('data-val') || 'paralysis';
      qStep2.classList.add('hidden');
      qStep3.classList.remove('hidden');
    });
  });

  // Inline Form Validation Inputs
  const nameInput = document.getElementById('leadName');
  const phoneInput = document.getElementById('leadPhone');
  const emailInput = document.getElementById('leadEmail');
  const nameError = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');
  const emailError = document.getElementById('emailError');
  const formGlobalError = document.getElementById('formGlobalError');

  function clearError(input, errorEl) {
    if (input) input.classList.remove('input-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
    if (formGlobalError) formGlobalError.classList.add('hidden');
  }

  [
    [nameInput, nameError],
    [phoneInput, phoneError],
    [emailInput, emailError]
  ].forEach(([inp, err]) => {
    if (inp) {
      inp.addEventListener('input', () => clearError(inp, err));
    }
  });

  function validateInputs() {
    let isValid = true;
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';

    const phoneRegex = /^[0-9+\s\-()]{8,16}$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!nameVal || nameVal.length < 2) {
      nameInput.classList.add('input-invalid');
      nameError.textContent = 'Please enter your full name (minimum 2 characters).';
      nameError.classList.add('visible');
      isValid = false;
    }

    if (!phoneVal || !phoneRegex.test(phoneVal)) {
      phoneInput.classList.add('input-invalid');
      phoneError.textContent = 'Please enter a valid phone or WhatsApp number.';
      phoneError.classList.add('visible');
      isValid = false;
    }

    if (!emailVal || !emailRegex.test(emailVal)) {
      emailInput.classList.add('input-invalid');
      emailError.textContent = 'Please enter a valid email address.';
      emailError.classList.add('visible');
      isValid = false;
    }

    return isValid;
  }

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateInputs()) {
        return;
      }

      const submitBtn = document.getElementById('submitLeadBtn') || leadForm.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Securing Diagnostic...</span>';

      const payload = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        stage: selectedStage,
        challenge: selectedChallenge
      };

      function updateWhatsAppLink() {
        const waBtn = document.getElementById('waChatBtn');
        if (waBtn) {
          const stageMap = {
            '910': 'Class 9-10 (Stream Selection)',
            '1112': 'Class 11-12 (College & Entrance)',
            'college': 'College Student / Graduate',
            'parent': 'Parent Seeking Guidance'
          };
          const challengeMap = {
            'paralysis': 'Too many options, zero clarity',
            'pressure': 'Parental pressure vs interests',
            'exams': 'Exam burnout & anxiety',
            'future': 'Fear of dead-end career'
          };
          const readableStage = stageMap[payload.stage] || payload.stage;
          const readableChallenge = challengeMap[payload.challenge] || payload.challenge;
          const msg = encodeURIComponent(`Hi Coach G. Ravi Sankar,\nI just completed the 5-D Career Diagnostic on your website!\n\nName: ${payload.name}\nPhone: ${payload.phone}\nEmail: ${payload.email}\nStage: ${readableStage}\nKey Challenge: ${readableChallenge}\n\nPlease share my personalized clarity roadmap.`);
          waBtn.href = `https://wa.me/919490075459?text=${msg}`;
        }
      }

      try {
        await fetch('/api/diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      } catch (err) {
        // Safe failover
      } finally {
        updateWhatsAppLink();
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
        qStep3.classList.add('hidden');
        qSuccess.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}

/* ==========================================================================
   9. RESPONSIVE MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const backdrop = document.getElementById('drawerBackdrop');
  const links = document.querySelectorAll('.drawer-link');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  links.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Handle ESC key to close drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}
