document.addEventListener("DOMContentLoaded", () => {

    console.log("REGISTER JS YÜKLENDİ");

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error("registerForm bulunamadı.");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        console.log("FORM SUBMIT BAŞLADI");

        const name =
            document.getElementById("fullName")?.value?.trim();

        const email =
            document.getElementById("email")?.value?.trim();

        const password =
            document.getElementById("password")?.value;

        const password2 =
            document.getElementById("passwordConfirm")?.value;

        const birthYear =
            document.getElementById("birthYear")?.value;

        console.log("FORM DEĞERLERİ:", {
            name,
            email,
            birthYear,
            passwordLength: password?.length,
            password2Length: password2?.length
        });

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

            console.log("AUTH SIGNUP BAŞLIYOR");

            const { data, error } =
                await supabaseClient.auth.signUp({
                    email,
                    password
                });

            console.log("AUTH SONUCU:", {
                data,
                error
            });

            if (error) {
                throw error;
            }

            const user = data.user;

            console.log("OLUŞAN USER:", user);

            if (!user) {
                throw new Error("Kullanıcı oluşturulamadı.");
            }

            const profileData = {
                id: user.id,
                email: email,
                full_name: name,
                birth_year: parseInt(birthYear),
                updated_at: new Date().toISOString()
            };

            console.log("========== PROFILE PAYLOAD ==========");
            console.log(profileData);

            const {
                data: profileInsertData,
                error: profileError
            } = await supabaseClient
                .from("profiles")
                .upsert(
                    profileData,
                    {
                        onConflict: "id"
                    }
                )
                .select();

            console.log("========== UPSERT SONUCU ==========");
            console.log(profileInsertData);
            console.log(profileError);

            if (profileError) {
                throw profileError;
            }

            const {
                data: verifyProfile,
                error: verifyError
            } = await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            console.log("========== VERITABANI KONTROL ==========");
            console.log(verifyProfile);
            console.log(verifyError);

            alert("Kayıt başarıyla oluşturuldu.");

            window.location.href = "profile.html";

        } catch (err) {

            console.error("REGISTER HATASI:", err);

            alert(
                err?.message ||
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