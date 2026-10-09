document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error("registerForm bulunamadı.");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("fullName")?.value.trim();

        const email =
            document.getElementById("email")?.value.trim();

        const password =
            document.getElementById("password")?.value;

        const password2 =
            document.getElementById("passwordConfirm")?.value;

        const birthYear =
            document.getElementById("birthYear")?.value;

        if (!name || !email || !password || !birthYear) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        if (password !== password2) {
            alert("Şifreler eşleşmiyor.");
            return;
        }

        try {

            const submitBtn =
                form.querySelector("button[type='submit']");

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Kayıt oluşturuluyor...";
            }

            console.log("Kayıt verileri:", {
                name,
                email,
                birthYear
            });

            // AUTH KAYDI

            const { data, error } =
                await supabaseClient.auth.signUp({
                    email,
                    password
                });

            if (error) {
                throw error;
            }

            const user = data.user;

            if (!user) {
                throw new Error("Kullanıcı oluşturulamadı.");
            }

            console.log("Auth user:", user);

            // PROFİL KAYDI

            const { error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .insert([
                        {
                            id: user.id,
                            email: email,
                            full_name: name,
                            birth_year: parseInt(birthYear),
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]);

            if (profileError) {
                console.error("Profil oluşturma hatası:", profileError);
                throw profileError;
            }

            alert("Kayıt başarıyla oluşturuldu.");

            window.location.href = "profile.html";

        } catch (err) {

            console.error("Register Error:", err);

            alert(
                err.message ||
                "Kayıt sırasında hata oluştu."
            );

        } finally {

            const submitBtn =
                form.querySelector("button[type='submit']");

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Kayıt Ol";
            }
        }
    });

});