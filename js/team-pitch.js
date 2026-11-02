function playerCard(
    player,
    positionLabel,
    isCaptain = false
) {
    return `
        <div class="player-card">
            <div class="player-name">
                ${isCaptain ? "👑 " : ""}
                ${player.name}
            </div>

            <div class="player-rating">
                ${
                    player.overall
                        ? `⚡ ${player.overall.toFixed(1)}`
                        : ""
                }
            </div>

            <div class="player-position">
                ${positionLabel}
            </div>
        </div>
    `;
}



function renderPitchLayout({
    attackers = [],
    midfielders = [],
    defenders = [],
    goalkeepers = [],
    profiles = []
}) {

    const getName = player => {

        const profile =
            profiles.find(
                p =>
                    p.id === player.user_id
            );

        return (
            profile?.nickname ||
            profile?.full_name ||
            player.name ||
            "Oyuncu"
        );

    };

    const playerCard = (
        player,
        positionLabel
    ) => `

        <div class="player-card">

            <div class="player-name">
                ${
                    player.is_captain
                        ? "👑 "
                        : ""
                }
                ${getName(player)}
            </div>

            <div class="player-rating">
                ${
                    player.overall
                        ? `⚡ ${player.overall.toFixed(1)}`
                        : ""
                }
            </div>

            <div class="player-position">
                ${positionLabel}
            </div>

        </div>

    `;

    let html = "";

    if (attackers.length) {
        html += `
            <div class="position-row">
                ${attackers.map(
                    p => playerCard(
                        p,
                        "⚽ FORVET"
                    )
                ).join("")}
            </div>
        `;
    }

    if (midfielders.length) {
        html += `
            <div class="position-row">
                ${midfielders.map(
                    p => playerCard(
                        p,
                        "⚙️ ORTA SAHA"
                    )
                ).join("")}
            </div>
        `;
    }

    if (defenders.length) {
        html += `
            <div class="position-row">
                ${defenders.map(
                    p => playerCard(
                        p,
                        "🛡️ DEFANS"
                    )
                ).join("")}
            </div>
        `;
    }

    if (goalkeepers.length) {
        html += `
            <div class="position-row">
                ${goalkeepers.map(
                    p => playerCard(
                        p,
                        "🥅 KALECİ"
                    )
                ).join("")}
            </div>
        `;
    }

    return `
        <div class="team-pitch">
            ${html}
        </div>
    `;

}