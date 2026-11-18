const selectedPlayers = new Set();
const teamPreferences = new Map();

let currentGroupId = null;

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        updateSelectedSummary();

        const params =
            new URLSearchParams(
                window.location.search
            );

        currentGroupId =
            params.get("groupId");

        const now = new Date();

        now.setMinutes(
            now.getMinutes() -
            now.getTimezoneOffset()
        );

        const dateField =
            document.getElementById(
                "matchDateTime"
            );

        if (dateField) {
            dateField.value =
                now
                    .toISOString()
                    .slice(0, 16);
        }


async function loadGroupInfo() {

    const { data, error } =
        await supabaseClient
            .from("groups")
            .select("field_name")
            .eq("id", currentGroupId)
            .single();

    if (error) {
        console.error(error);
        return;
    }

    const pitchInput =
        document.getElementById(
            "pitchName"
        );

    if (
        pitchInput &&
        data?.field_name
    ) {
        pitchInput.value =
            data.field_name;
    }
}

        await loadGroupInfo();
        await loadPlayers();
    }
);

function updateSelectedSummary() {

    let whiteCount = 0;
    let redCount = 0;
    let aiCount = 0;

    selectedPlayers.forEach(playerKey => {

        const pref =
            teamPreferences.get(playerKey) || "ai";

        if (pref === "white") {
            whiteCount++;
        } else if (pref === "red") {
            redCount++;
        } else {
            aiCount++;
        }
    });

    document.getElementById(
        "selectedCount"
    ).innerHTML = `
        <strong>👥 Toplam Oyuncu: ${selectedPlayers.size}</strong><br>
        ⚪ Beyaz Takım: ${whiteCount} |
        🔴 Kırmızı Takım: ${redCount} |
        🤖 AI: ${aiCount}
    `;
}


async function loadPlayers() {

    const { data: members, error: memberError } =
        await supabaseClient
            .from("group_members")
            .select(`
                user_id,
                profiles (
                    full_name
                )
            `)
            .eq(
                "group_id",
                currentGroupId
            )
            .eq(
                "active",
                true
            );

    if (memberError) {
        console.error(memberError);
        return;
    }

    const {
        data: ratedPlayers,
        error: ratedError
    } = await supabaseClient
        .from("player_rating_summary")
        .select(`
            target_user_id
        `)
        .eq(
            "group_id",
            currentGroupId
        );

    if (ratedError) {
        console.error(
            "player_rating_summary",
            ratedError
        );
    }

    const {
        data: guests,
        error: guestError
    } = await supabaseClient
        .from("guest_players")
        .select(`
            id,
            full_name
        `)
        .eq(
            "group_id",
            currentGroupId
        )
        .eq(
            "active",
            true
        );

    if (guestError) {
        console.error(guestError);
        return;
    }

    const {
        data: ratedGuests,
        error: ratedGuestError
    } = await supabaseClient
        .from("guest_player_rating_summary")
        .select(`
            target_guest_id
        `)
        .eq(
            "group_id",
            currentGroupId
        );

    if (ratedGuestError) {
        console.error(
            "guest_player_rating_summary",
            ratedGuestError
        );
    }

    const ratedPlayerSet =
        new Set(
            (ratedPlayers || [])
                .map(
                    p => p.target_user_id
                )
        );

    const ratedGuestSet =
        new Set(
            (ratedGuests || [])
                .map(
                    g => g.target_guest_id
                )
        );

    const playersList =
        document.getElementById(
            "playersList"
        );

    playersList.innerHTML = "";

    const allPlayers = [];

    members.forEach(player => {

        allPlayers.push({
            id: player.user_id,
            type: "player",
            name:
                player.profiles?.full_name ||
                "İsimsiz Oyuncu",
            isRated:
                ratedPlayerSet.has(
                    player.user_id
                )
        });

    });

    guests.forEach(guest => {

        allPlayers.push({
            id: guest.id,
            type: "guest",
            name:
                `${guest.full_name} (Misafir)`,
            isRated:
                ratedGuestSet.has(
                    guest.id
                )
        });

    });

    allPlayers.forEach(player => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            player.isRated
                ? "match-player-card"
                : "match-player-card disabled-player";

        const playerKey =
            `${player.type}:${player.id}`;

        card.dataset.playerKey =
            playerKey;

        card.innerHTML = `
            <div class="player-check"></div>

            <div class="player-name">
                ${player.name}
            </div>

            <div class="player-team-pref"
                data-player-key="${playerKey}"
                style="
                    display:none;
                    min-width:42px;
                    text-align:center;
                    font-size:18px;
                    cursor:pointer;
                    margin-right:8px;
                ">
                🤖
            </div>

            <div class="player-status">
                ${player.isRated ? "🟢" : "🔴"}
            </div>
        `;

        const teamPrefElement =
            card.querySelector(
                ".player-team-pref"
            );

        teamPrefElement.addEventListener(
            "click",
            (e) => {

                e.stopPropagation();

                if (
                    !selectedPlayers.has(
                        playerKey
                    )
                ) {
                    return;
                }

                const current =
                    teamPreferences.get(
                        playerKey
                    ) || "ai";

                let next;

                if (current === "ai") {
                    next = "white";
                    teamPrefElement.style.background = "#dbeafe";
                    teamPrefElement.style.borderRadius = "20px";
                    teamPrefElement.innerHTML = "⚪";
                }
                else if (current === "white") {
                    next = "red";
                    teamPrefElement.style.background = "#fee2e2";
                    teamPrefElement.style.borderRadius = "20px";
                    teamPrefElement.innerHTML = "🔴";
                }
                else {
                    next = "ai";
                    teamPrefElement.style.background = "transparent";
                    teamPrefElement.innerHTML = "🤖";
                }

                teamPreferences.set(
                    playerKey,
                    next
                );

                updateSelectedSummary();
            }
        );

        card.addEventListener(
            "click",
            () => {

                if (!player.isRated) {

                    document.getElementById(
                        "validationMessage"
                    ).innerHTML =
                        `
                        <div class="warning">
                            Bu oyuncu henüz değerlendirilmemiş.
                        </div>
                        `;

                    return;
                }

                const check =
                    card.querySelector(
                        ".player-check"
                    );

                if (
                    selectedPlayers.has(
                        playerKey
                    )
                ) {

                    selectedPlayers.delete(
                        playerKey
                    );

                    teamPreferences.delete(
                        playerKey
                    );

                    card.classList.remove(
                        "selected"
                    );

                    check.innerHTML = "";

                    teamPrefElement.style.display =
                        "none";

                    teamPrefElement.innerHTML =
                        "🤖";


                } else {

                    selectedPlayers.add(
                        playerKey
                    );

                    teamPreferences.set(
                        playerKey,
                        "ai"
                    );

                    card.classList.add(
                        "selected"
                    );

                    check.innerHTML = "✓";

                    teamPrefElement.style.display =
                        "block";

                    teamPrefElement.innerHTML =
                        "🤖";

                }

                document.getElementById(
                    "validationMessage"
                ).innerHTML = "";

                updateSelectedSummary();

            }
        );

        playersList.appendChild(
            card
        );

    });

}

document
    .getElementById(
        "generateTeamsBtn"
    )
    .addEventListener(
        "click",
        () => {
            const matchDateTime =
                document
                    .getElementById(
                        "matchDateTime"
                    )
                    ?.value;

            const pitchName =
                document
                    .getElementById(
                        "pitchName"
                    )
                    ?.value
                    .trim();

            const goalkeeperMode =
                document
                    .getElementById(
                        "goalkeeperMode"
                    )
                    ?.value || "team";

            if (!matchDateTime) {

                document.getElementById(
                    "validationMessage"
                ).innerHTML =
                    `
                    <div class="warning">
                        Lütfen maç tarihini seçin.
                    </div>
                    `;

                return;
            }

            if (!pitchName) {

                document.getElementById(
                    "validationMessage"
                ).innerHTML =
                    `
                    <div class="warning">
                        Lütfen halı saha bilgisini girin.
                    </div>
                    `;

                return;
            }

            if (
                selectedPlayers.size < 6
            ) {

                document.getElementById(
                    "validationMessage"
                ).innerHTML =
                    `
                    <div class="warning">
                        En az 6 oyuncu seçmelisiniz.
                    </div>
                    `;

                return;
            }

            if (
                selectedPlayers.size % 2 !== 0
            ) {

                document.getElementById(
                    "validationMessage"
                ).innerHTML =
                    `
                    <div class="warning">
                        Oyuncu sayısı çift olmalıdır.
                    </div>
                    `;

                return;
            }

            document.getElementById(
                "validationMessage"
            ).innerHTML = "";

            sessionStorage.setItem(
                "selectedPlayers",
                JSON.stringify(
                    Array.from(
                        selectedPlayers
                    )
                )
            );

            sessionStorage.setItem(
                "teamPreferences",
                JSON.stringify(
                    Object.fromEntries(
                        teamPreferences
                    )
                )
            );

            sessionStorage.setItem(
                "matchDateTime",
                matchDateTime
            );

            sessionStorage.setItem(
                "pitchName",
                pitchName
            );

            sessionStorage.setItem(
                "goalkeeperMode",
                goalkeeperMode
            );

            window.location.href =
                `generate-teams.html?groupId=${currentGroupId}`;
        }
    );
