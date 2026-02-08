// ==========================================
// THREE.JS IMPORTS (ES Modules)
// ==========================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ==========================================
// CONFIGURATION - CUSTOMIZE HERE
// ==========================================

const CONFIG = {
    // The secret word - each letter = one question
    secretWord: "VALENTINE",

    // Final message after she says yes
    finalMessage: "YAAAAY! I'm so excited to see you soon my love. I love celebrating you, and celebrating us, and I'm so grateful that I have you in my life, and that I can tell you and show you how much I love you every day. <3",

    // Questions array - FIRST option is always the correct answer (auto-shuffled)
    questions: [
        {
            question: "What was the first thing I gatekept from you?",
            options: ["The Bean, Bagel", "Pork and Chive Dumplings in Chinatown", "Hidden Speakeasy in LES", "Flavorful Peanuts from Walgreens"],
            hint: "We talked about this in the morning"
        },
        {
            question: "What's my favorite typo that you make?",
            options: ["goof", "kute", "slep", "spon"],
            hint: "I no give u hint heehee"
        },
        {
            question: "What was the first movie we watched together?",
            options: ["Vaaranam Aayiram", "Theri", "Master", "Dude"],
            hint: "Horrible movie"
        },
        {
            question: "What was the first thing I noticed about you when we spoke?",
            options: ["Your eyes", "Your nose", "Your eyebrows", "Your height"],
            hint: "You're using them right neow :3"
        },
        {
            question: "What is my favorite new habit/quirk I've picked up since dating you?",
            options: ["Being Whimsical", "Taking food photos of every meal before eating", "Cravings for Korean Food", "Being Dramatic"],
            hint: "no hint this time heehee"
        },
        {
            question: "What's one thing we absolutely have to have in our future house?",
            options: ["Dinosaur Skeleton (can we have one pwease)", "Gorilla Couch", "Food", "A Roof"],
            hint: "pwease"
        },
        {
            question: "What is my favorite thing about you?",
            options: ["All of the above", "Everything", "Every last detail about you", "Every tiny part of you that makes you you"],
            hint: "meow"
        },
        {
            question: "What is my favorite way to take care of you?",
            options: ["Cooking", "Massages", "Farts", "Doing your med school quizzes"],
            hint: "I try to do this every time I'm there"
        },
        {
            question: "What is my favorite thing that I copied from you?",
            options: ["Coffee Order/Making Coffee", "Making Matcha", "Being Goated", "Skincare Routine"],
            hint: "I think about you every time I do this"
        }
    ],

    // 3D Scene settings
    scene: {
        // Custom GLB model paths - your relationship items!
        models: [
            { path: "/models/heart_emoji.glb", scale: 0.3, count: 12, rotationSpeed: 0.008, isGold: true },
            { path: "/models/iced_matcha.glb", scale: 0.3, count: 8, rotationSpeed: 0.005 },
            { path: "/models/gochujang_korea.glb", scale: 0.3, count: 6, rotationSpeed: 0.006 },
            { path: "/models/korean_bakery.glb", scale: 0.3, count: 6, rotationSpeed: 0.004 },
            { path: "/models/wine_bottle_and_glass.glb", scale: 0.3, count: 6, rotationSpeed: 0.003 },
            { path: "/models/nespresso_machine_4.glb", scale: 0.3, count: 6, rotationSpeed: 0.004 },
        ],
        // Colors for fallback objects & particles
        colors: {
            primary: 0xd4a5a5,
            secondary: 0xe8b4b8,
            accent: 0x8b5a5a,
            gold: 0xD4AF37
        },
        particles: 400
    }
};

// ==========================================
// THREE.JS SCENE
// ==========================================

let scene, camera, renderer, composer;
let floatingObjects = [];
let particles;
let mouseX = 0, mouseY = 0;
let clock = new THREE.Clock();
let targetCameraZ = 30;
let isAnimating = false;

// Drag interaction
let raycaster = new THREE.Raycaster();
let dragMouse = new THREE.Vector2();
let draggedObject = null;
let dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
let dragOffset = new THREE.Vector3();
let isDragging = false;

function initThree() {
    const canvas = document.getElementById('three-canvas');

    // Scene - Pink background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffd6e0);
    scene.fog = new THREE.FogExp2(0xffd6e0, 0.008);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Post-processing - subtle bloom for clean look
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.3,
        0.4,
        0.85
    );
    composer.addPass(bloomPass);

    // Lighting - bright for silver background
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1.2, 100);
    pointLight1.position.set(20, 20, 30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 10, 10);
    scene.add(dirLight);

    // Create environment map for metallic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(50, 32, 32);
    const envMat = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        color: 0xffc0cb,
        vertexColors: false
    });
    const envMesh = new THREE.Mesh(envGeo, envMat);
    envScene.add(envMesh);

    const envMap = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();

    // Create objects (async)
    createFloatingObjects().then(() => {
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 500);
    });

    createParticles();

    // Mouse tracking for parallax
    document.addEventListener('mousemove', onMouseMove);

    // Drag interaction for 3D objects
    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', onDragStart);
    canvasEl.addEventListener('mousemove', onDrag);
    canvasEl.addEventListener('mouseup', onDragEnd);
    canvasEl.addEventListener('mouseleave', onDragEnd);

    // Touch support
    canvasEl.addEventListener('touchstart', onTouchStart, { passive: false });
    canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
    canvasEl.addEventListener('touchend', onDragEnd);

    // Resize handler
    window.addEventListener('resize', onResize);

    // Start animation
    animate();
}

function createHeartGeometry() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;

    shape.moveTo(x, y + 0.5);
    shape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x - 0.5, y);
    shape.bezierCurveTo(x - 0.5, y - 0.35, x, y - 0.6, x, y - 0.9);
    shape.bezierCurveTo(x, y - 0.6, x + 0.5, y - 0.35, x + 0.5, y);
    shape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5);

    const extrudeSettings = {
        depth: 0.3,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.1,
        bevelThickness: 0.1
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

async function createFloatingObjects() {
    const { models, colors } = CONFIG.scene;
    const loader = new GLTFLoader();
    const modelCache = new Map();

    const totalObjects = models.reduce((sum, m) => sum + m.count, 0);
    let loadedCount = 0;

    const progressBar = document.getElementById('loaderProgress');
    const loaderCount = document.getElementById('loaderCount');

    loaderCount.textContent = `0 / ${totalObjects}`;

    function updateProgress() {
        loadedCount++;
        const percent = (loadedCount / totalObjects) * 100;
        progressBar.style.width = `${percent}%`;
        loaderCount.textContent = `${loadedCount} / ${totalObjects}`;
    }

    for (const modelConfig of models) {
        let baseModel = modelCache.get(modelConfig.path);

        if (!baseModel) {
            try {
                console.log(`Attempting to load: ${modelConfig.path}`);
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(
                        modelConfig.path,
                        (loaded) => {
                            console.log(`Successfully loaded: ${modelConfig.path}`);
                            resolve(loaded);
                        },
                        (progress) => {
                            if (progress.total) {
                                console.log(`Loading ${modelConfig.path}: ${Math.round(progress.loaded / progress.total * 100)}%`);
                            }
                        },
                        (error) => {
                            console.error(`Failed to load ${modelConfig.path}:`, error);
                            reject(error);
                        }
                    );
                });
                baseModel = gltf.scene;
                modelCache.set(modelConfig.path, baseModel);
                console.log(`Model cached: ${modelConfig.path}`, baseModel);
            } catch (e) {
                console.warn(`Could not load model ${modelConfig.path}:`, e);
                baseModel = null;
            }
        }

        for (let i = 0; i < modelConfig.count; i++) {
            let wrapper;

            if (baseModel) {
                const mesh = baseModel.clone();

                // Normalize size: scale so largest dimension = target size
                const targetSize = 2.5;  // Uniform target size for all models
                const box = new THREE.Box3().setFromObject(mesh);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const normalizedScale = targetSize / maxDim;
                mesh.scale.set(normalizedScale, normalizedScale, normalizedScale);

                // Make materials metallic (gold for hearts, silver for others)
                const isGold = modelConfig.isGold === true;
                mesh.traverse((child) => {
                    if (child.isMesh && child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(mat => {
                            if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                                mat.metalness = 0.95;
                                mat.roughness = 0.1;
                                mat.envMapIntensity = 2.0;
                                if (isGold) {
                                    mat.color = new THREE.Color(0xD4AF37);
                                }
                            }
                        });
                    }
                });

                // Center the model (recalculate box after scaling)
                const scaledBox = new THREE.Box3().setFromObject(mesh);
                const center = scaledBox.getCenter(new THREE.Vector3());
                mesh.position.sub(center);

                wrapper = new THREE.Group();
                wrapper.add(mesh);
            } else {
                wrapper = createFallbackHeart(colors.primary);
            }

            // Position: spread out in X/Y, but closer in Z
            positionFloatingObject(wrapper);

            wrapper.userData = {
                type: modelConfig.path,
                speed: Math.random() * 0.4 + 0.15,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * modelConfig.rotationSpeed,
                    y: (Math.random() - 0.5) * modelConfig.rotationSpeed * 1.5,
                    z: (Math.random() - 0.5) * modelConfig.rotationSpeed
                },
                floatOffset: Math.random() * Math.PI * 2,
                floatAmplitude: Math.random() * 0.5 + 0.3,
                originalPosition: null // Will be set after positioning
            };

            wrapper.userData.originalPosition = wrapper.position.clone();

            floatingObjects.push(wrapper);
            scene.add(wrapper);
            updateProgress();
        }
    }

    console.log(`Loaded ${floatingObjects.length} 3D objects`);
}

function createFallbackHeart(color) {
    const geometry = createHeartGeometry();
    const material = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        metalness: 0.95,
        roughness: 0.1,
        envMapIntensity: 2.0
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(2, 2, 2);
    mesh.rotation.z = Math.PI;
    return mesh;
}

function positionFloatingObject(mesh) {
    // Spread out in X/Y, bring Z much closer to camera
    mesh.position.x = (Math.random() - 0.5) * 40;
    mesh.position.y = (Math.random() - 0.5) * 30;
    mesh.position.z = Math.random() * 8 + 15;  // Between 15 and 23 (closer to camera at z=30)
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
}

function createParticles() {
    const count = CONFIG.scene.particles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorOptions = [
        new THREE.Color(0xffb6c1),
        new THREE.Color(0xff69b4),
        new THREE.Color(0xffc0cb),
        new THREE.Color(0xdb7093)
    ];

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = Math.random() * 15 + 5;

        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Check if hovering over an object (for cursor feedback)
    if (!isDragging && renderer) {
        const rect = renderer.domElement.getBoundingClientRect();
        const hoverMouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        raycaster.setFromCamera(hoverMouse, camera);
        const intersects = raycaster.intersectObjects(floatingObjects, true);

        if (intersects.length > 0) {
            renderer.domElement.style.cursor = 'grab';
        } else {
            renderer.domElement.style.cursor = 'default';
        }
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// DRAG INTERACTION
// ==========================================

function getMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    dragMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    dragMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onDragStart(event) {
    event.preventDefault();
    getMousePosition(event);

    raycaster.setFromCamera(dragMouse, camera);

    // Check intersection with all floating objects
    const intersects = raycaster.intersectObjects(floatingObjects, true);

    if (intersects.length > 0) {
        isDragging = true;

        // Find the parent group (the floating object wrapper)
        let target = intersects[0].object;
        while (target.parent && !floatingObjects.includes(target)) {
            target = target.parent;
        }
        draggedObject = floatingObjects.includes(target) ? target : target.parent;

        // Set up the drag plane at the object's Z position
        dragPlane.setFromNormalAndCoplanarPoint(
            new THREE.Vector3(0, 0, 1),
            draggedObject.position
        );

        // Calculate offset from click point to object center
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersectPoint);
        dragOffset.subVectors(draggedObject.position, intersectPoint);

        // Change cursor
        renderer.domElement.style.cursor = 'grabbing';
    }
}

function onDrag(event) {
    if (!isDragging || !draggedObject) return;

    event.preventDefault();
    getMousePosition(event);

    raycaster.setFromCamera(dragMouse, camera);

    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersectPoint);

    // Move the object
    draggedObject.position.copy(intersectPoint.add(dragOffset));

    // Update the stored original position so it stays where you put it
    draggedObject.userData.originalPosition = draggedObject.position.clone();
}

function onDragEnd(event) {
    if (isDragging && draggedObject) {
        // Small bounce animation when released
        const obj = draggedObject;
        const currentScale = obj.scale.clone();
        obj.scale.multiplyScalar(1.15);

        setTimeout(() => {
            obj.scale.copy(currentScale);
        }, 150);
    }

    isDragging = false;
    draggedObject = null;
    renderer.domElement.style.cursor = 'default';
}

function onTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        const touch = event.touches[0];
        onDragStart({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
    }
}

function onTouchMove(event) {
    if (event.touches.length === 1 && isDragging) {
        event.preventDefault();
        const touch = event.touches[0];
        onDrag({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
    }
}

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Animate floating objects (skip if being dragged)
    floatingObjects.forEach(obj => {
        // Don't animate the object being dragged
        if (obj === draggedObject) return;

        const { speed, rotationSpeed, floatOffset, floatAmplitude = 0.3 } = obj.userData;

        // Gentle floating motion
        obj.position.y += Math.sin(time * speed + floatOffset) * 0.004 * floatAmplitude;
        obj.position.x += Math.cos(time * speed * 0.5 + floatOffset) * 0.002;

        // Smooth rotation
        obj.rotation.x += rotationSpeed.x;
        obj.rotation.y += rotationSpeed.y;
        obj.rotation.z += rotationSpeed.z;
    });

    // Animate particles
    if (particles) {
        particles.rotation.y = time * 0.02;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.002;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    // Smooth camera zoom
    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;

    // Subtle camera movement based on mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    composer.render();
}

// ==========================================
// ANIMATIONS
// ==========================================

function animateObjectsBurst() {
    // Objects burst outward then settle
    floatingObjects.forEach((obj, index) => {
        const delay = index * 20;
        const originalPos = obj.userData.originalPosition.clone();

        // Burst outward
        setTimeout(() => {
            const burstDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                Math.random() * 0.5
            ).normalize();

            const burstDistance = 3 + Math.random() * 2;
            const targetPos = originalPos.clone().add(burstDirection.multiplyScalar(burstDistance));

            // Animate to burst position
            animatePosition(obj, targetPos, 400, () => {
                // Then back to original
                animatePosition(obj, originalPos, 800);
            });
        }, delay);
    });
}

function animateObjectsSpin() {
    // All objects do a quick spin
    floatingObjects.forEach((obj, index) => {
        const delay = index * 15;
        setTimeout(() => {
            const startRotation = obj.rotation.y;
            const targetRotation = startRotation + Math.PI * 2;
            animateRotation(obj, 'y', targetRotation, 600);
        }, delay);
    });
}

function repositionAllObjects() {
    // Smoothly move all objects to new random positions
    floatingObjects.forEach((obj, index) => {
        const delay = index * 30;

        setTimeout(() => {
            // Generate new random position
            const newPos = new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 35,
                Math.random() * 10 + 8
            );

            // Animate to new position
            animatePosition(obj, newPos, 800 + Math.random() * 400, () => {
                // Update the stored original position
                obj.userData.originalPosition = newPos.clone();
            });

            // Also add a little rotation flourish
            const targetRotY = obj.rotation.y + (Math.random() - 0.5) * Math.PI;
            animateRotation(obj, 'y', targetRotY, 600);
        }, delay);
    });
}

function animateCameraZoom(targetZ, duration = 1000) {
    targetCameraZ = targetZ;
}

function animateBackgroundColor(targetColor, duration) {
    const startColor = scene.background.clone();
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        scene.background.lerpColors(startColor, targetColor, eased);
        scene.fog.color.lerpColors(startColor, targetColor, eased);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    update();
}

function animatePosition(obj, target, duration, callback) {
    const start = obj.position.clone();
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        obj.position.lerpVectors(start, target, eased);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else if (callback) {
            callback();
        }
    }
    update();
}

function animateRotation(obj, axis, target, duration) {
    const start = obj.rotation[axis];
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        obj.rotation[axis] = start + (target - start) * eased;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    update();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ==========================================
// QUIZ LOGIC
// ==========================================

let currentQuestion = 0;
let shuffledQuestions = [];
const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function startQuiz() {
    // Animate: camera zooms in slightly, objects burst
    animateCameraZoom(25, 1000);
    animateObjectsBurst();

    // Prepare questions
    shuffledQuestions = CONFIG.questions.map((q, i) => {
        const correctAnswer = q.options[0];
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        return {
            ...q,
            options: shuffled,
            correctIndex: shuffled.indexOf(correctAnswer),
            letter: CONFIG.secretWord[i]
        };
    });

    // Create letter boxes
    const lettersReveal = document.getElementById('lettersReveal');
    lettersReveal.innerHTML = '';
    for (let i = 0; i < CONFIG.secretWord.length; i++) {
        const box = document.createElement('div');
        box.className = 'letter-box';
        box.id = `letterBox-${i}`;
        lettersReveal.appendChild(box);
    }

    // Transition screens with animation
    transitionScreen('welcomeScreen', 'quizScreen');

    setTimeout(() => {
        displayQuestion();
    }, 800);
}

function displayQuestion() {
    const q = shuffledQuestions[currentQuestion];

    // Animate objects to new positions on each question
    repositionAllObjects();

    document.getElementById('questionLabel').textContent = `Memory ${romanNumerals[currentQuestion]}`;
    document.getElementById('questionText').textContent = q.question;

    const progressPercent = (currentQuestion / CONFIG.secretWord.length) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    document.getElementById('progressText').textContent = `Question ${currentQuestion + 1} of ${CONFIG.secretWord.length}`;

    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';

    // Stagger option appearance
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-item';
        btn.textContent = option;
        btn.style.opacity = '0';
        btn.style.transform = 'translateX(-20px)';
        btn.onclick = () => handleAnswer(index);
        optionsGrid.appendChild(btn);

        // Animate in
        setTimeout(() => {
            btn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateX(0)';
        }, index * 100 + 200);
    });

    document.getElementById('hintBox').textContent = q.hint;
    document.getElementById('hintBox').classList.remove('visible');
}

function handleAnswer(selectedIndex) {
    const q = shuffledQuestions[currentQuestion];
    const options = document.querySelectorAll('.option-item');

    options.forEach(opt => opt.classList.add('disabled'));

    if (selectedIndex === q.correctIndex) {
        options[selectedIndex].classList.add('correct');

        const letterBox = document.getElementById(`letterBox-${currentQuestion}`);
        letterBox.textContent = q.letter;
        letterBox.classList.add('revealed');

        triggerCelebration();

        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < shuffledQuestions.length) {
                // Fade out current question content
                const quizCard = document.getElementById('quizCard');
                quizCard.style.opacity = '0';
                quizCard.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    displayQuestion();
                    quizCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    quizCard.style.opacity = '1';
                    quizCard.style.transform = 'scale(1)';
                }, 300);
            } else {
                showFinalReveal();
            }
        }, 1200);

    } else {
        options[selectedIndex].classList.add('incorrect');
        document.getElementById('quizCard').classList.add('shake');
        document.getElementById('hintBox').classList.add('visible');

        setTimeout(() => {
            document.getElementById('quizCard').classList.remove('shake');
            options.forEach(opt => {
                opt.classList.remove('incorrect', 'disabled');
            });
        }, 800);
    }
}

function triggerCelebration() {
    // Pulse all floating objects with stagger
    floatingObjects.forEach((obj, index) => {
        setTimeout(() => {
            const originalScale = obj.scale.clone();
            obj.scale.multiplyScalar(1.4);

            const startTime = Date.now();
            const animateBack = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / 600, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                obj.scale.lerpVectors(
                    originalScale.clone().multiplyScalar(1.4),
                    originalScale,
                    eased
                );
                if (progress < 1) requestAnimationFrame(animateBack);
            };
            setTimeout(animateBack, 100);
        }, index * 30);
    });

    // Intensify particles briefly
    if (particles) {
        const originalOpacity = particles.material.opacity;
        particles.material.opacity = 1;
        setTimeout(() => {
            particles.material.opacity = originalOpacity;
        }, 800);
    }
}

function showFinalReveal() {
    // Zoom camera out for dramatic effect
    animateCameraZoom(35, 1500);

    transitionScreen('quizScreen', 'transitionScreen');

    const finalWord = document.getElementById('finalWord');
    finalWord.innerHTML = '';

    CONFIG.secretWord.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'final-letter';
        span.textContent = letter;
        finalWord.appendChild(span);

        setTimeout(() => {
            span.classList.add('visible');
            // Burst effect with each letter
            animateObjectsBurst();
        }, index * 150 + 500);
    });

    setTimeout(() => {
        transitionScreen('transitionScreen', 'finalScreen');
        animateCameraZoom(28, 1000);

        setTimeout(() => {
            document.getElementById('romanticQuestion').classList.add('visible');
        }, 300);

        setTimeout(() => {
            document.getElementById('responseContainer').classList.add('visible');
            initNoButton();
        }, 600);

    }, CONFIG.secretWord.length * 150 + 2500);
}

function initNoButton() {
    const btnNo = document.getElementById('btnNo');
    btnNo.noMoveCount = 0;

    btnNo.addEventListener('mouseenter', moveNoButton);
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveNoButton();
    });
}

const noButtonMessages = [
    "No",
    "Are you sure?",
    "Really?",
    "Think again...",
    "Pretty please?",
    "No?",
    "Reconsider?",
    "No",
];

let yesButtonScale = 1;

function moveNoButton() {
    const btn = document.getElementById('btnNo');

    // Move button to body on first move to escape any transformed ancestors
    if (btn.parentElement !== document.body) {
        const rect = btn.getBoundingClientRect();
        btn.style.position = 'fixed';
        btn.style.left = `${rect.left}px`;
        btn.style.top = `${rect.top}px`;
        btn.style.margin = '0';
        document.body.appendChild(btn);
    }

    // Update button text playfully (loop through messages)
    btn.noMoveCount = (btn.noMoveCount || 0) + 1;
    btn.textContent = noButtonMessages[btn.noMoveCount % noButtonMessages.length];

    // Get current position
    const rect = btn.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;

    // Get button dimensions
    const btnWidth = btn.offsetWidth || 150;
    const btnHeight = btn.offsetHeight || 60;

    // Calculate safe bounds with padding
    const padding = 40;
    const minX = padding;
    const minY = padding;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;

    // Generate new position that's at least 150px away from current position
    let newX, newY;
    let attempts = 0;
    do {
        newX = minX + Math.random() * (maxX - minX);
        newY = minY + Math.random() * (maxY - minY);
        attempts++;
    } while (
        attempts < 10 &&
        Math.hypot(newX - currentX, newY - currentY) < 150
    );

    // Set position
    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;
    btn.style.zIndex = '1000';

    // Smooth animation with slight scale bounce
    btn.style.transition = 'none';
    btn.style.transform = 'scale(0.9)';

    requestAnimationFrame(() => {
        btn.style.transition = 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s ease';
        btn.style.transform = 'scale(1)';
    });

    // Grow the Yes button each time (no limit!)
    yesButtonScale += 0.1;
    const yesBtn = document.querySelector('.btn-yes');
    if (yesBtn) {
        yesBtn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        yesBtn.style.transform = `scale(${yesButtonScale})`;
    }
}

function sayYes() {
    // Hide the No button
    const btnNo = document.getElementById('btnNo');
    if (btnNo) {
        btnNo.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        btnNo.style.opacity = '0';
        btnNo.style.transform = 'scale(0)';
        setTimeout(() => btnNo.remove(), 300);
    }

    document.getElementById('celebrationMessage').textContent = CONFIG.finalMessage;
    transitionScreen('finalScreen', 'celebrationScreen');

    // Change background to romantic pink
    const pinkColor = new THREE.Color(0xffd1dc);  // Soft pink
    animateBackgroundColor(pinkColor, 2000);

    // Also update the HTML background
    document.body.style.transition = 'background-color 2s ease';
    document.body.style.backgroundColor = '#ffd1dc';

    // Massive celebration - zoom in and burst
    animateCameraZoom(20, 2000);

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            triggerCelebration();
            animateObjectsBurst();
        }, i * 400);
    }

    if (particles) {
        particles.material.opacity = 1;
        particles.material.size = 0.25;
        // Make particles pink too
        const positions = particles.geometry.attributes.color.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = 1.0;     // R
            positions[i + 1] = 0.7; // G
            positions[i + 2] = 0.8; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;
    }
}

function transitionScreen(fromId, toId) {
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(toId);

    fromScreen.style.opacity = '0';
    fromScreen.style.transform = 'translateY(-30px)';

    setTimeout(() => {
        fromScreen.classList.remove('active');
        toScreen.classList.add('active');

        void toScreen.offsetWidth;

        toScreen.style.opacity = '1';
        toScreen.style.transform = 'none';
    }, 500);
}

// ==========================================
// INITIALIZE
// ==========================================

// Expose functions to global scope for onclick handlers
window.startQuiz = startQuiz;
window.sayYes = sayYes;

document.addEventListener('DOMContentLoaded', () => {
    initThree();
});
