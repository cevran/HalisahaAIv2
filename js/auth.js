async function getCurrentUser() {
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}

async function requireLogin() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
    }

    return user;
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}