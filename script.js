// 모바일 메뉴 토글(기존)
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

// 섹션 스파이(상단 메뉴 + 떠다니는 메뉴 둘 다 강조)
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
window.addEventListener('scroll', onScroll); onScroll();

// 부드러운 스크롤(같은 페이지 앵커)
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

// 맨 위로 버튼도 유지(있다면)
const toTop = document.getElementById('toTop');
if (toTop) toTop.addEventListener('click', e => {
  e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
});
