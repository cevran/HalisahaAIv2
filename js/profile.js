async function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (e) => {

            const img = new Image();

            img.onload = () => {

                const canvas =
                    document.createElement("canvas");

                const ctx =
                    canvas.getContext("2d");

                const MAX_SIZE = 800;

                let width = img.width;
                let height = img.height;

                if (width > height) {

                    if (width > MAX_SIZE) {

                        height =
                            height *
                            (MAX_SIZE / width);

                        width = MAX_SIZE;
                    }

                } else {

                    if (height > MAX_SIZE) {

                        width =
                            width *
                            (MAX_SIZE / height);

                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                canvas.toBlob(
                    (blob) => {

                        if (!blob) {
                            reject(
                                new Error(
                                    "Resim sıkıştırılamadı."
                                )
                            );
                            return;
                        }

                        resolve(
                            new File(
                                [blob],
                                "profile.jpg",
                                {
                                    type: "image/jpeg"
                                }
                            )
                        );

                    },
                    "image/jpeg",
                    0.8
                );
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

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

                const originalFile =
                    e.target.files[0];

                if (!originalFile) {
                    return;
                }

                const file =
                    await compressImage(
                        originalFile
                    );

                console.log(
                    "Orijinal:",
                    (
                        originalFile.size /
                        1024 /
                        1024
                    ).toFixed(2),
                    "MB"
                );

                console.log(
                    "Sıkıştırılmış:",
                    (
                        file.size /
                        1024 /
                        1024
                    ).toFixed(2),
                    "MB"
                );

                const fileName =
                    `${user.id}.jpg`;

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
                    `Fotoğraf güncellendi.\nDosya boyutu: ${(
                        file.size / 1024
                    ).toFixed(0)} KB`
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