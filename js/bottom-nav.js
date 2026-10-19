function renderBottomNav(activePage) {
    return `
        <nav class="bottom-nav">
            <a href="groups.html" class="nav-item ${activePage === 'groups' ? 'active' : ''}">
                <div class="nav-icon">👥</div>
                <span>Gruplarım</span>
            </a>

            <a href="matches.html" class="nav-item ${activePage === 'matches' ? 'active' : ''}">
                <div class="nav-icon">⚽</div>
                <span>Maçlarım</span>
            </a>

            <a href="profile.html" class="nav-item ${activePage === 'profile' ? 'active' : ''}">
                <div class="nav-icon">👤</div>
                <span>Profilim</span>
            </a>
        </nav>
    `;
}
