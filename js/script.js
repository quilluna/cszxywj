// 全局数据
let allVideosData = [];
let allNotificationsData = [];
let updatePreviewData = {};

// 从Cloudflare Functions API加载数据
async function loadVideosData() {
    // 检查本地缓存
    const cachedData = localStorage.getItem('videosData');
    const cachedTime = localStorage.getItem('videosDataTimestamp');
    const now = Date.now();
    const cacheExpiry = 60 * 60 * 1000; // 1小时缓存
    
    // 如果缓存有效，直接使用
    if (cachedData && cachedTime && (now - parseInt(cachedTime)) < cacheExpiry) {
        console.log('使用缓存数据');
        const parsedData = JSON.parse(cachedData);
        allVideosData = parsedData.videos || [];
        allNotificationsData = parsedData.notifications || [];
        updatePreviewData = parsedData.updatePreview || {};
        return { videos: allVideosData, notifications: allNotificationsData, updatePreview: updatePreviewData };
    }
    
    // 获取加载提示元素
    const loadingIndicator = document.getElementById('data-loading-indicator');
    
    // 显示数据加载提示
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    try {
        // Cloudflare Worker API端点
        const workerUrl = 'https://api.bo173.dpdns.org/cszxywj/fetch_data';
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        const responseData = await response.json();
        const data = responseData.data || {};
        allVideosData = data.videos || [];
        allNotificationsData = data.notifications || [];
        updatePreviewData = data.update_preview || {};
        
        // 检查是否使用了备选方案
        const source = responseData._source;
        if (source && source !== 'main') {
            // 解析备选方案编号
            const backupMatch = source.match(/backup(\d+)/);
            const backupNumber = backupMatch ? backupMatch[1] : '未知';
            
            // 显示备选方案提示模态框
            setTimeout(() => {
                const modal = document.getElementById('custom-confirm');
                if (modal) {
                    const messageElement = document.querySelector('.custom-confirm-message');
                    const titleElement = document.querySelector('.custom-confirm-title');
                    const cancelBtn = document.getElementById('confirm-cancel');
                    
                    if (titleElement) {
                        titleElement.textContent = '警告';
                    }
                    
                    if (messageElement) {
                        messageElement.textContent = `当前使用的是备选方案 ${backupNumber}，若数据不是最新，可联系网站管理员解决此问题。`;
                    }
                    
                    if (cancelBtn) {
                        cancelBtn.style.display = 'none';
                    }
                    
                    // 使用showCustomConfirm函数显示模态框
                    showCustomConfirm(() => {});
                }
            }, 1000);
        }
        
        // 缓存数据
        const cacheData = { videos: allVideosData, notifications: allNotificationsData, updatePreview: updatePreviewData };
        localStorage.setItem('videosData', JSON.stringify(cacheData));
        localStorage.setItem('videosDataTimestamp', now.toString());
        console.log('数据已缓存');
        
        // 隐藏数据加载提示
        if (loadingIndicator) {
            loadingIndicator.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
                loadingIndicator.style.animation = '';
            }, 300);
        }
        
        return { videos: allVideosData, notifications: allNotificationsData, updatePreview: updatePreviewData };
    } catch (error) {
        console.error('加载数据失败:', error);
        // 错误时回退到本地数据
        try {
            const localResponse = await fetch('data.json');
            if (localResponse.ok) {
                const localData = await localResponse.json();
                allVideosData = localData.videos || [];
                allNotificationsData = localData.notifications || [];
                updatePreviewData = localData.update_preview || {};
                
                // 显示警告模态框
                setTimeout(() => {
                    const modal = document.getElementById('custom-confirm');
                    if (modal) {
                        // 从本地数据获取最后更新日期
                        const lastUpdatedDate = localData.last_updated || '以前';
                        const messageElement = document.querySelector('.custom-confirm-message');
                        const titleElement = document.querySelector('.custom-confirm-title');
                        const cancelBtn = document.getElementById('confirm-cancel');
                        
                        if (titleElement) {
                            titleElement.textContent = '警告';
                        }
                        
                        if (messageElement) {
                            messageElement.textContent = `无法获取最新数据，已回滚到 ${lastUpdatedDate} 的数据，所以此站点目前的信息很可能已经过时，请联系站点管理员解决此问题。`;
                        }
                        
                        if (cancelBtn) {
                            cancelBtn.style.display = 'none';
                        }
                        
                        // 使用showCustomConfirm函数显示模态框
                        showCustomConfirm(() => {});
                    }
                }, 1000);
                
                // 隐藏数据加载提示
                if (loadingIndicator) {
                    loadingIndicator.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        loadingIndicator.style.display = 'none';
                        loadingIndicator.style.animation = '';
                    }, 300);
                }
                
                return { videos: allVideosData, notifications: allNotificationsData, updatePreview: updatePreviewData };
            }
            throw new Error('本地数据请求失败');
        } catch (localError) {
            console.error('本地数据加载失败:', localError);
            
            // 隐藏数据加载提示
            if (loadingIndicator) {
                loadingIndicator.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                    loadingIndicator.style.animation = '';
                }, 300);
            }
            
            // 显示错误提示
            setTimeout(() => {
                const modal = document.getElementById('custom-confirm');
                if (modal) {
                    const messageElement = document.querySelector('.custom-confirm-message');
                    const titleElement = document.querySelector('.custom-confirm-title');
                    const cancelBtn = document.getElementById('confirm-cancel');
                    
                    if (titleElement) {
                        titleElement.textContent = '错误';
                    }
                    
                    if (messageElement) {
                        messageElement.textContent = '无法加载数据，请稍后重试或联系站点管理员。';
                    }
                    
                    if (cancelBtn) {
                        cancelBtn.style.display = 'none';
                    }
                    
                    // 使用showCustomConfirm函数显示模态框
                    showCustomConfirm(() => {});
                }
            }, 1000);
            
            return { videos: [], notifications: [], updatePreview: {} };
        }
    }
}

// 将通知数据渲染到容器中
function renderNotificationsToContainer(notifications, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (notifications.length === 0) {
        container.innerHTML = '<p class="no-notifications">暂无通知</p>';
        return;
    }
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `warn-card ${notification.type}`;
        
        // YYYY-MM-DD
        let formattedDate = '';
        if (notification.date) {
            formattedDate = formatDate(notification.date);
        }
        
        notificationItem.innerHTML = `
            <h4>${notification.title}</h4>
            <p>${notification.content}</p>
            ${formattedDate ? `<p class="notification-date">生效日期：${formattedDate}</p>` : ''}
        `;
        
        container.appendChild(notificationItem);
    });
}

// 将视频数据渲染到容器中
function renderVideosToContainer(videos, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (videos.length === 0) {
        container.innerHTML = '<p class="no-videos">暂无视频</p>';
        return;
    }
    
    videos.forEach(video => {
        const statusClass = video.status === '异常' ? 'status-warning' : '';
        const spoilerAttr = video.spoiler ? 'data-spoiler="true"' : '';
        
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.dataset.game = video.game;
        videoItem.dataset.chapter = video.chapter;
        videoItem.setAttribute('video_id', video.video_id || '');
        if (video.spoiler) {
            videoItem.setAttribute('data-spoiler', 'true');
        }
        
        videoItem.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="video-duration">${video.duration}</div>
                <div class="play-btn">▶</div>
            </div>
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-meta">
                    <span class="video-date">
                        ${video.status === '异常' ? `<span class="${statusClass}" title="${video.error_reason || '审核未通过'}">${video.status}</span>` : video.status} ${formatDateTime(video.date)}
                    </span>
                    <span class="video-game-tag">${video.tags[0]}</span>
                </div>
            </div>
        `;
        
        container.appendChild(videoItem);
    });
    
    // 重新初始化状态警告提示，因为动态生成了status-warning元素
    initStatusWarningTips();
}

// 日期时间格式化函数：将日期对象或字符串格式化为标准日期时间格式
// includeTime: 是否包含时间部分（默认true）
function formatDateTime(dateStr, includeTime = true) {
    if (!dateStr) return '';
    
    // 处理不同格式的日期字符串
    let dateObj;
    if (dateStr.includes('T')) {
        // YYYY-MM-DDThh:mm
        dateObj = new Date(dateStr);
    } else if (dateStr.includes(' ')) {
        // YYYY-MM-DD HH:MM
        dateObj = new Date(dateStr.replace(' ', 'T'));
    } else {
        // YYYY-MM-DD
        dateObj = new Date(dateStr);
    }
    
    if (isNaN(dateObj.getTime())) return dateStr;
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    if (!includeTime) {
        return `${year}-${month}-${day}`;
    }
    
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 日期格式化函数：将日期对象或字符串格式化为标准日期格式（仅日期，无时间）
function formatDate(dateStr) {
    return formatDateTime(dateStr, false);
}

// 保存上一次的倒计时值
let lastCountdownValues = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
};

// 动态计算倒计时
function updateCountdown() {
    // 检查更新时间状态
    const updateTimeElement = document.querySelector('.update-time');
    const countdownElement = document.getElementById('countdown-timer');
    
    // 从全局updatePreviewData获取下次更新时间
    if (typeof updatePreviewData !== 'undefined' && updatePreviewData.time && updatePreviewData.time !== 'pending') {
        // 更新状态为已安排
        if (updateTimeElement) {
            updateTimeElement.dataset.status = 'scheduled';
            updateTimeElement.textContent = `更新时间：${updatePreviewData.time}`;
        }
        
        // 显示倒计时
        if (countdownElement) {
            countdownElement.style.display = 'block';
            
            // 处理日期格式，确保正确解析
            let nextUpdateTime;
            const timeStr = updatePreviewData.time;
            if (timeStr.includes(' ')) {
                // 格式：YYYY-MM-DD HH:MM
                nextUpdateTime = new Date(timeStr.replace(' ', 'T')).getTime();
            } else {
                nextUpdateTime = new Date(timeStr).getTime();
            }
            
            // 检查日期是否有效
            if (!isNaN(nextUpdateTime)) {
                const now = new Date().getTime();
                const timeRemaining = nextUpdateTime - now;

                if (timeRemaining <= 0) {
                    countdownElement.textContent = '视频已更新！';
                    return;
                }

                // 计算天、时、分、秒
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                // 检查数字是否变化（在更新lastCountdownValues之前）
                const hasChanged = {
                    days: days !== lastCountdownValues.days,
                    hours: hours !== lastCountdownValues.hours,
                    minutes: minutes !== lastCountdownValues.minutes,
                    seconds: seconds !== lastCountdownValues.seconds
                };

                // 检查现有倒计时数字元素
                const numberElements = countdownElement.querySelectorAll('.countdown-number');
                
                if (numberElements.length === 4) {
                    // 已有元素，只更新变化的数字
                    if (hasChanged.days) {
                        numberElements[0].classList.add('changing');
                        // 在动画透明阶段更新数字
                        setTimeout(() => {
                            numberElements[0].textContent = days;
                        }, 200); // 动画总时长的40%，此时数字完全透明
                        // 动画结束后移除changing类
                        setTimeout(() => {
                            numberElements[0].classList.remove('changing');
                        }, 500);
                    }
                    if (hasChanged.hours) {
                        numberElements[1].classList.add('changing');
                        // 在动画透明阶段更新数字
                        setTimeout(() => {
                            numberElements[1].textContent = hours;
                        }, 200); // 动画总时长的40%，此时数字完全透明
                        // 动画结束后移除changing类
                        setTimeout(() => {
                            numberElements[1].classList.remove('changing');
                        }, 500);
                    }
                    if (hasChanged.minutes) {
                        numberElements[2].classList.add('changing');
                        // 在动画透明阶段更新数字
                        setTimeout(() => {
                            numberElements[2].textContent = minutes;
                        }, 200); // 动画总时长的40%，此时数字完全透明
                        // 动画结束后移除changing类
                        setTimeout(() => {
                            numberElements[2].classList.remove('changing');
                        }, 500);
                    }
                    if (hasChanged.seconds) {
                        numberElements[3].classList.add('changing');
                        // 在动画透明阶段更新数字
                        setTimeout(() => {
                            numberElements[3].textContent = seconds;
                        }, 200); // 动画总时长的40%，此时数字完全透明
                        // 动画结束后移除changing类
                        setTimeout(() => {
                            numberElements[3].classList.remove('changing');
                        }, 500);
                    }
                } else {
                    // 首次渲染，构建完整HTML结构
                    let countdownHTML = '剩 ';
                    countdownHTML += `<span class="countdown-number">${days}</span> 天 `;
                    countdownHTML += `<span class="countdown-number">${hours}</span> 时 `;
                    countdownHTML += `<span class="countdown-number">${minutes}</span> 分 `;
                    countdownHTML += `<span class="countdown-number">${seconds}</span> 秒`;
                    // 更新倒计时显示
                    countdownElement.innerHTML = countdownHTML;
                }

                // 保存当前值
                lastCountdownValues = {
                    days,
                    hours,
                    minutes,
                    seconds
                };
            } else {
                // 日期格式无效
                countdownElement.textContent = '时间格式错误';
            }
        }
    } else {
        // 如果没有更新时间，则隐藏倒计时
        if (countdownElement) {
            countdownElement.style.display = 'none';
        }
        // 更新状态为待定
        if (updateTimeElement) {
            updateTimeElement.dataset.status = 'pending';
            updateTimeElement.textContent = '更新时间待定';
        }
    }
}

// 渲染更新预告时间
function renderUpdatePreview() {
    const updateTimeElement = document.querySelector('.update-time');
    const countdownElement = document.getElementById('countdown-timer');
    const updateTitleElement = document.querySelector('.update-title');
    
    // 更新标题
    if (updateTitleElement && updatePreviewData.title) {
        updateTitleElement.textContent = updatePreviewData.title;
    }
    
    // 更新时间
    if (updateTimeElement) {
        const status = updatePreviewData.status || (updatePreviewData.time && updatePreviewData.time !== 'pending' ? 'scheduled' : 'pending');
        
        if (status === 'scheduled' && updatePreviewData.time && updatePreviewData.time !== 'pending') {
            updateTimeElement.textContent = `更新时间：${formatDateTime(updatePreviewData.time)}`;
            updateTimeElement.dataset.status = 'scheduled';
        } else {
            updateTimeElement.textContent = '更新时间待定';
            updateTimeElement.dataset.status = 'pending';
        }
    }
    
    // 更新倒计时
    if (countdownElement && updatePreviewData.time && updatePreviewData.time !== 'pending') {
        countdownElement.style.display = 'block';
        // 初始化倒计时内容
        updateCountdown();
    } else if (countdownElement) {
        countdownElement.style.display = 'none';
    }
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 先加载视频数据，再初始化其他功能
    loadVideosData().then(data => {
        initVideoFilter();
        initResourceFilter();
        initScrollAnimation();
        initSmoothScroll();
        initDownloadCounter();
        initGameSelection();
        initChapterSelection();
        initDesktopTopBar();
        initCustomConfirm();
        initNotifications();
        loadRecommendedVideos();
        renderUpdatePreview(); // 渲染更新预告时间
    });
    
    // 初始化设置菜单和声音设置
    initSettingsMenu();
    initSoundSettings();
    
    // 初始化模态框关闭功能
    const closeModal = document.getElementById('close-modal');
    const okModal = document.getElementById('ok-modal');
    const warningModal = document.getElementById('warning-modal');
    
    if (closeModal && okModal && warningModal) {
        closeModal.addEventListener('click', function() {
            warningModal.style.display = 'none';
        });
        
        okModal.addEventListener('click', function() {
            warningModal.style.display = 'none';
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', function(event) {
            if (event.target === warningModal) {
                warningModal.style.display = 'none';
            }
        });
    }
});

// 初始化通知模块
function initNotifications() {
    const notificationContainer = document.getElementById('notifications-container');
    if (notificationContainer) {
        renderNotificationsToContainer(allNotificationsData, notificationContainer);
        
        // 检查是否存在warning类型的通知
        const hasWarningNotification = allNotificationsData.some(notification => notification.type === 'warning');
        const updateCard = document.querySelector('.update-card');
        
        if (updateCard) {
            if (hasWarningNotification) {
                // 有warning通知时，使用默认的橙色发光
                updateCard.classList.remove('no-warning');
            } else {
                // 没有warning通知时，使用蓝色发光
                updateCard.classList.add('no-warning');
            }
        }
    }
}

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
    const confirmOkBtn = document.getElementById('confirm-ok');
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    
    if (!confirmModal || !confirmOkBtn || !confirmCancelBtn) return;
    
    // 确定按钮点击事件
    confirmOkBtn.addEventListener('click', function() {
        hideCustomConfirm();
        if (window.customConfirmCallback) {
            window.customConfirmCallback(true);
        }
    });
    
    // 取消按钮点击事件
    confirmCancelBtn.addEventListener('click', function() {
        hideCustomConfirm();
        if (window.customConfirmCallback) {
            window.customConfirmCallback(false);
        }
    });
    
    // 点击遮罩层关闭确认框
    const confirmOverlay = document.querySelector('.custom-confirm-overlay');
    if (confirmOverlay) {
        confirmOverlay.addEventListener('click', function() {
            hideCustomConfirm();
            if (window.customConfirmCallback) {
                window.customConfirmCallback(false);
            }
        });
    }
    
    // 按ESC键关闭确认框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && confirmModal.classList.contains('active')) {
            hideCustomConfirm();
            if (window.customConfirmCallback) {
                window.customConfirmCallback(false);
            }
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
    
    // 重置确认框状态
    setTimeout(() => {
        const confirmCancelBtn = document.getElementById('confirm-cancel');
        if (confirmCancelBtn) {
            confirmCancelBtn.style.display = 'inline-block';
        }
    }, 300);
    
    // 移除回调函数
    setTimeout(() => {
        window.customConfirmCallback = null;
    }, 300);
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

// 处理管理入口点击事件
function handleAdminClick(event) {
    event.preventDefault();
    
    customConfirm(
        '注意：此页面为 JSON 数据预览界面，仅用于开发或配置参考。普通用户建议取消访问，无需在此页面进行任何操作。',
        '此页面可能不适合你',
        '继续访问',
        '取消访问'
    ).then((confirmed) => {
        if (confirmed) {
            window.location.href = 'admin.html';
        }
    });
}

// 桌面端顶栏显示功能
function initDesktopTopBar() {
    // 检查是否是移动端视图
    function checkMobileView() {
        const topSelector = document.querySelector('.top-selector');
        if (window.innerWidth > 768) {
            // 桌面端确保顶栏选择器可见
            if (topSelector) {
                // 先重置状态确保动画能触发
                topSelector.classList.remove('visible');
                // 使用requestAnimationFrame代替强制重排，让浏览器在适当的时机执行动画
                requestAnimationFrame(() => {
                    topSelector.classList.add('visible');
                });
            }
        }
    }
    
    // 初始检查
    checkMobileView();
    
    // 窗口大小变化时检查
    window.addEventListener('resize', checkMobileView);
}

// 不再显示移动端顶栏切换按钮
function showMobileTopBarToggle() {
    // 移动端不再需要这个按钮
    return;
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
                        if (chapterSelector) {
                            chapterSelector.classList.add('hidden');
                        }
                        
                        // 重置视频容器的动画状态
                        if (videoContainer) {
                            videoContainer.classList.remove('visible');
                            videoContainer.style.opacity = '0';
                            videoContainer.style.transform = 'translateY(20px)';
                            
                            // 显示视频容器
                            videoContainer.classList.remove('hidden');
                            videoContainer.classList.remove('fade-out');
                        }
                        
                        // 使用requestAnimationFrame代替强制重排
                        requestAnimationFrame(() => {
                            if (videoContainer) {
                                videoContainer.classList.add('visible');
                            }
                        });
                        
                        // 筛选并渲染视频（排除状态异常的视频）
                        const undertaleVideos = allVideosData.filter(v => v.game === 'undertale');
                        renderVideosToContainer(undertaleVideos, videoContainer);
                        
                        // 筛选视频（用于显示/隐藏逻辑）
                        filterVideos(game, 'all');
                        // 显示顶部选择框
                        showTopSelector('game-selector');
                        // 立即检查并添加visible类
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
                        
                        chapterSelector.classList.remove('hidden');
                        
                        // 使用requestAnimationFrame代替强制重排
                        requestAnimationFrame(() => {
                            chapterSelector.classList.add('visible');
                        });
                        
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
                    
                    // 直接显示视频容器
                    videoContainer.classList.remove('hidden');
                    videoContainer.classList.remove('fade-out');
                    
                    // 使用requestAnimationFrame代替强制重排
                    requestAnimationFrame(() => {
                        videoContainer.classList.add('visible');
                    });
                    
                    // 筛选并渲染视频（排除状态异常的视频）
                    const deltaruneVideos = allVideosData.filter(v => v.game === 'deltarune' && (chapter === 'all' || v.chapter === chapter));
                    renderVideosToContainer(deltaruneVideos, videoContainer);
                    
                    // 筛选视频
                    filterVideos('deltarune', chapter);
                    // 显示顶部选择框
                    showTopSelector('chapter-selector');
                    // 立即检查并添加visible类
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
    
    // 移除现有的事件监听器，避免重复添加
    const newSettingsBtn = settingsBtn.cloneNode(true);
    settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);
    
    // 重新获取引用
    const updatedSettingsBtn = document.getElementById('settingsBtn');
    
    // 点击设置按钮切换菜单显示状态
    updatedSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active');
    });
    
    // 刷新数据按钮功能
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    if (refreshDataBtn) {
        // 移除现有的事件监听器，避免重复添加
        const newRefreshDataBtn = refreshDataBtn.cloneNode(true);
        refreshDataBtn.parentNode.replaceChild(newRefreshDataBtn, refreshDataBtn);
        
        // 重新获取引用
        const updatedRefreshDataBtn = document.getElementById('refreshDataBtn');
        
        updatedRefreshDataBtn.addEventListener('click', async () => {
            try {
                // 显示加载状态
                updatedRefreshDataBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                updatedRefreshDataBtn.disabled = true;
                
                // 调用clear_cache端点
                const workerUrl = 'https://api.bo173.dpdns.org/cszxywj/clear_cache';
                const clearCacheResponse = await fetch(workerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                
                const clearCacheData = await clearCacheResponse.json();
                
                if (clearCacheData.code === 200) {
                    // 清除本地缓存
                    localStorage.removeItem('videosData');
                    localStorage.removeItem('videosDataTimestamp');
                    
                    // 重新获取数据
                    await loadVideosData();
                    
                    // 显示成功提示
                    customConfirm('数据刷新成功！', '成功', '确定', null);
                } else {
                    // 显示失败提示
                    customConfirm('刷新失败，请稍后重试', '失败', '确定', null);
                }
            } catch (error) {
                console.error('刷新数据失败:', error);
                customConfirm('刷新失败，请检查网络连接', '错误', '确定', null);
            } finally {
                // 恢复按钮状态
                updatedRefreshDataBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                updatedRefreshDataBtn.disabled = false;
            }
        });
    }
}

// 深色模式切换功能
function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    
    if (!themeToggle) return;
    
    // 移除现有的事件监听器，避免重复添加
    const newThemeToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
    
    // 重新获取引用
    const updatedThemeToggle = document.getElementById('themeToggle');
    
    // 更新主题按钮状态
    function updateThemeButton(theme) {
        if (updatedThemeToggle) {
            if (theme === 'dark') {
                updatedThemeToggle.classList.add('active');
            } else {
                updatedThemeToggle.classList.remove('active');
            }
        }
    }
    
    // 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 设置初始主题
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', initialTheme);
    updateThemeButton(initialTheme);
    
    // 添加点击事件监听器
    if (updatedThemeToggle) {
        updatedThemeToggle.addEventListener('click', () => {
            // 切换主题
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // 更新主题
            root.setAttribute('data-theme', newTheme);
            updateThemeButton(newTheme);
            
            // 保存到本地存储
            localStorage.setItem('theme', newTheme);
            
            // 添加切换动画效果
            updatedThemeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                updatedThemeToggle.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
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
                        // 触发动画
                        requestAnimationFrame(() => {
                            item.classList.add('visible');
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        });
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
    const videoContainer = document.getElementById('video-container');
    
    if (selector) {
        // 检查是否是移动端
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) {
            // 桌面端：保持原有功能
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
                            
                            gameSelector.classList.remove('hidden');
                            // 使用requestAnimationFrame代替强制重排
                            requestAnimationFrame(() => {
                                // 立即检查并添加visible类，确保动画触发
                                checkFadeElements();
                            });
                        }
                        
                        // 平滑滚动到顶部
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 300);
                });
            }
            
            // 使用requestAnimationFrame代替强制重排
            requestAnimationFrame(() => {
                // 显示顶部选择框（触发渐显动画）
                selector.classList.add('visible');
            });
            
            // 平滑滚动到页面顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // 移动端：隐藏选择器，在视频显示后添加返回按钮
            // 移除之前可能存在的占位符
            const existingPlaceholder = document.querySelector('.selector-placeholder');
            if (existingPlaceholder) {
                existingPlaceholder.remove();
            }
            
            // 确保选择器隐藏
            selector.classList.add('hidden');
            
            // 移除可能存在的顶部选择框类
            selector.classList.remove('top-selector', 'visible');
            
            // 检查视频容器是否可见
            if (videoContainer && !videoContainer.classList.contains('hidden')) {
                // 为视频容器添加返回游戏选择按钮
                const existingReturnBtn = document.getElementById('mobile-return-to-game-selector');
                if (!existingReturnBtn) {
                    // 创建返回按钮
                    const returnBtn = document.createElement('button');
                    returnBtn.id = 'mobile-return-to-game-selector';
                    returnBtn.textContent = '返回游戏选择';
                    returnBtn.className = 'return-btn mobile-return-btn';
                    
                    // 将按钮添加到视频容器的顶部
                    videoContainer.insertBefore(returnBtn, videoContainer.firstChild);
                    
                    // 添加返回按钮的事件监听器
                    returnBtn.addEventListener('click', function() {
                        // 获取游戏选择器和章节选择器元素
                        const gameSelector = document.getElementById('game-selector');
                        const chapterSelector = document.getElementById('chapter-selector');
                        
                        // 为当前显示的元素添加渐隐效果
                        if (videoContainer && !videoContainer.classList.contains('hidden')) {
                            videoContainer.classList.add('fade-out');
                        }
                        
                        // 延迟执行后续操作，让渐隐动画完成
                        setTimeout(() => {
                            // 隐藏视频容器
                            if (videoContainer) {
                                videoContainer.classList.add('hidden');
                                videoContainer.classList.remove('fade-out');
                            }
                            
                            // 隐藏章节选择器
                            if (chapterSelector) {
                                chapterSelector.classList.add('hidden');
                            }
                            
                            // 移除返回按钮
                            const existingReturnBtn = document.getElementById('mobile-return-to-game-selector');
                            if (existingReturnBtn) {
                                existingReturnBtn.remove();
                            }
                            
                            // 显示游戏选择器
                            if (gameSelector) {
                                // 先重置游戏选择器的动画状态
                                gameSelector.classList.remove('visible');
                                gameSelector.style.opacity = '0';
                                gameSelector.style.transform = 'translateY(20px)';
                                
                                gameSelector.classList.remove('hidden');
                                // 使用requestAnimationFrame代替强制重排
                                requestAnimationFrame(() => {
                                    // 立即检查并添加visible类，确保动画触发
                                    checkFadeElements();
                                });
                            }
                            
                            // 平滑滚动到顶部
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 300);
                    });
                }
            }
        }
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
            
            // 调慢动画时间和延迟间隔
            item.style.transition = `opacity 0.8s ease ${index * 0.10}s, transform 0.8s ease ${index * 0.15}s`;
            
            // 触发动画
            item.classList.add('visible');
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            
            // 动画完成后重置过渡效果为默认值
            setTimeout(() => {
                item.style.transition = '';
            }, 800 + (index * 100)); // 800ms为动画时长，index*100ms为延迟补偿
            
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



// 声音设置功能
function initSoundSettings() {
    // 获取声音设置相关元素
    let musicToggle = document.getElementById('musicToggle');
    let musicVolume = document.getElementById('musicVolume');
    let musicThemeSelector = document.getElementById('musicThemeSelector');
    let musicTheme = document.getElementById('musicTheme');
    
    // 检查元素是否存在
    if (!musicToggle || !musicVolume || !musicThemeSelector || !musicTheme) return;
    
    // 初始化声音设置对象
    window.soundSettings = window.soundSettings || {
        musicEnabled: false,
        musicVolume: parseInt(localStorage.getItem('musicVolume')) || 70,
        musicTheme: localStorage.getItem('musicTheme') || 'undertale'
    };
    const soundSettings = window.soundSettings;
    
    // 移除现有事件监听器，避免重复添加
    const newMusicToggle = musicToggle.cloneNode(true);
    const newMusicVolume = musicVolume.cloneNode(true);
    const newMusicTheme = musicTheme.cloneNode(true);
    
    // 替换元素
    musicToggle.parentNode.replaceChild(newMusicToggle, musicToggle);
    musicVolume.parentNode.replaceChild(newMusicVolume, musicVolume);
    musicTheme.parentNode.replaceChild(newMusicTheme, musicTheme);
    
    // 重新获取引用
    musicToggle = document.getElementById('musicToggle');
    musicVolume = document.getElementById('musicVolume');
    musicTheme = document.getElementById('musicTheme');
    
    // 音量渐变函数
    function fadeInVolume(audio, targetVolume, duration = 1000) {
        if (!audio) return;
        
        audio.volume = 0;
        const startTime = Date.now();
        
        function updateVolume() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            audio.volume = targetVolume * progress;
            
            if (progress < 1) {
                requestAnimationFrame(updateVolume);
            }
        }
        
        updateVolume();
    }
    
    function fadeOutVolume(audio, duration = 1000) {
        if (!audio) return;
        
        const startVolume = audio.volume;
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            function updateVolume() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                audio.volume = startVolume * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(updateVolume);
                } else {
                    resolve();
                }
            }
            
            updateVolume();
        });
    }
    
    // 初始化音频对象
    function initAudio() {
        // 只有在音频对象不存在时才创建
        if (!window.backgroundMusic) {
            window.backgroundMusic = new Audio();
            window.backgroundMusic.loop = true;
        }
        
        // 更新音量设置
        window.backgroundMusic.volume = soundSettings.musicVolume / 100;
        
        // 根据localStorage设置更新音频状态
        if (soundSettings.musicEnabled) {
            updateMusicTheme(); // 播放音乐
        } else {
            // 确保音乐不播放
            if (window.backgroundMusic) {
                window.backgroundMusic.pause();
            }
        }
    }
    
    // 更新音乐主题
    function updateMusicTheme() {
        if (!window.backgroundMusic) return;
        
        // 根据主题设置音乐路径
        let musicPath = '';
        if (soundSettings.musicTheme === 'undertale') {
            musicPath = 'sounds/bgm_ut.ogg';
        } else if (soundSettings.musicTheme === 'deltarune') {
            musicPath = 'sounds/bgm_dr.ogg'; // 使用现有的三角符文音乐文件
        }
        
        // 更新音乐源并播放
        if (musicPath && soundSettings.musicEnabled) {
            // 只有在音乐源发生变化时才更新和播放
            if (window.backgroundMusic.src !== window.location.origin + '/' + musicPath) {
                window.backgroundMusic.src = musicPath;
                window.backgroundMusic.play().catch(e => console.error('音乐播放失败:', e));
                // 播放时添加音量渐变
                fadeInVolume(window.backgroundMusic, soundSettings.musicVolume / 100);
            } else if (window.backgroundMusic.paused) {
                // 如果音乐源相同但已暂停，则恢复播放
                window.backgroundMusic.play().catch(e => console.error('音乐播放失败:', e));
                // 恢复播放时添加音量渐变
                fadeInVolume(window.backgroundMusic, soundSettings.musicVolume / 100);
            }
        } else if (!soundSettings.musicEnabled && !window.backgroundMusic.paused) {
            // 如果音乐被禁用且正在播放，则暂停
            window.backgroundMusic.pause();
        }
    }
    
    // 更新UI状态
    function updateUI() {
        // 获取音乐相关的设置项
        const musicThemeItem = document.querySelector('#musicThemeSelector').closest('.settings-item');
        const musicVolumeItem = document.querySelector('#musicVolume').closest('.settings-item');
        
        // 更新音乐开关状态
        if (soundSettings.musicEnabled) {
            musicToggle.classList.add('active');
            musicVolumeItem.style.display = 'flex';
            musicThemeItem.style.display = 'flex';
        } else {
            musicToggle.classList.remove('active');
            musicVolumeItem.style.display = 'none';
            musicThemeItem.style.display = 'none';
        }
        
        // 更新音量滑块值
        musicVolume.value = soundSettings.musicVolume;
        
        // 更新音乐主题选择器
        musicTheme.value = soundSettings.musicTheme;
    }
    
    // 保存设置到本地存储
    function saveSettings() {
        localStorage.setItem('musicVolume', soundSettings.musicVolume);
        localStorage.setItem('musicTheme', soundSettings.musicTheme);
    }
    
    // 音乐开关点击事件
    musicToggle.addEventListener('click', async () => {
        soundSettings.musicEnabled = !soundSettings.musicEnabled;
        updateUI();
        saveSettings();
        
        // 控制音乐播放
        if (soundSettings.musicEnabled) {
            updateMusicTheme(); // 确保音乐主题和src被正确设置
        } else {
            if (window.backgroundMusic && !window.backgroundMusic.paused) {
                // 暂停时添加音量渐变
                await fadeOutVolume(window.backgroundMusic);
                window.backgroundMusic.pause();
            }
        }
    });
    
    // 音乐音量变化事件
    musicVolume.addEventListener('input', () => {
        soundSettings.musicVolume = parseInt(musicVolume.value);
        if (window.backgroundMusic) {
            window.backgroundMusic.volume = soundSettings.musicVolume / 100;
        }
        saveSettings();
    });
    
    // 音乐主题变化事件
    musicTheme.addEventListener('change', () => {
        soundSettings.musicTheme = musicTheme.value;
        updateMusicTheme();
        saveSettings();
    });
    
    // 初始化
    updateUI(); // 先更新UI，确保音量滑块显示正确
    initAudio();
}

// 滚动动画功能
function initScrollAnimation() {
    // 使用动态选择器，每次调用时都重新获取元素
    function checkFadeElements() {
        const fadeElements = document.querySelectorAll('.fade-in');
        
        fadeElements.forEach(element => {
            if (!element.classList.contains('hidden')) {
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
            if (targetId === '#') {
                return;
            }
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

// 快速链接点击计数功能
let quickLinksClickCount = 0;
let quickLinksTimer = null;
function handleQuickLinksClick() {
    // 清除之前的计时器
    if (quickLinksTimer) {
        clearTimeout(quickLinksTimer);
    }
    
    // 增加点击计数
    quickLinksClickCount++;
    
    // 检查是否达到5次点击
    if (quickLinksClickCount >= 5) {
        document.getElementById('admin-link').style.display = 'block';
        quickLinksClickCount = 0;
    } else {
        // 设置新的计时器，1秒后重置计数
        quickLinksTimer = setTimeout(() => {
            quickLinksClickCount = 0;
        }, 1000);
    }
}

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
    // 使用全局变量allVideosData的副本，避免影响原始顺序
    const allVideos = [...allVideosData].filter(v => v.status !== '异常');
    
    if (allVideos.length === 0) return;
    
    const videoCount = Math.floor(Math.random() * 3) + 4;
    const shuffledVideos = allVideos.sort(() => 0.5 - Math.random());
    const selectedVideos = shuffledVideos.slice(0, videoCount);
    
    const container = document.querySelector('.popular-videos .container');
    if (!container) return;
    
    const noVideosText = container.querySelector('.no-videos');
    if (noVideosText) {
        noVideosText.remove();
    }
    
    let videosHTML = '<div class="video-grid">';
    selectedVideos.forEach(video => {
                const statusClass = video.status === '异常' ? 'status-warning' : '';
                const spoilerAttr = video.spoiler ? 'data-spoiler="true"' : '';
                
                videosHTML += `
                    <div class="video-item" data-game="${video.game}" data-chapter="${video.chapter}" video_id="${video.video_id}" ${spoilerAttr}>
                        <div class="video-thumbnail">
                            <img src="${video.thumbnail}" alt="${video.title}">
                            <div class="video-duration">${video.duration}</div>
                            <div class="play-btn">▶</div>
                        </div>
                        <div class="video-info">
                            <div class="video-title">${video.title}</div>
                            <div class="video-meta">
                                <span class="video-date">
                                    ${video.status === '异常' ? `<span class="${statusClass}" title="审核未通过">${video.status}</span>` : video.status} ${video.date}
                                </span>
                                <span class="video-game-tag">${video.tags[0]}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            videosHTML += '</div>';
            
            container.innerHTML += videosHTML;
            
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
            
            const videoItems = container.querySelectorAll('.video-item');
            videoItems.forEach(item => {
                item.addEventListener('click', function() {
                    const videoId = this.getAttribute('video_id');
                    const game = this.dataset.game;
                    const chapter = this.dataset.chapter;
                    
                    if (!videoId || videoId === '') {
                        customConfirm('此视频状态异常，无法播放', '错误', '确定', '');
                        return;
                    }
                    
                    if (this.querySelector('.status-warning')) {
                        customConfirm('该视频可能包含剧透内容，确定要继续观看吗？', '警告', '继续观看', '取消')
                            .then(result => {
                                if (result) {
                                    window.location.href = `player.html?video_id=${videoId}&game=${game}&chapter=${chapter}`;
                                }
                            });
                    } else {
                        window.location.href = `player.html?video_id=${videoId}&game=${game}&chapter=${chapter}`;
                    }
                });
                
                const playBtn = item.querySelector('.play-btn');
                if (playBtn) {
                    playBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        item.click();
                    });
                }
            });
        }