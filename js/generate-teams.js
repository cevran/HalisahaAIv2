const ITERATION_COUNT = 5000;

let selectedPlayers = [];
let generatedMatch = null;


const matchDateTime =
    sessionStorage.getItem("matchDateTime");

const pitchName =
    sessionStorage.getItem("pitchName");

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        selectedPlayers =
            JSON.parse(
                sessionStorage.getItem(
                    "selectedPlayers"
                ) || "[]"
            );

        if (
            !selectedPlayers ||
            selectedPlayers.length < 6
        ) {
            alert(
                "Oyuncu listesi bulunamadı."
            );

            window.history.back();
            return;
        }

        document
            .getElementById(
                "regenerateBtn"
            )
            ?.addEventListener(
                "click",
                generateTeams
            );

        document
            .getElementById(
                "saveMatchBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    console.log(
                        "Maçı Kaydet"
                    );

                }
            );
        

        const matchDateDisplay =
            document.getElementById(
                "matchDateDisplay"
            );

        if (matchDateDisplay) {

            matchDateDisplay.innerHTML =
                `📅 ${formatMatchDate(matchDateTime)}`;

        }

        const pitchDisplay =
            document.getElementById(
                "pitchNameDisplay"
            );

        if (pitchDisplay) {

            pitchDisplay.innerHTML =
                `🏟️ ${pitchName || "-"}`;

        }    
        await generateTeams();
    }
);




function formatMatchDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString);

    return date.toLocaleString(
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



async function generateTeams() {
    try {
        const players = await loadPlayerStats(selectedPlayers);
        const result = buildBalancedTeams(players);
        generatedMatch = result;
        renderMatch(result);
    } catch (err) {
        console.error(err);
        alert("Takımlar oluşturulamadı.");
    }
}

async function loadPlayerStats(ids) {

    const {
        data,
        error
    } = await supabaseClient
        .from(
            "player_rating_summary"
        )
        .select(`
            target_user_id,
            overall_score,
            condition_score,
            technique_score,
            attack_score,
            defense_score,
            teamplay_score,
            goalkeeper_score,
            captain_score
        `)
        .in(
            "target_user_id",
            ids
        );

    if (error) {
        throw error;
    }

    const profileIds =
        data.map(
            x => x.target_user_id
        );

    const {
        data: profiles,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select(`
            id,
            full_name,
            nickname
        `)
        .in(
            "id",
            profileIds
        );

    if (profileError) {
        throw profileError;
    }

    return data.map(rating => {

        const profile =
            profiles.find(
                p =>
                    p.id ===
                    rating.target_user_id
            );

        return {

            id:
                rating.target_user_id,

            name:
                profile?.nickname ||
                profile?.full_name ||
                "Oyuncu",

            overall:
                Number(
                    rating.overall_score || 0
                ),

            condition:
                Number(
                    rating.condition_score || 0
                ),

            technique:
                Number(
                    rating.technique_score || 0
                ),

            attack:
                Number(
                    rating.attack_score || 0
                ),

            defense:
                Number(
                    rating.defense_score || 0
                ),

            teamplay:
                Number(
                    rating.teamplay_score || 0
                ),

            goalkeeper:
                Number(
                    rating.goalkeeper_score || 0
                ),

            captain:
                Number(
                    rating.captain_score || 0
                )

        };
    });
}

function buildBalancedTeams(players) {

    let best = null;

    for (
        let i = 0;
        i < ITERATION_COUNT;
        i++
    ) {

        const shuffled =
            [...players]
            .sort(
                () =>
                    Math.random() - 0.5
            );

        const half =
            Math.floor(shuffled.length / 2);

        const whiteTeam =
            shuffled.slice(
                0,
                half
            );

        const redTeam =
            shuffled.slice(
                half
            );

        const whiteStats =
            teamStats(
                whiteTeam
            );

        const redStats =
            teamStats(
                redTeam
            );

        const score =

            Math.abs(
                whiteStats.overall -
                redStats.overall
            ) * 10 +

            Math.abs(
                whiteStats.attack -
                redStats.attack
            ) * 2 +

            Math.abs(
                whiteStats.defense -
                redStats.defense
            ) * 2 +

            Math.abs(
                whiteStats.technique -
                redStats.technique
            ) * 2 +

            Math.abs(
                whiteStats.condition -
                redStats.condition
            ) +

            Math.abs(
                whiteStats.teamplay -
                redStats.teamplay
            );

        if (
            !best ||
            score < best.score
        ) {

            best = {

                whiteTeam,
                redTeam,

                whiteStats,
                redStats,

                score

            };
        }
    }

    return best;
}

function teamStats(team) {

    const total =
        key =>
            team.reduce(
                (sum, player) =>
                    sum + player[key],
                0
            );

    return {

        overall:
            total(
                "overall"
            ),

        attack:
            total(
                "attack"
            ),

        defense:
            total(
                "defense"
            ),

        technique:
            total(
                "technique"
            ),

        condition:
            total(
                "condition"
            ),

        teamplay:
            total(
                "teamplay"
            )

    };
}

function getCaptain(team) {

    return [...team]
        .sort((a, b) => {

            if (
                b.captain !==
                a.captain
            ) {

                return (
                    b.captain -
                    a.captain
                );
            }

            return (
                b.overall -
                a.overall
            );

        })[0];
}

function buildFormation(team) {

    const available =
        [...team];

    const goalkeepers = [];
    const defenders = [];
    const midfielders = [];
    const attackers = [];

    available.sort(
        (a, b) =>
            b.goalkeeper -
            a.goalkeeper
    );

    goalkeepers.push(
        available.shift()
    );

    let defenderCount = 2;
    let midfielderCount = 2;

    if (
        team.length <= 6
    ) {

        defenderCount = 1;
        midfielderCount = 1;
    }

    const pickBest =
        (
            pool,
            field
        ) => {

            pool.sort(
                (a, b) =>
                    b[field] -
                    a[field]
            );

            return pool.shift();
        };

    for (
        let i = 0;
        i < defenderCount;
        i++
    ) {

        if (
            !available.length
        ) {
            break;
        }

        defenders.push(
            pickBest(
                available,
                "defense"
            )
        );
    }

    for (
        let i = 0;
        i < midfielderCount;
        i++
    ) {

        if (
            !available.length
        ) {
            break;
        }

        midfielders.push(
            pickBest(
                available,
                "teamplay"
            )
        );
    }

    attackers.push(
        ...available.sort(
            (a, b) =>
                b.attack -
                a.attack
        )
    );

    return {

        goalkeepers,
        defenders,
        midfielders,
        attackers

    };
}
 
function renderPitch(team, captain) {
    const formation = buildFormation(team);

    const playerCard = (player, position) => `
        <div class="player-card">
            <div class="player-name">
                ${player.id === captain.id ? "👑 " : ""}
                ${player.name}
            </div>

            <div class="player-rating">
                ⚡ ${player.overall.toFixed(1)}
            </div>

            <div class="player-position">
                ${position}
            </div>
        </div>
    `;

    let html = "";

    // FORVETLER
    if (formation.attackers.length) {

        html += `
            <div class="position-row">
                ${formation.attackers.map(
                    p => playerCard(p, "⚽ FORVET")
                ).join("")}
            </div>
        `;
    }

    // ORTA SAHALAR
    if (formation.midfielders.length) {

        html += `
            <div class="position-row">
                ${formation.midfielders.map(
                    p => playerCard(p, "⚽ ORTA SAHA")
                ).join("")}
            </div>
        `;
    }

    // DEFANSLAR
    if (formation.defenders.length) {

        html += `
            <div class="position-row">
                ${formation.defenders.map(
                    p => playerCard(p, "🛡️ DEFANS")
                ).join("")}
            </div>
        `;
    }

    // KALECİ
    if (formation.goalkeepers.length) {

        html += `
            <div class="position-row">
                ${formation.goalkeepers.map(
                    p => playerCard(p, "🥅 KALECİ")
                ).join("")}
            </div>
        `;
    }

    return html;
}


function renderMatch(result) {

    const whiteCaptain =
        getCaptain(
            result.whiteTeam
        );

    const redCaptain =
        getCaptain(
            result.redTeam
        );

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = value;
        }
    };

    const setHtml = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = value;
        }
    };

    // Takım güçleri

    setText(
        "whitePower",
        result.whiteStats.overall.toFixed(1)
    );

    setText(
        "redPower",
        result.redStats.overall.toFixed(1)
    );

    // Kadrolar

    setHtml(
        "whitePitch",
        renderPitch(
            result.whiteTeam,
            whiteCaptain
        )
    );

    setHtml(
        "redPitch",
        renderPitch(
            result.redTeam,
            redCaptain
        )
    );

    // Analiz kutuları

    const buildStatsHtml = (
        title,
        stats
    ) => `
        <div class="analysis-box">
            <h3>${title}</h3>

            <div class="analysis-item">
                <span>⚡ Güç</span>
                <strong>${stats.overall.toFixed(1)}</strong>
            </div>

            <div class="analysis-item">
                <span>⚽ Hücum</span>
                <strong>${stats.attack.toFixed(1)}</strong>
            </div>

            <div class="analysis-item">
                <span>🛡️ Savunma</span>
                <strong>${stats.defense.toFixed(1)}</strong>
            </div>

            <div class="analysis-item">
                <span>🎯 Teknik</span>
                <strong>${stats.technique.toFixed(1)}</strong>
            </div>

            <div class="analysis-item">
                <span>🏃 Kondisyon</span>
                <strong>${stats.condition.toFixed(1)}</strong>
            </div>

            <div class="analysis-item">
                <span>🤝 Takım Oyunu</span>
                <strong>${stats.teamplay.toFixed(1)}</strong>
            </div>
        </div>
    `;

    const whiteStatsHtml =
        buildStatsHtml(
            "⚪ Beyaz Takım",
            result.whiteStats
        );

    const redStatsHtml =
        buildStatsHtml(
            "🔴 Kırmızı Takım",
            result.redStats
        );

    // PNG içindeki analizler

    setHtml(
        "whiteTeamStatsShare",
        whiteStatsHtml
    );

    setHtml(
        "redTeamStatsShare",
        redStatsHtml
    );

}


document
    .getElementById("shareMatchBtn")
    ?.addEventListener(
        "click",
        async () => {

            try {

                const area =
                    document.getElementById(
                        "shareArea"
                    );

                if (!area) {

                    alert(
                        "Paylaşım alanı bulunamadı."
                    );

                    return;
                }

                const isMobile =
                    window.innerWidth < 768;

                const exportWidth =
                    isMobile
                        ? 720
                        : 1200;

                const originalWidth =
                    area.style.width;

                const originalMaxWidth =
                    area.style.maxWidth;

                area.style.width =
                    exportWidth + "px";

                area.style.maxWidth =
                    exportWidth + "px";

                await new Promise(
                    resolve =>
                        requestAnimationFrame(
                            resolve
                        )
                );

                const dataUrl =
                    await htmlToImage.toPng(
                        area,
                        {
                            pixelRatio: 2,
                            cacheBust: true,
                            backgroundColor:
                                "#2d8a42",

                            width:
                                area.scrollWidth,

                            height:
                                area.scrollHeight
                        }
                    );

                area.style.width =
                    originalWidth;

                area.style.maxWidth =
                    originalMaxWidth;

                const response =
                    await fetch(
                        dataUrl
                    );

                const blob =
                    await response.blob();

                const file =
                    new File(
                        [blob],
                        "halisaha-ai-takimlar.png",
                        {
                            type: "image/png"
                        }
                    );

                if (
                    navigator.share &&
                    navigator.canShare &&
                    navigator.canShare({
                        files: [file]
                    })
                ) {

                    await navigator.share({
                        files: [file],
                        title: "Halı Saha AI",
                        text: "⚽ Maç Kadroları"
                    });

                } else {

                    const a =
                        document.createElement(
                            "a"
                        );

                    a.href =
                        dataUrl;

                    a.download =
                        "halisaha-ai-takimlar.png";

                    document.body.appendChild(
                        a
                    );

                    a.click();

                    document.body.removeChild(
                        a
                    );
                }

            } catch (err) {

                console.error(
                    err
                );

                alert(
                    "PNG oluşturulamadı."
                );
            }
        }
    );