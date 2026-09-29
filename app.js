'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = s => s && /^https:\/\/(github\.com|shisisishi\.github\.io)\//.test(s) ? esc(s) : '';
let projects = [], category = '全部';
const marks = {'软件与交互':'{ }','艺术与视觉':'◯','科普与内容':'f(x)','演示与表达':'Aa'};
function links(p) {
  return `${safeURL(p.repo) ? `<a href="${safeURL(p.repo)}" target="_blank" rel="noopener">代码 ↗</a>` : ''}${safeURL(p.demo) ? `<a href="${safeURL(p.demo)}" target="_blank" rel="noopener">${p.id === 'debate-notes' ? '下载' : '体验'} ↗</a>` : ''}`;
}
function render() {
  const q = $('search').value.trim().toLowerCase(), state = $('state').value;
  const found = projects.filter(p => (category === '全部' || p.category === category) && (state === '全部' || p.status === state) && `${p.title} ${p.description} ${p.note}`.toLowerCase().includes(q));
  $('results').textContent = `${found.length} / ${projects.length} 个项目与作品系列`;
  $('empty').hidden = found.length > 0;
  $('grid').innerHTML = found.map(p => `<article class="card"><div class="card-visual">${p.cover && /^assets\/[\w./-]+$/.test(p.cover) ? `<img src="${esc(p.cover)}" alt="${esc(p.title)}预览" loading="lazy">` : `<div class="abstract"><span class="corner">${esc(p.category)}</span><span class="mark" aria-hidden="true">${esc(marks[p.category])}</span><span class="number">${String(projects.indexOf(p)+1).padStart(2,'0')}</span></div>`}</div><div class="card-body"><div class="meta"><span>${esc(p.category)}</span><span class="badge ${p.status==='已发布'?'published':''}">${esc(p.status)}</span></div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="card-actions"><button class="detail-link" data-id="${esc(p.id)}">项目详情 →</button>${links(p)}</div></div></article>`).join('');
}
function detail(id) {
  const p = projects.find(p => p.id === id); if (!p) return;
  $('detail-content').innerHTML = `<p class="eyebrow">${esc(p.category)} / ${esc(p.status)}</p><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p>${p.cover && /^assets\/[\w./-]+$/.test(p.cover) ? `<img src="${esc(p.cover)}" alt="${esc(p.title)}预览">` : ''}<p class="note">${esc(p.note)}</p><div class="card-actions">${links(p)}</div>`;
  $('detail').showModal();
}
$('search').addEventListener('input', render); $('state').addEventListener('change', render);
$('grid').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) detail(b.dataset.id); });
$('close').addEventListener('click', () => $('detail').close());
$('detail').addEventListener('click', e => { if (e.target === $('detail')) { const r = $('detail').getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('detail').close(); }});
fetch('projects.json').then(r => { if (!r.ok) throw Error('项目清单暂时无法读取'); return r.json(); }).then(data => {
  projects = data;
  $('total').textContent = projects.length;
  $('published').textContent = projects.filter(p => p.repo && p.status==='已发布').length;
  $('verified').textContent = projects.filter(p => ['已发布','已验证','已修复'].includes(p.status)).length;
  $('pending').textContent = projects.filter(p => !['已发布','已验证','已修复'].includes(p.status)).length;
  const categories = ['全部', ...new Set(projects.map(p => p.category))];
  $('categories').innerHTML = categories.map(c => `<button aria-pressed="${c==='全部'}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
  $('categories').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; category=b.dataset.category; for(const n of $('categories').children) n.setAttribute('aria-pressed',String(n===b)); render(); });
  render();
}).catch(e => { $('results').textContent = e.message; $('results').classList.add('error'); });
