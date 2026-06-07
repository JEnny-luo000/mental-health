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
    
    setTimeout(() => {
        typeWriter(line1, '你每天都会遇到很多人，', 80, () => {
            line1.classList.add('visible');
            setTimeout(() => {
                typeWriter(line2, '但你不知道他们心里正在经历什么。', 80, () => {
                    line2.classList.add('visible');
                    setTimeout(() => {
                        document.getElementById('ready-btn').style.display = 'inline-block';
                        document.getElementById('info-btn').style.display = 'inline-block';
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

// 页面切换函数 - 带淡入淡出效果
function switchPage(pageId) {
    if (appState.isTransitioning) return;
    appState.isTransitioning = true;
    
    const currentPage = document.querySelector('.page.active');
    const nextPage = document.getElementById(pageId);
    
    if (currentPage) {
        currentPage.classList.add('fade-out');
        setTimeout(() => {
            currentPage.classList.remove('active', 'fade-out');
        }, 500);
    }
    
    setTimeout(() => {
        nextPage.classList.add('active');
        setTimeout(() => {
            appState.isTransitioning = false;
            appState.currentPage = pageId.replace('-page', '');
        }, 500);
    }, 800);
}

// 场景切换函数 - 带淡入淡出效果
function switchScene(sceneId, callback) {
    if (appState.isTransitioning) return;
    appState.isTransitioning = true;
    
    const currentScene = document.querySelector('.scene.active');
    const nextScene = document.getElementById(sceneId);
    
    if (currentScene) {
        currentScene.classList.add('fade-out');
        setTimeout(() => {
            currentScene.classList.remove('active', 'fade-out');
        }, 500);
    }
    
    setTimeout(() => {
        nextScene.classList.add('active');
        setTimeout(() => {
            appState.isTransitioning = false;
            initScene(sceneId);
            if (callback) callback();
        }, 500);
    }, 800);
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

// 初始化场景1
function initScene1() {
    appState.sceneReady = false;
    
    setTimeout(() => {
        const eyeLids = document.getElementById('wake-up-eyes');
        if (eyeLids) {
            eyeLids.classList.add('opening');
        }
    }, 800);
    
    setTimeout(() => {
        initFogCanvas();
    }, 2500);
}

// 初始化雾气画布
function initFogCanvas() {
    const canvas = document.getElementById('fog-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let clearedPercent = 0;
    const targetClear = 60;
    
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawFog();
    }
    
    function drawFog() {
        if (!ctx) return;
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.7
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(200, 200, 220, 0.6)');
        gradient.addColorStop(1, 'rgba(150, 150, 180, 0.7)');
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(180, 190, 210, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 30 + 10;
            const fogGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            fogGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            fogGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = fogGrad;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
    }
    
    function eraseFog(x, y) {
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();
        
        clearedPercent = Math.min(100, clearedPercent + 0.5);
        if (clearedPercent >= targetClear) {
            canvas.classList.add('cleared');
            document.getElementById('wake-hint').classList.add('hidden');
            enableSlider();
        }
    }
    
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }
    
    function startDraw(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        eraseFog(pos.x, pos.y);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        eraseFog(pos.x, pos.y);
    }
    
    function endDraw() {
        isDrawing = false;
    }
    
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);
    
    setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', resizeCanvas);
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
        } else if (delta >= maxSlide) {
            sliderThumb.style.transform = `translateX(calc(-50% + ${maxSlide}px))`;
            // 关闭闹钟后开始震动1.5秒
            triggerShake();
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

// 触发震动效果（闹钟关闭后）
function triggerShake() {
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
function completeScene1() {
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
            
            // 更新嘴巴弧度：从悲伤(向下弯)到微笑(向上弯)
            // 起点终点 Y=20，控制点 Y 在 30（悲伤）到 5（微笑）之间
            // 控制点 Y < 起止点 Y → 向上弯（微笑）
            const curveY = 30 - (smileLevel / 100) * 25;
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
        } else if (!isHolding && smileLevel > 0) {
            // 松手时，微笑慢慢消退
            smileLevel = Math.max(0, smileLevel - 0.5);
            const curveY = 30 - (smileLevel / 100) * 25;
            mouthPath.setAttribute('d', `M 10 20 Q 40 ${curveY} 70 20`);
            
            if (smileLevel === 0) {
                // 重置心理描写
                psychologyText.classList.remove('visible');
                psychologyText.textContent = '';
                currentPsychologyIndex = 0;
                document.getElementById('emotion-hint').textContent = '点击并按住面具，让它露出微笑';
            }
        }
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
    
    // 初始状态：悲伤（控制点 Y=30 > 起止点 Y=20，向下弯）
    mouthPath.setAttribute('d', 'M 10 20 Q 40 30 70 20');
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
    
    // 显示自定义鼠标
    const cursor = document.getElementById('custom-cursor');
    cursor.classList.add('active');
    
    // 鼠标跟随
    document.addEventListener('mousemove', handleCursorMove);
    document.addEventListener('touchmove', handleCursorTouchMove, { passive: false });
    
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

function handleCursorMove(e) {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
}

function handleCursorTouchMove(e) {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor || !e.touches[0]) return;
    cursor.style.left = e.touches[0].clientX + 'px';
    cursor.style.top = e.touches[0].clientY + 'px';
}

function moveTaskButton() {
    const taskButton = document.getElementById('task-button');
    if (!taskButton) return;

    // 获取按钮实际尺寸,避免出现在屏幕特别边缘的位置
    const btnRect = taskButton.getBoundingClientRect();
    const btnWidth = btnRect.width || 130;
    const btnHeight = btnRect.height || 50;

    // 避开显示器
    const monitor = document.querySelector('.computer-monitor');
    const monitorRect = monitor ? monitor.getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 };

    // 边缘留白:四周至少 80px,避免按钮贴边
    const padding = 80;
    const minX = padding;
    const maxX = window.innerWidth - padding - btnWidth;
    const minY = padding;
    const maxY = window.innerHeight - padding - btnHeight;

    let randomX, randomY;
    let attempts = 0;

    // 确保按钮不与显示器重叠
    do {
        randomX = minX + Math.random() * (maxX - minX);
        randomY = minY + Math.random() * (maxY - minY);
        attempts++;
    } while (
        attempts < 20 &&
        randomX + btnWidth > monitorRect.left - 50 &&
        randomX < monitorRect.right + 50 &&
        randomY + btnHeight > monitorRect.top - 50 &&
        randomY < monitorRect.bottom + 50
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
    // 隐藏自定义鼠标
    const cursor = document.getElementById('custom-cursor');
    if (cursor) cursor.classList.remove('active');
    
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
