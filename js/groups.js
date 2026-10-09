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

            memberships.forEach(item => {

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
                        ${
                            item.role === "yonetici"
                                ? "Yönet"
                                : "Detay"
                        }
                    </button>
                `;

                groupsList.appendChild(card);

            });

        } catch (err) {

            console.error(err);

            groupsList.innerHTML =
                "<p>Gruplar yüklenemedi.</p>";
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

                        <button>
                            Katılım Talebi Gönder
                        </button>
                    `;

                    searchResults.appendChild(
                        div
                    );
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