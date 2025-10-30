// ===== 모바일 메뉴 토글(메뉴가 비어 있어도 안전) =====
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
    const m = document.getElementById('menu');
    if (m) m.classList.toggle('show');
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
window.addEventListener('scroll', onScroll, { passive: true });
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

// ===== 검색 강화: 하이라이트 + 카운트 + 점프 + 메뉴필터 =====
const searchInput = document.getElementById('searchInput');
const searchCount = document.getElementById('searchCount');
const floatNavLinks = document.querySelectorAll('.float-nav a[href^="#"]');
const searchScope = document.querySelector('main'); // 본문 전체

let hits = [];          // {node, top}
let hitIndex = -1;      // 현재 포커스 중인 결과

function clearHighlights(root){
  if(!root) return;
  const marks = root.querySelectorAll('mark.hl');
  marks.forEach(m=>{
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}

function highlightAll(word){
  clearHighlights(searchScope);
  hits = []; hitIndex = -1;
  if(!word){ updateCount(0); return; }

  const selectors = [
    '.section', '.card', '.accordion', '.steps', '.checklist', '.bullet', '.lead', '.hero', '.toc'
  ];
  const nodes = searchScope.querySelectorAll(selectors.join(','));

  const rx = new RegExp(`(${escapeRegExp(word)})`, 'gi');

  nodes.forEach(el=>{
    if (['SCRIPT','STYLE'].includes(el.tagName)) return;
    el.innerHTML = el.innerHTML.replace(rx, '<mark class="hl">$1</mark>');
  });

  searchScope.querySelectorAll('mark.hl').forEach(m=>{
    hits.push({ node: m, top: m.getBoundingClientRect().top + window.scrollY });
  });

  updateCount(hits.length);

  if(hits.length){
    hitIndex = 0;
    scrollToHit(hitIndex);
  }
}

function updateCount(n){
  if (searchCount) searchCount.textContent = n ? `${n}건` : '';
}

function scrollToHit(i){
  if(!hits[i]) return;
  const y = hits[i].top - 100;
  window.scrollTo({ top: y, behavior: 'smooth' });

  hits.forEach(h => h.node.classList.remove('focus-hit'));
  hits[i].node.classList.add('focus-hit');
  setTimeout(()=> hits[i] && hits[i].node.classList.remove('focus-hit'), 800);
}

function escapeRegExp(s){
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (searchInput) {
  searchInput.addEventListener('input', ()=>{
    const word = searchInput.value.trim();
    floatNavLinks.forEach(a=>{
      const match = a.textContent.toLowerCase().includes(word.toLowerCase());
      a.style.display = (word && !match) ? 'none' : '';
    });
    highlightAll(word);
  });

  searchInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      if(!hits.length) return;
      if(e.shiftKey){
        hitIndex = (hitIndex - 1 + hits.length) % hits.length;
      }else{
        hitIndex = (hitIndex + 1) % hits.length;
      }
      scrollToHit(hitIndex);
    }
  });
}

// 화면 크기 바뀌면 위치 다시 계산
window.addEventListener('resize', ()=>{
  if(!hits.length) return;
  hits = hits.map(h => ({ node: h.node, top: h.node.getBoundingClientRect().top + window.scrollY }));
});

// 포커스 hit 스타일 주입
const styleFocus = document.createElement('style');
styleFocus.textContent = `mark.hl.focus-hit { outline: 2px solid var(--brand-strong); }`;
document.head.appendChild(styleFocus);

// ✅ 라이트박스 기능
const galleryImgs = document.querySelectorAll('.figure-grid img');
const lightbox = document.getElementById('lightbox');
const lightImg = document.querySelector('.lb-img');
const prevBtn = document.querySelector('.lb-prev');
const nextBtn = document.querySelector('.lb-next');

let currentIndex = 0;
function showLightbox(index){
  currentIndex = index;
  lightImg.src = galleryImgs[currentIndex].src;
  lightbox.classList.add('active');
}
function hideLightbox(){
  lightbox.classList.remove('active');
}
galleryImgs.forEach((img, i)=>{
  img.addEventListener('click',()=> showLightbox(i));
});
if (lightbox) {
  lightbox.addEventListener('click', (e)=>{
    if(e.target === lightbox) hideLightbox();
  });
}
if (prevBtn) {
  prevBtn.addEventListener('click', ()=>{
    showLightbox((currentIndex - 1 + galleryImgs.length) % galleryImgs.length);
  });
}
if (nextBtn) {
  nextBtn.addEventListener('click', ()=>{
    showLightbox((currentIndex + 1) % galleryImgs.length);
  });
}
document.addEventListener('keydown',(e)=>{
  if(e.key === 'Escape') hideLightbox();
});

// ✅ 온보딩: 첫 방문에만 표시
(function(){
  const modal = document.getElementById('onboard');
  if(!modal) return;

  const closeBtn = modal.querySelector('.ob-close');
  const laterBtn = document.getElementById('obLater');
  const neverBtn = document.getElementById('obNever');
  const startBtn = document.getElementById('obStart');

  const KEY = 'onboard-dismissed';
  const dismissed = localStorage.getItem(KEY);

  function openModal(){
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    (startBtn || closeBtn)?.focus?.();
    document.body.style.overflow = 'hidden';
  }
  function closeModal(state){
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(state) localStorage.setItem(KEY, state);
  }

  if(dismissed !== 'never'){
    openModal();
  }

  closeBtn && closeBtn.addEventListener('click', ()=> closeModal('later'));
  laterBtn && laterBtn.addEventListener('click', ()=> closeModal('later'));
  neverBtn && neverBtn.addEventListener('click', ()=> closeModal('never'));
  startBtn && startBtn.addEventListener('click', ()=> closeModal('later'));

  modal.addEventListener('click', (e)=>{
    if(e.target === modal) closeModal('later');
  });

  document.addEventListener('keydown', (e)=>{
    if(!modal.classList.contains('active')) return;
    if(e.key === 'Escape') closeModal('later');
  });
})();

// ✅ 인쇄 버튼
const printBtn = document.getElementById('printBtn');
if (printBtn) {
  printBtn.addEventListener('click', () => {
    window.print();
  });
}

// === Scroll Reveal (IntersectionObserver) ===
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('on'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('on');
        io.unobserve(e.target);
      }
    });
  }, {root:null, rootMargin:'0px 0px -10% 0px', threshold:0.1});
  els.forEach(el => io.observe(el));
})();

// === Header Scroll Effect ===
(function(){
  const header = document.querySelector('header.site-edge');
  if(!header) return;

  function applyHeaderState(){
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    header.classList.toggle('scrolled', y > 10);
  }

  window.addEventListener('scroll', applyHeaderState, { passive:true });
  window.addEventListener('load', applyHeaderState);
  applyHeaderState();
})();

// === 검색 단축키 ===
document.addEventListener('keydown', (e)=>{
  const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
  if ((e.key === '/' && !inInput) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
    e.preventDefault();
    const box = document.getElementById('searchInput');
    if (box) { box.focus(); box.select(); }
  }
  if (e.key === 'Escape' && document.activeElement?.id === 'searchInput') {
    const box = document.getElementById('searchInput');
    if (box) box.value = '';
    const links = document.querySelectorAll('.float-nav a'); links.forEach(a=> a.style.display = '');
    if (typeof highlightAll === 'function') highlightAll('');
    if (typeof updateCount === 'function') updateCount(0);
  }
});
