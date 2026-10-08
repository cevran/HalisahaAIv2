// scripts.js
// Supabase initialization and utility functions

// 1. Verify that Supabase JS v2 is loaded correctly
if (!window.supabase) {
  console.error('[Halisaha AI] Supabase client library not loaded. Please ensure the Supabase JS SDK is included.');
  alert('Uygulama başlatılamadı: Supabase kütüphanesi yüklenemedi.');
  throw new Error('[Halisaha AI] Supabase client library not loaded.');
}

// 2. Refactor initialization to follow best practices
const supabaseUrl = 'https://rquhkilfwppdfxxaxysb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWhraWxmd3BwZGZ4eGF4eXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTQ5MDYsImV4cCI6MjEwNjg3MDkwNn0.8JaCqSA-tuXZBLkObPqencFMvav8uny0bEuUwbbzU_A';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 3. Verify initialization
if (!supabaseClient) {
  console.error('[Halisaha AI] Supabase client initialization failed.');
  alert('Uygulama başlatılamadı: Supabase istemcisi başlatılamadı.');
  throw new Error('[Halisaha AI] Supabase client initialization failed.');
}

console.log('[Halisaha AI] Supabase initialized successfully');

// 4. Reusable initialization section
function initializeSupabase() {
  return new Promise((resolve, reject) => {
    if (!window.supabase) {
      reject(new Error('[Halisaha AI] Supabase client library not loaded.'));
      return;
    }

    const supabaseUrl = 'https://rquhkilfwppdfxxaxysb.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWhraWxmd3BwZGZ4eGF4eXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTQ5MDYsImV4cCI6MjEwNjg3MDkwNn0.8JaCqSA-tuXZBLkObPqencFMvav8uny0bEuUwbbzU_A';

    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    if (!supabaseClient) {
      reject(new Error('[Halisaha AI] Supabase client initialization failed.'));
      return;
    }

    resolve(supabaseClient);
  });
}

// 5. Utility functions for common operations
// Register
async function register(email, password, fullName, birthYear) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          birth_year: birthYear,
        },
      },
    });

    if (error) {
      console.error('[Halisaha AI] Registration failed:', error.message);
      alert('Kayıt başarısız: ' + error.message);
      throw error;
    }

    console.log('[Halisaha AI] Registration successful:', data);
    alert('Kayıt başarılı! Lütfen e-postanızı kontrol edin.');
    return data;
  } catch (err) {
    console.error('[Halisaha AI] Registration error:', err);
    alert('Kayıt sırasında bir hata oluştu: ' + err.message);
    throw err;
  }
}

// Event listener for register form
document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const fullName = document.getElementById('fullName').value;
  const birthYear = document.getElementById('birthYear').value;

  // Password match check
  if (password !== confirmPassword) {
    alert('Şifreler eşleşmiyor.');
    return;
  }

  // Basic validation
  if (!email || !password || !fullName || !birthYear) {
    alert('Lütfen tüm alanları doldurun.');
    return;
  }

  // Register user
  register(email, password, fullName, birthYear);
});





// 3. Verify initialization
if (!supabaseClient) {
  console.error('[Halisaha AI] Supabase client initialization failed.');
  alert('Uygulama başlatılamadı: Supabase istemcisi başlatılamadı.');
  throw new Error('[Halisaha AI] Supabase client initialization failed.');
}

console.log('[Halisaha AI] Supabase initialized successfully');

// 4. Reusable initialization section
function initializeSupabase() {
  return new Promise((resolve, reject) => {
    if (!window.supabase) {
      reject(new Error('[Halisaha AI] Supabase client library not loaded.'));
      return;
    }

    const supabaseUrl = 'https://rquhkilfwppdfxxaxysb.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWhraWxmd3BwZGZ4eGF4eXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTQ5MDYsImV4cCI6MjEwNjg3MDkwNn0.8JaCqSA-tuXZBLkObPqencFMvav8uny0bEuUwbbzU_A';

    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    if (!supabaseClient) {
      reject(new Error('[Halisaha AI] Supabase client initialization failed.'));
      return;
    }

    resolve(supabaseClient);
  });
}

// 5. Utility functions for common operations
// Login
async function login(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('[Halisaha AI] Login failed:', error.message);
      alert('Giriş başarısız: ' + error.message);
      throw error;
    }

    console.log('[Halisaha AI] Login successful:', data);
    return data;
  } catch (err) {
    console.error('[Halisaha AI] Login error:', err);
    alert('Giriş sırasında bir hata oluştu: ' + err.message);
    throw err;
  }
}

// Register
async function register(email, password, fullName) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('[Halisaha AI] Registration failed:', error.message);
      alert('Kayıt başarısız: ' + error.message);
      throw error;
    }

    console.log('[Halisaha AI] Registration successful:', data);
    alert('Kayıt başarılı! Lütfen e-postanızı kontrol edin.');
    return data;
  } catch (err) {
    console.error('[Halisaha AI] Registration error:', err);
    alert('Kayıt sırasında bir hata oluştu: ' + err.message);
    throw err;
  }
}

// Logout
async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error('[Halisaha AI] Logout failed:', error.message);
      alert('Çıkış başarısız: ' + error.message);
      throw error;
    }

    console.log('[Halisaha AI] Logout successful');
    alert('Çıkış başarılı.');
  } catch (err) {
    console.error('[Halisaha AI] Logout error:', err);
    alert('Çıkış sırasında bir hata oluştu: ' + err.message);
    throw err;
  }
}

// Session check
async function checkSession() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      console.error('[Halisaha AI] Session check failed:', error.message);
      alert('Oturum kontrolü başarısız: ' + error.message);
      throw error;
    }

    console.log('[Halisaha AI] Session check successful:', data);
    return data;
  } catch (err) {
    console.error('[Halisaha AI] Session check error:', err);
    alert('Oturum kontrolü sırasında bir hata oluştu: ' + err.message);
    throw err;
  }
}

// Profile load
async function loadProfile() {
  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
      console.error('[Halisaha AI] Profile load failed:', error.message);
      alert('Profil yükleme başarısız: ' + error.message);
      throw error;
    }

    console.log('[Halisaha AI] Profile loaded successfully:', data);
    return data;
  } catch (err) {
    console.error('[Halisaha AI] Profile load error:', err);
    alert('Profil yükleme sırasında bir hata oluştu: ' + err.message);
    throw err;
  }
}

// Profile save
async function saveProfile(profileData) {
  try {
    const { data, error } = await supabaseClient.auth.updateUser(profileData);

    if (error) {
      console.error('[Halisaha AI] Profile save failed:', error.message);
      alert('Profil kaydetme başarısız: ' + error.message);
      throw error;
    }

    console.log('[Halisaha AI] Profile saved successfully:', data);
    alert('Profil başarıyla kaydedildi.');
    return data;
  } catch (err) {
    console.error('[Halisaha AI] Profile save error:', err);
    alert('Profil kaydetme sırasında bir hata oluştu: ' + err.message);
    throw err;
  }
}

// Example usage
// initializeSupabase().then(client => {
//   console.log('Supabase client initialized:', client);
// }).catch(err => {
//   console.error('Supabase initialization error:', err);
// });