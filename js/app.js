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
    
    // 合并页：原 science-page 已并入 empathy-page，
    // "完成体验"按钮（原 science-next-btn）从合并页底部 → 资源页
    const empathyCompleteBtn = document.getElementById('empathy-complete-btn');
    if (empathyCompleteBtn) {
        empathyCompleteBtn.addEventListener('click', () => {
            switchPage('resources-page');
        });
    }

    // 共情档案页事件
    document.getElementById('share-poster-btn').addEventListener('click', generatePoster);
    const goToResourcesBtn = document.getElementById('go-to-resources-btn');
    if (goToResourcesBtn) {
        goToResourcesBtn.addEventListener('click', () => {
            switchPage('resources-page');
        });
    }


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

// ========== 场景3A：工位上班（老板施压 / 倒计时 / 扣钱 / 加班） ==========
let scene3AEventsBound = false;
let clickCount = 0;
const MAX_CLICKS = 20;
const SCENE3A_TIME_LIMIT = 35;        // 倒计时秒数（紧凑但可完成）
const SCENE3A_INITIAL_SALARY = 200;   // 初始今日工资

const scene3AState = {
    timeLeft: SCENE3A_TIME_LIMIT,
    salary: SCENE3A_INITIAL_SALARY,
    overtime: false,
    finished: false,
    countdownTimer: null,
    bossTimer: null,
    bossHideTimer: null,
};

// 老板话术池（按压力等级递进）
const BOSS_QUOTES = {
    normal: [
        '快点！这点效率？',
        '你在磨蹭什么？',
        '别人早做完了！',
        '别摸鱼了，动起来！',
        '今天必须交！',
        '这进度我怎么看？',
    ],
    warning: [
        '时间不够了！想加班吗？',
        '怎么还没做完？扣钱！',
        '效率太低了！',
        '再不快点扣你工资！',
        '你是来上班的还是来睡觉的？',
    ],
    danger: [
        '加班！今天做不完别想走！',
        '扣50！长记性！',
        '公司养你吃白饭的？',
        '绩效扣分！',
        '这点事都做不好？',
    ],
    overtime: [
        '加班做完才能走！',
        '全部重做！',
        '明天还要不要来了？',
        '别以为下班了就能走！',
        '我看你是不想干了！',
    ],
};

function initScene3A() {
    // 重置状态（支持重复进入）
    scene3AState.timeLeft = SCENE3A_TIME_LIMIT;
    scene3AState.salary = SCENE3A_INITIAL_SALARY;
    scene3AState.overtime = false;
    scene3AState.finished = false;
    clearScene3ATimers();
    clickCount = 0;

    // 重置 UI
    const taskButton = document.getElementById('task-button');
    const counter = document.getElementById('click-counter');
    const salaryValue = document.getElementById('salary-value');
    const countdownStatus = document.getElementById('countdown-status');
    const salaryStatus = document.getElementById('salary-status');
    const overtimeWarning = document.getElementById('overtime-warning');
    const bossMessage = document.getElementById('boss-message');
    const content = document.querySelector('.scene-3a-content');

    if (taskButton) { taskButton.style.display = ''; taskButton.classList.remove('fading'); }
    if (counter) { counter.style.display = ''; counter.textContent = `0 / ${MAX_CLICKS}`; }
    if (salaryValue) salaryValue.textContent = `¥${scene3AState.salary}`;
    if (countdownStatus) countdownStatus.classList.remove('warning', 'danger');
    if (salaryStatus) salaryStatus.classList.remove('deducting');
    if (overtimeWarning) overtimeWarning.classList.remove('show');
    if (bossMessage) bossMessage.classList.remove('show');
    if (content) content.classList.remove('overtime');
    updateCountdownDisplay();

    // 绑定按钮事件（只绑一次）
    if (!scene3AEventsBound) {
        scene3AEventsBound = true;
        const btn = document.getElementById('task-button');
        btn.addEventListener('click', handleTaskClick);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTaskClick();
        }, { passive: false });
    }

    // 显示第一个按钮
    moveTaskButton();

    // 启动倒计时
    scene3AState.countdownTimer = setInterval(tickCountdown, 1000);

    // 启动老板骂人循环（稍延迟首条）
    scheduleNextBossMessage(2500);

    // 显示内心独白
    showInnerMonologue('scene3a-monologue', '我在做这些事，但好像不是我做的。我只是一个执行程序，没有意义，也没有尽头。');
}

function clearScene3ATimers() {
    if (scene3AState.countdownTimer) { clearInterval(scene3AState.countdownTimer); scene3AState.countdownTimer = null; }
    if (scene3AState.bossTimer) { clearTimeout(scene3AState.bossTimer); scene3AState.bossTimer = null; }
    if (scene3AState.bossHideTimer) { clearTimeout(scene3AState.bossHideTimer); scene3AState.bossHideTimer = null; }
}

function updateCountdownDisplay() {
    const countdownValue = document.getElementById('countdown-value');
    if (!countdownValue) return;
    const t = Math.max(0, scene3AState.timeLeft);
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    countdownValue.textContent = `${m}:${s}`;
}

function tickCountdown() {
    if (scene3AState.finished || scene3AState.overtime) return;

    scene3AState.timeLeft--;
    updateCountdownDisplay();

    const countdownStatus = document.getElementById('countdown-status');
    if (!countdownStatus) return;

    if (scene3AState.timeLeft <= 10 && scene3AState.timeLeft > 5) {
        countdownStatus.classList.add('warning');
    } else if (scene3AState.timeLeft <= 5 && scene3AState.timeLeft > 0) {
        countdownStatus.classList.remove('warning');
        countdownStatus.classList.add('danger');
    } else if (scene3AState.timeLeft <= 0) {
        enterOvertime();
    }
}

function enterOvertime() {
    scene3AState.overtime = true;
    const countdownStatus = document.getElementById('countdown-status');
    const overtimeWarning = document.getElementById('overtime-warning');
    const content = document.querySelector('.scene-3a-content');
    const countdownValue = document.getElementById('countdown-value');

    if (countdownStatus) { countdownStatus.classList.remove('warning'); countdownStatus.classList.add('danger'); }
    if (countdownValue) countdownValue.textContent = '加班';
    if (overtimeWarning) overtimeWarning.classList.add('show');
    if (content) content.classList.add('overtime');

    // 加班开场立即骂一次 + 扣钱
    showBossMessage(pickBossQuote(BOSS_QUOTES.overtime));
    deductSalary(30);
}

function scheduleNextBossMessage(delay) {
    if (scene3AState.finished) return;
    scene3AState.bossTimer = setTimeout(() => {
        if (scene3AState.finished) return;
        triggerBossMessage();
    }, delay);
}

function triggerBossMessage() {
    if (scene3AState.finished) return;

    // 根据当前压力等级选择话术池
    let pool;
    if (scene3AState.overtime) {
        pool = BOSS_QUOTES.overtime;
    } else if (scene3AState.timeLeft <= 10) {
        pool = BOSS_QUOTES.danger;
    } else if (scene3AState.timeLeft <= 20) {
        pool = BOSS_QUOTES.warning;
    } else {
        pool = BOSS_QUOTES.normal;
    }

    showBossMessage(pickBossQuote(pool));

    // 不同等级伴随不同力度扣钱
    if (scene3AState.overtime) {
        deductSalary(20 + Math.floor(Math.random() * 20));
    } else if (scene3AState.timeLeft <= 10) {
        deductSalary(15 + Math.floor(Math.random() * 15));
    } else if (scene3AState.timeLeft <= 20 && Math.random() < 0.5) {
        deductSalary(10 + Math.floor(Math.random() * 10));
    }

    // 安排下一条：越紧迫骂得越频繁
    let nextDelay;
    if (scene3AState.overtime) {
        nextDelay = 3500 + Math.random() * 2000;
    } else if (scene3AState.timeLeft <= 10) {
        nextDelay = 3000 + Math.random() * 1500;
    } else {
        nextDelay = 4500 + Math.random() * 2500;
    }
    scheduleNextBossMessage(nextDelay);
}

function pickBossQuote(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

function showBossMessage(text) {
    const bossMessage = document.getElementById('boss-message');
    const bossText = document.getElementById('boss-text');
    if (!bossMessage || !bossText) return;

    bossText.textContent = text;
    bossMessage.classList.add('show');

    if (scene3AState.bossHideTimer) clearTimeout(scene3AState.bossHideTimer);
    scene3AState.bossHideTimer = setTimeout(() => {
        bossMessage.classList.remove('show');
    }, 2800);
}

function deductSalary(amount) {
    scene3AState.salary = Math.max(0, scene3AState.salary - amount);
    const salaryValue = document.getElementById('salary-value');
    const salaryStatus = document.getElementById('salary-status');
    if (salaryValue) salaryValue.textContent = `¥${scene3AState.salary}`;

    // 抖动 + 变红
    if (salaryStatus) {
        salaryStatus.classList.remove('deducting');
        void salaryStatus.offsetWidth; // 触发重排以重播动画
        salaryStatus.classList.add('deducting');
    }

    showDeductFloat(amount);
}

function showDeductFloat(amount) {
    const salaryStatus = document.getElementById('salary-status');
    const sceneContent = document.querySelector('.scene-3a-content');
    if (!salaryStatus || !sceneContent) return;

    const rect = salaryStatus.getBoundingClientRect();
    const sceneRect = sceneContent.getBoundingClientRect();

    const float = document.createElement('div');
    float.className = 'salary-deduct-float';
    float.textContent = `-¥${amount}`;
    float.style.left = (rect.left - sceneRect.left + rect.width / 2 - 20) + 'px';
    float.style.top = (rect.bottom - sceneRect.top + 4) + 'px';
    sceneContent.appendChild(float);

    setTimeout(() => float.remove(), 1500);
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
        : { left: window.innerWidth / 2 - 240, right: window.innerWidth / 2 + 240, top: window.innerHeight / 2 - 150, bottom: window.innerHeight / 2 + 150, width: 480 };

    const cx = monitorRect.left + monitorRect.width / 2;
    const cy = monitorRect.top + (monitorRect.bottom - monitorRect.top) / 2;

    // 距离显示器中心的活动半径(px)
    const radius = 220;
    // 避开左右 cubicle 浅灰条带(各 80px)
    const sidePad = 100;
    // 避开上下边缘（上方留出状态栏空间）
    const topPad = 160;
    const bottomPad = 140;

    const minX = Math.max(sidePad, cx - radius);
    const maxX = Math.min(window.innerWidth - sidePad - btnWidth, cx + radius - btnWidth);
    const minY = Math.max(topPad, cy - radius);
    const maxY = Math.min(window.innerHeight - bottomPad - btnHeight, cy + radius - btnHeight);

    let randomX, randomY;
    let attempts = 0;

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
    if (scene3AState.finished) return;

    clickCount++;
    const counter = document.getElementById('click-counter');
    if (counter) counter.textContent = `${clickCount} / ${MAX_CLICKS}`;

    // 按钮消失动画
    taskButton.classList.add('fading');

    if (clickCount >= MAX_CLICKS) {
        setTimeout(() => {
            completeScene3A();
        }, 800);
    } else {
        setTimeout(() => {
            moveTaskButton();
        }, 500);
    }
}

function completeScene3A() {
    scene3AState.finished = true;
    clearScene3ATimers();

    // 隐藏老板消息与加班提示
    const bossMessage = document.getElementById('boss-message');
    if (bossMessage) bossMessage.classList.remove('show');
    const overtimeWarning = document.getElementById('overtime-warning');
    if (overtimeWarning) overtimeWarning.classList.remove('show');

    // 隐藏任务按钮和计数器
    const taskButton = document.getElementById('task-button');
    if (taskButton) taskButton.style.display = 'none';
    const counter = document.getElementById('click-counter');
    if (counter) counter.style.display = 'none';

    // 根据是否加班显示不同的收尾独白
    if (scene3AState.overtime) {
        showInnerMonologue('scene3a-monologue', '做完了……可已经不知道是几点了。今天又加班，工资也扣了。可明天，还得来。');
    } else {
        showInnerMonologue('scene3a-monologue', '做完了。可心里什么感觉都没有，只是空。');
    }

    setTimeout(() => {
        showContinueButton(() => {
            switchScene('scene-4');
        });
    }, 1000);
}

function setupScene3AEvents() {
    // 逻辑已移至 initScene3A
}

// ========== 场景4 - 微信聊天（与朋友） ==========
let scene4Initialized = false;
let scene4ChatTimers = [];

// 微信聊天对话：side 为 me（我/患者，右侧）或 friend（朋友，左侧）
// delay 为该条消息距离上一条的间隔（毫秒），节奏放慢以承载情绪
const scene4Dialogue = [
    { side: 'me',     text: '在吗',          delay: 1800 },
    { side: 'friend', text: '在呢 怎么啦',   delay: 2200 },
    { side: 'me',     text: '最近有点不对劲', delay: 2600 },
    { side: 'me',     text: '做什么都提不起劲', delay: 2400 },
    { side: 'friend', text: '啊？发生什么事了', delay: 2400 },
    { side: 'me',     text: '说不上来',       delay: 2200 },
    { side: 'me',     text: '就那种很空的感觉', delay: 2500 },
    { side: 'me',     text: '…算了不说了',   delay: 2400 },
    { side: 'friend', text: '别别别',         delay: 1800 },
    { side: 'friend', text: '有什么你说啊 别一个人扛着', delay: 2800 },
    { side: 'friend', text: '周末要不要出来吃个饭', delay: 2600 },
    { side: 'friend', text: '陪你聊聊 ☕',    delay: 2200 },
    { side: 'me',     text: '…好',           delay: 2400 }
];

function initScene4() {
    if (scene4Initialized) return;
    scene4Initialized = true;

    const chat = document.getElementById('wechat-chat');
    if (!chat) return;
    chat.innerHTML = '';
    // 回到顶部
    chat.scrollTop = 0;

    let elapsed = 1000; // 第一条消息前的小停顿
    scene4Dialogue.forEach((msg) => {
        elapsed += msg.delay;
        const timer = setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'wechat-bubble wechat-bubble-' + msg.side;
            bubble.textContent = msg.text;
            chat.appendChild(bubble);
            // 自动滚到最底部（用 rAF 让新气泡先渲染再滚动更顺滑）
            requestAnimationFrame(() => {
                chat.scrollTop = chat.scrollHeight;
            });
        }, elapsed);
        scene4ChatTimers.push(timer);
    });

    // 对话结束 4s 后显示继续按钮
    const endTimer = setTimeout(() => {
        showContinueButton(() => {
            switchScene('transition-scene');
        });
    }, elapsed + 4000);
    scene4ChatTimers.push(endTimer);
}

function resetScene4() {
    scene4Initialized = false;
    scene4ChatTimers.forEach(t => clearTimeout(t));
    scene4ChatTimers = [];
    const chat = document.getElementById('wechat-chat');
    if (chat) chat.innerHTML = '';
}

function setupScene4Events() {
    // 场景4 无交互事件，对话由 initScene4 自动播放
}

// ========== 过渡动画：第一视角 · 溺水下沉 → 渐黑 → 弹窗 ==========
// 总时长约 22s：6s 入水 + 自动下沉缓冲 + 互动期 + 沉底静止 4s + 渐黑 4s
const DROWN_SINK_DURATION  = 18000;  // 自动下沉总时长（互动期不依赖此时间）
const DROWN_AUTO_RATE      = 0.0001; // 被动自动下沉的速率（每秒增加多少 depth）
const DROWN_PRESS_LIFT     = 0.10;   // 每次点击"短暂上浮"的视觉量
const DROWN_PRESS_SINK     = 0.16;   // 每次点击后新的 baseline 增量
const DROWN_MAX_DEPTH      = 0.95;   // 深度上限（避免完全黑掉 1 秒后看不清弹窗）
const DROWN_FINAL_BLACK_AT = 0.85;   // 超过此深度进入"沉底静止"阶段
const DROWN_PAUSE_BEFORE_BLACK = 4000;
const DROWN_BLACK_DURATION = 4000;
const DROWN_MAX_PRESS_COUNT = 6;     // 超过此次数按钮淡出

const drownState = {
    pressCount: 0,        // 点击次数
    depth: 0,             // 当前视觉深度（驱动 CSS 变量）
    targetDepth: 0,       // 目标深度（被动下沉 + 点击下沉累加）
    liftUntil: 0,         // 短暂上浮的结束时间戳
    finished: false,      // 是否已结束（进入黑屏）
    sinkPhase: 'active',  // active → final（沉底）→ black
    sinkPhaseAt: 0,
    startTime: 0,
};

let drownTimers = [];
let drownBubbleTimers = [];
let drownAnimId = null;
let drownBtnBound = false;

const drownMainTexts = [
    '一直 往下沉',           // 0
    '越挣扎 越下沉',         // 0.55
    '…',                     // 0.85
    '…',                     // 1.00
];
const drownFeedbackTexts = [
    '无济于事',              // 1
    '无济于事',              // 2
    '无济于事',              // 3
    '无济于事',              // 4
    '无济于事',              // 5
    '无济于事',              // 6
];

function initTransition() {
    // 清理上一轮残留
    if (drownAnimId) { cancelAnimationFrame(drownAnimId); drownAnimId = null; }
    drownTimers.forEach(t => clearTimeout(t));       drownTimers = [];
    drownBubbleTimers.forEach(t => clearTimeout(t)); drownBubbleTimers = [];

    // 隐藏右上角"继续"按钮
    if (typeof hideContinueButton === 'function') {
        try { hideContinueButton(); } catch (_) {}
    }

    // 重置状态
    drownState.pressCount   = 0;
    drownState.depth       = 0;
    drownState.targetDepth = 0;
    drownState.liftUntil   = 0;
    drownState.finished    = false;
    drownState.sinkPhase   = 'active';
    drownState.sinkPhaseAt = performance.now();
    drownState.startTime   = performance.now();

    const transitionEl   = document.getElementById('transition-scene');
    const bubblesLayer   = document.getElementById('drown-bubbles');
    const particlesLayer = document.getElementById('drown-particles');
    const fadeOverlay    = document.getElementById('drown-final-black');
    const innerText      = document.getElementById('drown-inner-text');
    const floatBtn       = document.getElementById('drown-float-btn');
    const btnCount       = document.getElementById('drown-btn-count');

    if (!transitionEl) return;

    // 复位视觉
    transitionEl.style.setProperty('--drown-depth', '0');
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
    transitionEl.querySelectorAll('.drown-press-ripple, .drown-press-feedback').forEach(el => el.remove());

    // 创建悬浮颗粒
    createDrownParticles(particlesLayer, transitionEl);

    // === 主循环：根据 elapsed/点击/lift 算出当前 depth，写入 CSS 变量 ===
    function loop() {
        if (drownState.finished) return;
        const now = performance.now();
        const elapsed = (now - drownState.startTime) / 1000;

        // 1) 被动自动下沉（贯穿整个互动期）
        if (drownState.sinkPhase === 'active') {
            // 按时间线性累积 baseline（即使没人点击，场景也会慢慢变深）
            const passive = elapsed * DROWN_AUTO_RATE;
            // targetDepth 始终 ≥ passive
            const want = Math.max(drownState.targetDepth, passive);
            drownState.targetDepth = Math.min(DROWN_MAX_DEPTH, want);

            // 2) 短暂"上浮"覆盖：liftUntil 期间，把视觉深度往下推（数值变小=更靠近水面）
            let visualDepth = drownState.targetDepth;
            if (now < drownState.liftUntil) {
                const LIFT_MS = 700;
                const t0 = drownState.liftUntil - LIFT_MS;
                const t = Math.min(1, Math.max(0, (now - t0) / LIFT_MS));
                // 0→1→0 的形状：先抬升一点再回落
                const liftShape = 1 - Math.abs(2 * t - 1);
                visualDepth = Math.max(0, drownState.targetDepth - DROWN_PRESS_LIFT * liftShape);
            }

            // 平滑插值到 visualDepth
            drownState.depth += (visualDepth - drownState.depth) * 0.18;

            // 3) 达到最终深度 → 切到 final 阶段
            if (drownState.targetDepth >= DROWN_FINAL_BLACK_AT) {
                drownState.sinkPhase = 'final';
                drownState.sinkPhaseAt = now;
            }
        } else if (drownState.sinkPhase === 'final') {
            // 沉底阶段：继续慢推到 MAX
            const t = Math.min(1, (now - drownState.sinkPhaseAt) / 1500);
            const target = DROWN_MAX_DEPTH;
            drownState.depth += (target - drownState.depth) * 0.05;
            if (t >= 1) {
                drownState.sinkPhase = 'black';
                drownState.sinkPhaseAt = now;
            }
        } else if (drownState.sinkPhase === 'black') {
            // 黑屏阶段：开始渐黑
            if (fadeOverlay && !fadeOverlay.classList.contains('show')) {
                fadeOverlay.classList.add('show');
            }
            if (now - drownState.sinkPhaseAt >= DROWN_BLACK_DURATION) {
                drownState.finished = true;
                if (floatBtn) {
                    floatBtn.classList.remove('show');
                    floatBtn.style.pointerEvents = 'none';
                }
                if (typeof showRoleSwitchModal === 'function') showRoleSwitchModal();
                return;
            }
        }

        // 写入 CSS 变量（驱动所有视觉）
        transitionEl.style.setProperty('--drown-depth', drownState.depth.toFixed(3));

        // 更新主独白
        updateDrownMainText();

        drownAnimId = requestAnimationFrame(loop);
    }
    drownAnimId = requestAnimationFrame(loop);

    // === 气泡循环（自己的呼吸，从屏幕底部中央往上飘） ===
    function bubbleLoop() {
        if (drownState.finished) return;
        spawnDrownBubble(bubblesLayer, transitionEl);
        if (Math.random() < 0.35) drownBubbleTimers.push(setTimeout(() => spawnDrownBubble(bubblesLayer, transitionEl), 180));
        if (Math.random() < 0.15) drownBubbleTimers.push(setTimeout(() => spawnDrownBubble(bubblesLayer, transitionEl), 500));
        // 越深气泡越急（间隔变短 + 每次更多）
        const next = Math.max(450, 1100 - drownState.depth * 600) + Math.random() * 600;
        drownBubbleTimers.push(setTimeout(bubbleLoop, next));
    }
    drownBubbleTimers.push(setTimeout(bubbleLoop, 400));

    // 2s 后显示中央独白
    drownTimers.push(setTimeout(() => {
        if (innerText) innerText.classList.add('show');
    }, 2000));

    // 4s 后浮出"尝试上浮"按钮
    drownTimers.push(setTimeout(() => {
        if (floatBtn && !drownState.finished) floatBtn.classList.add('show');
    }, 4000));

    // 兜底：即使没人点击，到时间也强制结束
    drownTimers.push(setTimeout(() => {
        if (drownState.sinkPhase === 'active') {
            drownState.targetDepth = DROWN_FINAL_BLACK_AT;
        }
    }, DROWN_SINK_DURATION));

    // 绑定"尝试上浮"按钮（只绑一次）
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

// === 单个气泡（从屏幕底部中央：自己的嘴/鼻子） ===
function spawnDrownBubble(container, scope) {
    if (!container || !scope) return;
    const scopeRect = scope.getBoundingClientRect();
    const startX = scopeRect.left + scopeRect.width * (0.45 + Math.random() * 0.1);
    const startY = scopeRect.bottom - 10 - Math.random() * 20;

    const bubble = document.createElement('div');
    bubble.className = 'drown-bubble';
    const startSize = 8 + Math.random() * 14;
    bubble.style.width  = startSize + 'px';
    bubble.style.height = startSize + 'px';
    bubble.style.left   = (startX - startSize / 2) + 'px';
    bubble.style.top    = startY + 'px';
    bubble.style.opacity = '0';
    container.appendChild(bubble);

    const riseDistance = (scopeRect.bottom - scopeRect.top) * (0.85 + Math.random() * 0.15);
    const riseDuration = 4200 + Math.random() * 3500;
    const drift        = (Math.random() - 0.5) * 70;
    const wobble       = (Math.random() - 0.5) * 22;
    const t0           = performance.now();

    (function animate(now) {
        const t = Math.min(1, (now - t0) / riseDuration);
        const y = startY - riseDistance * t;
        const wx = Math.sin(t * 8 + t0 * 0.001) * wobble * (1 - t);
        const x = startX + drift * t + wx;
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

// === 主文字（根据当前 depth） ===
function updateDrownMainText() {
    const innerText = document.getElementById('drown-inner-text');
    if (!innerText) return;
    const d = drownState.depth;
    let idx = 0;
    if (d >= 0.55) idx = 1;
    if (d >= 0.85) idx = 2;
    if (innerText.dataset.idx !== String(idx)) {
        innerText.dataset.idx = String(idx);
        // 淡出 → 换字 → 淡入
        innerText.style.transition = 'opacity 1.2s ease';
        innerText.style.opacity = '0';
        setTimeout(() => {
            innerText.textContent = drownMainTexts[idx];
            innerText.style.opacity = '1';
        }, 1100);
    }
}

// === "尝试上浮" 按钮事件 ===
function onDrownFloatPress() {
    if (drownState.finished) return;
    if (drownState.sinkPhase !== 'active') return;
    if (drownState.pressCount >= DROWN_MAX_PRESS_COUNT) return;

    drownState.pressCount++;

    // 1) 新的 baseline 深度 = 当前 + DROWN_PRESS_SINK（点击之后比之前更深）
    drownState.targetDepth = Math.min(DROWN_MAX_DEPTH, drownState.targetDepth + DROWN_PRESS_SINK);

    // 2) 触发 700ms 的短暂上浮视觉（loop 里会读到 liftUntil）
    drownState.liftUntil = performance.now() + 700;

    // 3) 一口气吐一串气泡（挣扎的喘息）
    const bubblesLayer = document.getElementById('drown-bubbles');
    const transitionEl = document.getElementById('transition-scene');
    const burst = 4 + Math.min(6, Math.floor(drownState.pressCount * 1.2));
    for (let i = 0; i < burst; i++) {
        drownBubbleTimers.push(setTimeout(() => spawnDrownBubble(bubblesLayer, transitionEl), i * 70));
    }

    // 4) 水波反馈
    if (transitionEl) {
        const ripple = document.createElement('div');
        ripple.className = 'drown-press-ripple';
        transitionEl.appendChild(ripple);
        setTimeout(() => ripple.remove(), 2500);
    }

    // 5) 反馈文字
    if (transitionEl) {
        const fb = document.createElement('div');
        fb.className = 'drown-press-feedback';
        fb.textContent = drownFeedbackTexts[Math.min(drownFeedbackTexts.length - 1, drownState.pressCount - 1)];
        transitionEl.appendChild(fb);
        setTimeout(() => fb.remove(), 3300);
    }

    // 6) 按钮计数
    const btnCount = document.getElementById('drown-btn-count');
    if (btnCount) btnCount.textContent = drownState.pressCount;

    // 7) 按钮越按越暗淡
    const dim = Math.max(0.25, 1 - drownState.pressCount * 0.1);
    const floatBtn = document.getElementById('drown-float-btn');
    if (floatBtn) {
        floatBtn.style.color       = `rgba(220, 230, 245, ${0.85 * dim})`;
        floatBtn.style.borderColor = `rgba(180, 210, 230, ${0.32 * dim})`;
        floatBtn.style.background  = `rgba(20, 30, 45, ${0.42 * dim})`;
    }

    // 8) 达到点击上限：按钮淡出，但场景继续自动沉底
    if (drownState.pressCount >= DROWN_MAX_PRESS_COUNT && floatBtn) {
        setTimeout(() => {
            floatBtn.style.transition = 'opacity 1.6s ease';
            floatBtn.style.opacity = '0';
            floatBtn.style.pointerEvents = 'none';
        }, 800);
    }
}

// 完成体验：直接进入合并后的共情档案 + 科普页
function completeExperience() {
    appState.depressionCompleted = true;
    localStorage.setItem('depressionCompleted', 'true');
    const badge = document.getElementById('completed-badge');
    if (badge) badge.style.display = 'block';
    switchPage('empathy-page');
    // 切到合并页后回到顶部，让用户先看到"共情档案"部分
    requestAnimationFrame(() => {
        const empathyPage = document.getElementById('empathy-page');
        if (empathyPage) empathyPage.scrollTop = 0;
    });
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
        if (targetId === 'pos-scene-1-5') initPosScene1_5();
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
        <p>下一次，我们看一段真实对话 —— 把第 1 课的"倾听"和第 2 课的"回应"放在一起读。</p>
        <button id="pos1-go-next" class="btn btn-primary pos-next-btn">看一段真实对话 →</button>
    `;
    stage.appendChild(summary);
    setTimeout(() => { stage.scrollTop = stage.scrollHeight; }, 50);

    document.getElementById('pos1-go-next').addEventListener('click', () => {
        switchPosScene('pos-scene-1-5');
    });
}

// ========== 教学场景 1.5：真实案例（场景4微信聊天回放 + 教学点标注） ==========
let pos15Initialized = false;
let pos15ChatTimers = [];

// 与 scene4Dialogue 同步，但每条 friend 消息附带教学点标签
// tag: 'p1' = 教学点 1：倾听；'p2' = 教学点 2：回应
const POS15_DIALOGUE = [
    { side: 'me',     text: '在吗',                            delay: 1500 },
    { side: 'friend', text: '在呢 怎么啦',                     delay: 1800, tag: 'p1', tagText: '教学点 1 · 倾听 — 不问"怎么了"，先接住' },
    { side: 'me',     text: '最近有点不对劲',                  delay: 2200 },
    { side: 'me',     text: '做什么都提不起劲',                delay: 2000 },
    { side: 'friend', text: '啊？发生什么事了',                delay: 2000, tag: 'p1', tagText: '教学点 1 · 倾听 — 表达关注，但不逼 ta 立刻说出全部' },
    { side: 'me',     text: '说不上来',                        delay: 2000 },
    { side: 'me',     text: '就那种很空的感觉',                delay: 2200 },
    { side: 'me',     text: '…算了不说了',                     delay: 2000 },
    { side: 'friend', text: '别别别',                          delay: 1500, tag: 'p2', tagText: '教学点 2 · 回应 — ta 想关上门时，不放手' },
    { side: 'friend', text: '有什么你说啊 别一个人扛着',        delay: 2300, tag: 'p2', tagText: '教学点 2 · 回应 — 明确告诉 ta"我在"' },
    { side: 'friend', text: '周末要不要出来吃个饭',            delay: 2200, tag: 'p2', tagText: '教学点 2 · 回应 — 不空喊"加油"，给一个具体的陪伴' },
    { side: 'friend', text: '陪你聊聊 ☕',                      delay: 1800, tag: 'p2', tagText: '教学点 2 · 回应 — 把"我在"落成一个动作' },
    { side: 'me',     text: '…好',                             delay: 2000 }
];

function initPosScene1_5() {
    if (pos15Initialized) return;
    pos15Initialized = true;

    const chat = document.getElementById('pos-wechat-chat');
    if (!chat) return;
    chat.innerHTML = '';
    chat.scrollTop = 0;

    // 清除旧 timer
    pos15ChatTimers.forEach(t => clearTimeout(t));
    pos15ChatTimers = [];

    let elapsed = 600;
    POS15_DIALOGUE.forEach((msg) => {
        elapsed += msg.delay;
        const t = setTimeout(() => {
            // 气泡
            const bubble = document.createElement('div');
            bubble.className = 'pos-wechat-bubble pos-wechat-bubble-' + msg.side;
            bubble.textContent = msg.text;
            chat.appendChild(bubble);

            // 教学点标注（仅 friend 且带 tag）
            if (msg.side === 'friend' && msg.tag) {
                const tag = document.createElement('div');
                tag.className = 'pos-teach-tag pos-teach-tag-' + msg.tag;
                tag.innerHTML = `<span class="pos-teach-tag-dot"></span>${msg.tagText}`;
                chat.appendChild(tag);
            }

            requestAnimationFrame(() => {
                chat.scrollTop = chat.scrollHeight;
            });
        }, elapsed);
        pos15ChatTimers.push(t);
    });

    // 对话播完后启用继续按钮
    const endT = setTimeout(() => {
        const nextBtn = document.getElementById('pos-scene-1-5-next');
        if (nextBtn) {
            nextBtn.classList.add('ready');
            nextBtn.onclick = () => switchPosScene('pos-scene-2');
        }
    }, elapsed + 1200);
    pos15ChatTimers.push(endT);
}

function resetPosScene1_5() {
    pos15Initialized = false;
    pos15ChatTimers.forEach(t => clearTimeout(t));
    pos15ChatTimers = [];
    const chat = document.getElementById('pos-wechat-chat');
    if (chat) chat.innerHTML = '';
    const nextBtn = document.getElementById('pos-scene-1-5-next');
    if (nextBtn) nextBtn.classList.remove('ready');
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
