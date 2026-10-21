const ITERATION_COUNT = 5000;

let selectedPlayers = [];
let generatedMatch = null;

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

        await generateTeams();
    }
);

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

function renderPitch(
    team,
    captain,
    reverse = false
) {

    const formation =
        buildFormation(team);

    const html = [];

    const createPlayer =
    (
        player,
        x,
        y
    ) => {

        html.push(`

            <div
                class="field-player"
                style="
                    left:${x}%;
                    top:${y}%;
                ">

                <div class="player-name">
                    ${
                        player.id === captain.id
                            ? "👑 "
                            : ""
                    }
                    ${player.name}
                </div>

                <div class="player-power">
                    ${player.overall.toFixed(1)}
                </div>

            </div>

        `);
    };

    if (!reverse) {

  
        // Kaleci
        formation.goalkeepers.forEach(
            p => createPlayer(
                p,
                50,
                15
            )
        );

        formation.defenders.forEach(
            (p, i) => createPlayer(
                p,
                formation.defenders.length === 1
                    ? 50
                    : (i === 0 ? 35 : 65),
                35
            )
        );

        formation.midfielders.forEach(
            (p, i) => createPlayer(
                p,
                formation.midfielders.length === 1
                    ? 50
                    : (i === 0 ? 35 : 65),
                60
            )
        );

        formation.attackers.forEach(
            (p, i) => createPlayer(
                p,
                formation.attackers.length === 1
                    ? 50
                    : (20 + i * 30),
                82
            )
        );

    } else {


        // Forvet
        formation.attackers.forEach(
            (p, i) => createPlayer(
                p,
                formation.attackers.length === 1
                    ? 50
                    : (20 + i * 30),
                18
            )
        );

        formation.midfielders.forEach(
            (p, i) => createPlayer(
                p,
                formation.midfielders.length === 1
                    ? 50
                    : (i === 0 ? 35 : 65),
                40
            )
        );

        formation.defenders.forEach(
            (p, i) => createPlayer(
                p,
                formation.defenders.length === 1
                    ? 50
                    : (i === 0 ? 35 : 65),
                65
            )
        );

        formation.goalkeepers.forEach(
            p => createPlayer(
                p,
                50,
                85
            )
        );
    }

    return html.join("");
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

    const difference =
        Math.abs(
            result.whiteStats.overall -
            result.redStats.overall
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

    setText(
        "playerCount",
        result.whiteTeam.length +
        result.redTeam.length
    );

    setText(
        "powerDiff",
        difference.toFixed(1)
    );

    setText(
        "whitePower",
        result.whiteStats.overall
        .toFixed(1)
    );

    setText(
        "redPower",
        result.redStats.overall
        .toFixed(1)
    );

    setHtml(
        "whitePitch",
        renderPitch(
            result.whiteTeam,
            whiteCaptain,
            false
        )
    );

    setHtml(
        "redPitch",
        renderPitch(
            result.redTeam,
            redCaptain,
            true
        )
    );

    setText(
        "analysisWhite",
        result.whiteStats.overall
        .toFixed(1)
    );

    setText(
        "analysisRed",
        result.redStats.overall
        .toFixed(1)
    );

    setText(
        "analysisDiff",
        difference.toFixed(1)
    );

    const average =

        (
            result.whiteStats.overall +
            result.redStats.overall
        ) / 2;

    const percent =
        (difference / average) *
        100;

    let stars =
        "★★★★★";

    let text =
        "Mükemmele Yakın";

    if (percent > 1) {
        stars = "★★★★☆";
        text = "Çok Dengeli";
    }

    if (percent > 3) {
        stars = "★★★☆☆";
        text = "Dengeli";
    }

    if (percent > 7) {
        stars = "★☆☆☆☆";
        text = "Dengesiz";
    }

    setText(
        "analysisBalance",
        stars
    );

    setText(
        "balanceText",
        `${stars} ${text}`
    );
}