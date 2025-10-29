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

// ===== 검색 강화: 하이라이트 + 카운트 + 점프 + 메뉴필터 =====
const searchInput = document.getElementById('searchInput');
const searchCount = document.getElementById('searchCount');
const floatNavLinks = document.querySelectorAll('.float-nav a[href^="#"]');
const searchScope = document.querySelector('main'); // 본문 전체

let hits = [];          // {node, top}
let hitIndex = -1;      // 현재 포커스 중인 결과

function clearHighlights(root){
  if(!root) return;
  // mark.hl 제거 (안전하게 루프)
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

  // 하이라이트 대상: 본문 텍스트가 많은 요소들
  const selectors = [
    '.section', '.card', '.accordion', '.steps', '.checklist', '.bullet', '.lead', '.hero', '.toc'
  ];
  const nodes = searchScope.querySelectorAll(selectors.join(','));

  const rx = new RegExp(`(${escapeRegExp(word)})`, 'gi');

  nodes.forEach(el=>{
    // 안전: 코드/스크립트/스타일은 제외
    if (['SCRIPT','STYLE'].includes(el.tagName)) return;
    // 안쪽 링크/버튼의 href 등 속성은 변경하지 않도록 innerHTML 치환은 최소화
    // 이 페이지는 정적 콘텐츠라 간단 치환 허용
    el.innerHTML = el.innerHTML.replace(rx, '<mark class="hl">$1</mark>');
  });

  // 히트 목록 수집
  searchScope.querySelectorAll('mark.hl').forEach(m=>{
    hits.push({ node: m, top: m.getBoundingClientRect().top + window.scrollY });
  });

  updateCount(hits.length);

  // 첫 결과로 부드럽게 스크롤
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
  const y = hits[i].top - 100; // 헤더 여백 보정
  window.scrollTo({ top: y, behavior: 'smooth' });

  // 포커스 표시(잠깐 테두리 효과)
  hits.forEach(h => h.node.classList.remove('focus-hit'));
  hits[i].node.classList.add('focus-hit');
  setTimeout(()=> hits[i] && hits[i].node.classList.remove('focus-hit'), 800);
}

// 유틸: 정규식 이스케이프
function escapeRegExp(s){
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 입력 시 처리
if (searchInput) {
  searchInput.addEventListener('input', ()=>{
    const word = searchInput.value.trim();
    // 떠다니는 메뉴 필터(기존 기능 유지)
    floatNavLinks.forEach(a=>{
      const match = a.textContent.toLowerCase().includes(word.toLowerCase());
      a.style.display = (word && !match) ? 'none' : '';
    });
    // 본문 하이라이트
    highlightAll(word);
  });

  // Enter로 다음 결과로 점프 / Shift+Enter로 이전
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

// 다크/라이트 전환 시에도 스크롤 포지션 재계산(폰트/레이아웃 미세 변경 대비)
window.addEventListener('resize', ()=> {
  if(!hits.length) return;
  hits = hits.map(h => ({ node: h.node, top: h.node.getBoundingClientRect().top + window.scrollY }));
});

/* 포커스 히트 임시 스타일 (JS에서 class 토글) */
const styleFocus = document.createElement('style');
styleFocus.textContent = `
  mark.hl.focus-hit { outline: 2px solid var(--brand-strong); }
`;
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
lightbox.addEventListener('click', (e)=>{
  if(e.target === lightbox) hideLightbox();
});
prevBtn.addEventListener('click', ()=>{
  showLightbox((currentIndex - 1 + galleryImgs.length) % galleryImgs.length);
});
nextBtn.addEventListener('click', ()=>{
  showLightbox((currentIndex + 1) % galleryImgs.length);
});
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

  const KEY = 'onboard-dismissed';    // 'later' | 'never'
  const dismissed = localStorage.getItem(KEY);

  function openModal(){
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    // 포커스 이동
    (startBtn || closeBtn).focus();
    // 배경 스크롤 잠금
    document.body.style.overflow = 'hidden';
  }
  function closeModal(state){
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(state) localStorage.setItem(KEY, state);
  }

  // 첫 방문 판단: 'never'가 아닌 경우에만 자동 표시
  if(dismissed !== 'never'){
    // 최초 진입 또는 이전에 'later'였어도 새 세션에서 한 번 보여줌
    openModal();
  }

  // 버튼/동작 바인딩
  closeBtn && closeBtn.addEventListener('click', ()=> closeModal('later'));
  laterBtn && laterBtn.addEventListener('click', ()=> closeModal('later'));
  neverBtn && neverBtn.addEventListener('click', ()=> closeModal('never'));
  startBtn && startBtn.addEventListener('click', ()=> closeModal('later'));

  // 배경 클릭 닫기
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) closeModal('later');
  });

  // ESC 닫기
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
    // 폴백: JS 미지원/요소 없음 → 바로 표시
    els.forEach(el => el.classList.add('on'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('on');
        io.unobserve(e.target); // 한 번만 애니메이션
      }
    });
  }, {root:null, rootMargin:'0px 0px -10% 0px', threshold:0.1});
  els.forEach(el => io.observe(el));
})();
