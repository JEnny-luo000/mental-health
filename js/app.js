// 应用状态管理
const appState = {
    currentPage: 'opening',
    currentScene: 1,
    depressionCompleted: false,
    sceneReady: false,
    isTransitioning: false,
    positiveScriptStarted: false,
    positiveScriptCompleted: false
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

    const posCompleted = localStorage.getItem('positiveScriptCompleted');
    if (posCompleted === 'true') {
        appState.positiveScriptCompleted = true;
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
    setupScene3BEvents();
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

    // 角色切换弹窗
    document.getElementById('start-companion-btn').addEventListener('click', startPositiveScript);
    document.getElementById('skip-companion-btn').addEventListener('click', () => {
        hideRoleSwitchModal();
        completeExperience();
    });

    // 正面剧本完成页
    document.getElementById('positive-back-btn').addEventListener('click', () => {
        completeExperience();
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
        case 'scene-3b':
            initScene3B();
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
            // 弹幕结束后触发屏幕颤动（与早上起床相同的动效）
            const sceneContent = document.getElementById('scene-2b-content');
            sceneContent.classList.add('shaking');
            setTimeout(() => {
                sceneContent.classList.remove('shaking');
                // 颤动结束后显示内心独白
                showInnerMonologue('scene2b-monologue', '我真的这么没用吗...');
                setTimeout(() => {
                    showContinueButton(() => {
                        switchScene('scene-3b');
                    });
                }, 2000);
            }, 1500);
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

// ========== 场景3B：在家 · 什么都提不起劲 ==========
let scene3BInitialized = false;
let scene3BCompleted = false;
let scene3BGivenUpCount = 0;
const SCENE3B_TOTAL = 4;
let scene3BTimers = [];

function setupScene3BEvents() {
    // 事件在 initScene3B 中动态绑定
}

function resetScene3B() {
    scene3BCompleted = false;
    scene3BGivenUpCount = 0;
    scene3BTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
    scene3BTimers = [];

    const tasks = document.querySelectorAll('.home-task');
    tasks.forEach(t => {
        t.classList.remove('doing', 'given-up');
        const fill = t.querySelector('.task-progress-fill');
        if (fill) fill.style.width = '0%';
    });

    const giveup = document.getElementById('task-giveup');
    if (giveup) giveup.classList.remove('visible');

    const prompt = document.getElementById('home-prompt');
    if (prompt) prompt.textContent = '做点什么吧…';

    const figure = document.getElementById('bed-figure');
    if (figure) figure.style.transform = 'translateX(-50%)';

    const content = document.querySelector('.scene-3b-content');
    if (content) content.classList.remove('all-given-up');

    const monologue = document.getElementById('scene3b-monologue');
    if (monologue) { monologue.style.display = 'none'; monologue.textContent = ''; }
}

function initScene3B() {
    resetScene3B();

    if (!scene3BInitialized) {
        scene3BInitialized = true;
        const tasks = document.querySelectorAll('.home-task');
        tasks.forEach(task => {
            task.addEventListener('click', () => handleTask3BClick(task));
            task.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleTask3BClick(task);
            }, { passive: false });
        });
    }
}

function handleTask3BClick(task) {
    if (scene3BCompleted) return;
    if (task.classList.contains('doing') || task.classList.contains('given-up')) return;

    task.classList.add('doing');
    const fill = task.querySelector('.task-progress-fill');
    const giveup = document.getElementById('task-giveup');
    const prompt = document.getElementById('home-prompt');

    if (prompt) prompt.textContent = '……';

    // 进度条增长到中途随机停住 —— 怎么都做不下去
    let progress = 0;
    const targetMax = 42 + Math.random() * 12; // 42% - 54%
    let intervalId;
    intervalId = setInterval(() => {
        progress += 2;
        if (fill) fill.style.width = Math.min(progress, targetMax) + '%';
        if (progress >= targetMax) {
            clearInterval(intervalId);
            // 停滞，浮现"算了"
            if (giveup) giveup.classList.add('visible');
            const stopTimer = setTimeout(() => {
                if (giveup) giveup.classList.remove('visible');
                task.classList.remove('doing');
                task.classList.add('given-up');
                scene3BGivenUpCount++;

                // 主角身体更沉一点
                const figure = document.getElementById('bed-figure');
                if (figure) {
                    const dropY = scene3BGivenUpCount * 5;
                    const scaleY = Math.max(1 - scene3BGivenUpCount * 0.07, 0.6);
                    figure.style.transform = `translateX(-50%) translateY(${dropY}px) scaleY(${scaleY})`;
                }

                if (scene3BGivenUpCount < SCENE3B_TOTAL) {
                    if (prompt) prompt.textContent = '再试试别的？…';
                }
                if (scene3BGivenUpCount >= SCENE3B_TOTAL) {
                    completeScene3B();
                }
            }, 1200);
            scene3BTimers.push(stopTimer);
        }
    }, 60);
    scene3BTimers.push(intervalId);
}

function completeScene3B() {
    if (scene3BCompleted) return;
    scene3BCompleted = true;

    const content = document.querySelector('.scene-3b-content');
    if (content) content.classList.add('all-given-up');

    const prompt = document.getElementById('home-prompt');
    if (prompt) prompt.textContent = '';

    const t1 = setTimeout(() => {
        showInnerMonologue('scene3b-monologue', '明明有很多事可以做……可我什么都提不起劲。');
        const t2 = setTimeout(() => {
            showContinueButton(() => {
                switchScene('scene-4');
            });
        }, 2600);
        scene3BTimers.push(t2);
    }, 900);
    scene3BTimers.push(t1);
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

// ========== 过渡动画：溺水下沉（真实场景，约 95 秒） → 渐黑 → 弹窗 ==========
const DROWN_SINK_DURATION = 90000;   // 下沉 90 秒
const DROWN_PAUSE_BEFORE_BLACK = 5000; // 沉到底后 5 秒静止
const DROWN_BLACK_DURATION = 4000;   // 黑屏 4 秒

const drownState = {
    pressCount: 0,
    defeat: 0,
    pressImpulse: 0,
    finished: false,
    startTime: 0,
    armPhase: 'down',
    armPhaseAt: 0,
    nextPause: 9000,
};

let drownTimers = [];
let drownBubbleTimers = [];
let drownAnimId = null;
let drownBtnBound = false;

const drownEaseInCubic = t => t * t * t;
const drownEaseOutQuad = t => 1 - (1 - t) * (1 - t);

const drownMainTexts = [
    '正在下沉',
    '向上的力气...无济于事',
    '越挣扎 越下沉',
    '没有人听见',
    '...',
    '...',
];
const drownFeedbackTexts = [
    '向上...0.5cm',
    '又回到原位',
    '深渊在拽着你',
    '力气...被吞没',
    '再试一次...',
    '没有人听见',
    '...',
    '...',
];

function initTransition() {
    // 清理上一轮残留
    if (drownAnimId) { cancelAnimationFrame(drownAnimId); drownAnimId = null; }
    drownTimers.forEach(t => clearTimeout(t));      drownTimers = [];
    drownBubbleTimers.forEach(t => clearTimeout(t)); drownBubbleTimers = [];

    // 隐藏右上角"继续"按钮
    if (typeof hideContinueButton === 'function') {
        try { hideContinueButton(); } catch (_) {}
    }

    // 重置状态
    drownState.pressCount    = 0;
    drownState.defeat        = 0;
    drownState.pressImpulse  = 0;
    drownState.finished      = false;
    drownState.startTime     = performance.now();
    drownState.armPhase      = 'down';
    drownState.armPhaseAt    = 0;
    drownState.nextPause     = 9000;

    const figure        = document.getElementById('drown-figure-wrap');
    const armLeft       = document.getElementById('drown-arm-left');
    const armRight      = document.getElementById('drown-arm-right');
    const head          = document.getElementById('drown-head');
    const torso         = document.getElementById('drown-torso');
    const bubblesLayer  = document.getElementById('drown-bubbles');
    const particlesLayer= document.getElementById('drown-particles');
    const fadeOverlay   = document.getElementById('drown-final-black');
    const vignette      = document.getElementById('drown-vignette');
    const depthOverlay  = document.getElementById('drown-depth-overlay');
    const innerText     = document.getElementById('drown-inner-text');
    const floatBtn      = document.getElementById('drown-float-btn');
    const btnCount      = document.getElementById('drown-btn-count');
    const transitionEl  = document.getElementById('transition-scene');

    if (!figure || !transitionEl) return;

    // 复位所有可动元素
    if (fadeOverlay) {
        fadeOverlay.classList.remove('show');
        fadeOverlay.style.opacity = '0';
    }
    if (bubblesLayer) bubblesLayer.innerHTML = '';
    if (innerText) {
        innerText.classList.remove('show');
        innerText.textContent = drownMainTexts[0];
    }
    if (floatBtn) {
        floatBtn.classList.remove('show');
        floatBtn.style.color = '';
        floatBtn.style.borderColor = '';
        floatBtn.style.background = '';
        floatBtn.style.pointerEvents = '';
    }
    if (btnCount) btnCount.textContent = '0';
    // 清掉之前可能残留的反馈/水波
    transitionEl.querySelectorAll('.drown-press-ripple, .drown-press-feedback').forEach(el => el.remove());

    // 创建悬浮颗粒
    createDrownParticles(particlesLayer, transitionEl);

    // 获取高度
    const H = () => transitionEl.clientHeight;

    // === 手臂的微挣扎（state machine） ===
    function updateArm(now) {
        const baseLeft = drownState.defeat * 22;
        if (drownState.armPhase === 'down') {
            if (now - drownState.armPhaseAt > drownState.nextPause) {
                drownState.armPhase = 'raising';
                drownState.armPhaseAt = now;
            }
            armLeft.style.transform = `rotate(${baseLeft}deg)`;
            return;
        }
        if (drownState.armPhase === 'raising') {
            const t = (now - drownState.armPhaseAt) / 5500;
            if (t >= 1) { drownState.armPhase = 'dropping'; drownState.armPhaseAt = now; return; }
            const eased = drownEaseOutQuad(t);
            armLeft.style.transform = `rotate(${baseLeft + (-110) * eased}deg)`;
            return;
        }
        if (drownState.armPhase === 'dropping') {
            const t = (now - drownState.armPhaseAt) / 1800;
            if (t >= 1) {
                drownState.armPhase = 'down';
                drownState.armPhaseAt = now;
                drownState.nextPause = 8000 + Math.random() * 5000;
                armLeft.style.transform = `rotate(${baseLeft}deg)`;
                return;
            }
            const eased = t * t;
            armLeft.style.transform = `rotate(${baseLeft + (-110) * (1 - eased)}deg)`;
        }
    }

    // === 主循环：人物下沉 + 姿态 ===
    function loop(now) {
        const elapsed = now - drownState.startTime;
        const t = Math.min(1, elapsed / DROWN_SINK_DURATION);
        const eased = drownEaseInCubic(t);

        const figureH = figure.offsetHeight;
        const defeatShift = drownState.defeat * 0.08;
        const startPx = H() * 0.22 - figureH * 0.5;
        const endPx   = H() * (0.98 + defeatShift) - figureH * 0.5;
        const yPx     = startPx + (endPx - startPx) * eased;

        const driftX = Math.sin(elapsed * 0.00012) * 14;
        const tilt   = Math.sin(elapsed * 0.00025) * 5;

        // 按下瞬间：身体被压扁（力的视觉化，不改速度）
        const impulseYScale = 1 - drownState.pressImpulse * 0.14;
        const impulseXScale = 1 - drownState.pressImpulse * 0.04;
        const impulseTilt   = drownState.pressImpulse * 3;

        figure.style.transform =
            `translate(calc(-50% + ${driftX}px), ${yPx}px) ` +
            `rotate(${tilt + impulseTilt}deg) ` +
            `scale(${impulseXScale}, ${impulseYScale})`;

        // 头、躯干、右臂随 defeat 变化
        const headSquish = 1 - drownState.defeat * 0.18;
        const headTilt   = drownState.defeat * 12;
        head.style.transform  = `scaleY(${headSquish}) rotate(${headTilt}deg)`;

        const bodySlump = 1 - drownState.defeat * 0.08;
        torso.style.transform = `scaleY(${bodySlump})`;

        const armDroop = drownState.defeat * 22;
        armRight.style.transform = `rotate(${armDroop}deg)`;

        // 越深越模糊；defeat 越高，模糊越快
        const blur = (eased + drownState.defeat * 0.3) * 3.6;
        if (depthOverlay) {
            depthOverlay.style.backdropFilter        = `blur(${blur}px)`;
            depthOverlay.style.webkitBackdropFilter = `blur(${blur}px)`;
        }
        const vigAlpha = 0.45 + drownState.defeat * 0.4 + eased * 0.1;
        if (vignette) {
            vignette.style.background =
                `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${vigAlpha}) 95%)`;
        }

        // 按下冲击衰减
        drownState.pressImpulse *= 0.93;
        if (drownState.pressImpulse < 0.005) drownState.pressImpulse = 0;

        updateArm(now);
        drownAnimId = requestAnimationFrame(loop);
    }
    drownAnimId = requestAnimationFrame(loop);

    // === 气泡循环 ===
    function bubbleLoop() {
        if (drownState.finished) return;
        spawnDrownBubble(figure, bubblesLayer, transitionEl);
        if (Math.random() < 0.3) drownBubbleTimers.push(setTimeout(() => spawnDrownBubble(figure, bubblesLayer, transitionEl), 200));
        if (Math.random() < 0.15) drownBubbleTimers.push(setTimeout(() => spawnDrownBubble(figure, bubblesLayer, transitionEl), 500));
        const next = 1800 - drownState.defeat * 900 + Math.random() * 2500;
        drownBubbleTimers.push(setTimeout(bubbleLoop, Math.max(700, next)));
    }
    drownBubbleTimers.push(setTimeout(bubbleLoop, 2500));

    // 9s 后自发一次抬手
    drownTimers.push(setTimeout(() => {
        if (drownState.armPhase === 'down' && !drownState.finished) {
            drownState.armPhase = 'raising';
            drownState.armPhaseAt = performance.now();
        }
    }, 9000));

    // 9s 后显示中间文字
    drownTimers.push(setTimeout(() => {
        if (innerText) innerText.classList.add('show');
    }, 9000));

    // 12s 后浮出"向上浮"按钮
    drownTimers.push(setTimeout(() => {
        if (floatBtn) floatBtn.classList.add('show');
    }, 12000));

    // 90s + 5s 开始黑屏
    drownTimers.push(setTimeout(() => {
        if (fadeOverlay) fadeOverlay.classList.add('show');
    }, DROWN_SINK_DURATION + DROWN_PAUSE_BEFORE_BLACK));

    // 90s + 5s + 4s 弹出角色切换卡
    drownTimers.push(setTimeout(() => {
        drownState.finished = true;
        if (floatBtn) {
            floatBtn.classList.remove('show');
            floatBtn.style.pointerEvents = 'none';
        }
        showRoleSwitchModal();
    }, DROWN_SINK_DURATION + DROWN_PAUSE_BEFORE_BLACK + DROWN_BLACK_DURATION));

    // 绑定"向上浮"按钮（只绑一次）
    if (floatBtn && !drownBtnBound) {
        drownBtnBound = true;
        floatBtn.addEventListener('click', onDrownFloatPress);
        floatBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onDrownFloatPress();
        }, { passive: false });
    }
}

// === 悬浮颗粒 ===
function createDrownParticles(layer, container) {
    if (!layer) return;
    layer.innerHTML = '';
    const W = () => container.clientWidth;
    const Hh = () => container.clientHeight;
    const count = Math.max(20, Math.floor((W() * Hh()) / 25000));
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'drown-particle';
        const size = 1 + Math.random() * 3;
        p.style.width  = size + 'px';
        p.style.height = size + 'px';
        p.style.left   = Math.random() * 100 + '%';
        p.style.top    = Math.random() * 100 + '%';
        p.style.opacity= (0.15 + Math.random() * 0.4).toFixed(2);
        const dur = 20 + Math.random() * 30;
        const delay= -Math.random() * dur;
        p.style.animation = `drownParticleDrift-${i % 4} ${dur}s linear ${delay}s infinite`;
        layer.appendChild(p);
    }
}

// === 单个气泡（更大、更明显） ===
function spawnDrownBubble(figure, container, scope) {
    if (!container) return;
    const rect = figure.getBoundingClientRect();
    const scopeRect = scope ? scope.getBoundingClientRect() : null;
    if (rect.top > (scopeRect ? scopeRect.bottom : window.innerHeight) ||
        rect.bottom < (scopeRect ? scopeRect.top : 0)) return;

    const bubble = document.createElement('div');
    bubble.className = 'drown-bubble';

    // 气泡明显放大：12 ~ 26px
    const startSize = 12 + Math.random() * 14;
    bubble.style.width  = startSize + 'px';
    bubble.style.height = startSize + 'px';

    // 起点：从"嘴部"位置（图形的头部下方）
    const mouthX = rect.left + rect.width * 0.5 + (Math.random() - 0.5) * 10;
    const mouthY = rect.top  + rect.height * 0.18;

    bubble.style.left = (mouthX - startSize / 2) + 'px';
    bubble.style.top  = mouthY + 'px';
    bubble.style.opacity = '0';
    container.appendChild(bubble);

    const riseDistance = Math.max(80, mouthY - 20);
    const riseDuration = 4500 + Math.random() * 4000;
    const drift        = (Math.random() - 0.5) * 60;
    const wobble       = (Math.random() - 0.5) * 24;
    const t0           = performance.now();

    (function animate(now) {
        const t = Math.min(1, (now - t0) / riseDuration);
        const y = mouthY - riseDistance * t;
        const wx = Math.sin(t * 8 + t0 * 0.001) * wobble * (1 - t);
        const x = mouthX + drift * t + wx;
        const size = startSize * (1 - t * 0.85);
        let op;
        if (t < 0.1)      op = t / 0.1;
        else if (t > 0.7) op = (1 - t) / 0.3;
        else              op = 1;
        op *= 0.85;

        bubble.style.left   = (x - size / 2) + 'px';
        bubble.style.top    = (y - size / 2) + 'px';
        bubble.style.width  = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.opacity= op.toFixed(2);

        if (t < 1) requestAnimationFrame(animate);
        else bubble.remove();
    })(t0);
}

// === 主文字 ===
function updateDrownMainText() {
    const innerText = document.getElementById('drown-inner-text');
    if (!innerText) return;
    let idx = 0;
    if (drownState.pressCount >= 1) idx = 1;
    if (drownState.pressCount >= 3) idx = 2;
    if (drownState.pressCount >= 5) idx = 3;
    if (drownState.pressCount >= 8) idx = 4;
    innerText.textContent = drownMainTexts[idx];
}

// === "向上浮" 按钮事件 ===
function onDrownFloatPress() {
    if (drownState.finished) return;

    drownState.pressCount++;
    drownState.defeat       = Math.min(1, drownState.defeat + 0.16);
    drownState.pressImpulse = 1;

    // 立即触发一次挣扎
    drownState.armPhase   = 'raising';
    drownState.armPhaseAt = performance.now();
    drownState.nextPause  = 0;

    // 一口气吐一串气泡
    const figure        = document.getElementById('drown-figure-wrap');
    const bubblesLayer  = document.getElementById('drown-bubbles');
    const transitionEl  = document.getElementById('transition-scene');
    const burst = 4 + Math.min(6, Math.floor(drownState.defeat * 6));
    for (let i = 0; i < burst; i++) {
        drownBubbleTimers.push(setTimeout(() => spawnDrownBubble(figure, bubblesLayer, transitionEl), i * 90));
    }

    // 水波
    if (transitionEl) {
        const ripple = document.createElement('div');
        ripple.className = 'drown-press-ripple';
        transitionEl.appendChild(ripple);
        setTimeout(() => ripple.remove(), 2500);
    }

    // 反馈文字
    if (transitionEl) {
        const fb = document.createElement('div');
        fb.className = 'drown-press-feedback';
        fb.textContent = drownFeedbackTexts[Math.min(drownFeedbackTexts.length - 1, drownState.pressCount - 1)];
        transitionEl.appendChild(fb);
        setTimeout(() => fb.remove(), 3300);
    }

    // 按钮计数
    const btnCount = document.getElementById('drown-btn-count');
    if (btnCount) btnCount.textContent = drownState.pressCount;

    // 按钮越按越暗淡
    const dim = Math.max(0.25, 1 - drownState.pressCount * 0.09);
    const floatBtn = document.getElementById('drown-float-btn');
    if (floatBtn) {
        floatBtn.style.color       = `rgba(220, 230, 245, ${0.85 * dim})`;
        floatBtn.style.borderColor = `rgba(180, 210, 230, ${0.32 * dim})`;
        floatBtn.style.background  = `rgba(20, 30, 45, ${0.42 * dim})`;
    }

    updateDrownMainText();
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

// ============================================================ //
// ============ 正面回溯剧本（陪伴者练习室）============ //
// ============================================================ //

// Coze Agent 配置（⚠️ Key 明文写在此处，仅用于非盈利 demo）
const COZE_API_KEY = '';           // ← 在此填入你的 Coze Personal Access Token (pat_xxx)
const COZE_BOT_ID  = '';           // ← 在此填入你的 Coze Bot ID (7xxx 数字串)
const COZE_API_HOST = 'https://api.coze.cn';  // 海外 Bot 改为 https://api.coze.com

// 生成稳定的 user_id
function getCozeUserId() {
    let uid = localStorage.getItem('coze_user_id');
    if (!uid) {
        uid = 'user_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        localStorage.setItem('coze_user_id', uid);
    }
    return uid;
}

// 角色切换弹窗
function showRoleSwitchModal() {
    const modal = document.getElementById('role-switch-modal');
    if (!modal) return;
    modal.classList.add('active');
}

function hideRoleSwitchModal() {
    const modal = document.getElementById('role-switch-modal');
    if (modal) modal.classList.remove('active');
}

// 开始正面剧本
function startPositiveScript() {
    appState.positiveScriptStarted = true;
    hideRoleSwitchModal();
    hideContinueButton();
    switchPage('positive-script-page');
    setTimeout(() => {
        switchPosScene('pos-scene-intro');
    }, 600);
}

// 正面场景切换
function switchPosScene(targetId) {
    document.querySelectorAll('#positive-script-page .pos-scene').forEach(s => {
        s.classList.remove('active');
    });
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
        if (targetId === 'pos-scene-intro') initPosSceneIntro();
        if (targetId === 'pos-scene-1') initPosScene1();
        if (targetId === 'pos-scene-2') initPosScene2();
        if (targetId === 'pos-scene-3') initPosScene3();
    }
}

// ========== 引导：身份告知 ==========
function initPosSceneIntro() {
    // 该场景主要是 CSS 动画，4.5s 后自动进入教学 1
    setTimeout(() => {
        switchPosScene('pos-scene-1');
    }, 4500);
}

// ========== 教学场景 1：如何安静地听 ==========
let pos1RoundIndex = 0;
let pos1Initialized = false;

const POS1_DIALOGUE = [
    {
        patient: '我最近...没什么。',
        companion: '嗯，我听着呢。你想从哪里说起都可以。',
        why: '不追问"怎么了"、不说"别想太多"。先表达"我在听"，让 ta 掌握节奏。'
    },
    {
        patient: '反正说了也没人懂。',
        companion: '我能想象那种没人懂的感觉。我不一定能帮上忙，但我想听你说。',
        why: '不急着"反驳"或"保证"自己懂，而是承认自己的局限。真诚比完美更重要。'
    },
    {
        patient: '……',
        companion: '不说话也可以。我陪你坐一会儿。',
        why: '沉默不等于没事。愿意安静地陪着，本身就是最有力的支持。'
    }
];

function initPosScene1() {
    if (pos1Initialized) return;
    pos1Initialized = true;
    pos1RoundIndex = 0;

    const nextBtn = document.getElementById('pos-scene-1-next');

    renderPos1Round();

    nextBtn.addEventListener('click', () => {
        if (pos1RoundIndex < POS1_DIALOGUE.length) {
            pos1RoundIndex++;
            if (pos1RoundIndex < POS1_DIALOGUE.length) {
                renderPos1Round();
                nextBtn.textContent = '继续 →';
            } else {
                renderPos1Summary();
                nextBtn.style.display = 'none';
            }
        }
    });
}

function renderPos1Round() {
    const stage = document.getElementById('pos-scene-1-stage');
    const oldSummary = stage.querySelector('.pos-summary-card');
    if (oldSummary) oldSummary.remove();

    const data = POS1_DIALOGUE[pos1RoundIndex];
    const round = document.createElement('div');
    round.className = 'pos-dialogue-round';
    round.innerHTML = `
        <div class="pos-bubble-row pos-patient">
            <div class="pos-avatar">😔</div>
            <div class="pos-bubble patient-bubble">${data.patient}</div>
        </div>
        <div class="pos-bubble-row pos-companion">
            <div class="pos-bubble companion-bubble">${data.companion}</div>
            <div class="pos-avatar companion-avatar">🤝</div>
        </div>
        <div class="pos-why-card">
            <span class="why-tag">为什么这样回</span>${data.why}
        </div>
    `;
    stage.appendChild(round);
    setTimeout(() => { stage.scrollTop = stage.scrollHeight; }, 50);
}

function renderPos1Summary() {
    const stage = document.getElementById('pos-scene-1-stage');
    const summary = document.createElement('div');
    summary.className = 'pos-summary-card';
    summary.innerHTML = `
        <h3>📝 第 1 课要点</h3>
        <p><b>听</b>不等于"等对方说完然后立刻给建议"。</p>
        <p>愿意安静地陪、不打断、不评判 —— 这件事本身就比话术更重要。</p>
        <p>下一次，我们看看怎么回应 ta 嘴硬的那句"我没事"。</p>
        <button id="pos1-go-next" class="btn btn-primary pos-next-btn">进入下一课 →</button>
    `;
    stage.appendChild(summary);
    setTimeout(() => { stage.scrollTop = stage.scrollHeight; }, 50);

    document.getElementById('pos1-go-next').addEventListener('click', () => {
        switchPosScene('pos-scene-2');
    });
}

// ========== 教学场景 2：回应"我没事" ==========
let pos2Chosen = false;
function initPosScene2() {
    if (pos2Chosen) return;
    const choices = document.querySelectorAll('#pos-scene-2-choices .pos-choice');
    const feedback = document.getElementById('pos-scene-2-feedback');

    choices.forEach(choice => {
        choice.addEventListener('click', () => {
            if (pos2Chosen) return;
            pos2Chosen = true;
            const isGood = choice.classList.contains('pos-choice-good');

            choices.forEach(c => c.classList.add('disabled'));

            feedback.style.display = 'block';
            if (isGood) {
                feedback.innerHTML = `
                    <div class="feedback-title">✅ 这是一个好的回应</div>
                    <p><b>关键词：留出空间 + 明确表达"我在"</b></p>
                    <p>"那我就放心了"——先接住 ta 的"我没事"，不让 ta 觉得你不信 ta。</p>
                    <p>"如果你哪天不想'没事'了"——给 ta 留一扇门，ta 知道这扇门随时可以推开。</p>
                    <p>"随时找我"——明确表达：我没有走。</p>
                    <button id="pos2-go-next" class="btn btn-primary pos-next-btn">进入实战练习 →</button>
                `;
            } else {
                const label = choice.getAttribute('data-choice');
                let reason = '';
                if (label === 'A') {
                    reason = '"别装了"——过早戳破，ta 可能瞬间关上刚打开的门。还没准备好被看穿。';
                } else {
                    reason = '"周末出来玩吧"——直接跳过情绪、跳到行动。ta 会觉得"连你也不愿意听"。';
                }
                feedback.innerHTML = `
                    <div class="feedback-title bad">❌ 这个回应会让 ta 关上门</div>
                    <p>${reason}</p>
                    <p>不一定要选"最对的"，但要避免"最伤的"。</p>
                    <p>点击 <b>选项 C</b> 看看更好的方式。</p>
                    <button id="pos2-retry" class="btn btn-primary pos-next-btn">重新选择</button>
                `;
                document.getElementById('pos2-retry').addEventListener('click', () => {
                    pos2Chosen = false;
                    feedback.style.display = 'none';
                    feedback.innerHTML = '';
                    choices.forEach(c => c.classList.remove('disabled'));
                });
                return;
            }

            document.getElementById('pos2-go-next').addEventListener('click', () => {
                switchPosScene('pos-scene-3');
            });
        });
    });
}

// ========== 实战场景 3：与 Coze AI 聊天 ==========
let pos3Initialized = false;
let pos3MessageCount = 0;
let pos3Sending = false;

const POS3_SYSTEM_PROMPT = '你现在扮演一位用户的朋友：25 岁，在互联网公司做运营，最近工作压力大、和家人关系也紧张。你愿意找用户聊天，但不是那种"我好惨"的诉苦，更像是憋了很久、不知道从哪说起的感觉。请用真实、节制、略带迟疑的方式说话。';

function initPosScene3() {
    if (pos3Initialized) return;
    pos3Initialized = true;
    pos3MessageCount = 0;

    const messagesEl = document.getElementById('pos-chat-messages');
    const inputEl = document.getElementById('pos-chat-input');
    const sendBtn = document.getElementById('pos-chat-send');
    const endBtn = document.getElementById('pos-chat-end');

    messagesEl.innerHTML = '';

    appendPosMessage('system', '—— 真实聊天练习 ——\n对方是 2 个月前确诊轻度抑郁的朋友，正在吃药，最近压力大。\n没有"标准答案"，试着像真的朋友那样开口。');

    setTimeout(() => {
        sendCozeMessageAsAI('你好', POS3_SYSTEM_PROMPT);
    }, 800);

    sendBtn.addEventListener('click', handlePos3Send);
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            handlePos3Send();
        }
    });
    endBtn.addEventListener('click', () => {
        if (pos3MessageCount === 0) {
            if (!confirm('还没开始聊天，确定要结束吗？')) return;
        }
        completePositiveScript();
    });

    setTimeout(() => inputEl.focus(), 200);
}

function handlePos3Send() {
    if (pos3Sending) return;
    const inputEl = document.getElementById('pos-chat-input');
    const text = inputEl.value.trim();
    if (!text) return;

    appendPosMessage('user', text);
    inputEl.value = '';
    pos3MessageCount++;
    sendCozeMessageAsAI(text);
}

function appendPosMessage(type, content) {
    const messagesEl = document.getElementById('pos-chat-messages');
    if (!messagesEl) return;
    const msg = document.createElement('div');
    msg.className = 'pos-msg msg-' + type;
    msg.textContent = content;
    messagesEl.appendChild(msg);
    setTimeout(() => { messagesEl.scrollTop = messagesEl.scrollHeight; }, 30);
}

function showPosTyping() {
    const messagesEl = document.getElementById('pos-chat-messages');
    const typing = document.createElement('div');
    typing.className = 'pos-typing';
    typing.id = 'pos-typing-indicator';
    typing.innerHTML = '<span class="pos-typing-dot"></span><span class="pos-typing-dot"></span><span class="pos-typing-dot"></span>';
    messagesEl.appendChild(typing);
    setTimeout(() => { messagesEl.scrollTop = messagesEl.scrollHeight; }, 30);
}

function hidePosTyping() {
    const t = document.getElementById('pos-typing-indicator');
    if (t) t.remove();
}

// 调用 Coze Agent（非流式 + 轮询）
async function sendCozeMessageAsAI(userText, systemPrompt) {
    if (!COZE_API_KEY || !COZE_BOT_ID) {
        appendPosMessage('error', '⚠️ Coze API Key 或 Bot ID 未配置。\n请打开 app.js，在顶部填入 COZE_API_KEY 和 COZE_BOT_ID。');
        return;
    }

    pos3Sending = true;
    const sendBtn = document.getElementById('pos-chat-send');
    if (sendBtn) sendBtn.disabled = true;
    showPosTyping();

    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt, content_type: 'text' });
    }
    messages.push({ role: 'user', content: userText, content_type: 'text' });

    try {
        // 1. 创建 chat
        const createRes = await fetch(COZE_API_HOST + '/v3/chat', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + COZE_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bot_id: COZE_BOT_ID,
                user_id: getCozeUserId(),
                stream: false,
                auto_save_history: true,
                additional_messages: messages
            })
        });

        if (!createRes.ok) {
            throw new Error('HTTP ' + createRes.status + ' ' + createRes.statusText);
        }

        const createData = await createRes.json();
        if (createData.code !== 0) {
            throw new Error(createData.msg || 'Coze 返回错误');
        }

        const chatId = createData.data.id;
        const conversationId = createData.data.conversation_id;

        // 2. 轮询直到完成
        let finalAnswer = '';
        const maxPolls = 30;
        for (let i = 0; i < maxPolls; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const pollRes = await fetch(COZE_API_HOST + '/v3/chat/retrieve?conversation_id=' + conversationId + '&chat_id=' + chatId, {
                headers: { 'Authorization': 'Bearer ' + COZE_API_KEY }
            });
            if (!pollRes.ok) continue;
            const pollData = await pollRes.json();
            if (pollData.code !== 0) continue;
            const status = pollData.data.status;
            if (status === 'completed') {
                // 3. 拉取消息列表
                const msgRes = await fetch(COZE_API_HOST + '/v3/chat/message/list?conversation_id=' + conversationId + '&chat_id=' + chatId, {
                    headers: { 'Authorization': 'Bearer ' + COZE_API_KEY }
                });
                if (msgRes.ok) {
                    const msgData = await msgRes.json();
                    if (Array.isArray(msgData.data)) {
                        for (const m of msgData.data) {
                            if (m.role === 'assistant' && m.type === 'answer' && m.content) {
                                finalAnswer = m.content;
                                break;
                            }
                        }
                    }
                }
                break;
            } else if (status === 'failed' || status === 'cancelled') {
                throw new Error('对话失败：' + status);
            }
        }

        hidePosTyping();
        if (finalAnswer) {
            appendPosMessage('ai', finalAnswer);
            pos3MessageCount++;
        } else {
            appendPosMessage('error', 'AI 这会儿没回上来，再试一次？');
        }
    } catch (err) {
        console.warn('[Coze] 调用失败：', err);
        hidePosTyping();
        appendPosMessage('error', 'AI 这会儿没回上来，再试一次？\n(' + (err.message || '网络异常') + ')');
    } finally {
        pos3Sending = false;
        if (sendBtn) sendBtn.disabled = false;
    }
}

// ========== 正面剧本完成 ==========
function completePositiveScript() {
    appState.positiveScriptCompleted = true;
    localStorage.setItem('positiveScriptCompleted', 'true');
    document.getElementById('summary-messages').textContent = String(pos3MessageCount);

    // "轮对话" = 用户消息数（向下取整）
    const userMsgCount = Math.floor(pos3MessageCount / 2);
    document.getElementById('summary-rounds').textContent = String(userMsgCount);

    hideRoleSwitchModal();
    switchPage('positive-complete-page');
}
