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

                        width =
                            MAX_SIZE;
                    }

                } else {

                    if (height > MAX_SIZE) {

                        width =
                            width *
                            (MAX_SIZE / height);

                        height =
                            MAX_SIZE;
                    }
                }

                canvas.width =
                    width;

                canvas.height =
                    height;

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

            img.onerror =
                reject;

            img.src =
                e.target.result;
        };

        reader.onerror =
            reject;

        reader.readAsDataURL(
            file
        );
    });
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const {
            data: { user }
        } =
            await supabaseClient
                .auth
                .getUser();

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }

        let selectedAvatar =
            null;

        const preferredPositionInput =
            document.getElementById(
                "preferredPosition"
            );

        const dominantFootInput =
            document.getElementById(
                "dominantFoot"
            );

        const nicknameInput =
            document.getElementById(
                "nickname"
            );

        const playerName =
            document.getElementById(
                "playerName"
            );

        const playerAge =
            document.getElementById(
                "playerAge"
            );

        const profilePhoto =
            document.getElementById(
                "profilePhoto"
            );

        const photoUpload =
            document.getElementById(
                "photoUpload"
            );

        const avatarGrid =
            document.getElementById(
                "avatarGrid"
            );

        const editProfileBtn =
            document.getElementById(
                "editProfileBtn"
            );

        const editProfilePanel =
            document.getElementById(
                "editProfilePanel"
            );

        const saveProfileBtn =
            document.getElementById(
                "saveProfileBtn"
            );

        function renderAvatars(
            activeAvatar
        ) {

            if (!avatarGrid)
                return;

            avatarGrid.innerHTML =
                "";

            for (
                let i = 1;
                i <= 10;
                i++
            ) {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src =
                    `assets/avatar${i}.png`;

                img.className =
                    "avatar-option";

                if (
                    activeAvatar ===
                    `assets/avatar${i}.png`
                ) {

                    img.classList.add(
                        "selected"
                    );
                }

                img.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".avatar-option"
                            )
                            .forEach(
                                el =>
                                    el.classList.remove(
                                        "selected"
                                    )
                            );

                        img.classList.add(
                            "selected"
                        );

                        selectedAvatar =
                            `assets/avatar${i}.png`;

                        profilePhoto.src =
                            selectedAvatar;
                    }
                );

                avatarGrid.appendChild(
                    img
                );
            }
        }

        async function loadProfile() {

            try {

                const {
                    data: profile,
                    error
                } =
                    await supabaseClient
                        .from(
                            "profiles"
                        )
                        .select("*")
                        .eq(
                            "id",
                            user.id
                        )
                        .single();

                if (error)
                    throw error;

                let age = "";

                if (
                    profile.birth_year
                ) {

                    age =
                        new Date().getFullYear() -
                        Number(
                            profile.birth_year
                        );
                }

                playerName.textContent =
                    profile.full_name ||
                    "Oyuncu";

                playerAge.textContent =
                    age
                        ? `${age} yaş`
                        : "";

                preferredPositionInput.value =
                    profile.preferred_position ||
                    "";

                dominantFootInput.value =
                    profile.dominant_foot ||
                    "";

                if (
                    nicknameInput
                ) {

                    nicknameInput.value =
                        profile.nickname ||
                        "";
                }

                if (
                    profile.photo_url &&
                    profile.photo_url.trim() !==
                        ""
                ) {

                    if (
                        profile.photo_url.startsWith(
                            "assets/"
                        )
                    ) {

                        profilePhoto.src =
                            profile.photo_url;

                    } else {

                        profilePhoto.src =
                            profile.photo_url +
                            "?t=" +
                            Date.now();
                    }

                } else {

                    profilePhoto.src =
                        "assets/default-avatar.png";
                }

                renderAvatars(
                    profile.photo_url
                );

                if (
                    !profile.profile_completed ||
                    !profile.preferred_position ||
                    !profile.dominant_foot
                ) {

                    editProfilePanel.style.display =
                        "block";
                }

            } catch (err) {

                console.error(
                    err
                );

                alert(
                    "Profil bilgileri yüklenemedi."
                );
            }
        }

        if (
            editProfileBtn
        ) {

            editProfileBtn.addEventListener(
                "click",
                () => {

                    editProfilePanel.style.display =
                        editProfilePanel.style
                            .display ===
                        "none"
                            ? "block"
                            : "none";
                }
            );
        }

        if (
            photoUpload
        ) {

            photoUpload.addEventListener(
                "change",
                async e => {

                    try {

                        const originalFile =
                            e.target
                                .files[0];

                        if (
                            !originalFile
                        )
                            return;

                        const file =
                            await compressImage(
                                originalFile
                            );

                        const fileName =
                            `${user.id}.jpg`;

                        const {
                            error:
                                uploadError
                        } =
                            await supabaseClient
                                .storage
                                .from(
                                    "player-photos"
                                )
                                .upload(
                                    fileName,
                                    file,
                                    {
                                        upsert:
                                            true
                                    }
                                );

                        if (
                            uploadError
                        )
                            throw uploadError;

                        const {
                            data:
                                publicData
                        } =
                            supabaseClient
                                .storage
                                .from(
                                    "player-photos"
                                )
                                .getPublicUrl(
                                    fileName
                                );

                        const photoUrl =
                            publicData.publicUrl;

                        const {
                            error:
                                updateError
                        } =
                            await supabaseClient
                                .from(
                                    "profiles"
                                )
                                .update({
                                    photo_url:
                                        photoUrl,
                                    updated_at:
                                        new Date().toISOString()
                                })
                                .eq(
                                    "id",
                                    user.id
                                );

                        if (
                            updateError
                        )
                            throw updateError;

                        profilePhoto.src =
                            photoUrl +
                            "?t=" +
                            Date.now();

                    } catch (
                        err
                    ) {

                        console.error(
                            err
                        );

                        alert(
                            "Fotoğraf yüklenemedi."
                        );
                    }
                }
            );
        }

        if (
            saveProfileBtn
        ) {

            saveProfileBtn.addEventListener(
                "click",
                async () => {

                    try {

                        const updateData =
                            {

                                nickname:
                                    nicknameInput.value.trim(),

                                preferred_position:
                                    preferredPositionInput.value,

                                dominant_foot:
                                    dominantFootInput.value,

                                profile_completed:
                                    true,

                                updated_at:
                                    new Date().toISOString()
                            };

                        if (
                            selectedAvatar
                        ) {

                            updateData.photo_url =
                                selectedAvatar;
                        }

                        const {
                            error
                        } =
                            await supabaseClient
                                .from(
                                    "profiles"
                                )
                                .update(
                                    updateData
                                )
                                .eq(
                                    "id",
                                    user.id
                                );

                        if (error)
                            throw error;

                        alert(
                            "Profil güncellendi."
                        );

                        editProfilePanel.style.display =
                            "none";

                        await loadProfile();

                    } catch (
                        err
                    ) {

                        console.error(
                            err
                        );

                        alert(
                            err.message ||
                                "Profil güncellenemedi."
                        );
                    }
                }
            );
        }

        await loadProfile();
    }
);