document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const fullNameInput =
        document.getElementById("fullName");

    const ageInput =
        document.getElementById("age");

    const nicknameInput =
        document.getElementById("nickname");

    const preferredPositionInput =
        document.getElementById("preferredPosition");

    const dominantFootInput =
        document.getElementById("dominantFoot");

    const playerNumberInput =
        document.getElementById("playerNumber");

    const bioInput =
        document.getElementById("bio");

    const playerName =
        document.getElementById("playerName");

    const playerAge =
        document.getElementById("playerAge");

    const profilePhoto =
        document.getElementById("profilePhoto");

    const photoUpload =
        document.getElementById("photoUpload");

    const profileForm =
        document.getElementById("profileForm");

    async function loadProfile() {

        try {

            const {
                data: profile,
                error
            } = await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                throw error;
            }

            console.log("PROFILE:", profile);

            fullNameInput.value =
                profile.full_name || "";

            let age = "";

            if (profile.birth_year) {

                const currentYear =
                    new Date().getFullYear();

                age =
                    currentYear -
                    Number(profile.birth_year);

                ageInput.value = age;
            }

            playerName.textContent =
                profile.full_name || "Oyuncu";

            playerAge.textContent =
                age ? `${age} yaş` : "";

            nicknameInput.value =
                profile.nickname || "";

            preferredPositionInput.value =
                profile.preferred_position || "";

            dominantFootInput.value =
                profile.dominant_foot || "";

            playerNumberInput.value =
                profile.player_number || "";

            bioInput.value =
                profile.bio || "";

            if (
                profile.photo_url &&
                profile.photo_url.trim() !== ""
            ) {

                profilePhoto.src =
                    profile.photo_url + "?t=" + Date.now();

            } else {

                profilePhoto.src =
                    "assets/default-avatar.png";
            }

        } catch (err) {

            console.error(err);

            alert(
                "Profil bilgileri yüklenemedi."
            );
        }
    }

    profilePhoto.addEventListener(
        "click",
        () => {
            photoUpload.click();
        }
    );

    photoUpload.addEventListener(
        "change",
        async (e) => {

            try {

                const file =
                    e.target.files[0];

                if (!file) return;

                const extension =
                    file.name.split(".").pop();

                const fileName =
                    `${user.id}.${extension}`;

                const {
                    error: uploadError
                } = await supabaseClient.storage
                    .from("player-photos")
                    .upload(
                        fileName,
                        file,
                        {
                            upsert: true
                        }
                    );

                if (uploadError) {
                    throw uploadError;
                }

                const {
                    data: publicData
                } = supabaseClient.storage
                    .from("player-photos")
                    .getPublicUrl(fileName);

                const photoUrl =
                    publicData.publicUrl;

                const {
                    error: updateError
                } = await supabaseClient
                    .from("profiles")
                    .update({
                        photo_url: 