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
        await loadRatingProgress();

        document
            .getElementById("ratePlayersBtn")
            .addEventListener(
                "click",
                () => {

                    window.location.href =
                        `rate-players.html?group_id=${currentGroupId}`;

                }
            );

        document
        .getElementById(
            "createMatchBtn"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    `create-match.html?groupId=${currentGroupId}`;

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
            "rating summary error",
            ratedError
        );
    }

    const ratedSet =
        new Set(
            (ratedPlayers || []).map(
                x => x.target_user_id
            )
        );

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

        const isRated =
            ratedSet.has(
                member.user_id
            );

        const statusBadge =
            isRated
                ? `<span class="player-status rated">🟢 Değerlendirildi</span>`
                : `<span class="player-status unrated">🔴 Değerlendirilmedi</span>`;

        const div =
            document.createElement(
                "div"
            );

        div.className =
            `player-row ${
                isRated
                    ? ""
                    : "unrated"
            }`;

        div.dataset.rated =
            isRated;

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

                (${profile?.nickname || "-"})

                <span class="role-badge">
                    ${member.role}
                </span>

                ${statusBadge}

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


async function loadRatingProgress() {

    try {

        const {
            count: ratingCount,
            error: ratingError
        } = await supabaseClient
            .from("player_ratings")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "group_id",
                currentGroupId
            );

        if (ratingError) {
            console.error(
                "rating error",
                ratingError
            );

            document.getElementById(
                "ratingProgressText"
            ).innerHTML =
                "Değerlendirme sayısı okunamadı";

            return;
        }

        const {
            data: members,
            error: memberError
        } = await supabaseClient
            .from("group_members")
            .select("user_id")
            .eq(
                "group_id",
                currentGroupId
            )
            .eq(
                "active",
                true
            );

        if (memberError) {

            console.error(
                "member error",
                memberError
            );

            document.getElementById(
                "ratingProgressText"
            ).innerHTML =
                "Oyuncu bilgileri okunamadı";

            return;
        }

        const playerCount =
            members
                ? members.length
                : 0;

        const expectedCount =
            playerCount *
            Math.max(
                playerCount - 1,
                0
            );

        const completedCount =
            ratingCount || 0;

        const percentage =
            expectedCount === 0
                ? 0
                : Math.round(
                    (
                        completedCount /
                        expectedCount
                    ) * 100
                );

        const progressBar =
            document.getElementById(
                "ratingProgressBar"
            );

        const progressText =
            document.getElementById(
                "ratingProgressText"
            );

        if (progressBar) {

            progressBar.style.width =
                percentage + "%";
        }

        if (progressText) {

            progressText.innerHTML =
                `
                <strong>
                ${percentage}%
                </strong>
                <br>
                ${completedCount}
                / ${expectedCount}
                değerlendirme tamamlandı
                `;
        }

        console.log({
            playerCount,
            expectedCount,
            completedCount,
            percentage
        });

    } catch (err) {

        console.error(
            "loadRatingProgress",
            err
        );

        document.getElementById(
            "ratingProgressText"
        ).innerHTML =
            "Hesaplama sırasında hata oluştu";
    }
}