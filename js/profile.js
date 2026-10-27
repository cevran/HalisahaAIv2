document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const preferredPositionInput =
        document.getElementById("preferredPosition");

    const dominantFootInput =
        document.getElementById("dominantFoot");

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

            let age = "";

            if (profile.birth_year) {

                const currentYear =
                    new Date().getFullYear();

                age =
                    currentYear -
                    Number(profile.birth_year);
            }

            playerName.textContent =
                profile.full_name || "Oyuncu";

            playerAge.textContent =
                age ? `${age} yaş` : "";

            preferredPositionInput.value =
                profile.preferred_position || "";

            dominantFootInput.value =
                profile.dominant_foot || "";

            if (
                profile.photo_url &&
                profile.photo_url.trim() !== ""
            ) {

                profilePhoto.src =
                    profile.photo_url +
                    "?t=" +
                    Date.now();

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

                if (!file) {
                    return;
                }

                const extension =
                    file.name
                        .split(".")
                        .pop();

                const fileName =
                    `${user.id}.${extension}`;

                const {
                    error: uploadError
                } = await supabaseClient
                    .storage
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
                } = supabaseClient
                    .storage
                    .from("player-photos")
                    .getPublicUrl(fileName);

                const photoUrl =
                    publicData.publicUrl;

                const {
                    error: updateError
                } = await supabaseClient
                    .from("profiles")
                    .update({
                        photo_url: photoUrl,
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq("id", user.id);

                if (updateError) {
                    throw updateError;
                }

                profilePhoto.src =
                    photoUrl +
                    "?t=" +
                    Date.now();

                alert(
                    "Fotoğraf başarıyla güncellendi."
                );

            } catch (err) {

                console.error(err);

                alert(
                    err.message ||
                    "Fotoğraf yüklenemedi."
                );
            }
        }
    );

    profileForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            try {

                const {
                    error
                } = await supabaseClient
                    .from("profiles")
                    .update({
                        preferred_position:
                            preferredPositionInput.value,

                        dominant_foot:
                            dominantFootInput.value,

                        updated_at:
                            new Date().toISOString()
                    })
                    .eq("id", user.id);

                if (error) {
                    throw error;
                }

                alert(
                    "Profil başarıyla güncellendi."
                );

                await loadProfile();

            } catch (err) {

                console.error(err);

                alert(
                    err.message ||
                    "Profil güncellenemedi."
                );
            }
        }
    );

    await loadProfile();

});