document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const navItems = document.querySelectorAll('.nav-item');
    const categorySections = document.querySelectorAll('.category-section');

    searchInput.addEventListener('keyup', (event) => {
        const query = event.target.value.toLowerCase();

        navItems.forEach(item => {
            const name = item.textContent.toLowerCase();
            const url = item.href.toLowerCase();
            if (name.includes(query) || url.includes(query)) {
                item.classList.remove('nav-item-hidden');
            } else {
                item.classList.add('nav-item-hidden');
            }
        });

        // 检查并隐藏空的分类
        categorySections.forEach(section => {
            const visibleItems = section.querySelectorAll('.nav-item:not(.nav-item-hidden)');
            if (visibleItems.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    });
});
