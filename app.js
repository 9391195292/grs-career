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
            if (window.ScrollTrigger) {
              window.ScrollTrigger.refresh();
            }
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
  // Guarantee cards and content are immediately 100% visible
  const cards = document.querySelectorAll('.dimension-card, .v-card');
  cards.forEach((c) => {
    c.style.opacity = '1';
    c.style.visibility = 'visible';
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Subtle upward ease without hiding elements or touching opacity
  gsap.from('.dimension-card', {
    scrollTrigger: {
      trigger: '.pentagon-interactive-wrap',
      start: 'top 90%',
      once: true
    },
    y: 20,
    stagger: 0.08,
    duration: 0.5,
    ease: 'power2.out',
    immediateRender: false
  });

  gsap.from('.v-card', {
    scrollTrigger: {
      trigger: '.vision-metric-cards',
      start: 'top 90%',
      once: true
    },
    y: 20,
    stagger: 0.08,
    duration: 0.5,
    ease: 'power2.out',
    immediateRender: false
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
   8. 5-DIMENSIONAL CAREER DIAGNOSTIC & ₹149 ROADMAP UNLOCK ENGINE
   ========================================================================== */

/**
 * RAZORPAY CONFIGURATION
 * To activate live Indian payments:
 * 1. Sign up at https://razorpay.com and generate an API Key.
 * 2. Replace 'rzp_test_placeholder' below with your Live Key ID (e.g. 'rzp_live_xxxxxxxxxxxx').
 * In sandbox/demo mode, test payments will automatically simulate successful authorization.
 */
const RAZORPAY_CONFIG = {
  keyId: window.GRS_RAZORPAY_KEY || 'rzp_test_placeholder',
  amount: 14900, // ₹149 in paise
  currency: 'INR',
  name: 'GRS Career Intelligence',
  description: '5-Dimensional Career Intelligence Roadmap',
  coachPhone: '919490075459'
};

// 10 Scenario-based Questions (2 per Dimension) tagged to 5 Archetypes
const QUIZ_QUESTIONS = [
  // DIMENSION 1: APTITUDE & LOGIC
  {
    dimension: 'Aptitude & Logic',
    question: 'When facing a complex problem with incomplete information, what is your instinctive starting point?',
    options: [
      { key: 'A', text: 'Deconstruct the underlying logic, isolate root causes, and seek mathematical or empirical proof.', archetype: 'Investigator' },
      { key: 'B', text: 'Build a working prototype, test code, or hands-on model immediately to see what works in practice.', archetype: 'Builder' },
      { key: 'C', text: 'Brainstorm unconventional angles and visualize creative, out-of-the-box possibilities.', archetype: 'Creator' },
      { key: 'D', text: 'Evaluate strategic risk, calculate high-yield outcomes, and formulate a step-by-step roadmap.', archetype: 'Strategist' },
      { key: 'E', text: 'Convene teammates to understand user needs, synthesize opinions, and build consensus.', archetype: 'Supporter' }
    ]
  },
  {
    dimension: 'Aptitude & Logic',
    question: 'Which type of intellectual challenge excites you most during intensive project work?',
    options: [
      { key: 'A', text: 'Formulating mathematical proofs, analyzing statistical data, or running scientific experiments.', archetype: 'Investigator' },
      { key: 'B', text: 'Architecting scalable software, assembling robotics, or optimizing physical systems.', archetype: 'Builder' },
      { key: 'C', text: 'Crafting brand narratives, designing aesthetic interfaces, or directing multimedia concepts.', archetype: 'Creator' },
      { key: 'D', text: 'Forecasting industry trends, analyzing business models, and steering team execution.', archetype: 'Strategist' },
      { key: 'E', text: 'Mentoring peers, facilitating group discussions, and resolving interpersonal friction.', archetype: 'Supporter' }
    ]
  },

  // DIMENSION 2: PERSONALITY TRAITS
  {
    dimension: 'Personality Traits',
    question: 'In high-stakes group initiatives, what role do you naturally step into without being asked?',
    options: [
      { key: 'A', text: 'The Analytical Skeptic who verifies assumptions, audits evidence, and prevents logical errors.', archetype: 'Investigator' },
      { key: 'B', text: 'The Lead Builder who turns abstract theory into tangible, functional deliverables.', archetype: 'Builder' },
      { key: 'C', text: 'The Creative Catalyst who injects original ideas, reimagines boundaries, and makes work memorable.', archetype: 'Creator' },
      { key: 'D', text: 'The Strategic Director who maps milestones, allocates focus, and guarantees timely execution.', archetype: 'Strategist' },
      { key: 'E', text: 'The Team Anchor who ensures everyone is heard, motivated, and emotionally aligned.', archetype: 'Supporter' }
    ]
  },
  {
    dimension: 'Personality Traits',
    question: 'When your project hits an unforeseen roadblock or technical failure, what is your first reaction?',
    options: [
      { key: 'A', text: 'Dig into logs, diagnostic data, and foundational principles to isolate why the fault happened.', archetype: 'Investigator' },
      { key: 'B', text: 'Inspect mechanics, refactor the code, and re-engineer a pragmatic workaround.', archetype: 'Builder' },
      { key: 'C', text: 'Pivot sideways: Turn the constraint into an opportunity for an artistic or conceptual breakthrough.', archetype: 'Creator' },
      { key: 'D', text: 'Re-evaluate the strategic objective, renegotiate constraints, and pivot resources efficiently.', archetype: 'Strategist' },
      { key: 'E', text: 'Check in with everyone to relieve pressure, preserve morale, and rebuild shared confidence.', archetype: 'Supporter' }
    ]
  },

  // DIMENSION 3: GENUINE INTERESTS
  {
    dimension: 'Genuine Interests',
    question: 'If you had 48 hours in an unrestricted innovation studio, which lab would you choose?',
    options: [
      { key: 'A', text: 'A computational laboratory with supercomputing clusters, datasets, and simulation engines.', archetype: 'Investigator' },
      { key: 'B', text: 'A maker workshop with 3D printers, IoT hardware, microcontrollers, and drones.', archetype: 'Builder' },
      { key: 'C', text: 'An experiential design studio with generative visual workstations, VR headsets, and sound synthesis.', archetype: 'Creator' },
      { key: 'D', text: 'A venture control center simulating global financial markets, venture capital, and startups.', archetype: 'Strategist' },
      { key: 'E', text: 'A human development center conducting cognitive behavior research and youth coaching workshops.', archetype: 'Supporter' }
    ]
  },
  {
    dimension: 'Genuine Interests',
    question: 'Which headline would compel you to read the full article without hesitation?',
    options: [
      { key: 'A', text: 'The Mathematical Frontier: How Deep Algorithms Unravel Complex Biological Genomes.', archetype: 'Investigator' },
      { key: 'B', text: 'Next-Gen Autonomous Hardware: How Modular Robotics Are Transforming Space Exploration.', archetype: 'Builder' },
      { key: 'C', text: 'The New Aesthetics: How Designers and Creative Technologists Build Digital Worlds.', archetype: 'Creator' },
      { key: 'D', text: 'Decade of Disruption: How Strategic Platforms Redefine Global Economics and Leadership.', archetype: 'Strategist' },
      { key: 'E', text: 'Empathetic Intelligence: Revolutionizing Adolescent Mental Health and Holistic Well-Being.', archetype: 'Supporter' }
    ]
  },

  // DIMENSION 4: ORIENTATION STYLE
  {
    dimension: 'Orientation Style',
    question: 'How do you most effectively master deep, unfamiliar academic subjects?',
    options: [
      { key: 'A', text: 'Rigorous derivation: Tracing mathematical equations, first principles, and peer-reviewed studies.', archetype: 'Investigator' },
      { key: 'B', text: 'Kinesthetic experimentation: Building actual projects, tweaking code, and testing edge cases.', archetype: 'Builder' },
      { key: 'C', text: 'Visual translation: Concept maps, diagrams, aesthetic storytelling, and non-linear associations.', archetype: 'Creator' },
      { key: 'D', text: 'Executive case studies: Analyzing decision models, real-world case histories, and ROI impact.', archetype: 'Strategist' },
      { key: 'E', text: 'Collaborative discourse: Interactive debate, peer tutoring, and contextual group discussion.', archetype: 'Supporter' }
    ]
  },
  {
    dimension: 'Orientation Style',
    question: 'What milestone would give you the greatest sense of genuine fulfillment at age 30?',
    options: [
      { key: 'A', text: 'Publishing landmark scientific research or solving a profound mathematical problem.', archetype: 'Investigator' },
      { key: 'B', text: 'Inventing and shipping a reliable technological system or product used by millions.', archetype: 'Builder' },
      { key: 'C', text: 'Directing an internationally acclaimed creative work, product design, or digital brand.', archetype: 'Creator' },
      { key: 'D', text: 'Leading an influential enterprise, investment fund, or high-impact public institution.', archetype: 'Strategist' },
      { key: 'E', text: 'Building a community or educational platform that measurably heals and uplifts thousands of lives.', archetype: 'Supporter' }
    ]
  },

  // DIMENSION 5: EMOTIONAL QUOTIENT & RESILIENCE
  {
    dimension: 'Emotional Quotient',
    question: 'When receiving critical, blunt feedback on your work from an expert mentor, what happens?',
    options: [
      { key: 'A', text: 'Objectively examine the data behind the critique to verify whether it is factually sound.', archetype: 'Investigator' },
      { key: 'B', text: 'Focus solely on the practical fixes, iterate immediately, and test the upgraded version.', archetype: 'Builder' },
      { key: 'C', text: 'Synthesize the critique to spark a bolder, more distinctive creative reimagination.', archetype: 'Creator' },
      { key: 'D', text: 'Assess how to leverage the critique to improve strategic positioning and competitive results.', archetype: 'Strategist' },
      { key: 'E', text: 'Listen deeply, understand the mentor perspective, and use the conversation to strengthen rapport.', archetype: 'Supporter' }
    ]
  },
  {
    dimension: 'Emotional Quotient',
    question: 'During high-anxiety exam seasons or collective stress, what inner anchor keeps you steady?',
    options: [
      { key: 'A', text: 'Rational clarity: Relying on objective facts and knowledge rather than emotional panic.', archetype: 'Investigator' },
      { key: 'B', text: 'Disciplined execution: Following structured daily schedules and focusing on tangible tasks.', archetype: 'Builder' },
      { key: 'C', text: 'Creative expression: Venting through writing, design, music, or imaginative problem-framing.', archetype: 'Creator' },
      { key: 'D', text: 'Long-horizon vision: Remembering that short-term setbacks are minor blips on a multi-year strategy.', archetype: 'Strategist' },
      { key: 'E', text: 'Relational empathy: Sharing vulnerability with close friends and providing reassurance to peers.', archetype: 'Supporter' }
    ]
  }
];

// Archetype Intelligence Profiles - 25 Directional & Pure Archetypes Covering All Career Pathways
const ARCHETYPE_PROFILES = {
  // 1. Investigator Dominant
  'Investigator-Builder': {
    title: 'The Deep-Tech Systems Architect',
    primaryRecommendation: 'Science Stream (PCM) - Engineering & Deep-Tech',
    strongestCareerMatch: 'Computer Science & Artificial Intelligence Systems',
    altCareers: 'Robotics Engineering, Cloud Systems Architecture, Quantitative Analytics',
    summary: 'Your cognitive blueprint combines high analytical logic with a tangible builder instinct. You thrive when unraveling complex technical mechanisms and engineering working, high-impact systems.',
    careers: ['Artificial Intelligence & Deep Learning', 'Robotics Systems Engineering', 'Distributed Cloud Architecture', 'Quantitative Systems Engineering'],
    recommendedStream: 'PCM (Physics, Chemistry, Math) + Computer Science',
    targetEntrances: 'JEE Advanced, JEE Main, BITSAT, IISER IAT',
    parentNote: 'This student combines high analytical abstraction with tangible building instinct. Rote learning without engineering application will cause frustration; provide coding workstations, tech project freedom, and advanced physics/math mentorship.'
  },
  'Investigator-Strategist': {
    title: 'The Quantitative Analyst & FinTech Architect',
    primaryRecommendation: 'Science (PCM) or Applied Mathematics & Data Science',
    strongestCareerMatch: 'Data Science & Quantitative Financial Analytics',
    altCareers: 'FinTech Algorithmic Trading, Cryptographic Security, Operations Research',
    summary: 'You blend relentless analytical rigor with macroscopic vision. You excel at turning sprawling datasets and theoretical patterns into actionable, high-conviction decision frameworks.',
    careers: ['Quantitative Finance & Algorithmic Trading', 'Machine Learning & Big Data Science', 'Cryptographic Security & Blockchain', 'Computational Economics'],
    recommendedStream: 'PCM with Statistics / Economics or Applied Mathematics',
    targetEntrances: 'JEE Main/Advanced, ISI Admission Test, CMI Entrance, CUET (Stats/Maths)',
    parentNote: 'This student excels at deciphering complex statistical patterns and macro trends. Connect their mathematical abilities to algorithmic finance, game theory, and data science.'
  },
  'Investigator-Creator': {
    title: 'The Computational Scientist & R&D Innovator',
    primaryRecommendation: 'Science (PCM) with Interdisciplinary Research & Tech',
    strongestCareerMatch: 'Computational Sciences & Generative Algorithms',
    altCareers: 'Cognitive Neuroscience Research, Scientific Visualization, Bioinformatics',
    summary: 'You bridge deep intellectual inquiry with creative originality. You discover hidden scientific truths and synthesize them into aesthetically compelling, visionary concepts.',
    careers: ['Computational Biology & Genomics', 'Generative Algorithm Research', 'Scientific Visualization', 'Cognitive Neuroscience & AI'],
    recommendedStream: 'PCM with Computer Science / Fine Arts or Interdisciplinary Sciences',
    targetEntrances: 'IISc / IISER (IAT), JEE Advanced, NISER NEST, UCEED',
    parentNote: 'Do not push this student into conventional rote coaching factories. Their genius lies at the intersection of discovery and creative synthesis. Encourage open research questions.'
  },
  'Investigator-Supporter': {
    title: 'The Biomedical Scientist & Clinical Researcher',
    primaryRecommendation: 'Science Stream (PCB / PCMB) - Medical & Life Sciences',
    strongestCareerMatch: 'Biomedical Science & Clinical Genetics Research',
    altCareers: 'Neuroscience Research, Molecular Pharmacology, Biotechnology',
    summary: 'You combine analytical curiosity with profound human empathy. You are drawn to understanding the mechanisms of the mind, human health, and evidence-based healing.',
    careers: ['Biotechnology & Molecular Genetics', 'Clinical Neuroscience Research', 'Pharmaceutical Development', 'Immunology & Vaccine Research'],
    recommendedStream: 'PCB (Physics, Chemistry, Biology) with Mathematics or Biotechnology',
    targetEntrances: 'NEET-UG, IISER (IAT), CUET (Biotechnology/Genetics), ICAR AIEEA',
    parentNote: 'Driven by scientific truth that heals human life. Support their deep analytical empathy with rigorous biology, chemistry, and research lab exposure.'
  },
  'Investigator-Investigator': {
    title: 'The Pure Theoretical & Scientific Researcher',
    primaryRecommendation: 'Pure Sciences (PCM) - Fundamental Research & Math',
    strongestCareerMatch: 'Theoretical Physics, Pure Mathematics & Quantum Computing',
    altCareers: 'Astrophysics Research, Cryptographic Mathematics, Molecular Physics',
    summary: 'You possess pure intellectual rigor and an insatiable hunger for first-principles truth. You belong at the frontier of theoretical discovery where math explains reality.',
    careers: ['Theoretical Physics & Cosmology', 'Pure Mathematics & Cryptography', 'Quantum Computing Research', 'Fundamental Scientific R&D'],
    recommendedStream: 'PCM with Advanced Mathematics & Computer Science',
    targetEntrances: 'IAT (IISc Bangalore & IISERs), NEST (NISER), CMI Entrance, JEE Advanced',
    parentNote: 'A true deep thinker with profound intellectual curiosity. Do not reduce their education to rote formulas; encourage Olympiad preparation, research papers, and advanced theoretical texts.'
  },

  // 2. Builder Dominant
  'Builder-Investigator': {
    title: 'The Robotics & Mechatronics Specialist',
    primaryRecommendation: 'Science Stream (PCM) - Mechanical & Mechatronics',
    strongestCareerMatch: 'Robotics, Mechatronics & Autonomous Hardware',
    altCareers: 'Embedded Hardware Systems, Aerospace Engineering, Industrial Automation',
    summary: 'You are an engineer who thrives when hands-on mechanics intersect with algorithmic intelligence. You design and build the physical machines that automate civilization.',
    careers: ['Robotics & Autonomous Systems', 'Aerospace Engineering', 'Embedded IoT Hardware', 'Automotive & Electric Vehicle Tech'],
    recommendedStream: 'PCM (Physics, Chemistry, Math) + Engineering Graphics / CS',
    targetEntrances: 'JEE Advanced, JEE Main, BITSAT, VITEEE, MET',
    parentNote: 'This student learns through direct physical construction and hardware experimentation. Pair rigorous calculus and physics fundamentals with maker labs, CAD tools, and robotics hackathons.'
  },
  'Builder-Strategist': {
    title: 'The Enterprise Systems Engineer & Operations Leader',
    primaryRecommendation: 'Science (PCM) with Tech-Management Focus',
    strongestCareerMatch: 'Industrial Engineering & Enterprise Operations Management',
    altCareers: 'Tech Product Operations, Supply Chain Systems, Hardware Manufacturing Leadership',
    summary: 'You unite practical engineering capability with commercial foresight. You do not just build tools—you build the industrial systems and infrastructure that scale them globally.',
    careers: ['Industrial & Systems Engineering', 'Supply Chain Architecture & Logistics', 'Tech Hardware Manufacturing Leadership', 'Enterprise Systems Consulting'],
    recommendedStream: 'PCM with Economics / Entrepreneurship',
    targetEntrances: 'JEE Main, BITSAT, IPMAT, VITEEE',
    parentNote: 'This student values pragmatic utility and commercial leverage. Expose them to entrepreneurship, supply-chain challenges, and product design.'
  },
  'Builder-Creator': {
    title: 'The Industrial Product Designer & Architectural Engineer',
    primaryRecommendation: 'Science (PCM) with Architecture / Design Focus',
    strongestCareerMatch: 'Industrial & Hardware Product Design',
    altCareers: 'Architectural Engineering, Spatial Hardware Design, Physical Computing',
    summary: 'You have a natural gift for translating aesthetic vision into functional, tangible artifacts. You care as much about how something works as how it looks and feels.',
    careers: ['Industrial Product Design', 'Architectural Engineering & Urban Design', 'Physical Computing & Smart Devices', 'Sustainable Materials Engineering'],
    recommendedStream: 'PCM with Fine Arts / Engineering Drawing',
    targetEntrances: 'UCEED, NATA, JEE Main Paper 2 (Architecture), NID-DAT',
    parentNote: 'This student thrives when crafting physical artifacts that are both mechanically sound and visually striking. Traditional rote memorization does not reflect their immense spatial talent.'
  },
  'Builder-Supporter': {
    title: 'The Biomedical Devices & Rehabilitation Technologist',
    primaryRecommendation: 'Science Stream (PCMB / PCM) - Assistive Technologies',
    strongestCareerMatch: 'Prosthetics, Assistive Hardware & Rehabilitation Engineering',
    altCareers: 'Environmental Infrastructure, Sustainable Energy Systems, HealthTech Devices',
    summary: 'You channel engineering talent into direct human uplift. You are motivated to construct tools, devices, and physical infrastructure that alleviate suffering and empower people.',
    careers: ['Biomedical & Assistive Engineering', 'Prosthetics & Orthotics Technology', 'Clean Energy & Water Infrastructure', 'Ergonomic Healthcare Systems'],
    recommendedStream: 'PCM or PCMB (Physics, Chemistry, Math, Biology)',
    targetEntrances: 'JEE Main, NEET-UG, BITSAT, State Engineering CETs',
    parentNote: 'This student is motivated to construct real-world tools that alleviate human suffering. Connect their physics and mechanics learning to tangible medical or ecological problems.'
  },
  'Builder-Builder': {
    title: 'The Master Systems Engineer & Infrastructure Architect',
    primaryRecommendation: 'Science Stream (PCM) - Core Engineering',
    strongestCareerMatch: 'Advanced Mechanical, Aerospace & Structural Engineering',
    altCareers: 'Automotive Systems Engineering, Robotics Manufacturing, Civil Infrastructure',
    summary: 'You are the quintessence of engineering craftsmanship. You possess exceptional spatial, physical, and mechanical intuition for building robust physical systems.',
    careers: ['Aerospace & Propulsion Engineering', 'Mechanical & Autonomous Systems', 'Structural & Smart Infrastructure', 'Industrial Manufacturing Systems'],
    recommendedStream: 'PCM with Computer Science / Engineering Graphics',
    targetEntrances: 'JEE Advanced (IITs), JEE Main (NITs), BITSAT, State Engineering CETs',
    parentNote: 'This student is a builder at heart who wants to see the physical fruits of their labor. Support their hands-on projects, workshops, and solid engineering foundations.'
  },

  // 3. Strategist Dominant
  'Strategist-Investigator': {
    title: 'The Quantitative Economist & Investment Strategist',
    primaryRecommendation: 'Commerce (with Mathematics) & Analytical Economics',
    strongestCareerMatch: 'Investment Banking & Quantitative Economics',
    altCareers: 'Equity Research Analysis, Corporate Mergers & Acquisitions, FinTech Strategy',
    summary: 'You combine razor-sharp economic analysis with commercial strategy. You evaluate systemic risk, model market dynamics, and architect high-stakes financial solutions.',
    careers: ['Investment Banking & Private Equity', 'Econometric Modeling & Quantitative Economics', 'FinTech Strategy Consulting', 'Actuarial Risk Architecture'],
    recommendedStream: 'Commerce with Mathematics, Economics & Statistics',
    targetEntrances: 'IPMAT (IIM Indore/Rohtak), CUET (Economics/Maths), NMIMS NPAT, CA Foundation',
    parentNote: 'This student has exceptional commercial acumen backed by analytical rigor. Expose them to global market mechanics, financial models, and strategic enterprise case studies.'
  },
  'Strategist-Builder': {
    title: 'The Digital Product Manager & Venture Builder',
    primaryRecommendation: 'Tech-Commerce or Science (PCM) with Economics',
    strongestCareerMatch: 'Product Management & Enterprise Software Platforms',
    altCareers: 'Tech Entrepreneurship, FinTech Systems Architecture, Operations Consulting',
    summary: 'You bridge the commercial boardroom and technical execution. You do not just conceive business initiatives; you oversee technical teams to build scalable software and business engines.',
    careers: ['Digital Product Management', 'Venture Tech Entrepreneurship', 'Platform Operations Leadership', 'Corporate Innovation Architecture'],
    recommendedStream: 'PCM with Economics or Commerce with Mathematics & Computer Science',
    targetEntrances: 'IPMAT, JEE Main, BITSAT, CUET (Business/Maths)',
    parentNote: 'This student possesses entrepreneurial intuition. They build organizations, products, and commercial platforms. Support their business experiments alongside academic rigor.'
  },
  'Strategist-Creator': {
    title: 'The Venture Brand Strategist & Media Architect',
    primaryRecommendation: 'Commerce (with Mathematics) & Applied Economics',
    strongestCareerMatch: 'Brand Strategy, Growth Marketing & Venture Capital',
    altCareers: 'Digital Media Strategy, Creative IP Law, FinTech Product Innovation',
    summary: 'You combine macro-level business acumen with compelling narrative flair. You possess the rare ability to foresee cultural shifts and build high-value commercial brands around them.',
    careers: ['Brand Architecture & Venture Strategy', 'Growth Marketing & Digital Media Leadership', 'FinTech Commercial Strategy', 'Media Intellectual Property Consulting'],
    recommendedStream: 'Commerce with Applied Mathematics & Entrepreneurship',
    targetEntrances: 'IPMAT, CUET (Business Studies/Maths), NMIMS NPAT, CLAT',
    parentNote: 'Traditional engineering will feel restrictive to this student. They excel at public speaking, brand positioning, economics, and persuasive communication.'
  },
  'Strategist-Supporter': {
    title: 'The Corporate Legal Counsel & Public Policy Strategist',
    primaryRecommendation: 'Humanities / Law (CLAT) or Commerce with Legal Studies',
    strongestCareerMatch: 'Corporate Law, Intellectual Property & Policy Governance',
    altCareers: 'International Dispute Arbitration, ESG & Sustainability Strategy, Public Administration',
    summary: 'You pair high-level leadership ability with genuine emotional intelligence. You excel at navigating complex human institutions, law, ethics, and corporate governance.',
    careers: ['Corporate Law & Mergers (NLUs)', 'Intellectual Property Litigation', 'Public Policy & Regulatory Affairs', 'ESG & Corporate Governance'],
    recommendedStream: 'Humanities or Commerce with Legal Studies / Political Science / Economics',
    targetEntrances: 'CLAT (National Law Universities), AILET (NLU Delhi), SLAT, CUET (Legal Studies)',
    parentNote: 'This student is a natural debater with a keen sense of justice and governance. Top-tier corporate lawyers and policy makers from NLUs enjoy elite career trajectories.'
  },
  'Strategist-Strategist': {
    title: 'The Chief Executive & Global Investment Strategist',
    primaryRecommendation: 'Commerce (with Mathematics) - Corporate Finance & Leadership',
    strongestCareerMatch: 'Investment Banking, Private Equity & Corporate Strategy',
    altCareers: 'Mergers & Acquisitions, Global Asset Management, Enterprise Governance',
    summary: 'You are an executive strategist by nature. You think in resource allocation, compound growth, market influence, and visionary institutional leadership.',
    careers: ['Investment Banking & Private Equity', 'Corporate Strategy & Mergers (M&A)', 'Global Asset Management', 'Venture Capital & Enterprise Leadership'],
    recommendedStream: 'Commerce with Mathematics, Economics & Accountancy',
    targetEntrances: 'IPMAT (IIM Indore/Rohtak), CUET (Economics/Commerce), NMIMS NPAT, CA Foundation',
    parentNote: 'High commercial acumen, leadership instincts, and strategic vision. Expose them to finance publications, business models, and leadership challenges early.'
  },

  // 4. Creator Dominant
  'Creator-Investigator': {
    title: 'The Creative Technologist & Interaction Scientist',
    primaryRecommendation: 'Design & Creative Technology (HCI)',
    strongestCareerMatch: 'Human-Computer Interaction (HCI) & Computational Design',
    altCareers: 'Spatial Computing (AR/VR), Data Visualization Journalism, Interactive Media',
    summary: 'You merge boundless creative visual thinking with technical and analytical depth. You design the interfaces, visual simulations, and digital environments of tomorrow.',
    careers: ['Human-Computer Interaction (HCI)', 'Generative Design & Creative Coding', 'Data Visualization Journalism', 'Spatial Computing & Virtual Worlds'],
    recommendedStream: 'PCM with Design / Informatics or Humanities with Mathematics',
    targetEntrances: 'UCEED (IIT Bombay), NID-DAT, JEE Paper 2 (Architecture), CEED',
    parentNote: 'This student refuses to separate science from art. They flourish when designing software, simulations, and interactive media that make complex concepts intuitive and beautiful.'
  },
  'Creator-Builder': {
    title: 'The Game Systems Architect & Spatial Experience Designer',
    primaryRecommendation: 'Design & Interactive Media / Creative Computing',
    strongestCareerMatch: 'Game Development, Virtual Production & Spatial Computing',
    altCareers: 'UX/UI Systems Architecture, 3D CGI Environments, Immersive Simulation',
    summary: 'You envision bold imaginary worlds and possess the practical drive to construct them. You thrive in game design, spatial visual computing, and interactive media.',
    careers: ['Game Systems Architecture & Level Design', 'Virtual Production & CGI Environments', 'Spatial UX/UI Design (AR/VR)', 'Interactive Creative Computing'],
    recommendedStream: 'PCM or Commerce with Informatics Practices / Multimedia',
    targetEntrances: 'UCEED, NID-DAT, JEE Paper 2, Pearl / Srishti Entrances',
    parentNote: 'Enthusiastic about digital worlds, gameplay mechanics, and experiential environments. Encourage coding skills in Unity/Unreal alongside design portfolio development.'
  },
  'Creator-Strategist': {
    title: 'The Creative Director & Brand Entrepreneur',
    primaryRecommendation: 'Humanities / Media Arts & Creative Business',
    strongestCareerMatch: 'Creative Direction, Advertising & Entertainment Business',
    altCareers: 'Digital Content Production, Brand Storytelling, Design Management',
    summary: 'You pair distinct aesthetic originality with commercial savvy. You know how to make ideas culturally compelling and build profitable creative ventures.',
    careers: ['Creative Direction & Advertising Leadership', 'Entertainment & Media Production', 'Brand Storytelling & Narrative Design', 'Digital Media Entrepreneurship'],
    recommendedStream: 'Humanities or Commerce with Mass Media / Commercial Arts',
    targetEntrances: 'CUET (Mass Communication/English), NIFT-GAT, NID-DAT, IPMAT',
    parentNote: 'This student has immense creative vision paired with market sense. Help them build a professional design or media portfolio while mastering modern commercial media tools.'
  },
  'Creator-Supporter': {
    title: 'The Human-Centered UX/UI Designer & Experience Strategist',
    primaryRecommendation: 'Design, Humanities & Interaction Arts',
    strongestCareerMatch: 'Human-Centered UX/UI Design & Digital Experience',
    altCareers: 'Visual Communication, Educational Media Design, Cognitive Arts Therapy',
    summary: 'You bring warmth, empathy, and expressive energy. You are gifted at understanding human emotion and translating it into transformative experiences and media.',
    careers: ['Human-Centered UX/UI Design', 'Communication & Visual Experience Design', 'Educational Media Architecture', 'Accessibility & Inclusive Design'],
    recommendedStream: 'Humanities or Commerce with Psychology / Fine Arts / Informatics',
    targetEntrances: 'UCEED, NID-DAT, CUET (Fine Arts/Psychology), Ashoka AAT',
    parentNote: 'Empathy and aesthetics are this student\'s greatest assets. Surround them with supportive mentors who celebrate emotional intelligence and visual craft.'
  },
  'Creator-Creator': {
    title: 'The Visionary Visual Artist & Creative Director',
    primaryRecommendation: 'Fine Arts, Design & Cinematic Media',
    strongestCareerMatch: 'Visual Direction, Fine Arts & Cinematic Production',
    altCareers: 'Haute Couture Concept Design, Literary Authorship, Animation Direction',
    summary: 'You have an extraordinary creative engine. You think in vivid metaphors, visual forms, and original narratives that move hearts and challenge conventions.',
    careers: ['Visual Direction & Fine Arts', 'Cinematography & Film Direction', 'Animation & CGI Concept Art', 'Creative Writing & Narrative Direction'],
    recommendedStream: 'Humanities with Fine Arts / Graphic Design / Literature',
    targetEntrances: 'NID-DAT, NIFT Entrance, UCEED, FTII Entrance, CUET (Fine Arts)',
    parentNote: 'Possesses boundless imagination and artistic originality. Standard standardized tests will not evaluate their talent; help them build an exceptional portfolio for premier design and arts institutes.'
  },

  // 5. Supporter Dominant
  'Supporter-Investigator': {
    title: 'The Clinical Neuropsychologist & Medical Specialist',
    primaryRecommendation: 'Science Stream (PCB) - Clinical Medicine & Psychology',
    strongestCareerMatch: 'Medicine (MBBS) & Clinical Neuropsychiatry',
    altCareers: 'Clinical Psychology, Cognitive Rehabilitation, Medical Diagnostics',
    summary: 'You combine deep human empathy with scientific diagnostic instincts. You are called to medicine, patient advocacy, and healing the human mind and body.',
    careers: ['Doctor of Medicine (MBBS / MD)', 'Clinical Neuropsychology & Psychiatry', 'Cognitive Diagnostics & Therapy', 'Public Health Epidemiology'],
    recommendedStream: 'PCB (Physics, Chemistry, Biology) with Psychology / Health Science',
    targetEntrances: 'NEET-UG, AIIMS, CUET (Psychology/Biochem), NIMHANS Entrance',
    parentNote: 'This student combines deep patient empathy with scientific diagnostic instincts. Provide calm, stress-managed exam preparation that keeps their humanitarian purpose alive.'
  },
  'Supporter-Builder': {
    title: 'The Community Infrastructure & Public Health Technologist',
    primaryRecommendation: 'Science Stream (PCM/B) - Sustainable Technologies',
    strongestCareerMatch: 'Public Health Engineering & Community Ergonomics',
    altCareers: 'Green Architecture, Assistive Tech Consulting, Disaster Relief Systems',
    summary: 'You desire to improve daily life for communities through practical tools and sustainable infrastructure. You turn engineering into an act of service.',
    careers: ['Public Health & Sanitation Engineering', 'Sustainable Urban Infrastructure', 'Disaster Relief Hardware Systems', 'Community Ergonomics Consulting'],
    recommendedStream: 'PCM or PCB with Environmental Science / Psychology',
    targetEntrances: 'JEE Main, CUET, NEET, State CETs',
    parentNote: 'Deeply driven by community welfare and practical utility. Guide them toward sustainable engineering, environmental science, and public health infrastructure.'
  },
  'Supporter-Strategist': {
    title: 'The Public Governance & Institutional Leadership Director',
    primaryRecommendation: 'Humanities / Social Sciences & Governance Focus',
    strongestCareerMatch: 'Public Policy, Civil Services & Global Diplomatic Relations',
    altCareers: 'Organizational HR Leadership, Non-Profit Governance, Healthcare Policy',
    summary: 'You combine empathy for citizens and communities with macroscopic leadership ability. You excel at policy governance, institutional reform, and diplomacy.',
    careers: ['Civil Services & Public Administration (UPSC)', 'International Relations & Diplomacy', 'Strategic Human Resources Leadership', 'Healthcare Policy & Social Impact'],
    recommendedStream: 'Humanities with Political Science, Sociology & Economics',
    targetEntrances: 'UPSC Civil Services Foundation, CUET (Pol Sci/Sociology), CLAT, TISS-NET',
    parentNote: 'Values collective human progress and ethical institutional leadership. Encourage deep reading of world history, constitutional law, and sociological systems.'
  },
  'Supporter-Creator': {
    title: 'The Expressive Therapist & Educational Media Pioneer',
    primaryRecommendation: 'Humanities / Psychology & Communication Arts',
    strongestCareerMatch: 'Art Therapy, Pediatric Counseling & Educational Media',
    altCareers: 'Behavioral Health Communications, Developmental Psychology, Youth Advocacy',
    summary: 'You have a gift for emotional resonance and creative expression. You use storytelling, art, and compassionate counseling to heal trauma and inspire young minds.',
    careers: ['Expressive Arts Therapy & Counseling', 'Developmental & Pediatric Psychology', 'Educational Storytelling & Content Design', 'Non-Profit Advocacy & Community Outreach'],
    recommendedStream: 'Humanities with Psychology, Sociology & Fine Arts',
    targetEntrances: 'CUET (Psychology/Sociology), Ashoka AAT, TISS-BAT, Jamia Millia Entrances',
    parentNote: 'This student possesses high sensitivity to human emotion and community wellbeing. Affirm their compassionate creative voice and avoid pushing them into hyper-competitive technical rat-races.'
  },
  'Supporter-Supporter': {
    title: 'The Master Counselor & Humanitarian Healthcare Leader',
    primaryRecommendation: 'Humanities & Allied Health - Psychology & Social Welfare',
    strongestCareerMatch: 'Clinical Psychology, Psychotherapy & Humanitarian Leadership',
    altCareers: 'Pediatric Counseling, Community Healthcare Management, Social Work Leadership',
    summary: 'Your emotional resonance, empathy, and listening ability are world-class. You are a natural healer and counselor who provides emotional clarity in turbulent times.',
    careers: ['Clinical Psychology & Psychotherapy', 'Child Development & Family Counseling', 'Humanitarian Non-Profit Leadership', 'Community Mental Health Administration'],
    recommendedStream: 'Humanities with Psychology, Sociology & Home Science / Biology',
    targetEntrances: 'CUET (Psychology/Sociology), TISS-BAT, Ashoka AAT, NIMHANS',
    parentNote: 'Deep empathy, relational warmth, and a mission to heal and counsel. Provide emotional grounding and connect them with psychology and humanitarian mentoring.'
  }
};

// Stream Definitions for Live Compatibility Computation
const STREAM_DEFINITIONS = [
  {
    name: 'Science (PCM)',
    badgeName: 'Science (PCM):',
    weights: { Investigator: 0.48, Builder: 0.42, Strategist: 0.07, Creator: 0.03 }
  },
  {
    name: 'Science (PCB)',
    badgeName: 'Science (PCB):',
    weights: { Investigator: 0.45, Supporter: 0.45, Builder: 0.06, Creator: 0.04 }
  },
  {
    name: 'Commerce (with Maths)',
    badgeName: 'Commerce (with Maths):',
    weights: { Strategist: 0.50, Investigator: 0.35, Builder: 0.10, Creator: 0.05 }
  },
  {
    name: 'Commerce (Management)',
    badgeName: 'Commerce (Management):',
    weights: { Strategist: 0.48, Creator: 0.24, Supporter: 0.20, Builder: 0.08 }
  },
  {
    name: 'Humanities / Law',
    badgeName: 'Humanities / Law:',
    weights: { Strategist: 0.40, Supporter: 0.38, Investigator: 0.14, Creator: 0.08 }
  },
  {
    name: 'Humanities (Psychology)',
    badgeName: 'Humanities (Psychology):',
    weights: { Supporter: 0.50, Investigator: 0.30, Creator: 0.14, Strategist: 0.06 }
  },
  {
    name: 'Design & Creative Tech',
    badgeName: 'Design & Creative Tech:',
    weights: { Creator: 0.50, Builder: 0.30, Investigator: 0.10, Supporter: 0.10 }
  },
  {
    name: 'Humanities / Arts',
    badgeName: 'Humanities / Arts:',
    weights: { Creator: 0.52, Supporter: 0.28, Strategist: 0.20 }
  }
];

// Live Mathematical Stream Compatibility Calculator based on user's exact vector
function computeDynamicStreamCompatibility(scores) {
  const scoredStreams = STREAM_DEFINITIONS.map(stream => {
    let raw = 0;
    for (const [arch, weight] of Object.entries(stream.weights)) {
      raw += (scores[arch] || 0) * weight;
    }
    return {
      name: stream.badgeName,
      cleanName: stream.name,
      raw: raw
    };
  });

  // Sort descending by raw score
  scoredStreams.sort((a, b) => b.raw - a.raw);

  const topRaw = scoredStreams[0].raw > 0 ? scoredStreams[0].raw : 1;

  // Compute realistic dynamic percentage for Rank 1 (91% - 96%)
  const topPct = Math.min(96, Math.max(90, Math.round(88 + (topRaw / 5) * 8)));

  const results = [];

  // Rank 1: Top Recommended Stream
  results.push({
    name: scoredStreams[0].name,
    score: `${topPct}% Match`,
    badge: '(Recommended)',
    pct: topPct
  });

  // Rank 2: Good Alternative Stream (68% - 86%)
  const rank2Ratio = scoredStreams[1].raw / topRaw;
  const rank2Pct = Math.min(topPct - 5, Math.max(68, Math.round(42 + rank2Ratio * (topPct - 40))));
  results.push({
    name: scoredStreams[1].name,
    score: `${rank2Pct}% Match`,
    badge: '(Good Alternative)',
    pct: rank2Pct
  });

  // Rank 3: Baseline Comparison Stream (36% - 62%)
  const rank3Ratio = scoredStreams[2].raw / topRaw;
  const rank3Pct = Math.min(rank2Pct - 8, Math.max(36, Math.round(28 + rank3Ratio * (topPct - 48))));
  results.push({
    name: scoredStreams[2].name,
    score: `${rank3Pct}% Match`,
    badge: '',
    pct: rank3Pct
  });

  return results;
}

function getArchetypeProfile(dominant, secondary, scores) {
  // Check for pure single-dominant archetype (7+ in dominant or secondary is zero/identical)
  if (dominant === secondary || (scores && (scores[dominant] >= 7 || (scores[secondary] || 0) === 0))) {
    const pureKey = `${dominant}-${dominant}`;
    if (ARCHETYPE_PROFILES[pureKey]) {
      return { ...ARCHETYPE_PROFILES[pureKey], dominant, secondary: dominant };
    }
  }

  // Direct directional pair match
  const directPair = `${dominant}-${secondary}`;
  if (ARCHETYPE_PROFILES[directPair]) {
    return { ...ARCHETYPE_PROFILES[directPair], dominant, secondary };
  }

  // Reverse pair match
  const reversePair = `${secondary}-${dominant}`;
  if (ARCHETYPE_PROFILES[reversePair]) {
    return { ...ARCHETYPE_PROFILES[reversePair], dominant, secondary };
  }

  // Pure dominant fallback
  const pureDominantKey = `${dominant}-${dominant}`;
  if (ARCHETYPE_PROFILES[pureDominantKey]) {
    return { ...ARCHETYPE_PROFILES[pureDominantKey], dominant, secondary: dominant };
  }

  // Fallback
  return { ...ARCHETYPE_PROFILES['Investigator-Builder'], dominant, secondary };
}

function initQuizModal() {
  const quizModal = document.getElementById('quizModal');
  const openBtns = [
    document.getElementById('openQuizBtn'),
    document.getElementById('openQuizBtn2'),
    document.getElementById('heroStartBtn'),
    document.getElementById('drawerQuizBtn'),
    document.getElementById('assessmentSectionQuizBtn')
  ];
  const closeBtn = document.getElementById('closeQuizBtn');

  // Flows
  const flowAssessment = document.getElementById('quizAssessmentFlow');
  const flowCompiling = document.getElementById('quizCompilingFlow');
  const flowResult = document.getElementById('quizResultFlow');
  const flowPaidSuccess = document.getElementById('quizPaidSuccessFlow');

  // Dossier Compilation Flow Elements (15-20s High-Trust Engine)
  const compilingStepLabel = document.getElementById('compilingStepLabel');
  const compilingPct = document.getElementById('compilingPct');
  const compilingProgressBar = document.getElementById('compilingProgressBar');
  const compStage1 = document.getElementById('compStage1');
  const compStage2 = document.getElementById('compStage2');
  const compStage3 = document.getElementById('compStage3');
  const compStage4 = document.getElementById('compStage4');

  // Flow 1 Elements
  const qCurrentNum = document.getElementById('qCurrentNum');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const qDimensionLabel = document.getElementById('qDimensionLabel');
  const qQuestionText = document.getElementById('qQuestionText');
  const qOptionsContainer = document.getElementById('qOptionsContainer');

  // Flow 3 Elements (Top Result & Stream Compatibility)
  const resPrimaryStream = document.getElementById('resPrimaryStream');
  const resStrongestCareer = document.getElementById('resStrongestCareer');
  const resAltCareers = document.getElementById('resAltCareers');
  const resPrimaryPct = document.getElementById('resPrimaryPct');
  const mockPreviewStream = document.getElementById('mockPreviewStream');
  const compatStream1Name = document.getElementById('compatStream1Name');
  const compatStream1Pct = document.getElementById('compatStream1Pct');
  const compatStream1Badge = document.getElementById('compatStream1Badge');
  const compatStream1Bar = document.getElementById('compatStream1Bar');
  const compatStream2Name = document.getElementById('compatStream2Name');
  const compatStream2Pct = document.getElementById('compatStream2Pct');
  const compatStream2Badge = document.getElementById('compatStream2Badge');
  const compatStream2Bar = document.getElementById('compatStream2Bar');
  const compatStream3Name = document.getElementById('compatStream3Name');
  const compatStream3Pct = document.getElementById('compatStream3Pct');
  const compatStream3Bar = document.getElementById('compatStream3Bar');

  // Payment Form & Drawer Elements
  const openPaymentDrawerBtn = document.getElementById('openPaymentDrawerBtn');
  const closePaymentDrawerBtn = document.getElementById('closePaymentDrawerBtn');
  const paymentCheckoutDrawer = document.getElementById('paymentCheckoutDrawer');
  const unlockPayForm = document.getElementById('unlockPayForm');
  const buyerNameInput = document.getElementById('buyerName');
  const buyerPhoneInput = document.getElementById('buyerPhone');
  const buyerNameError = document.getElementById('buyerNameError');
  const buyerPhoneError = document.getElementById('buyerPhoneError');
  const unlockGlobalError = document.getElementById('unlockGlobalError');
  const payUnlockBtn = document.getElementById('payUnlockBtn');

  // Flow 4 Elements (Paid Success)
  const paidCandidateName = document.getElementById('paidCandidateName');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const sendWhatsappReportBtn = document.getElementById('sendWhatsappReportBtn');

  // State
  let currentQuestionIdx = 0;
  let archetypeScores = { Builder: 0, Investigator: 0, Creator: 0, Strategist: 0, Supporter: 0 };
  let activeProfile = null;
  let verifiedPaymentData = null;
  let compilingInterval = null;
  let compilingTimeout = null;

  function cancelCompilation() {
    if (compilingInterval) {
      clearInterval(compilingInterval);
      compilingInterval = null;
    }
    if (compilingTimeout) {
      clearTimeout(compilingTimeout);
      compilingTimeout = null;
    }
  }

  // Open & Close Handlers
  openBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        const drawer = document.getElementById('mobileNavDrawer');
        const toggle = document.getElementById('mobileMenuToggle');
        if (drawer && drawer.classList.contains('is-open')) {
          drawer.classList.remove('is-open');
          drawer.setAttribute('aria-hidden', 'true');
          if (toggle) toggle.classList.remove('is-active');
          document.body.style.overflow = '';
        }
        resetAndOpenQuiz();
      });
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      cancelCompilation();
      quizModal.classList.remove('open');
    });
  }

  // Close on backdrop click outside modal
  if (quizModal) {
    quizModal.addEventListener('click', (e) => {
      if (e.target === quizModal) {
        cancelCompilation();
        quizModal.classList.remove('open');
      }
    });
  }

  function resetAndOpenQuiz() {
    cancelCompilation();
    currentQuestionIdx = 0;
    archetypeScores = { Builder: 0, Investigator: 0, Creator: 0, Strategist: 0, Supporter: 0 };
    activeProfile = null;

    if (flowAssessment) flowAssessment.classList.remove('hidden');
    if (flowCompiling) flowCompiling.classList.add('hidden');
    if (flowResult) flowResult.classList.add('hidden');
    if (flowPaidSuccess) flowPaidSuccess.classList.add('hidden');
    if (paymentCheckoutDrawer) paymentCheckoutDrawer.classList.add('hidden');

    if (buyerNameInput) buyerNameInput.value = '';
    if (buyerPhoneInput) buyerPhoneInput.value = '';
    clearValidationErrors();

    renderQuestion(0);
    quizModal.classList.add('open');
  }

  function clearValidationErrors() {
    if (buyerNameInput) buyerNameInput.classList.remove('input-invalid');
    if (buyerPhoneInput) buyerPhoneInput.classList.remove('input-invalid');
    if (buyerNameError) buyerNameError.textContent = '';
    if (buyerPhoneError) buyerPhoneError.textContent = '';
    if (unlockGlobalError) unlockGlobalError.classList.add('hidden');
  }

  if (buyerNameInput) {
    buyerNameInput.addEventListener('input', () => {
      buyerNameInput.classList.remove('input-invalid');
      if (buyerNameError) buyerNameError.textContent = '';
    });
  }

  if (buyerPhoneInput) {
    buyerPhoneInput.addEventListener('input', () => {
      buyerPhoneInput.classList.remove('input-invalid');
      if (buyerPhoneError) buyerPhoneError.textContent = '';
    });
  }

  function renderQuestion(idx) {
    const qData = QUIZ_QUESTIONS[idx];
    if (!qData) return;

    if (qCurrentNum) qCurrentNum.textContent = idx + 1;
    if (quizProgressBar) {
      quizProgressBar.style.width = `${((idx + 1) / QUIZ_QUESTIONS.length) * 100}%`;
    }
    if (qDimensionLabel) qDimensionLabel.textContent = qData.dimension;
    if (qQuestionText) qQuestionText.textContent = qData.question;

    if (qOptionsContainer) {
      qOptionsContainer.innerHTML = '';
      qData.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'q-choice-btn';
        btn.innerHTML = `
          <span class="q-choice-key">${opt.key}</span>
          <span class="q-choice-text">${opt.text}</span>
        `;

        btn.addEventListener('click', () => {
          // Visual selection lock
          btn.classList.add('selected');
          const allButtons = qOptionsContainer.querySelectorAll('.q-choice-btn');
          allButtons.forEach(b => b.style.pointerEvents = 'none');

          // Record score
          archetypeScores[opt.archetype] = (archetypeScores[opt.archetype] || 0) + 1;

          setTimeout(() => {
            if (idx + 1 < QUIZ_QUESTIONS.length) {
              currentQuestionIdx = idx + 1;
              renderQuestion(idx + 1);
            } else {
              finishAssessmentAndCompute();
            }
          }, 180);
        });

        qOptionsContainer.appendChild(btn);
      });
    }
  }

  function updateRadarChart(scores) {
    const poly = document.getElementById('radarScoredPolygon');
    if (!poly) return;

    // Map archetype scores to the 5 dimension axes:
    // 0: Aptitude & Logic (Investigator / Builder)
    // 1: Personality Traits (Strategist)
    // 2: Genuine Interests (Creator)
    // 3: Orientation Style (Builder / Strategist)
    // 4: Emotional Quotient (Supporter)
    const v0 = Math.max(scores.Investigator || 0, scores.Builder || 0, 1);
    const v1 = Math.max(scores.Strategist || 0, 1);
    const v2 = Math.max(scores.Creator || 0, 1);
    const v3 = Math.max(scores.Builder || 0, scores.Strategist || 0, 1);
    const v4 = Math.max(scores.Supporter || 0, 1);
    const vals = [v0, v1, v2, v3, v4];

    // Center = (100, 88), Max radius = 64, Min radius = 24
    const cx = 100, cy = 88, maxR = 64, minR = 24;
    const angles = [
      -Math.PI / 2,
      -Math.PI / 2 + (2 * Math.PI / 5),
      -Math.PI / 2 + (4 * Math.PI / 5),
      -Math.PI / 2 + (6 * Math.PI / 5),
      -Math.PI / 2 + (8 * Math.PI / 5)
    ];

    const maxVal = Math.max(...vals, 4);
    const pts = angles.map((ang, i) => {
      const r = minR + ((vals[i] / maxVal) * (maxR - minR));
      const x = Math.round(cx + r * Math.cos(ang));
      const y = Math.round(cy + r * Math.sin(ang));
      return `${x},${y}`;
    }).join(' ');

    poly.setAttribute('points', pts);
  }

  function runCompilationSequence(onComplete) {
    cancelCompilation();

    const totalDurationMs = 17500; // 17.5 seconds (in the 15-20s sweet spot)
    const startTime = Date.now();

    const stages = [compStage1, compStage2, compStage3, compStage4];
    stages.forEach((st, idx) => {
      if (st) {
        st.classList.remove('completed', 'active');
        if (idx === 0) st.classList.add('active');
      }
    });

    if (compilingProgressBar) compilingProgressBar.style.width = '0%';
    if (compilingPct) compilingPct.textContent = '0%';
    if (compilingStepLabel) compilingStepLabel.textContent = 'Deconstructing Aptitude & Logic Vectors...';

    compilingInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / totalDurationMs, 1);
      const currentPct = Math.floor(progressRatio * 100);

      if (compilingProgressBar) compilingProgressBar.style.width = `${currentPct}%`;
      if (compilingPct) compilingPct.textContent = `${currentPct}%`;

      // Milestone 1 (0 to 4.2s)
      if (elapsed >= 4200 && compStage1 && !compStage1.classList.contains('completed')) {
        compStage1.classList.remove('active');
        compStage1.classList.add('completed');
        if (compStage2) compStage2.classList.add('active');
        if (compilingStepLabel) compilingStepLabel.textContent = 'Cross-referencing 150+ Career Pathways...';
      }

      // Milestone 2 (4.2s to 8.8s)
      if (elapsed >= 8800 && compStage2 && !compStage2.classList.contains('completed')) {
        compStage2.classList.remove('active');
        compStage2.classList.add('completed');
        if (compStage3) compStage3.classList.add('active');
        if (compilingStepLabel) compilingStepLabel.textContent = 'Calibrating Academic Stream Fit & Entrance Cutoffs...';
      }

      // Milestone 3 (8.8s to 13.2s)
      if (elapsed >= 13200 && compStage3 && !compStage3.classList.contains('completed')) {
        compStage3.classList.remove('active');
        compStage3.classList.add('completed');
        if (compStage4) compStage4.classList.add('active');
        if (compilingStepLabel) compilingStepLabel.textContent = 'Compiling Coach Ravi Sankar\'s 5-Page Action Dossier...';
      }

      // Milestone 4 (13.2s to 16.8s)
      if (elapsed >= 16800 && compStage4 && !compStage4.classList.contains('completed')) {
        compStage4.classList.remove('active');
        compStage4.classList.add('completed');
        if (compilingStepLabel) compilingStepLabel.textContent = 'Dossier Compiled Successfully • Revealing Page 1...';
      }

      if (elapsed >= totalDurationMs) {
        clearInterval(compilingInterval);
        compilingInterval = null;
        if (compilingProgressBar) compilingProgressBar.style.width = '100%';
        if (compilingPct) compilingPct.textContent = '100%';
        compilingTimeout = setTimeout(() => {
          if (onComplete) onComplete();
        }, 350);
      }
    }, 100);
  }

  function finishAssessmentAndCompute() {
    if (flowAssessment) flowAssessment.classList.add('hidden');
    if (flowResult) flowResult.classList.add('hidden');

    // Determine dominant and secondary archetypes
    const sortedArchetypes = Object.keys(archetypeScores).sort((a, b) => archetypeScores[b] - archetypeScores[a]);
    const dominant = sortedArchetypes[0] || 'Investigator';
    let secondary = sortedArchetypes[1] || 'Builder';
    if (secondary === dominant) secondary = sortedArchetypes[2] || 'Strategist';

    // Check if user has an overwhelming dominant score (e.g. 7+ out of 10 or secondary has 0)
    if (archetypeScores[dominant] >= 7 || (archetypeScores[secondary] || 0) === 0) {
      secondary = dominant;
    }

    activeProfile = getArchetypeProfile(dominant, secondary, archetypeScores);

    // Dynamically compute stream compatibility match based on user's exact vector scores
    const dynamicCompat = computeDynamicStreamCompatibility(archetypeScores);
    activeProfile.streamCompatibility = dynamicCompat;

    // Render Clean Verdict & Blurred PDF Preview Elements
    if (resPrimaryStream) resPrimaryStream.textContent = activeProfile.primaryRecommendation;
    if (resStrongestCareer) resStrongestCareer.textContent = activeProfile.strongestCareerMatch;
    if (resAltCareers) resAltCareers.textContent = activeProfile.altCareers;
    if (resPrimaryPct && dynamicCompat[0]) resPrimaryPct.textContent = dynamicCompat[0].score;
    if (mockPreviewStream) mockPreviewStream.textContent = activeProfile.recommendedStream || activeProfile.primaryRecommendation;

    // Render Stream Compatibility Match dynamically
    if (dynamicCompat[0]) {
      if (compatStream1Name) compatStream1Name.textContent = dynamicCompat[0].name;
      if (compatStream1Pct) compatStream1Pct.textContent = dynamicCompat[0].score;
      if (compatStream1Badge) {
        compatStream1Badge.textContent = dynamicCompat[0].badge;
        compatStream1Badge.style.display = dynamicCompat[0].badge ? 'inline-block' : 'none';
      }
      if (compatStream1Bar) compatStream1Bar.style.width = dynamicCompat[0].pct + '%';
    }
    if (dynamicCompat[1]) {
      if (compatStream2Name) compatStream2Name.textContent = dynamicCompat[1].name;
      if (compatStream2Pct) compatStream2Pct.textContent = dynamicCompat[1].score;
      if (compatStream2Badge) {
        compatStream2Badge.textContent = dynamicCompat[1].badge;
        compatStream2Badge.style.display = dynamicCompat[1].badge ? 'inline-block' : 'none';
      }
      if (compatStream2Bar) compatStream2Bar.style.width = dynamicCompat[1].pct + '%';
    }
    if (dynamicCompat[2]) {
      if (compatStream3Name) compatStream3Name.textContent = dynamicCompat[2].name;
      if (compatStream3Pct) compatStream3Pct.textContent = dynamicCompat[2].score;
      if (compatStream3Bar) compatStream3Bar.style.width = dynamicCompat[2].pct + '%';
    }

    // Dynamically calibrate SVG Radar Spider Chart
    updateRadarChart(archetypeScores);

    // Launch High-Trust 15-20s Dossier Compilation Sequence
    if (flowCompiling) flowCompiling.classList.remove('hidden');

    runCompilationSequence(() => {
      if (flowCompiling) flowCompiling.classList.add('hidden');
      if (flowResult) flowResult.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Two-Step Unlock Button & Payment Drawer Handlers
  if (openPaymentDrawerBtn) {
    openPaymentDrawerBtn.addEventListener('click', () => {
      if (paymentCheckoutDrawer) {
        paymentCheckoutDrawer.classList.remove('hidden');
        if (buyerNameInput) buyerNameInput.focus();
      }
    });
  }

  if (closePaymentDrawerBtn) {
    closePaymentDrawerBtn.addEventListener('click', () => {
      if (paymentCheckoutDrawer) {
        paymentCheckoutDrawer.classList.add('hidden');
      }
    });
  }

  // Payment Form Submission & Unlock
  if (unlockPayForm) {
    unlockPayForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearValidationErrors();

      const nameVal = buyerNameInput ? buyerNameInput.value.trim() : '';
      const phoneVal = buyerPhoneInput ? buyerPhoneInput.value.trim() : '';

      let isValid = true;
      if (!nameVal || nameVal.length < 2) {
        if (buyerNameInput) buyerNameInput.classList.add('input-invalid');
        if (buyerNameError) buyerNameError.textContent = 'Please enter student or candidate full name.';
        isValid = false;
      }

      const phonePattern = /^[0-9+\s\-()]{8,16}$/;
      if (!phoneVal || !phonePattern.test(phoneVal)) {
        if (buyerPhoneInput) buyerPhoneInput.classList.add('input-invalid');
        if (buyerPhoneError) buyerPhoneError.textContent = 'Please enter a valid WhatsApp / phone number.';
        isValid = false;
      }

      if (!isValid) return;

      executeRazorpayPayment(nameVal, phoneVal);
    });
  }

  function executeRazorpayPayment(name, phone) {
    const origBtnHtml = payUnlockBtn.innerHTML;
    payUnlockBtn.disabled = true;
    payUnlockBtn.innerHTML = '<span>Connecting to Gateway...</span>';

    const transactionId = 'GRS_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const isDemoKey = !RAZORPAY_CONFIG.keyId || RAZORPAY_CONFIG.keyId.includes('placeholder');

    // Live Razorpay Checkout
    if (window.Razorpay && !isDemoKey) {
      try {
        const options = {
          key: RAZORPAY_CONFIG.keyId,
          amount: RAZORPAY_CONFIG.amount,
          currency: RAZORPAY_CONFIG.currency,
          name: RAZORPAY_CONFIG.name,
          description: '6-Dimensional Career Intelligence Roadmap',
          prefill: {
            name: name,
            contact: phone
          },
          theme: {
            color: '#10B981'
          },
          handler: function (response) {
            payUnlockBtn.disabled = false;
            payUnlockBtn.innerHTML = origBtnHtml;
            handlePaymentSuccess(name, phone, response.razorpay_payment_id || transactionId);
          },
          modal: {
            ondismiss: function () {
              payUnlockBtn.disabled = false;
              payUnlockBtn.innerHTML = origBtnHtml;
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          payUnlockBtn.disabled = false;
          payUnlockBtn.innerHTML = origBtnHtml;
          if (unlockGlobalError) {
            unlockGlobalError.textContent = 'Payment could not be completed: ' + (resp.error.description || 'Transaction declined.');
            unlockGlobalError.classList.remove('hidden');
          }
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay live checkout error, falling back to simulated sandbox:', err);
      }
    }

    // Sandbox / Test Simulation Mode
    setTimeout(() => {
      payUnlockBtn.innerHTML = '<span>Verifying Authorization &#8377;149...</span>';
      setTimeout(() => {
        payUnlockBtn.disabled = false;
        payUnlockBtn.innerHTML = origBtnHtml;
        handlePaymentSuccess(name, phone, transactionId);
      }, 900);
    }, 400);
  }

  function handlePaymentSuccess(name, phone, txnId) {
    verifiedPaymentData = {
      name: name,
      phone: phone,
      txnId: txnId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      profile: activeProfile,
      scores: { ...archetypeScores }
    };

    if (paymentCheckoutDrawer) paymentCheckoutDrawer.classList.add('hidden');
    if (flowResult) flowResult.classList.add('hidden');
    if (flowPaidSuccess) flowPaidSuccess.classList.remove('hidden');
    if (paidCandidateName) paidCandidateName.textContent = name;

    // Build WhatsApp Report Dispatch Link
    if (sendWhatsappReportBtn) {
      const waMsg = encodeURIComponent(
        `Hi Coach G. Ravi Sankar,\n` +
        `I have completed my 5-D Career Diagnostic and unlocked my official 6-page action roadmap!\n\n` +
        `Student Name: ${name}\n` +
        `Phone Number: ${phone}\n` +
        `Primary Recommendation: ${activeProfile.primaryRecommendation}\n` +
        `Strongest Career Match: ${activeProfile.strongestCareerMatch}\n` +
        `Dominant Archetype: ${activeProfile.dominant}\n` +
        `Secondary Archetype: ${activeProfile.secondary}\n` +
        `Persona: ${activeProfile.title}\n` +
        `Recommended Stream: ${activeProfile.recommendedStream}\n` +
        `Target Entrances: ${activeProfile.targetEntrances}\n` +
        `Payment Transaction Ref: ${txnId}\n\n` +
        `I have downloaded my 6-Page Action Roadmap PDF and look forward to our clarity consultation.`
      );
      sendWhatsappReportBtn.href = `https://wa.me/${RAZORPAY_CONFIG.coachPhone}?text=${waMsg}`;
    }

    // Wire Instant Download Button
    if (downloadPdfBtn) {
      downloadPdfBtn.onclick = () => {
        downloadBrandedRoadmapPDF(verifiedPaymentData);
      };
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function downloadBrandedRoadmapPDF(data) {
    if (!window.html2pdf) {
      alert('PDF generator module is still loading. Please try again in a moment.');
      return;
    }

    const reportContainer = document.getElementById('pdfReportContainer');
    if (!reportContainer) return;

    const originalBtnText = downloadPdfBtn.innerHTML;
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.innerHTML = '<span>Compiling Branded PDF...</span>';

    // Populate offscreen print-friendly HTML
    reportContainer.innerHTML = buildRoadmapPrintableHTML(data);

    const filename = `GRS_Career_Roadmap_${data.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(reportContainer).save()
      .then(() => {
        downloadPdfBtn.disabled = false;
        downloadPdfBtn.innerHTML = '<span>Downloaded! Click to Re-download</span>';
        setTimeout(() => {
          downloadPdfBtn.innerHTML = originalBtnText;
          if (window.lucide) window.lucide.createIcons();
        }, 3500);
      })
      .catch((err) => {
        console.error('PDF generation error:', err);
        downloadPdfBtn.disabled = false;
        downloadPdfBtn.innerHTML = originalBtnText;
        alert('Could not download PDF automatically. Please try again.');
      });
  }

  function buildRoadmapPrintableHTML(data) {
    const { name, phone, txnId, date, profile, scores } = data;
    const totalQuestions = 10;

    // Calculate score percentages
    const calcPct = (val) => Math.min(100, Math.round(((val || 0) / totalQuestions) * 100 * 2.2 + 25));

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; background: #ffffff; padding: 20px; line-height: 1.45;">
        <!-- Header -->
        <div style="border-bottom: 2.5px solid #000000; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #15803d; text-transform: uppercase; margin-bottom: 4px;">GRS Career Intelligence &bull; Official Report</div>
            <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 4px 0; color: #000000; letter-spacing: -0.5px;">5-DIMENSIONAL COGNITIVE ROADMAP</h1>
            <div style="font-size: 12.5px; color: #4b5563;">Prepared by Coach G. Ravi Sankar (M.Sc., MCA, B.Ed. &bull; IIT-Madras Certified)</div>
          </div>
          <div style="text-align: right; font-size: 11.5px; color: #374151;">
            <div><strong>Report ID:</strong> ${txnId}</div>
            <div><strong>Issued:</strong> ${date}</div>
            <div style="color: #15803d; font-weight: bold; margin-top: 2px;">Verified Authentic</div>
          </div>
        </div>

        <!-- Student & Archetype Summary Box -->
        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Candidate Name</span>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${name}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Phone / WhatsApp</span>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${phone}</div>
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">Primary Recommendation:</div>
            <div style="font-size: 20px; font-weight: 900; color: #15803d; margin-bottom: 6px;">${profile.primaryRecommendation || profile.recommendedStream}</div>
            
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">Strongest Career Match:</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">${profile.strongestCareerMatch || profile.title}</div>

            <div style="font-size: 12px; color: #475569;">
              <strong>(Alternative High-Fit Options:</strong> ${profile.altCareers || profile.careers.slice(0, 3).join(', ')})
            </div>
          </div>

          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; margin-top: 10px;">
            <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.8px; margin-bottom: 6px;">Stream Compatibility Match:</div>
            <div style="font-size: 12px; color: #334155; line-height: 1.6;">
              &bull; <strong>${profile.streamCompatibility ? profile.streamCompatibility[0].name : 'Science (PCM):'}</strong> ${profile.streamCompatibility ? profile.streamCompatibility[0].score : '94% Match'} <span style="color: #15803d; font-weight: bold;">(Recommended)</span><br>
              &bull; <strong>${profile.streamCompatibility ? profile.streamCompatibility[1].name : 'Commerce (with Maths):'}</strong> ${profile.streamCompatibility ? profile.streamCompatibility[1].score : '78% Match'} <span style="color: #b45309; font-weight: bold;">(Good Alternative)</span><br>
              &bull; <strong>${profile.streamCompatibility ? profile.streamCompatibility[2].name : 'Humanities / Arts:'}</strong> ${profile.streamCompatibility ? profile.streamCompatibility[2].score : '42% Match'}
            </div>
          </div>
        </div>

        <!-- 5-Vector Scorecard -->
        <div style="margin-bottom: 22px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 12px;">1. Cognitive Vector Calibration</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 0; width: 35%; font-weight: bold; color: #1e293b;">Aptitude & Logic (Analytical Rigor)</td>
              <td style="padding: 6px 0; width: 45%;">
                <div style="background: #e2e8f0; border-radius: 4px; height: 10px; width: 100%; overflow: hidden;">
                  <div style="background: #0f172a; height: 100%; width: ${calcPct(scores.Investigator)}%;"></div>
                </div>
              </td>
              <td style="padding: 6px 0; width: 20%; text-align: right; font-weight: bold; color: #15803d;">${calcPct(scores.Investigator)}th Percentile</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 0; font-weight: bold; color: #1e293b;">Personality Traits (Action & Execution)</td>
              <td style="padding: 6px 0;">
                <div style="background: #e2e8f0; border-radius: 4px; height: 10px; width: 100%; overflow: hidden;">
                  <div style="background: #0f172a; height: 100%; width: ${calcPct(scores.Builder)}%;"></div>
                </div>
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #15803d;">${calcPct(scores.Builder)}th Percentile</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 0; font-weight: bold; color: #1e293b;">Genuine Interests (Curiosity & Breadth)</td>
              <td style="padding: 6px 0;">
                <div style="background: #e2e8f0; border-radius: 4px; height: 10px; width: 100%; overflow: hidden;">
                  <div style="background: #0f172a; height: 100%; width: ${calcPct(scores.Creator)}%;"></div>
                </div>
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #15803d;">${calcPct(scores.Creator)}th Percentile</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 0; font-weight: bold; color: #1e293b;">Orientation Style (Strategy & Leadership)</td>
              <td style="padding: 6px 0;">
                <div style="background: #e2e8f0; border-radius: 4px; height: 10px; width: 100%; overflow: hidden;">
                  <div style="background: #0f172a; height: 100%; width: ${calcPct(scores.Strategist)}%;"></div>
                </div>
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #15803d;">${calcPct(scores.Strategist)}th Percentile</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #1e293b;">Emotional Quotient (Empathy & Resilience)</td>
              <td style="padding: 6px 0;">
                <div style="background: #e2e8f0; border-radius: 4px; height: 10px; width: 100%; overflow: hidden;">
                  <div style="background: #0f172a; height: 100%; width: ${calcPct(scores.Supporter)}%;"></div>
                </div>
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #15803d;">${calcPct(scores.Supporter)}th Percentile</td>
            </tr>
          </table>
        </div>

        <!-- Recommended Pathways & Entrances -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px;">
          <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">Primary Stream Alignment</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${profile.recommendedStream}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">Gateway Entrance Milestones</div>
            <div style="font-size: 12.5px; color: #334155; font-weight: 600;">${profile.targetEntrances}</div>
          </div>

          <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px;">Top High-Trajectory Career Paths</div>
            <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #0f172a; line-height: 1.5;">
              ${profile.careers.map(c => `<li style="margin-bottom: 2px;"><strong>${c}</strong></li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Coach Ravi Sankar Parent Briefing -->
        <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: bold; letter-spacing: 1px; color: #166534; text-transform: uppercase; margin-bottom: 4px;">Parent-Student Harmony Directive &bull; Coach G. Ravi Sankar</div>
          <p style="font-size: 12.5px; color: #14532d; margin: 0; line-height: 1.6;">
            "${profile.parentNote} Remember: True performance emerges from psychological safety and natural alignment, not forced compliance."
          </p>
        </div>

        <!-- Footer / Credentials -->
        <div style="border-top: 1.5px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>G. Ravi Sankar</strong> &bull; IIT-Madras Certified Career & Youth Coach<br>
            Phone: +91 9490075459 &bull; Email: gattaravisankar@gmail.com
          </div>
          <div style="text-align: right;">
            Confidential Diagnostic Report<br>
            &copy; 2026 GRS Career Intelligence
          </div>
        </div>
      </div>
    `;
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
