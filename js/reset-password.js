document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "resetPasswordForm"
            );

        if (!form) {
            console.error(
                "resetPasswordForm bulunamadı."
            );
            return;
        }

        form.addEventListener(
            "submit",
            async (e) => {

                e.preventDefault();

                const password =
                    document
                        .getElementById(
                            "newPassword"
                        )
                        .value
                        .trim();

                const password2 =
                    document
                        .getElementById(
                            "newPassword2"
                        )
                        .value
                        .trim();

                if (!password) {

                    alert(
                        "Şifre boş olamaz."
                    );

                    return;
                }

                if (password.length < 6) {

                    alert(
                        "Şifre en az 6 karakter olmalıdır."
                    );

                    return;
                }

                if (password !== password2) {

                    alert(
                        "Şifreler eşleşmiyor."
                    );

                    return;
                }

                try {

                    const { error } =
                        await supabaseClient
                            .auth
                            .updateUser({
                                password:
                                    password
                            });

                    if (error) {
                        throw error;
                    }

                    alert(
                        "Şifreniz başarıyla güncellendi."
                    );

                    window.location.href =
                        "index.html";

                } catch (err) {

                    console.error(err);

                    alert(
                        err.message ||
                        "Şifre güncellenemedi."
                    );
                }

            }
        );

    }
);