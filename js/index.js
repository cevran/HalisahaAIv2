document.addEventListener("DOMContentLoaded", async () => {

    try {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (session) {
            await redirectUser(
                session.user.id
            );
            return;
        }

    } catch (err) {

        console.error(err);
    }

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) {

        console.error(
            "loginForm bulunamadı."
        );

        return;
    }

    document
        .getElementById(
            "forgotPasswordLink"
        )
        ?.addEventListener(
            "click",
            async (e) => {

                e.preventDefault();

                const email =
                    prompt(
                        "Kayıtlı e-posta adresinizi girin"
                    );

                if (!email) {
                    return;
                }

                try {

                    const { error } =
                        await supabaseClient.auth
                            .resetPasswordForEmail(
                                email,
                                {
                                    redirectTo:
                                        window.location.origin +
                                        "/HalisahaAIv2/reset-password.html"
                                }
                            );

                    if (error) {
                        throw error;
                    }

                    alert(
                        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
                    );

                } catch (err) {

                    console.error(err);

                    alert(
                        err.message ||
                        "İşlem başarısız."
                    );
                }
            }
        );

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            if (
                !email ||
                !password
            ) {

                alert(
                    "E-posta ve şifre zorunludur."
                );

                return;
            }

            const submitBtn =
                form.querySelector(
                    "button[type='submit']"
                );

            try {

                submitBtn.disabled = true;

                submitBtn.innerText =
                    "Giriş yapılıyor...";

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({
                            email,
                            password
                        });

                if (error) {
                    throw error;
                }

                if (!data.user) {
                    throw new Error(
                        "Giriş başarısız."
                    );
                }

                await redirectUser(
                    data.user.id
                );

            } catch (err) {

                console.error(err);

                alert(
                    err.message ||
                    "Giriş sırasında hata oluştu."
                );

            } finally {

                submitBtn.disabled =
                    false;

                submitBtn.innerText =
                    "Giriş Yap";
            }

        }
    );

});

async function redirectUser(
    userId
) {

    try {

        const {
            data: profile,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    userId
                )
                .single();

        if (
            error ||
            !profile
        ) {

            window.location.href =
                "profile.html";

            return;
        }

        const profileCompleted =

            profile.full_name &&
            profile.age &&
            profile.preferred_position &&
            profile.dominant_foot;

        if (
            profileCompleted
        ) {

            window.location.href =
                "dashboard.html";

        } else {

            window.location.href =
                "profile.html";
        }

    } catch (err) {

        console.error(err);

        window.location.href =
            "profile.html";
    }

}