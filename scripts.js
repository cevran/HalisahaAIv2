// scripts.js
const supabaseUrl = 'https://rquhkilfwppdfxxaxysb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWhraWxmd3BwZGZ4eGF4eXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTQ5MDYsImV4cCI6MjEwNjg3MDkwNn0.8JaCqSA-tuXZBLkObPqencFMvav8uny0bEuUwbbzU_A';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);


// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Giriş başarılı!');
      window.location.href = 'dashboard.html'; // Redirect to dashboard after login
    }
  } catch (err) {
    alert('Giriş sırasında bir hata oluştu.');
    console.error(err);
  }
});

// Register Form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const birthYear = document.getElementById('birthYear').value;

  if (password !== confirmPassword) {
    alert('Şifreler eşleşmiyor.');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      // Save birth year to user profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          birth_year: parseInt(birthYear),
        });

      if (profileError) {
        alert('Profil verileri kaydedilirken bir hata oluştu.');
        console.error(profileError);
      } else {
        alert('Kayıt başarılı! E-posta adresinize onay maili gönderildi.');
        window.location.href = 'login.html'; // Redirect to login after registration
      }
    }
  } catch (err) {
    alert('Kayıt sırasında bir hata oluştu.');
    console.error(err);
  }
});

// Forgot Password Form
document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail({
      email,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Şifre sıfırlama maili gönderildi! E-posta adresinizi kontrol edin.');
      window.location.href = 'login.html'; // Redirect to login after password reset
    }
  } catch (err) {
    alert('Şifre sıfırlama sırasında bir hata oluştu.');
    console.error(err);
  }
});

// Profile Form
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const full_name = document.getElementById('full_name').value;
  const nickname = document.getElementById('nickname').value;
  const preferred_position = document.getElementById('preferred_position').value;
  const dominant_foot = document.getElementById('dominant_foot').value;
  const player_number = document.getElementById('player_number').value;
  const bio = document.getElementById('bio').value;
  const profileImage = document.getElementById('profileImage').files[0];
  const avatar = document.getElementById('avatar');
  const user = supabase.auth.user();

  try {
    // Update profile data in Supabase
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name,
        nickname,
        preferred_position,
        dominant_foot,
        player_number,
        bio,
      })
      .eq('id', user.id);

    if (profileError) {
      alert('Profil verileri güncellenirken bir hata oluştu.');
      console.error(profileError);
      return;
    }

    // Upload profile image to Supabase Storage
    if (profileImage) {
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('profile-images')
        .upload(`/${user.id}/${profileImage.name}`, profileImage);

      if (uploadError) {
        alert('Profil fotoğrafı yüklenirken bir hata oluştu.');
        console.error(uploadError);
        return;
      }

      // Update profile image URL in Supabase
      const { error: imageUrlError } = await supabase
        .from('profiles')
        .update({
          profile_image_url: uploadData.path,
        })
        .eq('id', user.id);

      if (imageUrlError) {
        alert('Profil fotoğrafı URL\'si güncellenirken bir hata oluştu.');
        console.error(imageUrlError);
        return;
      }

      // Show uploaded image
      avatar.innerHTML = `<img src="https://your-supabase-url.supabase.co/storage/v1/object/public/profile-images/${uploadData.path}" alt="Profil Fotoğrafı" />`;
    }

    alert('Profiliniz başarıyla güncellendi!');
  } catch (err) {
    alert('Profil güncelleme sırasında bir hata oluştu.');
    console.error(err);
  }
});

// Remove profile image
document.getElementById('removeImage').addEventListener('click', async () => {
  const user = supabase.auth.user();
  const avatar = document.getElementById('avatar');

  try {
    // Remove image from Supabase Storage
    const { error: storageError } = await supabase
      .storage
      .from('profile-images')
      .remove(`/${user.id}/*`);

    if (storageError) {
      alert('Profil fotoğrafı silinirken bir hata oluştu.');
      console.error(storageError);
      return;
    }

    // Update profile image URL in Supabase
    const { error: imageUrlError } = await supabase
      .from('profiles')
      .update({
        profile_image_url: null,
      })
      .eq('id', user.id);

    if (imageUrlError) {
      alert('Profil fotoğrafı URL\'si silinirken bir hata oluştu.');
      console.error(imageUrlError);
      return;
    }

    // Show default avatar
    avatar.innerHTML = `<div>${user.user_metadata.full_name.charAt(0)}</div>`;
  } catch (err) {
    alert('Profil fotoğrafı silinirken bir hata oluştu.');
    console.error(err);
  }
});

// Load user profile data on page load
window.addEventListener('DOMContentLoaded', async () => {
  const user = supabase.auth.user();
  const avatar = document.getElementById('avatar');
  const full_name = document.getElementById('full_name');
  const nickname = document.getElementById('nickname');
  const preferred_position = document.getElementById('preferred_position');
  const dominant_foot = document.getElementById('dominant_foot');
  const player_number = document.getElementById('player_number');
  const bio = document.getElementById('bio');
  const email = document.getElementById('email');
  const birth_year = document.getElementById('birth_year');
  const age = document.getElementById('age');

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      alert('Profil verileri yüklenirken bir hata oluştu.');
      console.error(error);
      return;
    }

    full_name.value = data.full_name;
    nickname.value = data.nickname;
    preferred_position.value = data.preferred_position;
    dominant_foot.value = data.dominant_foot;
    player_number.value = data.player_number;
    bio.value = data.bio;
    email.value = data.email;
    birth_year.value = data.birth_year;

    // Calculate age
    const today = new Date();
    const birthDate = new Date(data.birth_year, 0, 1);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    age.value = age;

    // Show profile image or default avatar
    if (data.profile_image_url) {
      avatar.innerHTML = `<img src="https://your-supabase-url.supabase.co/storage/v1/object/public/profile-images/${data.profile_image_url}" alt="Profil Fotoğrafı" />`;
    } else {
      avatar.innerHTML = `<div>${data.full_name.charAt(0)}</div>`;
    }
  } catch (err) {
    alert('Profil verileri yüklenirken bir hata oluştu.');
    console.error(err);
  }
});


// Load user profile data on page load
window.addEventListener('DOMContentLoaded', async () => {
  const user = supabase.auth.user();
  const fullName = document.getElementById('fullName');
  const nickname = document.getElementById('nickname');
  const birthYear = document.getElementById('birthYear');
  const age = document.getElementById('age');
  const email = document.getElementById('email');
  const userAvatar = document.getElementById('userAvatar');
  const groupsList = document.getElementById('groupsList');
  const gamesList = document.getElementById('gamesList');

  try {
    // Load user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      alert('Kullanıcı profili yüklenirken bir hata oluştu.');
      console.error(profileError);
      return;
    }

    fullName.textContent = profileData.full_name;
    nickname.textContent = profileData.nickname;
    birthYear.textContent = profileData.birth_year;

    // Calculate age
    const today = new Date();
    const birthDate = new Date(profileData.birth_year, 0, 1);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    age.textContent = calculatedAge;

    email.textContent = profileData.email;

    // Show user avatar or default
    if (profileData.profile_image_url) {
      userAvatar.innerHTML = `<img src="https://rquhkilfwppdfxxaxysb.supabase.co/storage/v1/object/public/profile-images/${profileData.profile_image_url}" alt="Profil Fotoğrafı" />`;
    } else {
      userAvatar.innerHTML = `<div>${profileData.full_name.charAt(0)}</div>`;
    }

    // Load groups
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', user.id);

    if (groupsError) {
      alert('Gruplar yüklenirken bir hata oluştu.');
      console.error(groupsError);
      return;
    }

    groupsData.forEach(group => {
      const li = document.createElement('li');
      li.textContent = group.name;
      groupsList.appendChild(li);
    });

    // Load games
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', user.id);

    if (gamesError) {
      alert('Oyunlar yüklenirken bir hata oluştu.');
      console.error(gamesError);
      return;
    }

    gamesData.forEach(game => {
      const li = document.createElement('li');
      li.textContent = `${game.title} - ${game.date}`;
      gamesList.appendChild(li);
    });
  } catch (err) {
    alert('Dashboard verileri yüklenirken bir hata oluştu.');
    console.error(err);
  }
});

