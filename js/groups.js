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

    async function loadGroups() {

        try {

            groupsList.innerHTML =
                "<p>Gruplar yükleniyor...</p>";

            const {
                data: memberships,
                error
            } = await supabaseClient
                .from("group_members")
                .select(`
                    role,
                    group_id,
                    groups (
                        id,
                        name,
                        city,
                        description,
                        max_players,
                        created_by
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
                    "<p>Henüz bir gruba üye değilsiniz.</p>";
                return;
            }

            groupsList.innerHTML = "";

            memberships.forEach(item => {

                const group = item.groups;

                const card =
                    document.createElement("div");

                card.style.border =
                    "1px solid #e5e5e5";

                card.style.borderRadius =
                    "10px";

                card.style.padding =
                    "15px";

                card.style.marginBottom =
                    "12px";

                card.innerHTML = `
                    <h3>${group.name}</h3>

                    <p>
                        📍 ${group.city || "-"}
                    </p>

                    <p>
                        👤 Rol:
                        ${item.role}
                    </p>

                    <p>
                        ⚽ Maks Oyuncu:
                        ${group.max_players || "-"}
                    </p>

                    <button
                        style="margin-top:10px;"
                        onclick="alert('Grup detay ekranı sonraki adımda gelecek.')"
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

    createGroupForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            try {

                const groupName =
                    document
                        .getElementById("groupName")
                        .value
                        .trim();

                const groupCity =
                    document
                        .getElementById("groupCity")
                        .value
                        .trim();

                const groupDescription =
                    document
                        .getElementById("groupDescription")
                        .value
                        .trim();

                const maxPlayers =
                    parseInt(
                        document
                            .getElementById("maxPlayers")
                            .value
                    );

const groupPayload = {
    name: groupName,
    city: groupCity,
    description: groupDescription,
    max_players: maxPlayers,
    created_by: user.id,
    is_active: true
};

console.log("USER ID:", user.id);
console.log("GROUP PAYLOAD:", groupPayload);

const {
    data: groupData,
    error: groupError
} = await supabaseClient
    .from("groups")
    .insert(groupPayload)
    .select()
    .single();

console.log("GROUP DATA:", groupData);
console.log("GROUP ERROR:", groupError);

                if (groupError) {
                    throw groupError;
                }

                const {
                    error: memberError
                } = await supabaseClient
                    .from("group_members")
                    .insert({
                        group_id:
                            groupData.id,
                        user_id:
                            user.id,
                        role: "yonetici",
                        active: true
                    });

                if (memberError) {
                    throw memberError;
                }

                alert(
                    "Grup başarıyla oluşturuldu."
                );

                createGroupForm.reset();

                document.getElementById(
                    "maxPlayers"
                ).value = 20;

                await loadGroups();

            } catch (err) {

                console.error(err);

                alert(
                    err.message ||
                    "Grup oluşturulamadı."
                );
            }
        }
    );

    await loadGroups();

});