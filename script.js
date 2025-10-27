// ===== 모바일 메뉴 토글(메뉴가 비어 있어도 안전) =====
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
    const m = document.getElementById('menu'); if (m) m.classList.toggle('show');
  });
}

// ===== 섹션 스파이(상단/떠다니는 메뉴 active) =====
const headerLinks = document.querySelectorAll('nav a[href^="#"]');
const floatLinks  = document.querySelectorAll('.float-nav a[href^="#"]');
const allLinks = [...headerLinks, ...floatLinks];
const sections = allLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function onScroll(){
  const y = window.scrollY + 120;
  let activeIndex = -1;
  sections.forEach((sec, i) => { if (sec.offsetTop <= y) activeIndex = i; });
  allLinks.forEach((a, i) => a.classList.toggle('active', i === activeIndex));
}
window.addEventListener('scroll', onScroll);
onScroll();

// ===== 부드러운 스크롤 =====
allLinks.forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      history.replaceState(null, '', id);
    }
  });
});

// ===== 맨 위로 버튼(떠다니는 메뉴/본문 하단) =====
const toTopMini = document.getElementById('toTopMini');
if (toTopMini) {
  toTopMini.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
const toTop = document.getElementById('toTop');
if (toTop) {
  toTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== 다크 모드 토글 + 상태 저장 =====
const darkToggle = document.getElementById('darkToggle');
function setDarkIcon(){
  if (!darkToggle) return;
  const isDark = document.documentElement.classList.contains('dark');
  darkToggle.textContent = isDark ? '☀️' : '🌙';
}
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('dark-mode',
      document.documentElement.classList.contains('dark') ? 'on' : 'off'
    );
    setDarkIcon();
  });
  // 초기 복원
  if (localStorage.getItem('dark-mode') === 'on') {
    document.documentElement.classList.add('dark');
  }
  setDarkIcon();
}

// ===== 간단 검색: 떠다니는 메뉴 필터 =====
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const word = searchInput.value.toLowerCase().trim();
    const links = document.querySelectorAll('.float-nav a');
    links.forEach(a => {
      const match = a.textContent.toLowerCase().includes(word);
      a.style.display = (word && !match) ? 'none' : '';
    });
  });
}
