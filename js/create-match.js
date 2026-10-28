const selectedPlayers = new Set();

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

        document.getElementById(
            "selectedCount"
        ).innerText =
            "Seçilen Oyuncu: 0";

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

        await loadPlayers();
    }
);

async function loadPlayers() {

    const { data, error } =
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

    if (error) {
        console.error(error);
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

    const ratedSet =
        new Set(
            (ratedPlayers || []).map(
                p => p.target_user_id
            )
        );

    const playersList =
        document.getElementById(
            "playersList"
        );

    playersList.innerHTML = "";

    data.forEach(player => {

        const isRated =
            ratedSet.has(
                player.user_id
            );

        const card =
            document.createElement(
                "div"
            );

        card.className =
            isRated
                ? "match-player-card"
                : "match-player-card disabled-player";

        card.dataset.userId =
            player.user_id;

        card.innerHTML = `
            <div class="player-check"></div>

            <div class="player-name">
                ${player.profiles?.full_name || "İsimsiz Oyuncu"}
            </div>

            <div class="player-status">
                ${isRated ? "🟢" : "🔴"}
            </div>
        `;

        card.addEventListener(
            "click",
            () => {

                if (!isRated) {

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

                const userId =
                    player.user_id;

                const check =
                    card.querySelector(
                        ".player-check"
                    );

                if (
                    selectedPlayers.has(
                        userId
                    )
                ) {

                    selectedPlayers.delete(
                        userId
                    );

                    card.classList.remove(
                        "selected"
                    );

                    check.innerHTML = "";

                } else {

                    selectedPlayers.add(
                        userId
                    );

                    card.classList.add(
                        "selected"
                    );

                    check.innerHTML = "✓";
                }

                document.getElementById(
                    "validationMessage"
                ).innerHTML = "";

                document.getElementById(
                    "selectedCount"
                ).innerText =
                    `Seçilen Oyuncu: ${selectedPlayers.size}`;
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
                "matchDateTime",
                matchDateTime
            );

            sessionStorage.setItem(
                "pitchName",
                pitchName
            );

            window.location.href =
                `generate-teams.html?groupId=${currentGroupId}`;
        }
    );