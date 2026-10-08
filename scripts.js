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
      alert('Login successful!');
      window.location.href = 'dashboard.html'; // Redirect to dashboard after login
    }
  } catch (err) {
    alert('An error occurred during login.');
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
    alert('Passwords do not match.');
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
        alert('Error saving profile data.');
        console.error(profileError);
      } else {
        alert('Registration successful! Check your email for confirmation.');
        window.location.href = 'login.html'; // Redirect to login after registration
      }
    }
  } catch (err) {
    alert('An error occurred during registration.');
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
      alert('Password reset email sent! Check your inbox.');
      window.location.href = 'login.html'; // Redirect to login after password reset
    }
  } catch (err) {
    alert('An error occurred during password reset.');
    console.error(err);
  }
});