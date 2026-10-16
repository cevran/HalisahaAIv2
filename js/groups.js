document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const groupsList =
        document.getElementById("groupsList");

    const createGroupForm =
        document.getElementById("createGroupForm");

    const createGroupArea =
        document.getElementById("createGroupArea");

    const toggleCreateGroupBtn =
        document.getElementById("toggleCreateGroupBtn");

    const searchGroupBtn =
        document.getElementById("searchGroupBtn");

    const searchResults =
        document.getElementById("searchResults");

    toggleCreateGroupBtn.addEventListener(
        "click",
        () => {

            if (
                createGroupArea.style.display ===
                "none"
            ) {

                createGroupArea.style.display =
                    "block";

            } else {

                createGroupArea.style.display =
                    "none";
            }
        }
    );

    async function loadGroups() {

        try {

            const {
                data: memberships,
                error
            } = await supabaseClient
                .from("group_members")
                .select(`
                    role,
                    groups (
                        id,
                        name,
                        city,
                        description,
                        max_players
                    )
                `)
                .eq("user_id", user.id)
                .eq("active", true);

            if (error) {
                throw error;
            }

            if (
                !memberships ||
                memberships.length === 0
            ) {

                groupsList.innerHTML =
                    "<p>Bir gruba üye değilsiniz.</p>";

                return;
            }

            groupsList.innerHTML = "";

            for (const item of memberships) {

                const group =
                    item.groups;

                const card =
                    document.createElement("div");

                card.style.border =
                    "1px solid #ddd";

                card.style.borderRadius =
                    "10px";

                card.style.padding =
                    "15px";

                card.style.marginBottom =
                    "12px";

                card.innerHTML = `
                    <h3>${group.name}</h3>

                    <p>📍 ${group.city || "-"}</p>

                    <p>
                        👤 Rol:
                        ${item.role}
                    </p>

                    <button
                        style="margin-top:10px;"
                    >
                        ${item.role === "yonetici"
                        ? "Yönet"
                        : "Detay"
                    }
                    </button>
                `;

                if (item.role === "yonetici") {

                    const requests =
                        await loadPendingRequests(group.id);

                    if (requests.length > 0) {

                        const pendingDiv =
                            document.createElement("div");

                        pendingDiv.style.marginTop = "15px";

                        pendingDiv.innerHTML =
                            "<h4>Bekleyen Başvurular</h4>";

                        for (const req of requests) {

                            const profile =
                                await getProfile(
                                    req.user_id
                                );

                            const row =
                                document.createElement("div");

                            row.style.marginBottom = "8px";

                            row.innerHTML = `
                                <strong>
                                ${profile?.full_name || ""}
                                </strong>
                                (${profile?.nickname || ""})

                                <button
                                    class="approve-btn"
                                    style="margin-left:10px;"
                                >
                                    Kabul Et
                                </button>
                            `;

                            row.querySelector(".approve-btn")
                                .addEventListener(
                                    "click",
                                    () => approveRequest(req)
                                );

                            pendingDiv.appendChild(row);
                        }

                        card.appendChild(pendingDiv);
                    }
                }

                groupsList.appendChild(card);

            }

        } catch (err) {

            console.error(err);

            groupsList.innerHTML =
                "<p>Gruplar yüklenemedi.</p>";
        }
    }



    async function loadPendingRequests(groupId) {

        try {

            const { data, error } = await supabaseClient
                .from("group_join_requests")
                .select(`
                    id,
                    status,
                    profiles (
                        full_name,
                        nickname
                    )
                `)
                .eq("group_id", groupId)
                .eq("status", "pending");

            if (error) {
                throw error;
            }

            return data || [];

        } catch (err) {

            console.error(err);
            return [];

        }
    }




    async function sendJoinRequest(groupId) {

        try {

            const { data: existing } = await supabaseClient
                .from("group_join_requests")
                .select("id,status")
                .eq("group_id", groupId)
                .eq("user_id", user.id)
                .maybeSingle();

            if (existing) {

                alert(
                    "Bu grup için daha önce başvuru göndermişsiniz."
                );

                return;
            }

            const { error } = await supabaseClient
                .from("group_join_requests")
                .insert({
                    group_id: groupId,
                    user_id: user.id,
                    status: "pending"
                });

            if (error) {
                throw error;
            }

            alert("Katılım talebi gönderildi.");

        } catch (err) {

            console.error(err);
            alert(err.message);

        }
    }


    async function loadPendingRequests(groupId) {

        const { data, error } = await supabaseClient
            .from("group_join_requests")
            .select(`
                id,
                user_id,
                group_id,
                status
            `)
            .eq("group_id", groupId)
            .eq("status", "pending");

        if (error) {
            console.error(error);
            return [];
        }

        return data || [];
    }


    async function getProfile(userId) {

        const { data, error } = await supabaseClient
            .from("profiles")
            .select("full_name,nickname")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error(error);
            return null;
        }

        return data;
    }


    async function approveRequest(request) {

        try {

            const { error: memberError } =
                await supabaseClient
                    .from("group_members")
                    .insert({
                        group_id: request.group_id,
                        user_id: request.user_id,
                        role: "uye",
                        active: true
                    });

            if (memberError) {
                throw memberError;
            }

            const { error: requestError } =
                await supabaseClient
                    .from("group_join_requests")
                    .update({
                        status: "approved"
                    })
                    .eq("id", request.id);

            if (requestError) {
                throw requestError;
            }

            alert("Oyuncu gruba eklendi.");

            await loadGroups();

        } catch (err) {

            console.error(err);
            alert(err.message);

        }
    }



    searchGroupBtn.addEventListener(
        "click",
        async () => {

            try {

                const text =
                    document
                        .getElementById(
                            "searchText"
                        )
                        .value
                        .trim();

                if (!text) {
                    return;
                }

                const {
                    data,
                    error
                } = await supabaseClient
                    .from("groups")
                    .select("*")
                    .ilike(
                        "name",
                        `%${text}%`
                    );

                if (error) {
                    throw error;
                }

                searchResults.innerHTML = "";

                if (
                    !data ||
                    data.length === 0
                ) {

                    searchResults.innerHTML =
                        "<p>Grup bulunamadı.</p>";

                    return;
                }

                data.forEach(group => {

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.style.border =
                        "1px solid #ddd";

                    div.style.borderRadius =
                        "10px";

                    div.style.padding =
                        "15px";

                    div.style.marginBottom =
                        "10px";

                    div.innerHTML = `
                        <h4>${group.name}</h4>
                        <p>📍 ${group.city || "-"}</p>

                        <button
                        class="join-btn"
                        data-group-id="${group.id}"
                        >
                            Katılım Talebi Gönder
                        </button>
                    `;
                    const btn =
                        div.querySelector(".join-btn");

                    btn.addEventListener(
                        "click",
                        () => sendJoinRequest(group.id)
                    );

                    searchResults.appendChild(div);
                    
                
                });

            } catch (err) {

                console.error(err);

                alert(
                    err.message
                );
            }
        }
    );

    createGroupForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from("groups")
                        .insert({
                            name:
                                document
                                    .getElementById(
                                        "groupName"
                                    )
                                    .value
                                    .trim(),

                            city:
                                document
                                    .getElementById(
                                        "groupCity"
                                    )
                                    .value
                                    .trim(),

                            description:
                                document
                                    .getElementById(
                                        "groupDescription"
                                    )
                                    .value
                                    .trim(),

                            max_players:
                                parseInt(
                                    document
                                        .getElementById(
                                            "maxPlayers"
                                        )
                                        .value
                                ),

                            created_by:
                                user.id,

                            is_active: true
                        });

                if (error) {
                    throw error;
                }

                alert(
                    "Grup oluşturuldu."
                );

                createGroupForm.reset();

                document.getElementById(
                    "maxPlayers"
                ).value = 20;

                createGroupArea.style.display =
                    "none";

                await loadGroups();

            } catch (err) {

                console.error(err);

                alert(
                    err.message
                );
            }
        }
    );

    await loadGroups();

});