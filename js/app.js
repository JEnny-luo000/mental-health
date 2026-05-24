// 应用状态管理
const appState = {
    currentPage: 'opening',
    energy: 100,
    currentScene: 1,
    depressionCompleted: false
};

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 应用初始化
function initApp() {
    // 检查本地存储
    checkCompletionStatus();
    
    // 开始开场动画
    startOpeningAnimation();
    
    // 绑定事件
    bindEvents();
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
        typeWriter(line1, '你每天都会遇到很多人，', 50, () => {
            line1.classList.add('visible');
            setTimeout(() => {
                typeWriter(line2, '但你不知道他们心里正在经历什么。', 50, () => {
                    line2.classList.add('visible');
                    setTimeout(() => {
                        document.getElementById('ready-btn').style.display = 'inline-block';
                        document.getElementById('info-btn').style.display = 'inline-block';
                    }, 500);
                });
            }, 300);
        });
    }, 800);
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
    document.getElementById('science-next-btn').addEventListener('click', goToEmpathy);
    
    // 共情档案页事件
    document.getElementById('share-poster-btn').addEventListener('click', generatePoster);
    document.getElementById('go-to-resources-btn').addEventListener('click', goToResources);
    
    // 资源页事件
    document.getElementById('back-to-hall-btn').addEventListener('click', goToHall);
    
    // 科普页面滚动事件
    setupScienceScroll();
}

// 页面切换函数
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    appState.currentPage = pageId.replace('-page', '');
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
    showScene(1);
    appState.currentScene = 1;
    appState.energy = 100;
}

// 显示场景
function showScene(sceneNum) {
    document.querySelectorAll('.scene').forEach(scene => {
        scene.classList.remove('active');
    });
    
    let sceneId;
    if (sceneNum === 'transition') {
        sceneId = 'transition-scene';
    } else if (sceneNum === '2choice') {
        sceneId = 'scene-2-choice';
    } else {
        sceneId = `scene-${sceneNum}`;
    }
    
    const sceneElement = document.getElementById(sceneId);
    if (sceneElement) {
        sceneElement.classList.add('active');
    }
}

// 场景1 - 长按唤醒
function setupScene1Events() {
    let pressStartTime = 0;
    let pressInterval = null;
    let progress = 0;
    
    const sceneContent = document.querySelector('.scene-1-content');
    
    const startPress = (e) => {
        e.preventDefault();
        pressStartTime = Date.now();
        progress = 0;
        
        pressInterval = setInterval(() => {
            const elapsed = Date.now() - pressStartTime;
            if (elapsed > 2000) {
                progress = Math.min((elapsed - 2000) / 30, 100);
                document.getElementById('wake-progress-fill').style.width = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(pressInterval);
                    completeScene1();
                }
            }
        }, 50);
    };
    
    const endPress = () => {
        clearInterval(pressInterval);
    };
    
    sceneContent.addEventListener('mousedown', startPress);
    sceneContent.addEventListener('mouseup', endPress);
    sceneContent.addEventListener('mouseleave', endPress);
    sceneContent.addEventListener('touchstart', startPress);
    sceneContent.addEventListener('touchend', endPress);
}

// 完成场景1
function completeScene1() {
    showInnerMonologue('scene1-monologue', '连起床都需要这么大的力气...');
    applyInnerWorldEffects();
    decreaseEnergy(10);
    
    setTimeout(() => {
        showScene('2choice');
    }, 2000);
}

// 显示内心独白
function showInnerMonologue(elementId, text) {
    const element = document.getElementById(elementId);
    element.style.display = 'block';
    typeWriter(element, text, 60);
}

// 应用内心世界视觉效果
function applyInnerWorldEffects() {
    const container = document.getElementById('script-container');
    container.classList.add('glitch-effect', 'vignette', 'grayscale-blue');
}

// 减少能量
function decreaseEnergy(amount) {
    appState.energy = Math.max(0, appState.energy - amount);
    document.documentElement.style.setProperty('--energy-level', appState.energy / 100);
}

// 场景2选择
function setupScene2Events() {
    document.getElementById('choice-go-out').addEventListener('click', () => {
        showScene(2);
        setTimeout(() => showScene('2a'), 500);
        decreaseEnergy(15);
    });
    
    document.getElementById('choice-stay').addEventListener('click', () => {
        showScene('2b');
        decreaseEnergy(10);
        startDanmaku();
    });
}

// 场景2A - 维持微笑
function setupScene2AEvents() {
    let smileLevel = 0;
    let holding = false;
    const smilePath = document.getElementById('smile-path');
    const smileMask = document.getElementById('smile-mask');
    
    const updateSmile = () => {
        if (holding && smileLevel < 100) {
            smileLevel = Math.min(100, smileLevel + 2);
        } else if (!holding && smileLevel > 0) {
            smileLevel = Math.max(0, smileLevel - 1);
        }
        
        const curve = 50 - (smileLevel * 0.5);
        smilePath.setAttribute('d', `M 20 50 Q 100 ${curve} 180 50`);
        
        if (smileLevel <= 0 && document.getElementById('scene-2a').classList.contains('active')) {
            completeScene2A();
        }
    };
    
    const startHold = (e) => {
        e.preventDefault();
        holding = true;
    };
    
    const endHold = () => {
        holding = false;
    };
    
    smileMask.addEventListener('mousedown', startHold);
    smileMask.addEventListener('mouseup', endHold);
    smileMask.addEventListener('mouseleave', endHold);
    smileMask.addEventListener('touchstart', startHold);
    smileMask.addEventListener('touchend', endHold);
    
    setInterval(updateSmile, 50);
    
    setTimeout(() => {
        showInnerMonologue('scene2a-monologue', '要一直保持微笑真的好累...');
    }, 500);
}

// 完成场景2A
function completeScene2A() {
    decreaseEnergy(20);
    setTimeout(() => {
        showScene('3a');
    }, 1500);
}

// 场景2B - 弹幕
function setupScene2BEvents() {
    // 弹幕在startDanmaku中设置
}

// 开始弹幕
function startDanmaku() {
    const words = ['懒', '矫情', '没用', '想太多', '振作点', '至于吗', '废物'];
    const container = document.getElementById('danmaku-container');
    let wordCount = 0;
    const maxWords = 30;
    
    const createWord = () => {
        if (wordCount >= maxWords) {
            setTimeout(() => completeScene2B(), 1500);
            return;
        }
        
        const word = document.createElement('div');
        word.className = 'danmaku-word';
        word.textContent = words[Math.floor(Math.random() * words.length)];
        word.style.left = `${Math.random() * 80 + 10}%`;
        word.style.top = `${Math.random() * 70 + 10}%`;
        
        word.addEventListener('click', () => {
            word.style.opacity = '0';
            setTimeout(() => word.remove(), 300);
        });
        
        container.appendChild(word);
        wordCount++;
        
        setTimeout(createWord, 500);
    };
    
    setTimeout(() => {
        showInnerMonologue('scene2b-monologue', '我真的这么没用吗...');
    }, 1000);
    
    createWord();
}

// 完成场景2B
function completeScene2B() {
    decreaseEnergy(25);
    setTimeout(() => {
        showScene('3a');
    }, 1000);
}

// 场景3A - 摘下面具
function setupScene3AEvents() {
    let reactionsShown = false;
    
    document.getElementById('remove-mask-btn').addEventListener('click', () => {
        if (reactionsShown) return;
        reactionsShown = true;
        
        document.getElementById('remove-mask-btn').style.display = 'none';
        
        const reactionsContainer = document.getElementById('people-reactions');
        reactionsContainer.innerHTML = `
            <div class="reaction-person pressing"></div>
            <div class="reaction-wall"></div>
            <div class="reaction-person reaction-warm"></div>
        `;
        
        showInnerMonologue('scene3a-monologue', '说出来又能怎样呢...');
        decreaseEnergy(15);
        
        setTimeout(() => {
            showScene(4);
        }, 2500);
    });
}

// 场景4 - 选项消逝
function setupScene4Events() {
    const options = document.querySelectorAll('.night-option');
    let optionsFaded = 0;
    
    options.forEach(option => {
        option.addEventListener('mouseenter', () => {
            option.classList.add('fading');
            optionsFaded++;
            
            if (optionsFaded >= options.length) {
                setTimeout(() => {
                    document.getElementById('try-message-btn').style.display = 'inline-block';
                }, 800);
            }
        });
        
        option.addEventListener('touchstart', (e) => {
            e.preventDefault();
            option.classList.add('fading');
            optionsFaded++;
            
            if (optionsFaded >= options.length) {
                setTimeout(() => {
                    document.getElementById('try-message-btn').style.display = 'inline-block';
                }, 800);
            }
        });
    });
    
    document.getElementById('try-message-btn').addEventListener('click', () => {
        document.getElementById('try-message-btn').style.display = 'none';
        const messageBubble = document.getElementById('message-bubble');
        messageBubble.style.display = 'block';
        
        setTimeout(() => {
            const replyBubble = document.getElementById('reply-bubble');
            replyBubble.style.display = 'block';
            showInnerMonologue('scene4-monologue', '算了...');
            decreaseEnergy(10);
            
            setTimeout(() => {
                showScene(5);
            }, 2000);
        }, 3000);
    });
}

// 场景5 - 镜子
function setupScene5Events() {
    const mirror = document.getElementById('mirror');
    let mirrorClicked = false;
    
    mirror.addEventListener('click', () => {
        if (mirrorClicked) return;
        mirrorClicked = true;
        
        const crackOverlay = document.getElementById('crack-overlay');
        crackOverlay.style.display = 'block';
        
        showInnerMonologue('scene5-monologue', '你可能觉得我看起来很正常。但每天早上醒来，都像是在水里挣扎...');
        
        setTimeout(() => {
            startTransition();
        }, 3500);
    });
}

// 开始过渡动画
function startTransition() {
    showScene('transition');
    
    const lightSpotsContainer = document.querySelector('.light-spots');
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const spot = document.createElement('div');
            spot.className = 'light-spot';
            spot.style.left = `${Math.random() * 80 + 10}%`;
            spot.style.animationDelay = `${Math.random() * 0.5}s`;
            lightSpotsContainer.appendChild(spot);
        }, i * 300);
    }
    
    setTimeout(() => {
        completeExperience();
    }, 4000);
}

// 完成体验
function completeExperience() {
    appState.depressionCompleted = true;
    localStorage.setItem('depressionCompleted', 'true');
    document.getElementById('completed-badge').style.display = 'block';
    switchPage('science-page');
}

// 设置科普页面滚动
function setupScienceScroll() {
    const sciencePage = document.getElementById('science-page');
    
    sciencePage.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.science-section');
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.7) {
                setTimeout(() => {
                    section.classList.add('visible');
                }, index * 150);
            }
        });
    });
}

// 前往共情档案页
function goToEmpathy() {
    switchPage('empathy-page');
}

// 生成海报（模拟）
function generatePoster() {
    alert('海报生成功能：在实际项目中，这里可以使用html2canvas等库将页面内容转换为图片供用户分享。');
}

// 前往资源页
function goToResources() {
    switchPage('resources-page');
}
