let currentUserId = null;
let currentGroupId = null;
let currentUserRole = null;

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }

        currentUserId = user.id;

        const params =
            new URLSearchParams(
                window.location.search
            );

        currentGroupId =
            params.get("id");

        await loadGroup();
        await loadPlayers();

        document
            .getElementById("ratePlayersBtn")
            .addEventListener(
                "click",
                () => {

                    window.location.href =
                        `rate-players.html?id=${currentGroupId}`;

                }
            );

        document
            .getElementById(
                "createMatchBtn"
            )
            .addEventListener(
                "click",
                () => {

                    alert(
                        "Maç oluşturma ekranı sonraki adımda eklenecek."
                    );

                }
            );
    }
);

async function loadGroup() {

    const { data, error } =
        await supabaseClient
            .from("groups")
            .select("*")
            .eq("id", currentGroupId)
            .single();

    if (error) {

        console.error(error);
        return;
    }

    document.getElementById(
        "groupName"
    ).innerText = data.name;

    document.getElementById(
        "groupInfo"
    ).innerHTML = `
        <p><b>Şehir:</b> ${data.city || "-"}</p>
        <p><b>Açıklama:</b> ${data.description || "-"}</p>
        <p><b>Maks Oyuncu:</b> ${data.max_players}</p>
    `;

    const roleResult =
        await supabaseClient
            .from("group_members")
            .select("role")
            .eq(
                "group_id",
                currentGroupId
            )
            .eq(
                "user_id",
                currentUserId
            )
            .single();

    currentUserRole =
        roleResult.data?.role;
}

async function loadPlayers() {

    const { data, error } =
        await supabaseClient
            .from("group_members")
            .select(`
                user_id,
                role,
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

    document.getElementById(
        "playerCount"
    ).innerText =
        data.length;

    const playersList =
        document.getElementById(
            "playersList"
        );

    playersList.innerHTML = "";

    data.forEach(member => {

        const profile =
            member.profiles;

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "player-row";

        let buttons = "";

        if (
            currentUserRole ===
            "yonetici"
        ) {

            buttons = `
                <button
                    class="primary-btn"
                    onclick="makeAdmin('${member.user_id}')">
                    Yönetici Yap
                </button>

                <button
                    class="danger-btn"
                    onclick="removePlayer('${member.user_id}')">
                    Çıkar
                </button>
            `;
        }

        div.innerHTML = `
            <div>

                <strong>
                    ${profile?.full_name || ""}
                </strong>

                (${profile?.nickname || ""})

                <span class="role-badge">
                    ${member.role}
                </span>

            </div>

            <div class="player-actions">
                ${buttons}
            </div>
        `;

        playersList.appendChild(
            div
        );
    });
}

async function removePlayer(
    userId
) {

    if (
        !confirm(
            "Oyuncu gruptan çıkarılsın mı?"
        )
    ) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("group_members")
            .update({
                active:false
            })
            .eq(
                "group_id",
                currentGroupId
            )
            .eq(
                "user_id",
                userId
            );

    if (error) {

        alert(error.message);
        return;
    }

    await loadPlayers();
}

async function makeAdmin(
    userId
) {

    const { error } =
        await supabaseClient
            .from("group_members")
            .update({
                role:"yonetici"
            })
            .eq(
                "group_id",
                currentGroupId
            )
            .eq(
                "user_id",
                userId
            );

    if (error) {

        alert(error.message);
        return;
    }

    await loadPlayers();
}