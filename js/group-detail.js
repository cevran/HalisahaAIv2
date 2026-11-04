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
            ?.addEventListener(
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
            ?.addEventListener(
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

    const roleResult =
        await supabaseClient
            .from("group_members")
            .select("role")
            .eq("group_id", currentGroupId)
            .eq("user_id", currentUserId)
            .single();

    currentUserRole =
        roleResult.data?.role;

    const {
        count: playerCount
    } = await supabaseClient
        .from("group_members")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("group_id", currentGroupId)
        .eq("active", true);

    document.getElementById(
        "groupInfo"
    ).innerHTML = `

        ${
            currentUserRole === "yonetici"
            ? `
                <div style="
                    display:flex;
                    justify-content:flex-end;
                    margin-bottom:10px;
                ">
                    <button
                        id="groupSettingsBtn"
                        style="
                            width:42px;
                            height:42px;
                            border:none;
                            border-radius:12px;
                            background:#f3f4f6;
                            cursor:pointer;
                            font-size:20px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                        ">
                        ⚙️
                    </button>
                </div>
            `
            : ""
        }

        <div class="group-name">
            ${data.name}
        </div>

        <div class="group-info">
            🏟️ ${data.field_name || "-"}
        </div>

        <div class="group-info">
            📍 ${data.city || "-"}
        </div>

        <div class="group-info">
            👥 ${playerCount || 0} Oyuncu
        </div>

        ${
            data.description
            ? `
                <div class="group-description">
                    ${data.description}
                </div>
            `
            : ""
        }

    `;

    if (currentUserRole === "yonetici") {

        document
            .getElementById("groupSettingsBtn")
            ?.addEventListener(
                "click",
                () => {
                    openGroupSettings(data);
                }
            );

    }

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
                    photo_url
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

    data.forEach(member => {

        const profile =
            member.profiles;

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "player-row";

        const photoUrl =
            profile?.photo_url &&
            profile.photo_url.trim() !== ""
                ? profile.photo_url
                : "assets/default-avatar.png";

        const isManager =
            member.role === "yonetici";

        const roleBadge =
            isManager
                ? "👑 Yönetici"
                : "👤 Oyuncu";

        let buttons = "";

        if (
            currentUserRole ===
            "yonetici"
        ) {

            buttons = `

                <button
                    class="primary-btn"
                    onclick="${
                        isManager
                            ? `removeAdmin('${member.user_id}')`
                            : `makeAdmin('${member.user_id}')`
                    }">

                    ${
                        isManager
                            ? "Yöneticilikten Çıkar"
                            : "Yönetici Yap"
                    }

                </button>

                <button
                    class="danger-btn"
                    onclick="removePlayer('${member.user_id}')">

                    Gruptan Çıkar

                </button>

            `;
        }

        div.innerHTML = `

            <div class="player-left">

                <img
                    class="player-avatar"
                    src="${photoUrl}"
                    alt="Oyuncu">

                <div class="player-info">

                    <div class="player-name">
                        ${profile?.full_name || "Oyuncu"}
                    </div>

                    <div class="player-role">
                        ${roleBadge}
                    </div>

                </div>

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
                active: false
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
    await loadGroup();
}

async function makeAdmin(
    userId
) {

    const { error } =
        await supabaseClient
            .from("group_members")
            .update({
                role: "yonetici"
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

async function removeAdmin(
    userId
) {

    const { error } =
        await supabaseClient
            .from("group_members")
            .update({
                role: "oyuncu"
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
                ratingError
            );

            document.getElementById(
                "ratingProgressText"
            ).innerHTML =
                "Veri okunamadı";

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
                memberError
            );

            return;
        }

        const playerCount =
            members?.length || 0;

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

            progressText.innerHTML = `

                <div style="
                    font-size:32px;
                    font-weight:700;
                    color:#43a047;
                    margin-bottom:6px;
                ">
                    ${percentage}%
                </div>

                <div style="
                    color:#666;
                    font-size:16px;
                    font-weight:500;
                ">
                    ${completedCount}
                    / ${expectedCount}
                    değerlendirme tamamlandı
                </div>

            `;
        }

    } catch (err) {

        console.error(err);

        document.getElementById(
            "ratingProgressText"
        ).innerHTML =
            "Hesaplama hatası";
    }

}





function openGroupSettings(group){

    document
        .getElementById("fieldNameInput")
        .value =
        group.field_name || "";

    document
        .getElementById("cityInput")
        .value =
        group.city || "";

    document
        .getElementById("descriptionInput")
        .value =
        group.description || "";

    document
        .getElementById("groupSettingsModal")
        .classList.add("show");

    document
        .getElementById("saveGroupBtn")
        .onclick =
        () => saveGroupSettings();

    document
        .getElementById("deleteGroupBtn")
        .onclick =
        () => deleteGroup();

    document
        .getElementById("closeGroupModalBtn")
        .onclick =
        () => {

            document
                .getElementById("groupSettingsModal")
                .classList.remove("show");

        };

}


async function saveGroupSettings(){

    const field_name =
        document.getElementById(
            "fieldNameInput"
        ).value.trim();

    const city =
        document.getElementById(
            "cityInput"
        ).value.trim();

    const description =
        document.getElementById(
            "descriptionInput"
        ).value.trim();

    const { error } =
        await supabaseClient
            .from("groups")
            .update({
                field_name,
                city,
                description
            })
            .eq(
                "id",
                currentGroupId
            );

    if(error){

        alert(error.message);
        return;

    }

    document
        .getElementById(
            "groupSettingsModal"
        )
        .classList.remove("show");

    await loadGroup();

    alert(
        "✅ Grup güncellendi"
    );

}


async function deleteGroup(){

    const ok = confirm(
        "Grup silinsin mi?\n\nBu işlem geri alınamaz."
    );

    if(!ok) return;

    const { error } =
        await supabaseClient
            .from("groups")
            .delete()
            .eq(
                "id",
                currentGroupId
            );

    if(error){

        alert(error.message);
        return;

    }

    alert("✅ Grup silindi");

    location.href =
        "groups.html";

}