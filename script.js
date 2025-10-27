// 모바일 메뉴 토글
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
    document.getElementById('menu').classList.toggle('show');
  });
}

// 현재 섹션에 맞춰 메뉴 강조 (간단 버전)
const links = document.querySelectorAll('nav a[href^="#"]');
const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

function onScroll() {
  const y = window.scrollY + 120;
  let activeIndex = -1;
  sections.forEach((sec, i) => {
    if (sec.offsetTop <= y) activeIndex = i;
  });
  links.forEach((a, i) => a.classList.toggle('active', i === activeIndex));
}
window.addEventListener('scroll', onScroll);
onScroll();

// 맨 위로 버튼(앵커)
const toTop = document.getElementById('toTop');
if (toTop) {
  toTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
