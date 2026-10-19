let currentUser;
let currentGroupId;

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) {

            location.href =
                "index.html";

            return;
        }

        currentUser = user;

        currentGroupId =
            new URLSearchParams(
                location.search
            ).get("id");

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
                    full_name,
                    nickname
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

    const container =
        document.getElementById(
            "playersList"
        );

    container.innerHTML = "";

    data.forEach(player => {

        if (
            player.user_id ===
            currentUser.id
        ) {
            return;
        }

        const p =
            player.profiles;

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "player-row";

        card.innerHTML = `
            <div>

                <strong>
                    ${p.full_name}
                </strong>

                (${p.nickname || ""})

            </div>

            <button
                onclick="openRating('${player.user_id}')">

                Değerlendir

            </button>
        `;

        container.appendChild(
            card
        );

    });

}