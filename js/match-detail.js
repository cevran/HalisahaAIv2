document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            const matchId =
                params.get("id");

            if (!matchId) {

                document.getElementById(
                    "matchDetail"
                ).innerHTML =
                    `
                    <div class="warning">
                        Maç bulunamadı.
                    </div>
                    `;

                return;
            }

            await loadMatch(
                matchId
            );

        }
        catch (err) {

            console.error(err);

            document.getElementById(
                "matchDetail"
            ).innerHTML =
                `
                <div class="warning">
                    Maç yüklenemedi.
                </div>
                `;

        }

    }
);

async function loadMatch(
    matchId
) {

    const {
        data: match,
        error: matchError
    } =
        await supabaseClient
            .from("matches")
            .select("*")
            .eq("id", matchId)
            .single();

    if (matchError) {
        throw matchError;
    }

    const {
        data: players,
        error: playerError
    } =
        await supabaseClient
            .from(
                "match_players"
            )
            .select("*")
            .eq(
                "match_id",
                matchId
            );

    if (playerError) {
        throw playerError;
    }

    const userIds =
        players.map(
            p => p.user_id
        );

    const {
        data: profiles,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select(`
                id,
                full_name,
                nickname
            `)
            .in(
                "id",
                userIds
            );

    if (profileError) {
        throw profileError;
    }

    const whiteTeam =
        players.filter(
            p =>
                p.team_color ===
                "white"
        );

    const redTeam =
        players.filter(
            p =>
                p.team_color ===
                "red"
        );

    renderMatch(
        match,
        whiteTeam,
        redTeam,
        profiles
    );
}

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }

    return new Date(
        dateString
    ).toLocaleString(
        "tr-TR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function getPlayerName(
    player,
    profiles
) {

    const profile =
        profiles.find(
            p =>
                p.id ===
                player.user_id
        );

    if (!profile) {
        return "Oyuncu";
    }

    return (
        profile.nickname ||
        profile.full_name
    );
}

function renderTeam(
    title,
    cssClass,
    players,
    profiles
) {

    const html =
        players
            .map(player => {

                let position =
                    player.position ||
                    "-";

                if (
                    position === "GK"
                ) {
                    position =
                        "🥅 Kaleci";
                }

                if (
                    position === "DEF"
                ) {
                    position =
                        "🛡️ Defans";
                }

                if (
                    position === "MID"
                ) {
                    position =
                        "⚙️ Orta Saha";
                }

                if (
                    position === "ATT"
                ) {
                    position =
                        "⚽ Forvet";
                }

                return `
                    <div class="team-player">

                        <div class="player-name">
                            ${
                                player.is_captain
                                    ? "👑 "
                                    : ""
                            }

                            ${getPlayerName(
                                player,
                                profiles
                            )}
                        </div>

                        <div class="player-position">
                            ${position}
                        </div>

                    </div>
                `;

            })
            .join("");

    return `
        <div class="team-card">

            <div class="team-title ${cssClass}">
                ${title}
            </div>

            ${html}

        </div>
    `;
}

function renderMatch(
    match,
    whiteTeam,
    redTeam,
    profiles
) {

    const container =
        document.getElementById(
            "matchDetail"
        );

    container.innerHTML = `

        <div class="match-info-card">

            <div class="match-date">
                📅 ${formatDate(
                    match.match_date
                )}
            </div>

            <div class="match-pitch">
                🏟️ ${
                    match.pitch_name ||
                    "-"
                }
            </div>

        </div>

        ${renderTeam(
            "⚪ Beyaz Takım",
            "white-team-title",
            whiteTeam,
            profiles
        )}

        ${renderTeam(
            "🔴 Kırmızı Takım",
            "red-team-title",
            redTeam,
            profiles
        )}

        <div class="match-actions">

            <button
                id="shareMatchBtn"
            >
                📤 Takımları Paylaş
            </button>

            <button
                id="enterScoreBtn"
            >
                ⚽ Maç Sonucu Gir
            </button>

        </div>

    `;
}