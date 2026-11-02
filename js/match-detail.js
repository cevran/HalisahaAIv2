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



function renderMatchPitches(
    whiteTeam,
    redTeam,
    profiles
) {

    document.getElementById(
        "whitePitch"
    ).innerHTML =
        renderPitchLayout({
            attackers:
                whiteTeam.filter(
                    p => p.position === "ATT"
                ),

            midfielders:
                whiteTeam.filter(
                    p => p.position === "MID"
                ),

            defenders:
                whiteTeam.filter(
                    p => p.position === "DEF"
                ),

            goalkeepers:
                whiteTeam.filter(
                    p => p.position === "GK"
                ),

            profiles
        });

    document.getElementById(
        "redPitch"
    ).innerHTML =
        renderPitchLayout({
            attackers:
                redTeam.filter(
                    p => p.position === "ATT"
                ),

            midfielders:
                redTeam.filter(
                    p => p.position === "MID"
                ),

            defenders:
                redTeam.filter(
                    p => p.position === "DEF"
                ),

            goalkeepers:
                redTeam.filter(
                    p => p.position === "GK"
                ),

            profiles
        });

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

            ${
                match.status === "completed"
                ? `
                <div class="match-result">
                    ⚪ ${match.white_score ?? 0}
                    -
                    ${match.red_score ?? 0} 🔴
                </div>
                `
                : ""
            }

        </div>

        <div class="match-pitch-area">

            <div class="teams-layout">

                <div class="team-side">

                    <div
                        class="team-title white-team-title"
                    >
                        ⚪ Beyaz Takım
                    </div>

                    <div
                        id="whitePitch"
                        class="team-formation"
                    ></div>

                </div>

                <div class="team-side">

                    <div
                        class="team-title red-team-title"
                    >
                        🔴 Kırmızı Takım
                    </div>

                    <div
                        id="redPitch"
                        class="team-formation"
                    ></div>

                </div>

            </div>

        </div>

        <div class="match-actions">

            <button
                id="shareMatchBtn"
            >
                📤 Takımları Paylaş
            </button>

            ${
                match.status !== "completed"
                ? `
                <button
                    id="enterScoreBtn"
                >
                    ⚽ Maç Sonucu Gir
                </button>
                `
                : `
                <button
                    disabled
                    style="
                        background:#16a34a;
                        opacity:.8;
                    "
                >
                    ✅ Sonuç Kaydedildi
                </button>
                `
            }

        </div>

    `;

    renderMatchPitches(
        whiteTeam,
        redTeam,
        profiles
    );

    const scoreBtn =
        document.getElementById(
            "enterScoreBtn"
        );

    if (scoreBtn) {

        scoreBtn.addEventListener(
            "click",
            () => {
                showScoreModal(
                    match.id
                );
            }
        );

    }

}



function showScoreModal(
    matchId
) {

    const modal =
        document.getElementById(
            "scoreModal"
        );

    modal.classList.remove(
        "hidden"
    );

    document
        .getElementById(
            "saveScoreBtn"
        )
        .onclick =
        async () => {

            const whiteScore =
                Number(
                    document
                    .getElementById(
                        "whiteScoreInput"
                    )
                    .value
                );

            const redScore =
                Number(
                    document
                    .getElementById(
                        "redScoreInput"
                    )
                    .value
                );

            await saveScore(
                matchId,
                whiteScore,
                redScore
            );

        };

    document
        .getElementById(
            "cancelScoreBtn"
        )
        .onclick =
        () => {

            modal.classList.add(
                "hidden"
            );

        };

}


async function saveScore(
    matchId,
    whiteScore,
    redScore
) {

    try {

        if (
            isNaN(whiteScore) ||
            isNaN(redScore)
        ) {

            alert(
                "Lütfen geçerli skor girin."
            );

            return;
        }

        const { error } =
            await supabaseClient
                .from("matches")
                .update({

                    white_score:
                        whiteScore,

                    red_score:
                        redScore,

                    status:
                        "completed",

                    played_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    matchId
                );

        if (error) {
            throw error;
        }

        document
            .getElementById(
                "scoreModal"
            )
            ?.classList.add(
                "hidden"
            );

        alert(
            "✅ Maç sonucu kaydedildi."
        );

        location.reload();

    }
    catch (err) {

        console.error(err);

        alert(
            "Hata: " +
            err.message
        );

    }

}