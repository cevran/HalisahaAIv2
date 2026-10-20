const selectedPlayers = new Set();

let currentGroupId = null;

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const { data: { user } } =
            await supabaseClient.auth.getUser();

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

    const playersList =
        document.getElementById(
            "playersList"
        );

    playersList.innerHTML = "";

    data.forEach(player => {

        const card =
            document.createElement("div");

        card.className =
            "match-player-card";

        card.dataset.userId =
            player.user_id;

        card.innerHTML = `
            <div class="player-check"></div>

            <div class="player-name">
                ${player.profiles?.full_name || "İsimsiz Oyuncu"}
            </div>
        `;

        card.addEventListener(
            "click",
            () => {

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

            if (
                selectedPlayers.size < 6
            ) {

                document.getElementById(
                    "validationMessage"
                ).innerHTML =
                    '<div class="warning">En az 6 oyuncu seçmelisiniz.</div>';

                return;
            }

            if (
                selectedPlayers.size % 2 !== 0
            ) {

                document.getElementById(
                    "validationMessage"
                ).innerHTML =
                    '<div class="warning">Oyuncu sayısı çift olmalıdır.</div>';

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

            window.location.href =
                `generate-teams.html?groupId=${currentGroupId}`;
        }
    );
