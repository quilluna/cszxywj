// 加载公共部分的函数
function loadInclude(url, elementId, callback) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
            if (callback) callback();
        })
        .catch(error => console.error('Error loading include:', error));
}

// 替换占位符的函数
function replacePlaceholders(html, replacements) {
    let result = html;
    for (const [placeholder, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

// 加载所有公共部分
function loadAllIncludes(pageTitle, activeNav) {
    // 设置默认值
    pageTitle = pageTitle || '传说之下攻略站';
    activeNav = activeNav || '';
    
    // 准备导航项的active类
    const navReplacements = {
        activeHome: activeNav === 'home' ? 'active' : '',
        activeContent: activeNav === 'content' ? 'active' : '',
        activeDownload: activeNav === 'download' ? 'active' : ''
    };
    
    // 设置页面标题
    if (pageTitle) {
        document.title = pageTitle;
    }
    
    // 加载导航栏
    fetch('partials/navbar.html')
        .then(response => response.text())
        .then(html => {
            const navbarHtml = replacePlaceholders(html, navReplacements);
            // 插入导航栏到body开头
            document.body.insertAdjacentHTML('afterbegin', navbarHtml);
            // 导航栏加载完成后初始化主题按钮
            if (typeof initDarkMode === 'function') {
                initDarkMode();
            }
            // 导航栏加载完成后初始化汉堡菜单
            if (typeof initMobileMenu === 'function') {
                initMobileMenu();
            }
        });
    
    // 加载页脚
    fetch('partials/footer.html')
        .then(response => response.text())
        .then(html => {
            // 插入页脚到body末尾
            document.body.insertAdjacentHTML('beforeend', html);
            // 页脚加载完成后初始化运行时间计数器
            if (typeof initRuntimeCounter === 'function') {
                initRuntimeCounter();
            }
        });
}

// 简化的加载函数，用于页面调用
function initPage(pageTitle, activeNav) {
    // 使用DOMContentLoaded确保页面结构已加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadAllIncludes(pageTitle, activeNav);
        });
    } else {
        loadAllIncludes(pageTitle, activeNav);
    }
}