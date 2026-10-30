document.addEventListener(
    "DOMContentLoaded",
    async () => {

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

        console.log(
            "Reset password sayfası açıldı"
        );

        const {
            data: sessionData
        } =
            await supabaseClient.auth
                .getSession();

        console.log(
            "SESSION:",
            sessionData
        );

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

                    console.log(
                        "Şifre güncelleme başladı"
                    );

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .auth
                            .updateUser({
                                password:
                                    password
                            });

                    console.log(
                        "UPDATE DATA:",
                        data
                    );

                    console.log(
                        "UPDATE ERROR:",
                        error
                    );

                    if (error) {
                        throw error;
                    }

                    alert(
                        "Şifreniz başarıyla güncellendi."
                    );

                    window.location.href =
                        "index.html";

                } catch (err) {

                    console.error(
                        "ŞİFRE GÜNCELLEME HATASI:",
                        err
                    );

                    alert(
                        err.message ||
                        "Şifre güncellenemedi."
                    );
                }

            }
        );

    }
);