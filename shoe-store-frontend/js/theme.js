function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
  const themeIcons = document.querySelectorAll('.theme-icon');
  themeIcons.forEach(icon => {
    if (isDark) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.add('fa-moon');
      icon.classList.remove('fa-sun');
    }
  });

  const siteLogo = document.getElementById('siteLogo');
  if (siteLogo) {
    if (isDark) {
      siteLogo.src = 'images/logo/darkmode.png';
    } else {
      siteLogo.src = 'images/logo/lightmode.png';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeIcons(true);
  } else {
    updateThemeIcons(false);
  }
});
