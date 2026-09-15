/* =========================================================
   ULTRON — front-end only. Dữ liệu mô phỏng cục bộ.
   Tâm giao diện: khối cầu tri thức dạng hạt (point cloud 3D
   tự chiếu bằng canvas 2D, không phụ thuộc thư viện ngoài).
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad2 = (n) => String(n).padStart(2, '0');
  const esc = (s) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const rnd = (a, b) => a + Math.random() * (b - a);

  const C = {
    silver: [226, 228, 231],
    chrome: [188, 189, 194],
    cold: [77, 138, 181],
    red: [255, 74, 56],
    brass: [200, 154, 60],
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function fit(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height };
  }

  /* ================= KHỐI CẦU TRI THỨC ================= */
  const orbCv = $('#orbCanvas');
  const orb = orbCv.getContext('2d');
  const N = 2400;
  const pts = [];
  (function seedSphere() {
    const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = gold * i;
      const k = Math.random();
      pts.push({
        x: Math.cos(th) * r,
        y,
        z: Math.sin(th) * r,
        // 4% hạt đỏ (cần quyết), 18% xanh (đang học), còn lại bạc
        t: k < 0.04 ? 2 : k < 0.22 ? 1 : 0,
        ph: Math.random() * Math.PI * 2,
      });
    }
  })();

  let yaw = 0;
  let tilt = 0.32;
  let mx = 0;
  let my = 0;
  let speak = 1; // 0..1 mức "đang nói"
  let t = 0;

  $('.orb-stage').addEventListener('pointermove', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  $('.orb-stage').addEventListener('pointerleave', () => {
    mx = 0;
    my = 0;
  });

  function drawOrb() {
    const { w, h } = fit(orbCv);
    if (w < 60 || h < 60) return;
    orb.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2 - 16;
    const R = Math.min(w, h) * 0.31;
    if (R < 20) return;

    // quầng lõi
    const g = orb.createRadialGradient(cx, cy, 0, cx, cy, R * 1.9);
    g.addColorStop(0, `rgba(199,37,35,${0.14 + speak * 0.14})`);
    g.addColorStop(0.35, 'rgba(77,138,181,0.07)');
    g.addColorStop(1, 'rgba(7,8,10,0)');
    orb.fillStyle = g;
    orb.beginPath();
    orb.arc(cx, cy, R * 1.9, 0, Math.PI * 2);
    orb.fill();

    // vòng vạch quanh khối cầu
    const ticks = 72;
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2 + t * 0.12;
      const long = i % 9 === 0;
      const r1 = R * 1.52;
      const r2 = r1 + (long ? 9 : 4);
      orb.beginPath();
      orb.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.38);
      orb.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2 * 0.38);
      orb.strokeStyle = rgba(C.chrome, long ? 0.34 : 0.13);
      orb.lineWidth = 1;
      orb.stroke();
    }

    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const pt = tilt + my * 0.25;
    const cosP = Math.cos(pt);
    const sinP = Math.sin(pt);
    const rollY = mx * 0.35;

    for (let i = 0; i < N; i++) {
      const p = pts[i];
      // biến dạng hữu cơ: tổng các hoà âm theo toạ độ cầu
      const d =
        1 +
        0.11 * Math.sin(3 * p.x + t * 0.7) +
        0.09 * Math.sin(2.4 * p.y - t * 0.55) +
        0.07 * Math.sin(4.2 * p.z + t * 0.9) +
        speak * 0.05 * Math.sin(p.ph + t * 3.4);
      let x = p.x * d;
      let y = p.y * d;
      let z = p.z * d;

      // quay quanh trục dọc (yaw) + nghiêng nhẹ theo con trỏ
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;
      let y1 = y;
      // nghiêng
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;
      // lắc ngang nhẹ
      const x2 = x1 * Math.cos(rollY) - y2 * Math.sin(rollY) * 0.25;

      const persp = 2.6 / (2.6 - z2 * 0.85);
      const sx = cx + x2 * R * persp;
      const sy = cy + y2 * R * persp;

      const depth = (z2 + 1) / 2; // 0 xa, 1 gần
      let col;
      let a;
      let size;
      if (p.t === 2) {
        col = C.red;
        a = 0.35 + depth * 0.6;
        size = 1.5 + depth * 1.9;
      } else if (p.t === 1) {
        col = C.cold;
        a = 0.2 + depth * 0.55;
        size = 1.1 + depth * 1.4;
      } else {
        col = C.chrome;
        a = 0.12 + depth * 0.52;
        size = 1 + depth * 1.35;
      }
      orb.fillStyle = rgba(col, a);
      orb.fillRect(sx - size / 2, sy - size / 2, size, size);

      // hào quang cho hạt đỏ ở mặt trước
      if (p.t === 2 && depth > 0.72) {
        orb.fillStyle = rgba(C.red, 0.1);
        orb.fillRect(sx - 3, sy - 3, 6, 6);
      }
    }

    // lõi sáng ở tâm
    const cg = orb.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
    cg.addColorStop(0, `rgba(255,190,180,${0.16 + speak * 0.18})`);
    cg.addColorStop(0.5, 'rgba(199,37,35,0.08)');
    cg.addColorStop(1, 'rgba(199,37,35,0)');
    orb.fillStyle = cg;
    orb.beginPath();
    orb.arc(cx, cy, R * 0.5, 0, Math.PI * 2);
    orb.fill();
  }

  /* ================= MẠNG LƯỚI ================= */
  const netCv = $('#netCanvas');
  const net = netCv.getContext('2d');
  let nodes = [];
  let edges = [];
  function seedNet() {
    nodes = [];
    edges = [];
    const n = 64;
    for (let i = 0; i < n; i++) {
      const k = Math.random();
      nodes.push({
        x: rnd(0.06, 0.94),
        y: rnd(0.1, 0.9),
        vx: rnd(-0.00014, 0.00014),
        vy: rnd(-0.00014, 0.00014),
        t: k < 0.07 ? 2 : k < 0.32 ? 1 : 0,
        r: rnd(1.6, 4.2),
        ph: Math.random() * 6.28,
      });
    }
    for (let i = 0; i < n; i++) {
      const links = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < links; j++) {
        const b = Math.floor(Math.random() * n);
        if (b !== i) edges.push([i, b]);
      }
    }
  }
  seedNet();

  function drawNet() {
    const { w, h } = fit(netCv);
    if (w < 120 || h < 100) return;
    net.clearRect(0, 0, w, h);

    nodes.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0.04 || p.x > 0.96) p.vx *= -1;
      if (p.y < 0.06 || p.y > 0.94) p.vy *= -1;
    });

    edges.forEach(([a, b]) => {
      const p = nodes[a];
      const q = nodes[b];
      const hot = p.t === 2 || q.t === 2;
      net.beginPath();
      net.moveTo(p.x * w, p.y * h);
      net.lineTo(q.x * w, q.y * h);
      net.strokeStyle = hot ? rgba(C.red, 0.22) : rgba(C.chrome, 0.1);
      net.lineWidth = 1;
      net.stroke();
    });

    nodes.forEach((p) => {
      const x = p.x * w;
      const y = p.y * h;
      const pulse = p.t === 2 ? 1 + 0.35 * Math.sin(t * 2.4 + p.ph) : 1;
      const col = p.t === 2 ? C.red : p.t === 1 ? C.cold : C.chrome;
      if (p.t === 2) {
        net.fillStyle = rgba(C.red, 0.12);
        net.beginPath();
        net.arc(x, y, p.r * 3.4 * pulse, 0, Math.PI * 2);
        net.fill();
      }
      net.fillStyle = rgba(col, p.t === 0 ? 0.55 : 0.9);
      net.beginPath();
      net.arc(x, y, p.r * pulse, 0, Math.PI * 2);
      net.fill();
    });
  }

  /* ================= BIỂU ĐỒ MỨC CHÚ Ý ================= */
  const sigCv = $('#chartSignal');
  const sig = sigCv.getContext('2d');
  const series = Array.from({ length: 24 }, (_, i) => 0.25 + 0.5 * Math.abs(Math.sin(i / 3.1)) + Math.random() * 0.2);
  function drawSignal() {
    const { w, h } = fit(sigCv);
    if (w < 120 || h < 80) return;
    sig.clearRect(0, 0, w, h);
    const pad = { l: 26, r: 10, t: 26, b: 22 };
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;
    sig.font = '9px "Roboto Mono", monospace';

    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ih - (i / 4) * ih;
      sig.beginPath();
      sig.moveTo(pad.l, y);
      sig.lineTo(w - pad.r, y);
      sig.strokeStyle = rgba(C.chrome, 0.1);
      sig.lineWidth = 1;
      sig.stroke();
      sig.fillStyle = rgba(C.chrome, 0.45);
      sig.fillText(String(i * 25), 4, y + 3);
    }
    const bw = (iw / series.length) * 0.58;
    series.forEach((v, i) => {
      const x = pad.l + (i + 0.5) * (iw / series.length);
      const bh = Math.min(1, v) * ih;
      const hot = v > 0.82;
      const g = sig.createLinearGradient(0, pad.t + ih - bh, 0, pad.t + ih);
      g.addColorStop(0, hot ? rgba(C.red, 0.95) : rgba(C.cold, 0.85));
      g.addColorStop(1, hot ? rgba(C.red, 0.15) : rgba(C.cold, 0.12));
      sig.fillStyle = g;
      sig.fillRect(x - bw / 2, pad.t + ih - bh, bw, bh);
    });
    sig.fillStyle = rgba(C.chrome, 0.45);
    sig.fillText('00h', pad.l - 4, h - 7);
    sig.fillText('23h', w - pad.r - 22, h - 7);
  }

  /* ================= VÒNG LẶP ================= */
  function frame() {
    t += 0.01;
    yaw += 0.0035;
    speak = Math.max(0.12, speak - 0.004);
    if (!$('#view-cortex').hidden) drawOrb();
    if (!$('#view-net').hidden) drawNet();
    requestAnimationFrame(frame);
  }
  drawOrb();
  drawNet();
  drawSignal();
  if (!reduce) requestAnimationFrame(frame);
  else {
    drawOrb();
    drawNet();
  }
  window.addEventListener('resize', () => {
    drawOrb();
    drawNet();
    drawSignal();
  });

  /* ================= ĐỒNG HỒ & LỜI CHÀO ================= */
  const DAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  function tick() {
    const d = new Date();
    $('#orbClock').textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);
  (function greet() {
    const d = new Date();
    const h = d.getHours();
    $('#greet').textContent = h < 11 ? 'Tôi đã dọn buổi sáng cho bạn, Cường.' : h < 18 ? 'Tôi đang nghe, Cường.' : 'Đêm là lúc bạn làm tốt nhất, Cường.';
    $('#greetSub').textContent = `${DAYS[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1} · 4 nguồn · 184 thực thể`;
  })();

  /* ================= TOAST ================= */
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff4a38" stroke-width="2"><path d="M12 4.5 20 19H4L12 4.5Z"/></svg><span>${msg}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  /* ================= ĐIỀU HƯỚNG ================= */
  const views = ['cortex', 'net', 'sys'];
  function show(v) {
    views.forEach((x) => {
      const el = $('#view-' + x);
      if (el) el.hidden = x !== v;
    });
    $$('[data-view]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.view === v)));
    requestAnimationFrame(() => {
      if (v === 'cortex') drawOrb();
      if (v === 'net') drawNet();
      if (v === 'net') drawSignal();
    });
    $('.main').scrollTop = 0;
  }
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => show(b.dataset.view)));

  /* ================= HÀNG ĐỢI TÁC VỤ ================= */
  const queue = [
    { nm: 'Soạn bản nháp API thanh toán v1', sb: 'Chặn 2 người · hạn 08:30 mai', ag: 'bạn làm', st: 'run', tag: ['red', 'Cần bạn'] },
    { nm: 'Duyệt báo giá bổ sung Vinpro', sb: 'Khách hàng · 2 tính năng', ag: 'chờ bạn', st: '', tag: ['red', 'Cần quyết'] },
    { nm: 'Trả lời anh Hưng về mốc bàn giao', sb: 'Nháp đã viết sẵn', ag: 'chờ gửi', st: '', tag: ['brass', 'Nháp sẵn'] },
    { nm: 'Đối chiếu 3 hoá đơn tháng 8', sb: 'Tôi tự chạy · 92% tin cậy', ag: '12 ph', st: '', tag: ['cold', 'Tôi chạy'] },
    { nm: 'Theo dõi CI staging của anh Nam', sb: 'Nhắc lại khi có thay đổi', ag: 'liên tục', st: '', tag: ['cold', 'Giám sát'] },
    { nm: 'Tóm tắt 2 luồng thảo luận dài', sb: 'Đã gửi vào ghi chú', ag: '16:40', st: 'done', tag: ['ok', 'Xong'] },
    { nm: 'Lưu trữ 36 thư quảng cáo', sb: 'Không cần bạn xem', ag: '09:05', st: 'done', tag: ['ok', 'Xong'] },
    { nm: 'Dựng bản đồ liên kết dự án Thanh toán', sb: '184 thực thể · 512 liên kết', ag: '08:40', st: 'done', tag: ['ok', 'Xong'] },
    { nm: 'Kiểm tra xung đột lịch ngày mai', sb: 'Phát hiện 1 xung đột 09:00', ag: '07:55', st: 'done', tag: ['ok', 'Xong'] },
  ];
  function renderQueue() {
    $('#queue').innerHTML = queue
      .map(
        (q, i) => `<button class="qi ${q.st}" data-i="${i}" data-testid="task-${i}">
          <span class="ix">${pad2(i + 1)}</span>
          <span><span class="nm">${q.nm}</span><span class="sb">${q.sb}</span></span>
          <span class="tag tag--${q.tag[0]}">${q.tag[1]}</span>
          <span class="ag">${q.ag}</span>
        </button>`
      )
      .join('');
    const open = queue.filter((q) => q.st !== 'done').length;
    $('#qCount').textContent = `${queue.length} tác vụ · ${open} đang mở`;
    $('#numTask').textContent = String(open);
    $$('#queue .qi').forEach((b) =>
      b.addEventListener('click', () => {
        const q = queue[Number(b.dataset.i)];
        if (q.st === 'done') return toast(`Tác vụ đã xong: ${q.nm}`);
        q.st = 'done';
        q.tag = ['ok', 'Xong'];
        q.ag = 'vừa xong';
        renderQueue();
        toast(`Đã đóng tác vụ: ${q.nm}`);
        log(`Đóng tác vụ “${q.nm}”`, 1);
      })
    );
  }
  renderQueue();

  const autos = [
    ['ok', 'Đã lưu trữ', '36 thư không cần bạn', '09:05'],
    ['ok', 'Đã đối chiếu', '3 hoá đơn tháng 8 khớp sổ', '09:12'],
    ['cold', 'Đã tóm tắt', '2 luồng thảo luận dài', '16:40'],
    ['brass', 'Đã soạn', '2 bản nháp trả lời thư', '18:40'],
    ['cold', 'Đã dời', 'Nhắc gia hạn tên miền sang 20/9', 'hôm qua'],
    ['ok', 'Đã phát hiện', 'Xung đột lịch 09:00 ngày mai', '07:55'],
  ];
  $('#autoRows').innerHTML = autos
    .map(([lv, tag, nm, v]) => `<div class="row"><span class="tag tag--${lv}">${tag}</span><span class="nm">${nm}</span><span class="vl">${v}</span></div>`)
    .join('');

  const decide = [
    ['red', 'Báo giá', 'Bổ sung 2 tính năng cho Vinpro', 'hôm nay'],
    ['red', 'Lịch', 'Dời review 09:00 → 14:00 mai', '3 người'],
  ];
  $('#decideRows').innerHTML = decide
    .map(([lv, tag, nm, v]) => `<div class="row"><span class="tag tag--${lv}">${tag}</span><span class="nm">${nm}</span><span class="vl">${v}</span></div>`)
    .join('');
  $('#decideMeta').textContent = `${decide.length} mục`;

  /* ================= LỊCH & SỰ KIỆN ================= */
  (function cal() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const shift = (first.getDay() + 6) % 7; // bắt đầu từ Thứ Hai
    const days = new Date(y, m + 1, 0).getDate();
    const prev = new Date(y, m, 0).getDate();
    const evDays = [16, 18, 22, 25, 30];
    const hotDays = [16, 30];
    let html = ['H', 'B', 'T', 'N', 'S', 'B', 'C'].map((d) => `<div class="d">${d}</div>`).join('');
    for (let i = 0; i < shift; i++) html += `<div class="c out">${prev - shift + i + 1}</div>`;
    for (let d = 1; d <= days; d++) {
      const cls = ['c'];
      if (d === now.getDate()) cls.push('now');
      if (evDays.includes(d)) cls.push('ev');
      if (hotDays.includes(d)) cls.push('ev', 'hot');
      html += `<div class="${cls.join(' ')}">${d}</div>`;
    }
    const tail = (7 - ((shift + days) % 7)) % 7;
    for (let i = 1; i <= tail; i++) html += `<div class="c out">${i}</div>`;
    $('#miniCal').innerHTML = html;
    $('#calMeta').textContent = String(y);
  })();

  const evs = [
    ['21:30', 'Làm sâu: API thanh toán', 'còn 14 phút · tôi sẽ chặn thông báo', 'now'],
    ['08:30', 'Hạn: bản nháp API v1', 'sáng mai · 2 người đang chờ', 'soon'],
    ['09:00', 'Review thiết kế — xung đột', 'tôi đề nghị dời sang 14:00', 'soon'],
    ['14:00', 'Gọi Vinpro chốt báo giá', 'cần bạn duyệt trước 12:00', 'soon'],
  ];
  $('#evList').innerHTML = evs
    .map(([tm, nm, mt, k]) => `<div class="ev ev--${k}"><div class="t">${tm}</div><div class="dot"></div><div><div class="nm">${nm}</div><div class="mt">${mt}</div></div></div>`)
    .join('');

  /* ================= THỰC THỂ & LIÊN KẾT ================= */
  const ents = [
    ['Dự án Thanh toán v2', '38 liên kết · 5 việc mở', '96', 'red'],
    ['Khách hàng Vinpro', '21 liên kết · 1 quyết định', '88', 'red'],
    ['Anh Hưng — đối tác', '14 liên kết · 1 thư chờ', '71', 'brass'],
    ['Hạ tầng CI/CD', '19 liên kết · đang chặn', '64', 'brass'],
    ['Repo web-frontend', '27 liên kết · 3 PR', '52', 'cold'],
    ['Hàng đợi sự kiện', '9 liên kết · đang học', '34', 'cold'],
    ['Báo cáo chi phí tháng 8', '6 liên kết · đã xong', '12', 'iron'],
  ];
  $('#entList').innerHTML = ents
    .map(([nm, sb, w, lv]) => `<div class="row"><span class="tag tag--${lv}">${w}</span><span class="nm">${nm}<span class="sb" style="display:block">${sb}</span></span></div>`)
    .join('');

  const edgesInfo = [
    ['Thanh toán v2', '→ Hàng đợi sự kiện', 'đối soát gần thực thời'],
    ['Vinpro', '→ Thanh toán v2', 'báo giá phụ thuộc mốc 30/9'],
    ['CI/CD', '→ Thanh toán v2', 'chặn kiểm thử tích hợp'],
    ['Anh Hưng', '→ Mốc bàn giao 30/9', 'cần cam kết bằng văn bản'],
    ['Repo web', '→ Lỗi giá Safari', 'đã sửa, chờ phát hành'],
    ['Hội thảo 12/10', '→ Thanh toán v2', 'chủ đề tách service'],
  ];
  $('#edgeList').innerHTML = edgesInfo
    .map(([a, b, why]) => `<div class="row"><span class="nm">${a} <span style="color:var(--red-hot)">${b}</span><span class="sb" style="display:block">${why}</span></span></div>`)
    .join('');

  $('#btnReseed').addEventListener('click', () => {
    seedNet();
    drawNet();
    toast('Đã dựng lại bố cục mạng lưới.');
  });

  /* ================= DÒNG SUY LUẬN ================= */
  const LV = [
    ['i', 'ĐỌC'],
    ['o', 'XONG'],
    ['w', 'CẢNH'],
    ['e', 'CHẶN'],
  ];
  const hhmmss = (d) => d.toTimeString().slice(0, 8);
  function push(target, code, text, tm) {
    const [c, nm] = LV[code];
    const el = document.createElement('div');
    el.className = 'tl';
    el.innerHTML = `<time>${tm}</time><span class="lv lv--${c}">${nm}</span><span class="tt">${text}</span>`;
    target.appendChild(el);
    while (target.children.length > 90) target.removeChild(target.firstChild);
    target.scrollTop = target.scrollHeight;
  }
  function log(text, code) {
    const tm = hhmmss(new Date());
    push($('#term'), code, text, tm);
    push($('#termMini'), code, text, tm);
  }
  const seed = [
    [0, 'Quét 4 nguồn: lịch, thư, repo, ghi chú'],
    [0, 'Dựng lại bản đồ tri thức: 184 thực thể, 512 liên kết'],
    [1, 'Lưu trữ 36 thư không cần bạn xem'],
    [3, 'CI staging đang chặn kiểm thử tích hợp'],
    [2, 'Xung đột lịch 09:00 ngày mai với giờ làm sâu'],
    [1, 'Đối chiếu 3 hoá đơn tháng 8 — khớp sổ'],
    [0, 'Suy luận: báo giá Vinpro phụ thuộc mốc 30/9'],
    [2, 'Bản nháp API v1 còn 11 giờ tới hạn'],
    [1, 'Soạn 2 bản nháp trả lời thư'],
    [0, 'Phát hiện liên kết mới: hội thảo 12/10 ↔ tách service'],
  ];
  const t0 = Date.now();
  seed.forEach(([code, text], i) => {
    const tm = hhmmss(new Date(t0 - (seed.length - i) * 520000));
    push($('#term'), code, text, tm);
    push($('#termMini'), code, text, tm);
  });
  const rolling = [
    [0, 'Theo dõi repo: chưa có commit mới trên nhánh thanh toán'],
    [2, 'Còn 14 phút tới phiên làm sâu 21:30'],
    [1, 'Cập nhật mức chú ý cho 12 thực thể'],
    [0, 'Đọc lại ghi chú kiến trúc để dựng lập luận'],
  ];
  let ri = 0;
  let paused = false;
  setInterval(() => {
    if (paused) return;
    const [code, text] = rolling[ri % rolling.length];
    log(text, code);
    ri++;
  }, 11000);
  $('#btnPause').addEventListener('click', (e) => {
    paused = !paused;
    e.currentTarget.textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
    toast(paused ? 'Đã tạm dừng dòng suy luận.' : 'Dòng suy luận tiếp tục.');
  });

  /* ================= NHỊP HỆ THỐNG ================= */
  setInterval(() => {
    const load = Math.round(rnd(38, 62));
    const conf = Math.round(rnd(88, 96));
    $('#mLoad').textContent = load + '%';
    $('#tLoad').style.width = load + '%';
    $('#mConf').textContent = conf + '%';
    $('#tConf').style.width = conf + '%';
    $('#chipLoad').innerHTML = `<i></i> Tải nhận thức ${load}%`;
  }, 6000);

  /* ================= ĐỐI THOẠI ================= */
  function addTurn(who, html, me) {
    const a = document.createElement('article');
    a.className = 'turn ' + (me ? 'turn--u' : 'turn--x');
    const d = new Date();
    a.innerHTML = `<div class="who">${who}${me ? '' : `<time>${pad2(d.getHours())}:${pad2(d.getMinutes())}</time>`}</div><div class="tx">${html}</div>`;
    $('#stream').insertBefore(a, $('#pending'));
  }
  $('#composer').addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('#prompt');
    const q = inp.value.trim();
    if (!q) return;
    addTurn('Cường', `<p>${esc(q)}</p>`, true);
    inp.value = '';
    $('#pending').hidden = false;
    $('#orbState').textContent = 'Đang suy luận';
    speak = 0.5;
    setTimeout(
      () => {
        $('#pending').hidden = true;
        $('#orbState').textContent = 'Đang nói';
        speak = 1;
        const open = queue.filter((x) => x.st !== 'done').length;
        addTurn(
          'Ultron',
          `<p>Tôi đã đối chiếu yêu cầu với bản đồ tri thức. Kết luận: giữ nguyên thứ tự hiện tại — <strong>bản nháp API thanh toán</strong> đi trước, vì nó là nút chặn của hai người và của mốc 30/9.</p>
           <p>Bạn còn <b class="r">${open} tác vụ mở</b>; ${'2'} trong số đó cần bạn quyết, phần còn lại tôi chạy được mà không cần bạn. Nếu bạn muốn, tôi dời buổi review 09:00 sang 14:00 và thông báo cho 3 người.</p>
           <div class="readout"><div><div class="k">Thực thể liên quan</div><div class="v">7</div></div><div><div class="k">Độ tin cậy</div><div class="v c">92%</div></div><div><div class="k">Cần bạn quyết</div><div class="v r">2</div></div></div>`,
          false
        );
        $('.main').scrollTop = $('.main').scrollHeight;
        log('Trả lời câu hỏi của Cường sau khi đọc 7 thực thể liên quan', 0);
      },
      reduce ? 200 : 1500
    );
    $('.main').scrollTop = $('.main').scrollHeight;
  });
  $('#btnBrief').addEventListener('click', () => {
    show('cortex');
    speak = 1;
    toast('Tình hình: 1 việc gấp trước 08:30 mai, 2 việc cần bạn quyết, 3 điểm nóng trong mạng lưới.');
  });

  /* ================= HỆ THỐNG THIẾT KẾ ================= */
  const sws = [
    ['Void', '#07080A', 'Nền sâu nhất'],
    ['Graphite', '#0E1013', 'Nền phụ'],
    ['Charleston', '#2B2B2B', 'Kim loại tối (Ultron)'],
    ['Iron', '#4F504F', 'Xám khung phim'],
    ['Vibranium', '#BCBDC2', 'Chữ & hạt ổn định'],
    ['Chrome', '#A8A9AD', 'Bạc kim loại Ultron'],
    ['American Red', '#C72523', 'Cần bạn quyết'],
    ['Eye Red', '#FF4A38', 'Mắt lõi · điểm nóng'],
    ['Auburn', '#951E22', 'Nền đỏ tối'],
    ['Blood', '#4D1518', 'Bóng đỏ sâu'],
    ['Cold Steel', '#4D8AB5', 'Dữ liệu · đang học'],
    ['Navy', '#1E2638', 'Nền khối cầu'],
  ];
  $('#sws').innerHTML = sws
    .map(([n, hex, use]) => `<div class="sw"><div class="c" style="background:${hex}"></div><div class="m"><div class="n">${n}</div><div class="h">${hex}</div><div class="h">${use}</div></div></div>`)
    .join('');

  const types = [
    ['Tiêu đề khung nhìn', '20px / 600 / 0,10em', 'Chakra Petch', "font-family:'Chakra Petch';font-size:20px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--silver)"],
    ['Tiêu đề panel', '10,5px / 600 / 0,24em', 'Chakra Petch', "font-family:'Chakra Petch';font-size:10.5px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--chrome)"],
    ['Nội dung đối thoại', '14,5px / 400 / 1,75', 'Be Vietnam Pro', 'font-size:14.5px;line-height:1.75;color:var(--chrome)'],
    ['Số liệu', '14px mono', 'Roboto Mono', "font-family:'Roboto Mono';font-size:14px;color:var(--silver)"],
    ['Nhãn kỹ thuật', '9px / 0,26em', 'Chakra Petch', "font-family:'Chakra Petch';font-size:9px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--faint)"],
  ];
  $('#typeScale').innerHTML = types
    .map(([nm, spec, fam, css]) => `<div class="type-row"><div style="${css}">Tôi đã đọc xong bốn nguồn của bạn</div><div class="d">${nm} · ${spec} · ${fam}</div></div>`)
    .join('');

  const spec = [
    ['Khối cầu', '2.400 hạt', 'Fibonacci sphere, chiếu phối cảnh'],
    ['Biến dạng', '3 hoà âm + nhịp nói', 'Bề mặt phồng theo vùng hoạt động'],
    ['Hạt đỏ', '4%', 'Thực thể cần bạn quyết'],
    ['Hạt xanh', '18%', 'Thực thể đang học'],
    ['Quay lõi', '0,0035 rad/frame', 'Vòng quay yaw liên tục'],
    ['--d-fast', '160 ms', 'Hover, focus, đổi màu'],
    ['--d-std', '260 ms', 'Panel, bảng lệnh'],
    ['--e-std', 'cubic-bezier(.2,0,0,1)', 'Mọi chuyển động'],
    ['Vát góc', '7px / 9px / 12px', 'Nút / ô nhập / bảng lệnh'],
    ['Nét viền', '1px', 'Toàn bộ khung kim loại'],
  ];
  $('#specTable tbody').innerHTML = spec.map(([k, v, u]) => `<tr><td class="k">${k}</td><td class="v">${v}</td><td>${u}</td></tr>`).join('');

  /* ================= BẢNG LỆNH ================= */
  const cmds = [
    { g: 'Đi tới', n: 'Lõi nhận thức', d: 'Khối cầu tri thức, đối thoại, hàng đợi', k: '1', run: () => show('cortex') },
    { g: 'Đi tới', n: 'Mạng lưới tri thức', d: '184 thực thể, 512 liên kết', k: '2', run: () => show('net') },
    { g: 'Đi tới', n: 'Hệ thống thiết kế', d: 'Bảng màu phim, thang chữ, token', k: '3', run: () => show('sys') },
    { g: 'Ra lệnh', n: 'Tóm tắt tình hình', d: 'Ultron nêu kết luận trước', k: '', run: () => $('#btnBrief').click() },
    { g: 'Ra lệnh', n: 'Dời buổi review sang 14:00', d: 'Thông báo cho 3 người', k: '', run: () => { toast('Đã dời review sang 14:00 và thông báo 3 người.'); log('Dời review 09:00 → 14:00, thông báo 3 người', 1); } },
    { g: 'Ra lệnh', n: 'Gửi bản nháp trả lời anh Hưng', d: 'Nháp đã viết sẵn', k: '', run: () => { toast('Đã gửi trả lời anh Hưng về mốc bàn giao.'); log('Gửi thư trả lời anh Hưng', 1); } },
    { g: 'Ra lệnh', n: 'Chỉ cho tôi các điểm nóng', d: '3 điểm nóng trong mạng lưới', k: '', run: () => { show('net'); toast('3 điểm nóng: Thanh toán v2, Vinpro, CI/CD.'); } },
    { g: 'Ra lệnh', n: 'Im lặng 25 phút', d: 'Chặn thông báo cho phiên làm sâu', k: '', run: () => { toast('Tôi sẽ im lặng 25 phút. Chỉ báo nếu có việc chặn người khác.'); log('Bật chế độ im lặng 25 phút', 0); } },
  ];
  const scrim = $('#scrim');
  const palInput = $('#palInput');
  const palList = $('#palList');
  let sel = 0;
  let filtered = cmds;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

  function renderPal() {
    const q = norm(palInput.value.trim());
    filtered = q ? cmds.filter((c) => norm(c.n + ' ' + c.d).includes(q)) : cmds;
    if (!filtered.length) {
      palList.innerHTML = `<div class="empty">Không có lệnh nào khớp “${esc(palInput.value)}”.<br />Thử: tóm tắt, điểm nóng, dời họp, im lặng.</div>`;
      return;
    }
    sel = Math.min(sel, filtered.length - 1);
    let html = '';
    let g = '';
    filtered.forEach((c, i) => {
      if (c.g !== g) {
        g = c.g;
        html += `<p class="lbl pal-group">${g}</p>`;
      }
      html += `<button class="pal-item ${i === sel ? 'on' : ''}" data-i="${i}" data-testid="palette-item-${i}"><span><span class="pn">${c.n}</span><br /><span class="pd">${c.d}</span></span>${c.k ? `<span class="pk">${c.k}</span>` : ''}</button>`;
    });
    palList.innerHTML = html;
    $$('.pal-item', palList).forEach((b) =>
      b.addEventListener('click', () => {
        sel = Number(b.dataset.i);
        exec();
      })
    );
    const on = $('.pal-item.on', palList);
    if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function openPal() {
    scrim.hidden = false;
    palInput.value = '';
    sel = 0;
    renderPal();
    palInput.focus();
  }
  const closePal = () => (scrim.hidden = true);
  function exec() {
    const c = filtered[sel];
    closePal();
    if (c) c.run();
  }
  $('#cmdBtn').addEventListener('click', openPal);
  palInput.addEventListener('input', () => {
    sel = 0;
    renderPal();
  });
  scrim.addEventListener('click', (e) => {
    if (e.target === scrim) closePal();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      scrim.hidden ? openPal() : closePal();
      return;
    }
    if (scrim.hidden) return;
    if (e.key === 'Escape') closePal();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      sel = Math.min(sel + 1, filtered.length - 1);
      renderPal();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      sel = Math.max(sel - 1, 0);
      renderPal();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      exec();
    }
  });
})();
