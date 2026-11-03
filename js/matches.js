let allMatches = [];
let currentFilter = "upcoming";

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const {
            data: { user }
        } =
            await supabaseClient
                .auth
                .getUser();

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }

        document
            .querySelectorAll(
                ".segment-btn"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".segment-btn"
                            )
                            .forEach(
                                b => b.classList.remove("active")
                            );

                        btn.classList.add(
                            "active"
                        );

                        currentFilter =
                            btn.dataset.filter;

                        renderMatches();

                    }
                );

            });

        await loadMatches();
    }
);

async function loadMatches() {

    try {

        const {
            data: matches,
            error
        } =
            await supabaseClient
                .from("matches")
                .select(`
                    *,
                    groups (
                        id,
                        name
                    )
                `)
                .order(
                    "match_date",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        const matchIds =
            matches.map(
                m => m.id
            );

        let playerCounts = {};

        if (matchIds.length) {

            const {
                data: players
            } =
                await supabaseClient
                    .from(
                        "match_players"
                    )
                    .select(`
                        match_id
                    `)
                    .in(
                        "match_id",
                        matchIds
                    );

            (players || [])
                .forEach(
                    p => {

                        playerCounts[
                            p.match_id
                        ] =
                            (
                                playerCounts[
                                    p.match_id
                                ] || 0
                            ) + 1;

                    }
                );
        }

        allMatches =
            matches.map(
                match => ({

                    ...match,

                    player_count:
                        playerCounts[
                            match.id
                        ] || 0

                })
            );

        document.querySelector(
            ".match-count"
        ).innerText =
            `Toplam ${allMatches.length} maç`;

        renderMatches();

    }
    catch (err) {

        console.error(err);

        alert(
            "Maçlar yüklenemedi"
        );
    }
}

function renderMatches() {

    const container =
        document.getElementById(
            "matchesContainer"
        );

    let matches =
        [...allMatches];

    const now =
        new Date();

    if (
        currentFilter ===
        "upcoming"
    ) {

        matches =
            matches.filter(
                m =>
                    new Date(
                        m.match_date
                    ) >= now
            );
    }

    if (
        currentFilter ===
        "history"
    ) {

        matches =
            matches.filter(
                m =>
                    new Date(
                        m.match_date
                    ) < now
            );
    }

    if (
        matches.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚽
                </div>

                <div class="empty-title">
                    Maç bulunamadı
                </div>

            </div>
            `;

        return;
    }

    container.innerHTML =
        matches
            .map(
                buildMatchCard
            )
            .join("");
}

function buildMatchCard(match) {

    const goalkeeperText = {

        team:
            "Takımdan Kaleci",

        external:
            "Dış Kaleci",

        rotation:
            "Dönüşümlü Kaleci"

    }[
        match.goalkeeper_mode
    ] || "-";

    const statusText = {

        planned:
            "Planlandı",

        completed:
            "Tamamlandı",

        live:
            "Devam Ediyor"

    }[
        match.status
    ] || match.status;

    const scoreHtml =

        match.white_score !== null &&
        match.red_score !== null

            ?

                `
                <div class="score-row">

                    <div class="score-team">
                        ⚪ Beyaz
                    </div>

                    <div class="final-score">
                        ${match.white_score}
                        -
                        ${match.red_score}
                    </div>

                    <div class="score-team">
                        🔴 Kırmızı
                    </div>

                </div>
                `

            :

                `
                <div class="match-info-row">

                    <div class="info-chip">
                        👥 ${match.player_count} Oyuncu
                    </div>

                    <div class="info-chip">
                        🧤 ${goalkeeperText}
                    </div>

                </div>
                `;

    return `

        <div
            class="match-card"
            onclick="window.location.href='match-detail.html?id=${match.id}'">

            <div class="match-card-top">

                <div>

                    <div class="group-name">
                        ⚽ ${match.groups?.name || "-"}
                    </div>

                    <div class="pitch-name">
                        🏟️ ${match.pitch_name || "-"}
                    </div>

                    <div class="match-date">
                        📅 ${formatDate(match.match_date)}
                    </div>

                </div>

                <div class="
                    status-badge
                    ${match.status}
                ">
                    ${statusText}
                </div>

            </div>

            ${scoreHtml}

        </div>

    `;
}

function formatDate(dateStr) {

    return new Date(
        dateStr
    ).toLocaleString(
        "tr-TR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}