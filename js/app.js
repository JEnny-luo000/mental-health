// 应用状态管理
const appState = {
    currentPage: 'opening',
    currentScene: 1,
    depressionCompleted: false,
    sceneReady: false,
    isTransitioning: false
};

// DOM 元素引用
let continueBtn, continueHint;
let currentSceneCallback = null;
let scene2ACompleted = false;

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 应用初始化
function initApp() {
    continueBtn = document.getElementById('continue-btn');
    continueHint = document.getElementById('continue-hint');
    
    checkCompletionStatus();
    startOpeningAnimation();
    bindEvents();
    bindContinueButton();
}

// 检查完成状态
function checkCompletionStatus() {
    const completed = localStorage.getItem('depressionCompleted');
    if (completed === 'true') {
        appState.depressionCompleted = true;
        document.getElementById('completed-badge').style.display = 'block';
    }
}

// 开场文字动画
function startOpeningAnimation() {
    const line1 = document.getElementById('text-line-1');
    const line2 = document.getElementById('text-line-2');
    const openingContent = document.querySelector('.opening-content');
    const openingButtons = document.getElementById('opening-buttons');

    setTimeout(() => {
        typeWriter(line1, '你每天都会遇到很多人，', 80, () => {
            line1.classList.add('visible');
            setTimeout(() => {
                typeWriter(line2, '但你不知道他们心里正在经历什么。', 80, () => {
                    line2.classList.add('visible');
                    setTimeout(() => {
                        openingContent.classList.add('settled');
                        openingButtons.classList.add('visible');
                    }, 1000);
                });
            }, 600);
        });
    }, 1200);
}

// 打字机效果
function typeWriter(element, text, delay, callback) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, delay);
        } else if (callback) {
            callback();
        }
    }
    
    type();
}

// 绑定继续按钮
function bindContinueButton() {
    continueBtn.addEventListener('click', handleContinue);
}

function handleContinue() {
    if (appState.isTransitioning) return;
    if (!appState.sceneReady) return;
    
    appState.sceneReady = false;
    hideContinueButton();
    
    if (currentSceneCallback && typeof currentSceneCallback === 'function') {
        currentSceneCallback();
        currentSceneCallback = null;
    }
}

// 显示继续按钮
function showContinueButton(callback) {
    currentSceneCallback = callback;
    setTimeout(() => {
        appState.sceneReady = true;
        continueBtn.classList.add('visible');
        continueHint.classList.add('visible');
    }, 500);
}

// 隐藏继续按钮
function hideContinueButton() {
    continueBtn.classList.remove('visible');
    continueHint.classList.remove('visible');
}

// 绑定所有事件
function bindEvents() {
    // 开场页面事件
    document.getElementById('ready-btn').addEventListener('click', goToHall);
    document.getElementById('info-btn').addEventListener('click', showInfoModal);
    document.getElementById('close-modal-btn').addEventListener('click', hideInfoModal);
    
    // 大厅页面事件
    document.getElementById('depression-door').addEventListener('click', startDepressionExperience);
    
    // 场景事件
    setupScene1Events();
    setupScene2Events();
    setupScene2AEvents();
    setupScene2BEvents();
    setupScene3AEvents();
    setupScene4Events();
    setupScene5Events();
    
    // 科普页面事件
    document.getElementById('science-next-btn').addEventListener('click', () => {
        switchPage('empathy-page');
    });
    
    // 共情档案页事件
    document.getElementById('share-poster-btn').addEventListener('click', generatePoster);
    document.getElementById('go-to-resources-btn').addEventListener('click', () => {
        switchPage('resources-page');
    });
    
    // 资源页事件
    document.getElementById('back-to-hall-btn').addEventListener('click', () => {
        switchPage('hall-page');
    });
}

// 页面切换函数 - 先淡出旧页再淡入新页，去掉中间会闪背景的空白
function switchPage(pageId) {
    if (appState.isTransitioning) return;
    appState.isTransitioning = true;

    const currentPage = document.querySelector('.page.active');
    const nextPage = document.getElementById(pageId);

    if (currentPage === nextPage) {
        appState.isTransitioning = false;
        return;
    }

    if (currentPage) {
        // 旧页淡出
        currentPage.classList.add('fade-out');
        setTimeout(() => {
            // 旧页淡出完成，立即换上新页（无空隙，避免背景闪烁）
            currentPage.classList.remove('active', 'fade-out');
            nextPage.classList.add('active');
            setTimeout(() => {
                appState.isTransitioning = false;
                appState.currentPage = pageId.replace('-page', '');
            }, 500);
        }, 500);
    } else {
        nextPage.classList.add('active');
        setTimeout(() => {
            appState.isTransitioning = false;
            appState.currentPage = pageId.replace('-page', '');
        }, 500);
    }
}

// 场景切换函数 - 先淡出旧场景再淡入新场景，去掉中间会闪背景的空白
function switchScene(sceneId, callback) {
    if (appState.isTransitioning) return;
    appState.isTransitioning = true;

    const currentScene = document.querySelector('.scene.active');
    const nextScene = document.getElementById(sceneId);

    if (currentScene === nextScene) {
        appState.isTransitioning = false;
        if (callback) callback();
        return;
    }

    if (currentScene) {
        // 旧场景淡出
        currentScene.classList.add('fade-out');
        setTimeout(() => {
            // 旧场景淡出完成，立即换上新场景（无空隙，避免背景闪烁）
            currentScene.classList.remove('active', 'fade-out');
            nextScene.classList.add('active');
            setTimeout(() => {
                appState.isTransitioning = false;
                initScene(sceneId);
                if (callback) callback();
            }, 500);
        }, 500);
    } else {
        nextScene.classList.add('active');
        setTimeout(() => {
            appState.isTransitioning = false;
            initScene(sceneId);
            if (callback) callback();
        }, 500);
    }
}

// 前往大厅
function goToHall() {
    switchPage('hall-page');
}

// 显示说明弹窗
function showInfoModal() {
    document.getElementById('info-modal').classList.add('active');
}

// 隐藏说明弹窗
function hideInfoModal() {
    document.getElementById('info-modal').classList.remove('active');
}

// 开始抑郁症体验
function startDepressionExperience() {
    switchPage('script-page');
    setTimeout(() => {
        showScene('intro');
    }, 800);
}

// 显示场景
function showScene(sceneNum) {
    let sceneId;
    if (sceneNum === 'intro') {
        sceneId = 'scene-intro';
    } else if (sceneNum === 'transition') {
        sceneId = 'transition-scene';
    } else if (sceneNum === '2choice') {
        sceneId = 'scene-2-choice';
    } else {
        sceneId = `scene-${sceneNum}`;
    }
    
    const sceneElement = document.getElementById(sceneId);
    if (sceneElement) {
        sceneElement.classList.add('active');
        appState.currentScene = sceneNum;
        
        // 初始化场景
        setTimeout(() => {
            initScene(sceneId);
        }, 300);
    }
}

// 根据场景ID初始化场景
function initScene(sceneId) {
    switch(sceneId) {
        case 'scene-intro':
            initIntro();
            break;
        case 'scene-1':
            initScene1();
            break;
        case 'scene-2-choice':
            break;
        case 'scene-2a':
            initScene2A();
            break;
        case 'scene-2b':
            initScene2B();
            break;
        case 'scene-3a':
            initScene3A();
            break;
        case 'scene-4':
            resetScene4();
            initScene4();
            break;
        case 'scene-5':
            initScene5();
            break;
        case 'transition-scene':
            initTransition();
            break;
    }
}

// ========== 引导场景：身份与场景交代 ==========
function initIntro() {
    const line1 = document.getElementById('intro-line-1');
    const line2 = document.getElementById('intro-line-2');
    
    line1.textContent = '';
    line2.textContent = '';
    line1.classList.remove('visible');
    line2.classList.remove('visible');
    
    setTimeout(() => {
        typewriterIntro(line1, '你是一名普通的上班族。', 60, () => {
            line1.classList.add('visible');
            setTimeout(() => {
                line2.classList.add('visible');
                typewriterIntro(line2, '又是一个工作日的早晨——', 60, () => {
                    setTimeout(() => {
                        showContinueButton(() => {
                            switchScene('scene-1');
                        });
                    }, 1000);
                });
            }, 800);
        });
    }, 1200);
}

function typewriterIntro(element, text, delay, callback) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, delay);
        } else if (callback) {
            callback();
        }
    }
    
    type();
}

// 睁眼：两片眼皮路径 d 的控制点 Y 从 50（平直闭合）插值到 15/85（弧形睁开）
// 与 CSS 的 translateY 同步走 3s：曲线慢慢成形 + 眼皮一起退场
function animateEyeOpening(duration = 3000) {
    const topLid = document.querySelector('.eye-lid-path-top');
    const bottomLid = document.querySelector('.eye-lid-path-bottom');
    if (!topLid || !bottomLid) return;

    // 重入场景时，先把上一次还在跑的 rAF 停掉，避免互相覆盖
    if (animateEyeOpening._rafId) {
        cancelAnimationFrame(animateEyeOpening._rafId);
    }

    // 先重置为闭合态：控制点 y=50，曲线退化成 y=50 的水平线，
    // 两片眼皮严丝合缝盖满中线，整屏纯黑、无弧形
    const closedTop = 'M 0,0 L 100,0 L 100,50 C 80,50 20,50 0,50 Z';
    const closedBottom = 'M 0,50 C 20,50 80,50 100,50 L 100,100 L 0,100 Z';
    topLid.setAttribute('d', closedTop);
    bottomLid.setAttribute('d', closedBottom);

    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // 与 CSS transition 同款 cubic-bezier(0.4, 0, 0.2, 1) 的近似
        const eased = 1 - Math.pow(1 - t, 3);

        // 上眼皮控制点 y: 50→15（向下凹得越来越深）
        // 下眼皮控制点 y: 50→85（向上凸得越来越高）
        const topY = 50 - 35 * eased;
        const bottomY = 50 + 35 * eased;

        // 拼路径：C x1,y1 x2,y2 x,y —— 两个控制点共享同一个 Y
        topLid.setAttribute('d', `M 0,0 L 100,0 L 100,50 C 80,${topY} 20,${topY} 0,50 Z`);
        bottomLid.setAttribute('d', `M 0,50 C 20,${bottomY} 80,${bottomY} 100,50 L 100,100 L 0,100 Z`);

        if (t < 1) {
            animateEyeOpening._rafId = requestAnimationFrame(step);
        } else {
            animateEyeOpening._rafId = null;
        }
    }

    animateEyeOpening._rafId = requestAnimationFrame(step);
}

// 初始化场景1
function initScene1() {
    appState.sceneReady = false;

    // 同时启动睁眼 + 雾气淡入，都是 3s；眼睛完全睁开时雾气已满格
    setTimeout(() => {
        const eyeLids = document.getElementById('wake-up-eyes');
        if (eyeLids) {
            eyeLids.classList.add('opening');
        }
        // 路径 d 同步从平直闭合态插值到弧形睁开态
        animateEyeOpening(3000);
        initFogCanvas();
    }, 800);
}

// 初始化雾气画布（全屏刮刮乐）
function initFogCanvas() {
    const canvas = document.getElementById('fog-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const TARGET_PERCENT = 50;    // 擦除 50% 触发自动清除
    const BRUSH_RADIUS = 75;      // 大笔刷半径
    const SOFT_EDGE = 22;         // 笔刷柔边宽度
    const GRID_SIZE = 50;         // 面积采样网格 50x50
    const STEP = 6;               // 插值步长（px）
    
    let isDrawing = false;
    let lastX = null, lastY = null;
    let finished = false;
    const totalCells = GRID_SIZE * GRID_SIZE;
    const scratchedMask = new Uint8Array(totalCells);
    
    // 重置状态（支持重复进入场景）
    canvas.classList.remove('cleared', 'active');
    scratchedMask.fill(0);
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawFog();
    }
    
    function drawFog() {
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, w, h);
        
        // 底层深灰蓝渐变
        const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, 'rgba(140, 150, 175, 0.92)');
        baseGrad.addColorStop(0.5, 'rgba(165, 170, 190, 0.95)');
        baseGrad.addColorStop(1, 'rgba(120, 130, 155, 0.92)');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, w, h);
        
        // 大量半透明白色雾团（云感）
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * 90 + 30;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.18)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        
        // 深色雾团增加层次
        for (let i = 0; i < 45; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = Math.random() * 130 + 60;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, 'rgba(90, 100, 130, 0.35)');
            grad.addColorStop(1, 'rgba(90, 100, 130, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
    }
    
    function eraseAt(x, y) {
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-out';
        const inner = Math.max(1, BRUSH_RADIUS - SOFT_EDGE);
        const grad = ctx.createRadialGradient(x, y, inner, x, y, BRUSH_RADIUS);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        markScratched(x, y);
    }
    
    function markScratched(cx, cy) {
        const cellW = canvas.width / GRID_SIZE;
        const cellH = canvas.height / GRID_SIZE;
        const r = BRUSH_RADIUS;
        const minX = Math.max(0, Math.floor((cx - r) / cellW));
        const maxX = Math.min(GRID_SIZE - 1, Math.floor((cx + r) / cellW));
        const minY = Math.max(0, Math.floor((cy - r) / cellH));
        const maxY = Math.min(GRID_SIZE - 1, Math.floor((cy + r) / cellH));
        
        for (let yi = minY; yi <= maxY; yi++) {
            for (let xi = minX; xi <= maxX; xi++) {
                scratchedMask[yi * GRID_SIZE + xi] = 1;
            }
        }
    }
    
    function checkProgress() {
        if (finished) return;
        let scratched = 0;
        for (let i = 0; i < totalCells; i++) {
            if (scratchedMask[i]) scratched++;
        }
        const percent = (scratched / totalCells) * 100;
        if (percent >= TARGET_PERCENT) {
            triggerAutoClear();
        }
    }
    
    function triggerAutoClear() {
        finished = true;
        canvas.classList.add('cleared');
        canvas.classList.remove('active');
        detachEvents();
        const hint = document.getElementById('wake-hint');
        if (hint) hint.classList.add('hidden');
        // 等雾气缓慢散尽（与 .cleared 过渡时长一致）再启用滑块关闹钟
        setTimeout(enableSlider, 5000);
    }
    
    function getPos(e) {
        let clientX, clientY;
        if (e.touches && e.touches.length) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return { x: clientX, y: clientY };
    }
    
    function startDraw(e) {
        if (finished) return;
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
        eraseAt(pos.x, pos.y);
        checkProgress();
    }
    
    function draw(e) {
        if (!isDrawing || finished) return;
        e.preventDefault();
        const pos = getPos(e);
        // 插值连线，避免快速移动时出现断点
        const dx = pos.x - lastX;
        const dy = pos.y - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(dist / STEP));
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = lastX + dx * t;
            const y = lastY + dy * t;
            eraseAt(x, y);
        }
        lastX = pos.x;
        lastY = pos.y;
        checkProgress();
    }
    
    function endDraw() {
        if (!isDrawing) return;
        isDrawing = false;
        lastX = lastY = null;
        checkProgress();
    }
    
    function onPointerDown(e) { startDraw(e); }
    function onPointerMove(e) { draw(e); }
    function onPointerUp() { endDraw(); }
    function onPointerLeave() { endDraw(); }
    
    function attachEvents() {
        canvas.addEventListener('mousedown', onPointerDown);
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('mouseleave', onPointerLeave);
        canvas.addEventListener('touchstart', onPointerDown, { passive: false });
        canvas.addEventListener('touchmove', onPointerMove, { passive: false });
        canvas.addEventListener('touchend', onPointerUp);
        canvas.addEventListener('touchcancel', onPointerUp);
        // 兜底：mouseup/touchend 绑在 window 防止移出画布卡住
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);
    }
    
    function detachEvents() {
        canvas.removeEventListener('mousedown', onPointerDown);
        canvas.removeEventListener('mousemove', onPointerMove);
        canvas.removeEventListener('mouseleave', onPointerLeave);
        canvas.removeEventListener('touchstart', onPointerDown);
        canvas.removeEventListener('touchmove', onPointerMove);
        canvas.removeEventListener('touchend', onPointerUp);
        canvas.removeEventListener('touchcancel', onPointerUp);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchend', onPointerUp);
    }
    
    resizeCanvas();
    attachEvents();
    window.addEventListener('resize', resizeCanvas);
    
    // 触发淡入（下一帧，避免初次绘制闪烁）
    requestAnimationFrame(() => {
        canvas.classList.add('active');
    });
}

// 启用滑动关闭闹钟
function enableSlider() {
    const sliderThumb = document.getElementById('slider-thumb');
    if (!sliderThumb) return;
    
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    const maxSlide = 110;
    let hasMoved = false;
    let resistanceOffset = 0;
    let slidToEnd = false; // 防止在达到 maxSlide 后多次触发 switchToWallpaper
    
    function getPos(e) {
        if (e.touches) {
            return e.touches[0].clientX;
        }
        return e.clientX;
    }
    
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        hasMoved = false;
        startX = getPos(e);
        sliderThumb.classList.add('dragging');
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const posX = getPos(e);
        const delta = posX - startX;
        
        if (delta > 0 && delta < maxSlide) {
            // 添加阻力感：滑动越远，阻力越大
            resistanceOffset = Math.max(0, (delta / maxSlide) * 15);
            const actualDelta = delta - resistanceOffset;
            currentX = Math.max(0, actualDelta);
            sliderThumb.style.transform = `translateX(calc(-50% + ${currentX}px))`;
            hasMoved = true;
        } else if (delta >= maxSlide && !slidToEnd) {
            slidToEnd = true;
            sliderThumb.style.transform = `translateX(calc(-50% + ${maxSlide}px))`;
            // 关闭闹钟：先切换为经典 iPhone 壁纸，稍作停留再开始震动
            switchToWallpaper();
        }
    }
    
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        sliderThumb.classList.remove('dragging');
        
        if (hasMoved && currentX < maxSlide - 5) {
            sliderThumb.style.transform = 'translateX(-50%)';
            currentX = 0;
        }
    }
    
    sliderThumb.addEventListener('mousedown', startDrag);
    sliderThumb.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

// 切换为经典 iPhone 壁纸（闹钟关闭后）
function switchToWallpaper() {
    const phoneScreen = document.getElementById('phone-screen');
    const sliderArea = document.getElementById('phone-slider-area');
    if (!phoneScreen) return;
    
    // 锁定滑块，避免后续误触
    if (sliderArea) sliderArea.style.pointerEvents = 'none';
    
    // 同步更新壁纸上的时间（在原闹钟时间 +1 分钟）
    const wallpaperTime = document.getElementById('wallpaper-time');
    if (wallpaperTime) {
        const statusTime = document.getElementById('phone-status-time');
        wallpaperTime.textContent = statusTime ? statusTime.textContent : '07:01';
    }
    
    // 关闭闹钟界面，渐入壁纸
    phoneScreen.classList.remove('alarm-active');
    
    // 给用户一点时间看清壁纸，再开始震动
    setTimeout(() => {
        triggerShake();
    }, 900);
}

// 触发震动效果（闹钟关闭后）
let shakeTriggered = false;
function triggerShake() {
    if (shakeTriggered) return;
    shakeTriggered = true;
    const sceneContent = document.getElementById('scene-1-content');
    if (sceneContent) {
        sceneContent.classList.add('shaking');
        // 震动1.5秒后停止
        setTimeout(() => {
            sceneContent.classList.remove('shaking');
            // 震动结束后进入下一阶段
            completeScene1();
        }, 1500);
    }
}

// 场景1事件设置
function setupScene1Events() {
    // 事件在 initScene1 中动态设置
}

// 完成场景1
let scene1Completed = false;
function completeScene1() {
    if (scene1Completed) return;
    scene1Completed = true;
    showInnerMonologue('scene1-monologue', '连起床都需要这么大的力气...');
    applyInnerWorldEffects();
    
    setTimeout(() => {
        showContinueButton(() => {
            switchScene('scene-2-choice');
        });
    }, 1500);
}

// 显示内心独白
function showInnerMonologue(elementId, text) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = '';
    element.style.display = 'block';
    typeWriter(element, text, 100);
}

// 应用内心世界视觉效果
function applyInnerWorldEffects() {
    const container = document.getElementById('script-container');
    container.classList.add('glitch-effect', 'vignette', 'grayscale-blue');
}

// 场景2选择
function setupScene2Events() {
    document.getElementById('choice-go-out').addEventListener('click', () => {
        switchScene('scene-2a');
    });
    
    document.getElementById('choice-stay').addEventListener('click', () => {
        switchScene('scene-2b');
    });
}

// ========== 场景2A - 维持微笑（重点优化） ==========
function initScene2A() {
    scene2ACompleted = false;
    resetFaceEmotion();
    
    const face = document.getElementById('emotion-face');
    let isHolding = false;
    let smileLevel = 0;
    let holdStartTime = 0;
    let updateInterval = null;
    
    // 心理描写内容
    const psychologies = [
        '我其实不想笑...',
        '但我不能让别人担心...',
        '这样会给大家添麻烦的',
        '只要...坚持住就好...',
        '好累...好想休息...'
    ];
    let currentPsychologyIndex = 0;
    
    const mouthPath = document.getElementById('mouth-path');
    const psychologyText = document.getElementById('psychology-text');
    const completeHint = document.getElementById('complete-hint');
    
    function updateSmile() {
        if (isHolding && smileLevel < 100) {
            smileLevel = Math.min(100, smileLevel + 1.5);
            
            // 更新嘴巴弧度：从悲伤(嘴角向下，∩ 形)到微笑(嘴角向上，⌣ 形)
            // 起点终点 Y=20，控制点 Y 在 5（悲伤/∩）到 30（微笑/⌣）之间
            // SVG 中 Y 向下：控制点 Y < 起止点 Y → 曲线向上凸 = 悲伤 ∩
            //                   控制点 Y > 起止点 Y → 曲线向下凹 = 微笑 ⌣
            const curveY = 5 + (smileLevel / 100) * 25;
            mouthPath.setAttribute('d', `M 10 20 Q 40 ${curveY} 70 20`);
            
            // 更新提示文字
            if (smileLevel > 20 && smileLevel < 40) {
                document.getElementById('emotion-hint').textContent = '继续按住...';
            } else if (smileLevel >= 40 && smileLevel < 70) {
                document.getElementById('emotion-hint').textContent = '保持住...';
            } else if (smileLevel >= 70) {
                document.getElementById('emotion-hint').textContent = '就是这样，保持微笑';
            }
            
            // 显示心理描写
            const psychologyThreshold = (currentPsychologyIndex + 1) * 20;
            if (smileLevel >= psychologyThreshold && currentPsychologyIndex < psychologies.length) {
                psychologyText.textContent = psychologies[currentPsychologyIndex];
                psychologyText.classList.add('visible');
                currentPsychologyIndex++;
            }
            
            // 完成条件
            if (smileLevel >= 100) {
                clearInterval(updateInterval);
                completeScene2A();
            }
        }
        // 松手后不再做任何事：smileLevel 保持当前值，嘴角弧度定格
    }
    
    const startHold = (e) => {
        e.preventDefault();
        isHolding = true;
        holdStartTime = Date.now();
        updateInterval = setInterval(updateSmile, 50);
    };
    
    const endHold = () => {
        isHolding = false;
        clearInterval(updateInterval);
    };
    
    face.addEventListener('mousedown', startHold);
    face.addEventListener('mouseup', endHold);
    face.addEventListener('mouseleave', endHold);
    face.addEventListener('touchstart', startHold);
    face.addEventListener('touchend', endHold);
}

function resetFaceEmotion() {
    const mouthPath = document.getElementById('mouth-path');
    const psychologyText = document.getElementById('psychology-text');
    const completeHint = document.getElementById('complete-hint');
    
    // 初始状态：悲伤（嘴角向下，∩ 形；控制点 Y=5 < 起止点 Y=20，曲线向上凸）
    mouthPath.setAttribute('d', 'M 10 20 Q 40 5 70 20');
    psychologyText.classList.remove('visible');
    psychologyText.textContent = '';
    completeHint.classList.remove('visible');
    document.getElementById('emotion-hint').textContent = '点击并按住面具，让它露出微笑';
}

function completeScene2A() {
    if (scene2ACompleted) return;
    scene2ACompleted = true;
    
    const completeHint = document.getElementById('complete-hint');
    const psychologyText = document.getElementById('psychology-text');
    
    completeHint.classList.add('visible');
    psychologyText.textContent = '我没事，真的没事...';
    
    setTimeout(() => {
        showContinueButton(() => {
            switchScene('scene-3a');
        });
    }, 2000);
}

// 场景2A事件设置（保留空的，因为逻辑在initScene2A中）
function setupScene2AEvents() {
    // 事件在 initScene2A 中动态绑定
}

// ========== 场景2B - 弹幕 ==========
function initScene2B() {
    const words = ['懒', '矫情', '没用', '想太多', '振作点', '至于吗', '废物'];
    const container = document.getElementById('danmaku-container');
    container.innerHTML = '';
    let wordCount = 0;
    const maxWords = 15;
    
    const createWord = () => {
        if (wordCount >= maxWords) {
            showInnerMonologue('scene2b-monologue', '我真的这么没用吗...');
            setTimeout(() => {
                showContinueButton(() => {
                    switchScene('scene-3a');
                });
            }, 2000);
            return;
        }
        
        const word = document.createElement('div');
        word.className = 'danmaku-word';
        word.textContent = words[Math.floor(Math.random() * words.length)];
        word.style.left = `${Math.random() * 80 + 10}%`;
        word.style.top = `${Math.random() * 70 + 10}%`;
        
        container.appendChild(word);
        wordCount++;
        
        setTimeout(createWord, 600);
    };
    
    createWord();
}

function setupScene2BEvents() {
    // 弹幕事件在 initScene2B 中设置
}

// ========== 场景3A - 摘下面具 ==========
// ========== 场景3A：工位上班 ==========
let scene3AInitialized = false;
let clickCount = 0;
const MAX_CLICKS = 20;

function initScene3A() {
    if (scene3AInitialized) return;
    scene3AInitialized = true;

    clickCount = 0;

    // 显示第一个按钮
    moveTaskButton();

    // 任务按钮点击事件
    const taskButton = document.getElementById('task-button');
    taskButton.addEventListener('click', handleTaskClick);
    taskButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTaskClick();
    }, { passive: false });

    // 显示内心独白
    showInnerMonologue('scene3a-monologue', '我在做这些事，但好像不是我做的。我只是一个执行程序，没有意义，也没有尽头。');
}

function moveTaskButton() {
    const taskButton = document.getElementById('task-button');
    if (!taskButton) return;

    // 获取按钮实际尺寸
    const btnRect = taskButton.getBoundingClientRect();
    const btnWidth = btnRect.width || 130;
    const btnHeight = btnRect.height || 50;

    // 取显示器中心位置,按钮围绕显示器中央小范围随机
    const monitor = document.querySelector('.computer-monitor');
    const monitorRect = monitor
        ? monitor.getBoundingClientRect()
        : { left: window.innerWidth / 2 - 240, right: window.innerWidth / 2 + 240, top: window.innerHeight / 2 - 150, bottom: window.innerHeight / 2 + 150 };

    const cx = monitorRect.left + monitorRect.width / 2;
    const cy = monitorRect.top + monitorRect.height / 2;

    // 距离显示器中心的活动半径(px)
    const radius = 220;
    // 避开左右 cubicle 浅灰条带(各 80px)
    const sidePad = 100;
    // 避开上下边缘
    const topPad = 80;
    const bottomPad = 120;

    // 可用范围:以显示器中心为基准,左右 radius、上下 radius 的矩形,
    // 再裁剪到深色区域内(sidePad/topPad/bottomPad)
    const minX = Math.max(sidePad, cx - radius);
    const maxX = Math.min(window.innerWidth - sidePad - btnWidth, cx + radius - btnWidth);
    const minY = Math.max(topPad, cy - radius);
    const maxY = Math.min(window.innerHeight - bottomPad - btnHeight, cy + radius - btnHeight);

    let randomX, randomY;
    let attempts = 0;

    // 重试:确保不与显示器重叠
    do {
        randomX = minX + Math.random() * (maxX - minX);
        randomY = minY + Math.random() * (maxY - minY);
        attempts++;
    } while (
        attempts < 30 &&
        randomX + btnWidth > monitorRect.left &&
        randomX < monitorRect.right &&
        randomY + btnHeight > monitorRect.top &&
        randomY < monitorRect.bottom
    );

    taskButton.style.left = randomX + 'px';
    taskButton.style.top = randomY + 'px';
    taskButton.classList.remove('fading');
}

function handleTaskClick() {
    const taskButton = document.getElementById('task-button');
    if (!taskButton || taskButton.classList.contains('fading')) return;
    
    clickCount++;
    const counter = document.getElementById('click-counter');
    if (counter) counter.textContent = `${clickCount} / ${MAX_CLICKS}`;
    
    // 按钮消失动画
    taskButton.classList.add('fading');
    
    if (clickCount >= MAX_CLICKS) {
        // 完成所有点击
        setTimeout(() => {
            completeScene3A();
        }, 800);
    } else {
        // 下一个随机位置
        setTimeout(() => {
            moveTaskButton();
        }, 500);
    }
}

function completeScene3A() {
    // 隐藏任务按钮和计数器
    const taskButton = document.getElementById('task-button');
    if (taskButton) taskButton.style.display = 'none';
    const counter = document.getElementById('click-counter');
    if (counter) counter.style.display = 'none';

    // 显示继续按钮
    setTimeout(() => {
        showContinueButton(() => {
            switchScene('scene-4');
        });
    }, 1000);
}

function setupScene3AEvents() {
    // 逻辑已移至 initScene3A
}

// ========== 场景4 - 选项消逝 ==========
let scene4Initialized = false;

function initScene4() {
    if (scene4Initialized) return;
    scene4Initialized = true;
    
    const options = document.querySelectorAll('.night-option');
    let optionsFaded = 0;
    
    options.forEach(option => {
        option.addEventListener('mouseenter', () => {
            if (!option.classList.contains('fading')) {
                option.classList.add('fading');
                optionsFaded++;
                checkOptionsFaded(optionsFaded, options.length);
            }
        });
        
        option.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!option.classList.contains('fading')) {
                option.classList.add('fading');
                optionsFaded++;
                checkOptionsFaded(optionsFaded, options.length);
            }
        });
    });
    
    const tryMessageBtn = document.getElementById('try-message-btn');
    tryMessageBtn.addEventListener('click', () => {
        tryMessageBtn.style.display = 'none';
        const messageBubble = document.getElementById('message-bubble');
        messageBubble.style.display = 'block';
        
        setTimeout(() => {
            const replyBubble = document.getElementById('reply-bubble');
            replyBubble.style.display = 'block';
            showInnerMonologue('scene4-monologue', '算了...');
            
            setTimeout(() => {
                showContinueButton(() => {
                    switchScene('scene-5');
                });
            }, 2000);
        }, 3000);
    });
}

function checkOptionsFaded(fadedCount, totalCount) {
    if (fadedCount >= totalCount) {
        setTimeout(() => {
            document.getElementById('try-message-btn').style.display = 'inline-block';
        }, 800);
    }
}

function resetScene4() {
    scene4Initialized = false;
    const options = document.querySelectorAll('.night-option');
    options.forEach(option => {
        option.classList.remove('fading');
    });
}

function setupScene4Events() {
    // 事件在 initScene4 中设置
}

// ========== 场景5 - 镜子 ==========
function initScene5() {
    const mirror = document.getElementById('mirror');
    let mirrorClicked = false;
    
    mirror.addEventListener('click', () => {
        if (mirrorClicked) return;
        mirrorClicked = true;
        
        const crackOverlay = document.getElementById('crack-overlay');
        crackOverlay.style.display = 'block';
        
        showInnerMonologue('scene5-monologue', '你可能觉得我看起来很正常。但每天早上醒来，都像是在水里挣扎...');
        
        setTimeout(() => {
            showContinueButton(() => {
                switchScene('transition-scene');
            });
        }, 4000);
    });
}

function setupScene5Events() {
    // 事件在 initScene5 中设置
}

// ========== 过渡动画 ==========
function initTransition() {
    const lightSpotsContainer = document.querySelector('.light-spots');
    lightSpotsContainer.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const spot = document.createElement('div');
            spot.className = 'light-spot';
            spot.style.left = `${Math.random() * 80 + 10}%`;
            spot.style.animationDelay = `${Math.random() * 0.5}s`;
            lightSpotsContainer.appendChild(spot);
        }, i * 400);
    }
    
    setTimeout(() => {
        completeExperience();
    }, 5000);
}

// 完成体验
function completeExperience() {
    appState.depressionCompleted = true;
    localStorage.setItem('depressionCompleted', 'true');
    document.getElementById('completed-badge').style.display = 'block';
    switchPage('science-page');
}

// 生成海报（模拟）
function generatePoster() {
    alert('海报生成功能：在实际项目中，这里可以使用html2canvas等库将页面内容转换为图片供用户分享。');
}
