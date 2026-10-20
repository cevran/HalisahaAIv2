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
                ${player.profiles?.full_name || ""}
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