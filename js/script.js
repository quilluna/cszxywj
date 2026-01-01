// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能（initDarkMode、initMobileMenu和initSettingsMenu会在导航栏加载完成后自动初始化）
    initVideoFilter();
    initResourceFilter();
    initScrollAnimation();
    initSmoothScroll();
    initDownloadCounter();
    initGameSelection();
    initChapterSelection();
    initMobileTopBarToggle();
    initCustomConfirm();
    // 加载推荐视频
    loadRecommendedVideos();
});

// 初始化运行时间计数器
function initRuntimeCounter() {
    // 设置网站启动时间
    const startTime = new Date('2026-01-01T01:29:00');
    
    // 更新运行时间
    function updateRuntime() {
        const now = new Date();
        const elapsed = now - startTime;
        
        // 计算天、时、分、秒
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        // 更新页面显示
        const counterElement = document.getElementById('runtime-counter');
        if (counterElement) {
            counterElement.textContent = `本站已快乐运行 ${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
        }
    }
    
    // 立即更新一次
    updateRuntime();
    
    // 每秒更新一次
    setInterval(updateRuntime, 1000);
}

// 初始化自定义确认框
function initCustomConfirm() {
    const confirmModal = document.getElementById('custom-confirm');
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    const confirmOkBtn = document.getElementById('confirm-ok');
    
    if (!confirmModal || !confirmCancelBtn || !confirmOkBtn) return;
    
    // 取消按钮点击事件
    confirmCancelBtn.addEventListener('click', function() {
        hideCustomConfirm();
        window.customConfirmCallback(false);
    });
    
    // 确定按钮点击事件
    confirmOkBtn.addEventListener('click', function() {
        hideCustomConfirm();
        window.customConfirmCallback(true);
    });
    
    // 点击遮罩层关闭确认框
    const confirmOverlay = document.querySelector('.custom-confirm-overlay');
    if (confirmOverlay) {
        confirmOverlay.addEventListener('click', function() {
            hideCustomConfirm();
            window.customConfirmCallback(false);
        });
    }
    
    // 按ESC键关闭确认框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && confirmModal.classList.contains('active')) {
            hideCustomConfirm();
            window.customConfirmCallback(false);
        }
    });
}

// 显示自定义确认框
function showCustomConfirm(callback) {
    const confirmModal = document.getElementById('custom-confirm');
    if (!confirmModal) return;
    
    // 保存回调函数
    window.customConfirmCallback = callback;
    
    // 显示确认框（CSS过渡会自动处理动画效果）
    confirmModal.classList.add('active');
}

// 隐藏自定义确认框
function hideCustomConfirm() {
    const confirmModal = document.getElementById('custom-confirm');
    if (!confirmModal) return;
    
    // 隐藏确认框
    confirmModal.classList.remove('active');
}

// 自定义确认函数，模拟原生confirm的使用方式
function customConfirm(message, title = '提示', confirmText = '确定', cancelText = '取消') {
    return new Promise((resolve) => {
        const confirmTitle = document.querySelector('.custom-confirm-title');
        const confirmMessage = document.querySelector('.custom-confirm-message');
        const confirmOkBtn = document.getElementById('confirm-ok');
        const confirmCancelBtn = document.getElementById('confirm-cancel');
        
        if (confirmTitle) {
            confirmTitle.textContent = title;
        }
        
        if (confirmMessage) {
            confirmMessage.textContent = message;
        }
        
        if (confirmOkBtn) {
            confirmOkBtn.textContent = confirmText;
        }
        
        if (confirmCancelBtn) {
            if (cancelText) {
                confirmCancelBtn.textContent = cancelText;
                confirmCancelBtn.style.display = 'inline-block';
            } else {
                confirmCancelBtn.style.display = 'none';
            }
        }
        
        showCustomConfirm(resolve);
    });
}

// 移动端顶栏切换功能
function initMobileTopBarToggle() {
    // 创建切换按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'toggle-top-selector';
    toggleBtn.className = 'mobile-toggle-btn hidden';
    toggleBtn.textContent = '显示游戏章节';
    document.body.appendChild(toggleBtn);
    // 检查是否是移动端视图
    function checkMobileView() {
        const topSelector = document.querySelector('.top-selector');
        if (window.innerWidth <= 768) {
            // 移动端默认隐藏切换按钮，只在选择游戏后显示
            toggleBtn.classList.add('hidden');
            // 移动端保持当前顶栏选择器状态，不强制显示或隐藏
        } else {
            // 桌面端隐藏切换按钮
            toggleBtn.classList.add('hidden');
            // 在桌面端确保顶栏选择器可见
            if (topSelector) {
                // 先重置状态确保动画能触发
                topSelector.classList.remove('visible');
                // 强制重排
                topSelector.offsetHeight;
                // 再添加visible类触发动画
                setTimeout(() => {
                    topSelector.classList.add('visible');
                }, 10);
            }
        }
    }
    
    // 按钮点击事件处理
    toggleBtn.addEventListener('click', function() {
        const topSelector = document.querySelector('.top-selector');
        if (topSelector) {
            topSelector.classList.toggle('visible');
            toggleBtn.textContent = topSelector.classList.contains('visible') ? '隐藏游戏章节' : '显示游戏章节';
        }
    });
    
    // 初始检查
    checkMobileView();
    
    // 窗口大小变化时检查
    window.addEventListener('resize', checkMobileView);
}

// 显示移动端顶栏切换按钮
function showMobileTopBarToggle() {
    const toggleBtn = document.getElementById('toggle-top-selector');
    if (toggleBtn && window.innerWidth <= 768) {
        toggleBtn.classList.remove('hidden');
    }
}

// 游戏类型选择逻辑
function initGameSelection() {
    const gameOptions = document.querySelectorAll('.game-option');
    const chapterSelector = document.getElementById('chapter-selector');
    const videoContainer = document.getElementById('video-container');
    const gameSelector = document.getElementById('game-selector');
    
    if (gameOptions.length > 0) {
        gameOptions.forEach(option => {
            option.addEventListener('click', function() {
                const game = this.dataset.game;
                
                // 切换body背景类
                if (game === 'undertale') {
                    document.body.classList.remove('bg_dr');
                    document.body.classList.add('bg_ut');
                } else if (game === 'deltarune') {
                    document.body.classList.remove('bg_ut');
                    document.body.classList.add('bg_dr');
                }
                
                // 为选择框添加渐隐效果
                gameSelector.classList.add('fade-out');
                
                // 减少延迟时间，加快过渡
                setTimeout(() => {
                        // 隐藏游戏选择器
                        gameSelector.classList.add('hidden');
                        // 移除渐隐类和visible类（为下次显示做准备）
                        gameSelector.classList.remove('fade-out', 'visible');
                        // 重置透明度和位移，确保下次动画能重新触发
                        gameSelector.style.opacity = '0';
                        gameSelector.style.transform = 'translateY(20px)';
                    
                    if (game === 'undertale') {
                        // 直接显示传说之下视频
                        chapterSelector.classList.add('hidden');
                        
                        // 重置视频容器的动画状态
                        videoContainer.classList.remove('visible');
                        videoContainer.style.opacity = '0';
                        videoContainer.style.transform = 'translateY(20px)';
                        // 强制重排
                        videoContainer.offsetHeight;
                        
                        // 显示视频容器
                        videoContainer.classList.remove('hidden');
                        // 移除fade-out类
                        videoContainer.classList.remove('fade-out');
                        
                        // 筛选视频
                        filterVideos(game, 'all');
                        // 显示顶部选择框
                        showTopSelector('game-selector');
                        // 立即检查并添加visible类，避免需要滚动才能显示
                        checkFadeElements();
                        // 视频渐显
                        animateVideoItems();
                    } else if (game === 'deltarune') {
                // 移除可能存在的返回按钮
                const existingReturnBtn = document.getElementById('return-to-game-selector');
                if (existingReturnBtn) {
                    existingReturnBtn.remove();
                }
                // 准备显示章节选择器
                // 先重置章节选择器的动画状态
                chapterSelector.classList.remove('visible');
                chapterSelector.style.opacity = '0';
                chapterSelector.style.transform = 'translateY(20px)';
                // 强制重排
                chapterSelector.offsetHeight;
                
                chapterSelector.classList.remove('hidden');
                
                // 隐藏视频容器并重置动画
                videoContainer.classList.add('hidden');
                videoContainer.classList.remove('visible');
                videoContainer.style.opacity = '0';
                videoContainer.style.transform = 'translateY(20px)';
                
                // 游戏选择器移到顶部
                showTopSelector('game-selector');
                
                // 立即检查并添加visible类，避免需要滚动才能显示章节选择器
                checkFadeElements();
            }
                }, 100);
            });
        });
    }
}

// 章节选择逻辑
function initChapterSelection() {
    const chapterOptions = document.querySelectorAll('.chapter-option');
    const videoContainer = document.getElementById('video-container');
    const gameSelector = document.getElementById('game-selector');
    const chapterSelector = document.getElementById('chapter-selector');
    
    if (chapterOptions.length > 0) {
        chapterOptions.forEach(option => {
            option.addEventListener('click', function() {
                const chapter = this.dataset.chapter;
                
                // 只添加渐隐效果，不立即隐藏
                chapterSelector.classList.add('fade-out');
                
                // 减少延迟时间
                setTimeout(() => {
                    // 隐藏章节选择器
                    chapterSelector.classList.add('hidden');
                    // 移除渐隐类和visible类（为下次显示做准备）
                    chapterSelector.classList.remove('fade-out', 'visible');
                    // 重置透明度和位移，确保下次动画能重新触发
                    chapterSelector.style.opacity = '0';
                    chapterSelector.style.transform = 'translateY(20px)';
                    // 确保游戏选择器保持隐藏
                    gameSelector.classList.add('hidden');
                    
                    // 重置视频容器的动画状态
                    videoContainer.classList.remove('visible');
                    videoContainer.style.opacity = '0';
                    videoContainer.style.transform = 'translateY(20px)';
                    // 强制重排
                    videoContainer.offsetHeight;
                    
                    // 直接显示视频容器
                    videoContainer.classList.remove('hidden');
                    // 移除fade-out类
                    videoContainer.classList.remove('fade-out');
                    // 筛选视频
                    filterVideos('deltarune', chapter);
                    // 显示顶部选择框
                    showTopSelector('chapter-selector');
                    // 立即检查并添加visible类，避免需要滚动才能显示
                    checkFadeElements();
                    // 视频渐显
                    animateVideoItems();
                }, 100);
            });
        });
    }
}

// 视频筛选功能
function filterVideos(game, chapter) {
    const videoItems = document.querySelectorAll('.video-item');
    
    if (videoItems.length > 0) {
        videoItems.forEach(item => {
            const itemGame = item.dataset.game;
            const itemChapter = item.dataset.chapter;
            
            if (itemGame === game && (chapter === 'all' || itemChapter === chapter)) {
                item.style.display = 'block';
                // 重置动画状态
                item.classList.remove('visible');
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
            } else {
                item.style.display = 'none';
                item.classList.remove('visible');
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
            }
        });
    }
}

// 设置菜单功能
function initSettingsMenu() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    
    if (!settingsBtn || !settingsMenu) return;
    
    // 点击设置按钮切换菜单显示状态
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active');
    });
    
    // 点击页面其他地方关闭设置菜单
    document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.remove('active');
        }
    });
}

// 深色模式切换功能
function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    
    if (!themeToggle) return;
    
    // 更新主题按钮状态
    function updateThemeButton(theme) {
        if (theme === 'dark') {
            themeToggle.classList.add('active');
        } else {
            themeToggle.classList.remove('active');
        }
    }
    
    // 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 设置初始主题（强制使用深色模式）
    const initialTheme = 'dark';
    root.setAttribute('data-theme', initialTheme);
    updateThemeButton(initialTheme);
    
    // 添加点击事件监听器
    themeToggle.addEventListener('click', () => {
        // 切换主题
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // 更新主题
        root.setAttribute('data-theme', newTheme);
        updateThemeButton(newTheme);
        
        // 保存到本地存储
        localStorage.setItem('theme', newTheme);
        
        // 添加切换动画效果
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    });
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // 只有在没有保存主题偏好时才响应系统变化
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            root.setAttribute('data-theme', newTheme);
            updateThemeButton(newTheme);
        }
    });
}








// 移动端汉堡菜单功能
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // 切换汉堡菜单图标
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = hamburger.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0) translate(0, 0)';
            spans[1].style.opacity = hamburger.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = hamburger.classList.contains('active') ? 'rotate(-45deg) translate(5px, -5px)' : 'rotate(0) translate(0, 0)';
        });
        
        // 点击导航链接后关闭菜单
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                // 恢复汉堡菜单图标
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'rotate(0) translate(0, 0)';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'rotate(0) translate(0, 0)';
            });
        });
    }
}

// 视频筛选功能
function initVideoFilter() {
    const chapterLinks = document.querySelectorAll('.chapter-link');
    const videoItems = document.querySelectorAll('.video-item');
    
    if (chapterLinks.length > 0 && videoItems.length > 0) {
        chapterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 移除所有活动状态
                chapterLinks.forEach(l => l.classList.remove('active'));
                // 添加当前活动状态
                link.classList.add('active');
                
                // 获取筛选条件
                const game = link.dataset.game;
                const chapter = link.dataset.chapter;
                
                // 筛选视频
                videoItems.forEach(item => {
                    const itemGame = item.dataset.game;
                    const itemChapter = item.dataset.chapter;
                    
                    if (itemGame === game && itemChapter === chapter) {
                        item.style.display = 'block';
                        // 确保视频项具有fade-in类以支持动画
                        item.classList.add('fade-in');
                        // 重置动画状态
                        item.classList.remove('visible');
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        // 强制重排
                        item.offsetHeight;
                        // 触发动画
                        setTimeout(() => {
                            item.classList.add('visible');
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('visible');
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                    }
                });
            });
        });
    }
}

// 显示顶部选择框
function showTopSelector(selectorId) {
    const selector = document.getElementById(selectorId);
    if (selector) {
        // 确保移除之前可能添加的顶部选择框类
        document.querySelectorAll('.top-selector').forEach(el => {
            el.classList.remove('top-selector', 'visible');
        });
        
        // 移除之前可能存在的占位符
        const existingPlaceholder = document.querySelector('.selector-placeholder');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }
        
        // 创建占位符以保持页面布局稳定
        const placeholder = document.createElement('div');
        placeholder.className = 'selector-placeholder';
        placeholder.style.height = selector.offsetHeight + 'px';
        placeholder.style.width = selector.offsetWidth + 'px';
        selector.parentNode.insertBefore(placeholder, selector);
        
        // 确保选择器可见（移除hidden类）
        selector.classList.remove('hidden');
        
        // 添加顶部选择框类
        selector.classList.add('top-selector');
        
        // 在选择游戏或章节后显示移动端切换按钮
        showMobileTopBarToggle();
        
        // 为章节选择器添加返回按钮
        if (selectorId === 'chapter-selector') {
            // 先移除可能存在的返回按钮
            const existingReturnBtn = document.getElementById('return-to-game-selector');
            if (existingReturnBtn) {
                existingReturnBtn.remove();
            }
            
            // 创建返回按钮
            const returnBtn = document.createElement('button');
            returnBtn.id = 'return-to-game-selector';
            returnBtn.textContent = '返回游戏选择';
            returnBtn.className = 'return-btn';
            
            // 将按钮添加到选择器容器的顶部
            const selectorContainer = selector.querySelector('.selector-container');
            if (selectorContainer) {
                selectorContainer.insertBefore(returnBtn, selectorContainer.firstChild);
            }
            
            // 添加返回按钮的事件监听器
            returnBtn.addEventListener('click', function() {
                // 获取视频容器、游戏选择器和章节选择器元素
                const videoContainer = document.getElementById('video-container');
                const gameSelector = document.getElementById('game-selector');
                const chapterSelector = document.getElementById('chapter-selector');
                
                // 为当前显示的元素添加渐隐效果
                if (videoContainer && !videoContainer.classList.contains('hidden')) {
                    videoContainer.classList.add('fade-out');
                }
                
                // 延迟执行后续操作，让渐隐动画完成
                setTimeout(() => {
                    // 隐藏当前的章节选择器（顶部和原始状态）和视频容器
                    selector.classList.remove('top-selector', 'visible');
                    if (videoContainer) {
                        videoContainer.classList.add('hidden');
                        videoContainer.classList.remove('fade-out');
                    }
                    if (chapterSelector) {
                        chapterSelector.classList.add('hidden');
                        // 移除返回按钮
                        const existingReturnBtn = document.getElementById('return-to-game-selector');
                        if (existingReturnBtn) {
                            existingReturnBtn.remove();
                        }
                    }
                    
                    // 移除占位符
                    const placeholder = document.querySelector('.selector-placeholder');
                    if (placeholder) {
                        placeholder.remove();
                    }
                    
                    // 显示游戏选择器
                    if (gameSelector) {
                        // 先重置游戏选择器的动画状态
                        gameSelector.classList.remove('visible');
                        gameSelector.style.opacity = '0';
                        gameSelector.style.transform = 'translateY(20px)';
                        // 强制重排
                        gameSelector.offsetHeight;
                        
                        gameSelector.classList.remove('hidden');
                        // 立即检查并添加visible类，确保动画触发
                        checkFadeElements();
                    }
                    
                    // 平滑滚动到顶部
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 300);
            });
        }
        
        // 强制重排以确保过渡正确触发
        selector.offsetHeight;
        
        // 显示顶部选择框（触发渐显动画）
        setTimeout(() => {
            selector.classList.add('visible');
        }, 10);
        
        // 平滑滚动到页面顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// 视频渐显动画
function animateVideoItems() {
    const videoItems = document.querySelectorAll('.video-item');
    
    if (videoItems.length > 0) {
        // 筛选出当前应该显示的视频项（已经被filterVideos函数设置为display: block）
        const visibleItems = Array.from(videoItems).filter(item => item.style.display === 'block');
        
        // 为每个可见的视频项添加动画效果
        visibleItems.forEach((item, index) => {
            // 确保视频项具有fade-in类以支持动画
            item.classList.add('fade-in');
            
            // 重置动画状态
            item.classList.remove('visible');
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            // 强制重排
            item.offsetHeight;
            
            // 缩短动画时间和延迟间隔
            item.style.transition = `opacity 0.3s ease ${index * 0.05}s, transform 0.3s ease ${index * 0.05}s`;
            
            // 触发动画
            item.classList.add('visible');
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            
            // 动画完成后重置过渡效果为默认值
            setTimeout(() => {
                item.style.transition = '';
            }, 300 + (index * 50)); // 300ms为动画时长，index*50ms为延迟补偿
            
            // 检查是否为剧透视频，如果是则添加剧透标签
            const videoThumbnail = item.querySelector('.video-thumbnail');
            // 先移除可能已存在的剧透标签，避免重复添加
            const existingSpoilerTag = videoThumbnail.querySelector('.spoiler-tag');
            if (existingSpoilerTag) {
                existingSpoilerTag.remove();
            }
            
            if (item.dataset.spoiler === 'true') {
                const spoilerTag = document.createElement('div');
                spoilerTag.className = 'spoiler-tag';
                spoilerTag.textContent = '剧透';
                videoThumbnail.appendChild(spoilerTag);
            }
            
            // 添加点击事件，跳转到播放器页面
            item.addEventListener('click', async function() {
                // 检查是否为剧透视频，如果是则显示二次确认
                if (this.dataset.spoiler === 'true') {
                    const isConfirmed = await customConfirm('警告：此视频包含剧透内容！\n\n确定要继续观看吗？');
                    if (!isConfirmed) {
                        return; // 用户取消，不执行跳转
                    }
                }
                
                const title = this.querySelector('.video-title').textContent;
                const date = this.querySelector('.video-date')?.textContent;
                const game = this.dataset.game;
                const chapter = this.dataset.chapter;
                const videoId = this.getAttribute('video_id');
                
                // 检查是否为异常视频（热域视频，video_id为空或包含异常状态）
                if (!videoId || this.querySelector('.status-warning')) {
                    await customConfirm('此视频状态异常，不可播放', '错误', '知道了', '');
                    return; // 不执行跳转
                }
                
                // 构建URL参数
                const urlParams = new URLSearchParams({
                    title: encodeURIComponent(title),
                    date: date ? encodeURIComponent(date) : '',
                    game: encodeURIComponent(game),
                    chapter: encodeURIComponent(chapter),
                    video_id: encodeURIComponent(videoId)
                });
                
                // 跳转到播放器页面
                window.location.href = `player.html?${urlParams.toString()}`;
            });
            
            // 为播放按钮添加点击事件
            const playBtn = item.querySelector('.play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    
                    // 检查是否为剧透视频，如果是则显示二次确认
                    if (item.dataset.spoiler === 'true') {
                        const isConfirmed = await customConfirm('警告：此视频包含剧透内容！\n\n确定要继续观看吗？');
                        if (!isConfirmed) {
                            return; // 用户取消，不执行跳转
                        }
                    }
                    
                    const title = item.querySelector('.video-title').textContent;
                    const date = item.querySelector('.video-date')?.textContent;
                    const game = item.dataset.game;
                    const chapter = item.dataset.chapter;
                    const videoId = item.getAttribute('video_id');
                    
                    // 检查是否为异常视频（热域视频，video_id为空或包含异常状态）
                    if (!videoId || item.querySelector('.status-warning')) {
                        await customConfirm('此视频不可跳转', '提示', '知道了', '');
                        return; // 不执行跳转
                    }
                    
                    // 构建URL参数
                    const urlParams = new URLSearchParams({
                        title: encodeURIComponent(title),
                        date: date ? encodeURIComponent(date) : '',
                        game: encodeURIComponent(game),
                        chapter: encodeURIComponent(chapter),
                        video_id: encodeURIComponent(videoId)
                    });
                    
                    // 跳转到播放器页面
                    window.location.href = `player.html?${urlParams.toString()}`;
                });
            }
        });
    }
}

// 资源筛选功能
function initResourceFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const resourceItems = document.querySelectorAll('.resource-item');
    
    if (categoryBtns.length > 0 && resourceItems.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有活动状态
                categoryBtns.forEach(b => b.classList.remove('active'));
                // 添加当前活动状态
                btn.classList.add('active');
                
                // 获取筛选条件
                const category = btn.dataset.category;
                
                // 筛选资源
                resourceItems.forEach(item => {
                    const itemCategory = item.dataset.category;
                    
                    if (category === 'all' || itemCategory === category) {
                        item.style.display = 'flex';
                        // 添加动画效果
                        item.classList.add('fade-in');
                        setTimeout(() => item.classList.add('visible'), 10);
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('visible');
                    }
                });
            });
        });
    }
}

// 滚动动画功能
function initScrollAnimation() {
    // 使用动态选择器，每次调用时都重新获取元素
    function checkFadeElements() {
        const fadeElements = document.querySelectorAll('.fade-in');
        
        fadeElements.forEach(element => {
            // 只处理可见的元素（display不为none）
            if (element.style.display !== 'none' && getComputedStyle(element).display !== 'none') {
                const elementTop = element.getBoundingClientRect().top;
                const elementBottom = element.getBoundingClientRect().bottom;
                const isVisible = (elementTop < window.innerHeight - 50) && (elementBottom > 0);
                
                if (isVisible && !element.classList.contains('visible')) {
                    element.classList.add('visible');
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            }
        });
    }
    
    // 初始检查
    checkFadeElements();
    
    // 滚动时检查
    window.addEventListener('scroll', checkFadeElements);
    
    // 窗口大小改变时检查
    window.addEventListener('resize', checkFadeElements);
    
    // 暴露函数以便其他地方调用
    window.checkFadeElements = checkFadeElements;
}

// 平滑滚动功能
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 减去导航栏高度
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 下载计数器功能
function initDownloadCounter() {
    const downloadBtns = document.querySelectorAll('.download-btn');
    
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 获取资源项
            const resourceItem = this.closest('.resource-item');
            if (resourceItem) {
                // 更新下载次数（模拟）
                const downloadMeta = resourceItem.querySelector('.resource-downloads');
                if (downloadMeta) {
                    // 提取当前下载次数
                    const currentCount = parseInt(downloadMeta.textContent.match(/\d+/)[0]);
                    // 更新显示
                    downloadMeta.textContent = `下载次数: ${currentCount + 1}`;
                    
                    // 添加点击动画
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                    
                    // 显示下载提示
                    showDownloadNotification();
                }
            }
        });
    });
}

// 显示下载通知
function showDownloadNotification() {
    // 检查是否已存在通知元素
    let notification = document.querySelector('.download-notification');
    
    if (!notification) {
        // 创建通知元素
        notification = document.createElement('div');
        notification.className = 'download-notification';
        notification.textContent = '资源下载中...';
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #4ECDC4;
            color: #2C2C2C;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
    }
    
    // 显示通知
    notification.style.transform = 'translateX(0)';
    
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 3000);
}

// 添加页面加载动画
window.addEventListener('load', function() {
    // 添加页面淡入效果
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // 添加视频卡片悬停效果
    const videoCards = document.querySelectorAll('.video-card, .video-item');
    videoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 添加资源项悬停效果
    const resourceItems = document.querySelectorAll('.resource-item');
    resourceItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// 添加滚动进度条
window.addEventListener('scroll', function() {
    // 计算滚动进度
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    // 检查是否已存在进度条
    let progressBar = document.querySelector('.progress-bar');
    
    if (!progressBar) {
        // 创建进度条
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, #7B4F9D, #4ECDC4);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }
    
    // 更新进度条宽度
    progressBar.style.width = scrolled + '%';
});

// 为所有可点击元素添加点击反馈
function addClickFeedback() {
    const clickableElements = document.querySelectorAll('a, button, .video-card, .video-item, .resource-item');
    
    clickableElements.forEach(element => {
        element.addEventListener('click', function(e) {
            // 优先处理按钮元素，确保波纹仅绑定到按钮
            let targetElement = this;
            let isButton = false;
            
            // 检查点击目标是否为按钮或在按钮内部
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                targetElement = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
                isButton = true;
                e.stopPropagation(); // 阻止事件冒泡到父元素
            }

            
            // 创建点击效果元素
            const ripple = document.createElement('span');
            const rect = targetElement.getBoundingClientRect();
            
            // 设置不同元素的波纹尺寸限制
            const maxButtonSize = 80; // 按钮波纹最大尺寸
            const maxElementSize = 100; // 其他元素波纹最大尺寸
            let size;
            
            if (isButton) {
                // 按钮使用更小的尺寸，确保在按钮内部
                size = Math.min(Math.max(rect.width, rect.height), maxButtonSize);
            } else {
                // 其他元素使用缩放后的尺寸
                size = Math.max(rect.width, rect.height) * 0.4;
                size = Math.min(size, maxElementSize);
            }
            
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;
            
            // 添加相对定位和溢出隐藏
            if (targetElement.style.position === '' || targetElement.style.position === 'static') {
                targetElement.style.position = 'relative';
            }
            
            // 确保按钮有溢出隐藏，防止波纹超出
            if (isButton && targetElement.style.overflow !== 'hidden') {
                targetElement.style.overflow = 'hidden';
            }
            
            // 添加点击效果
            targetElement.appendChild(ripple);
            
            // 动画结束后移除元素
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // 添加ripple动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 初始化点击反馈
addClickFeedback();

// 添加键盘导航支持
document.addEventListener('keydown', function(e) {
    // ESC键关闭菜单
    if (e.key === 'Escape') {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // 恢复汉堡菜单图标
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'rotate(0) translate(0, 0)';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'rotate(0) translate(0, 0)';
        }
    }
});

// 状态警告提示功能（PC端和移动端通用）
function initStatusWarningTips() {
    const warningElements = document.querySelectorAll('.status-warning');
    
    warningElements.forEach(element => {
        let tipElement = null;
        let hideTimeout = null;
        
        // 将title属性的值复制到data-title属性，并清空title属性以移除浏览器默认提示
        if (element.title) {
            element.dataset.title = element.title;
            element.title = '';
        }
        
        // 创建提示框
        function createTipElement() {
            const tip = document.createElement('div');
            tip.className = 'status-warning-tip';
            tip.textContent = element.dataset.title;
            tip.style.cssText = `
                position: absolute;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.9rem;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                white-space: nowrap;
            `;
            return tip;
        }
        
        // 显示提示框
        function showTip() {
            // 清除隐藏计时器
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            // 移除已存在的提示框
            document.querySelectorAll('.status-warning-tip').forEach(tip => tip.remove());
            
            // 创建并添加提示框
            tipElement = createTipElement();
            document.body.appendChild(tipElement);
            
            // 定位提示框
            const rect = element.getBoundingClientRect();
            tipElement.style.left = `${rect.left + window.scrollX}px`;
            tipElement.style.top = `${rect.top + window.scrollY - tipElement.offsetHeight - 10}px`;
            
            // 显示提示框
            tipElement.style.opacity = '1';
        }
        
        // 隐藏提示框
        function hideTip() {
            if (tipElement) {
                tipElement.style.opacity = '0';
                hideTimeout = setTimeout(() => {
                    if (tipElement && tipElement.parentNode) {
                        tipElement.remove();
                    }
                    tipElement = null;
                }, 200);
            }
        }
        
        // 添加鼠标事件（PC端）
        element.addEventListener('mouseenter', showTip);
        element.addEventListener('mouseleave', hideTip);
        
        // 添加点击事件（移动端）
        element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showTip();
            
            // 3秒后自动隐藏
            hideTimeout = setTimeout(hideTip, 3000);
        });
    });
    
    // 点击其他区域隐藏所有提示框
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.status-warning')) {
            document.querySelectorAll('.status-warning-tip').forEach(tip => {
                tip.style.opacity = '0';
                setTimeout(() => {
                    if (tip.parentNode) {
                        tip.remove();
                    }
                }, 200);
            });
        }
    });
}

// 初始化移动端提示功能
document.addEventListener('DOMContentLoaded', initStatusWarningTips);

// 随机显示推荐视频
function loadRecommendedVideos() {
    // 从content.html获取视频内容
    fetch('content.html')
        .then(response => response.text())
        .then(html => {
            // 创建临时DOM元素来解析HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 获取所有视频项
            const allVideos = tempDiv.querySelectorAll('.video-item');
            
            // 如果没有视频，不执行后续操作
            if (allVideos.length === 0) return;
            
            // 随机选择4-6个视频
            const videoCount = Math.floor(Math.random() * 3) + 4; // 4-6个视频
            const shuffledVideos = Array.from(allVideos).sort(() => 0.5 - Math.random());
            const selectedVideos = shuffledVideos.slice(0, videoCount);
            
            // 获取推荐视频容器
            const container = document.querySelector('.popular-videos .container');
            if (!container) return;
            
            // 移除"暂无推荐视频"文本
            const noVideosText = container.querySelector('.no-videos');
            if (noVideosText) {
                noVideosText.remove();
            }
            
            // 创建视频网格
            let videosHTML = '<div class="video-grid">';
            selectedVideos.forEach(video => {
                videosHTML += video.outerHTML;
            });
            videosHTML += '</div>';
            
            // 插入视频到容器
            container.innerHTML += videosHTML;
            
            // 为推荐视频添加动画效果
            setTimeout(() => {
                const videoItems = container.querySelectorAll('.video-item');
                videoItems.forEach((item, index) => {
                    item.classList.add('fade-in');
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }, 100);
            
            // 为推荐视频添加点击事件
            const videoItems = container.querySelectorAll('.video-item');
            videoItems.forEach(item => {
                // 视频项点击事件
                item.addEventListener('click', function() {
                    const videoId = this.getAttribute('video_id');
                    const game = this.dataset.game;
                    const chapter = this.dataset.chapter;
                    
                    // 检查视频ID是否为空或无效
                    if (!videoId || videoId === '') {
                        customConfirm('此视频状态异常，无法播放', '错误', '确定', '');
                        return;
                    }
                    
                    // 检查是否有警告状态
                    if (this.querySelector('.status-warning')) {
                        customConfirm('该视频可能包含剧透内容，确定要继续观看吗？', '警告', '继续观看', '取消')
                            .then(result => {
                                if (result) {
                                    // 跳转到播放页面
                                    window.location.href = `player.html?video_id=${videoId}&game=${game}&chapter=${chapter}`;
                                }
                            });
                    } else {
                        // 跳转到播放页面
                        window.location.href = `player.html?video_id=${videoId}&game=${game}&chapter=${chapter}`;
                    }
                });
                
                // 播放按钮点击事件
                const playBtn = item.querySelector('.play-btn');
                if (playBtn) {
                    playBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        // 触发视频项的点击事件
                        item.click();
                    });
                }
            });
        })
        .catch(error => console.error('加载推荐视频失败:', error));
}