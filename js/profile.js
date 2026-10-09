let uploadedPhotoUrl = "";

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const { data: profile, error } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

        if (error) {
            console.error(error);
        }

        if (profile) {

            document.getElementById("fullName").value =
                profile.full_name || "";

            document.getElementById("age").value =
                profile.age || "";

            document.getElementById("preferredPosition").value =
                profile.preferred_position || "";

            document.getElementById("dominantFoot").value =
                profile.dominant_foot || "";

            uploadedPhotoUrl =
                profile.photo_url || "";

            if (
                uploadedPhotoUrl &&
                document.getElementById("photoPreview")
            ) {
                document.getElementById("photoPreview").src =
                    uploadedPhotoUrl;
            }
        }

    } catch (err) {
        console.error(err);
    }

    const photoInput =
        document.getElementById("photoFile");

    if (photoInput) {

        photoInput.addEventListener("change", (e) => {

            const file = e.target.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = function(event) {

                document.getElementById(
                    "photoPreview"
                ).src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    const form =
        document.getElementById("profileForm");

    if (!form) {
        console.error("profileForm bulunamadı.");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        try {

            const {
                data: { user }
            } = await supabaseClient.auth.getUser();

            const fullName =
                document.getElementById("fullName")
                    .value
                    .trim();

            const age =
                parseInt(
                    document.getElementById("age").value
                );

            const preferredPosition =
                document.getElementById(
                    "preferredPosition"
                ).value;

            const dominantFoot =
                document.getElementById(
                    "dominantFoot"
                ).value;

            const btn =
                form.querySelector(
                    "button[type='submit']"
                );

            btn.disabled = true;
            btn.innerText = "Kaydediliyor...";

            // FOTO YUKLE

            const photoFile =
                document.getElementById("photoFile")
                    .files[0];

            if (photoFile) {

                const fileExt =
                    photoFile.name
                        .split(".")
                        .pop();

                const fileName =
                    `${user.id}.${fileExt}`;

                const filePath =
                    `avatars/${fileName}`;

                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from("player-photos")
                        .upload(
                            filePath,
                            photoFile,
                            {
                                upsert: true
                            }
                        );

                if (uploadError) {
                    throw uploadError;
                }

                const { data: publicData } =
                    supabaseClient
                        .storage
                        .from("player-photos")
                        .getPublicUrl(filePath);

                uploadedPhotoUrl =
                    publicData.publicUrl;
            }

            const { error } =
                await supabaseClient
                    .from("profiles")
                    .update({
                        full_name: fullName,
                        age: age,
                        preferred_position:
                            preferredPosition,
                        dominant_foot:
                            dominantFoot,
                        photo_url:
                            uploadedPhotoUrl,
                        updated_at:
                            new Date()
                                .toISOString()
                    })
                    .eq("id", user.id);

            if (error) {
                throw error;
            }

            alert(
                "Profil başarıyla kaydedildi."
            );

            window.location.href =
                "dashboard.html"