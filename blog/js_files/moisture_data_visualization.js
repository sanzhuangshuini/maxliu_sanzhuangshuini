(function () {
  const RAW = [{ t: "2026-03-02T18:56:46.211Z", v: 342 }, { t: "2026-03-02T19:54:52.395Z", v: 345 }, { t: "2026-03-02T20:55:46.313Z", v: 338 }, { t: "2026-03-02T21:56:40.067Z", v: 319 }, { t: "2026-03-02T22:57:33.980Z", v: 308 }, { t: "2026-03-02T23:58:27.869Z", v: 280 }, { t: "2026-03-03T00:59:21.870Z", v: 274 }, { t: "2026-03-03T02:00:15.590Z", v: 203 }, { t: "2026-03-03T03:01:08.978Z", v: 169 }, { t: "2026-03-03T04:02:02.493Z", v: 160 }, { t: "2026-03-03T05:02:56.037Z", v: 112 }, { t: "2026-03-03T06:03:49.551Z", v: 109 }, { t: "2026-03-03T07:04:43.006Z", v: 41 }, { t: "2026-03-03T08:05:36.778Z", v: 25 }, { t: "2026-03-03T09:06:30.524Z", v: 23 }, { t: "2026-03-03T10:07:24.190Z", v: 14 }, { t: "2026-03-03T11:08:17.681Z", v: 21 }, { t: "2026-03-03T12:09:10.923Z", v: 6 }, { t: "2026-03-03T13:10:03.942Z", v: 19 }, { t: "2026-03-03T20:40:16.268Z", v: 426 }, { t: "2026-03-03T21:41:09.661Z", v: 525 }, { t: "2026-03-03T22:42:02.990Z", v: 592 }, { t: "2026-03-03T23:42:56.274Z", v: 630 }, { t: "2026-03-04T00:43:49.787Z", v: 601 }, { t: "2026-03-04T01:44:43.364Z", v: 618 }, { t: "2026-03-04T02:45:36.874Z", v: 615 }, { t: "2026-03-04T03:46:30.472Z", v: 617 }, { t: "2026-03-04T04:47:24.185Z", v: 619 }, { t: "2026-03-04T05:48:17.422Z", v: 618 }, { t: "2026-03-04T06:49:10.521Z", v: 611 }, { t: "2026-03-04T07:50:03.404Z", v: 591 }, { t: "2026-03-04T08:50:56.525Z", v: 600 }, { t: "2026-03-04T09:51:49.986Z", v: 598 }, { t: "2026-03-04T10:52:43.330Z", v: 583 }, { t: "2026-03-04T11:53:36.786Z", v: 590 }, { t: "2026-03-04T12:54:30.027Z", v: 550 }, { t: "2026-03-04T13:55:23.457Z", v: 550 }, { t: "2026-03-04T14:56:16.843Z", v: 536 }, { t: "2026-03-04T15:57:10.149Z", v: 524 }, { t: "2026-03-04T16:58:03.464Z", v: 505 }, { t: "2026-03-04T17:58:56.720Z", v: 494 }, { t: "2026-03-04T18:59:49.918Z", v: 468 }, { t: "2026-03-04T20:00:43.300Z", v: 433 }, { t: "2026-03-04T21:01:36.795Z", v: 407 }, { t: "2026-03-04T22:02:30.299Z", v: 373 }, { t: "2026-03-04T23:03:23.887Z", v: 333 }, { t: "2026-03-05T00:04:17.355Z", v: 311 }, { t: "2026-03-05T01:05:10.933Z", v: 276 }, { t: "2026-03-05T02:06:04.267Z", v: 215 }, { t: "2026-03-05T03:06:57.318Z", v: 177 }, { t: "2026-03-05T04:07:50.665Z", v: 148 }, { t: "2026-03-05T05:08:43.765Z", v: 135 }, { t: "2026-03-05T06:09:36.742Z", v: 104 }, { t: "2026-03-05T07:10:30.103Z", v: 97 }, { t: "2026-03-05T08:11:23.890Z", v: 120 }, { t: "2026-03-05T09:12:17.141Z", v: 38 }, { t: "2026-03-05T10:13:10.216Z", v: 65 }, { t: "2026-03-05T11:14:03.185Z", v: 54 }, { t: "2026-03-05T12:14:56.163Z", v: 57 }, { t: "2026-03-05T13:15:49.125Z", v: 53 }, { t: "2026-03-05T14:16:42.553Z", v: 49 }, { t: "2026-03-05T15:17:35.775Z", v: 39 }, { t: "2026-03-05T16:18:28.905Z", v: 36 }, { t: "2026-03-05T17:19:22.123Z", v: 33 }, { t: "2026-03-05T18:20:15.595Z", v: 19 }, { t: "2026-03-05T19:21:08.882Z", v: 91 }, { t: "2026-03-05T20:22:02.138Z", v: 21 }, { t: "2026-03-05T21:22:55.342Z", v: 27 }, { t: "2026-03-05T22:23:48.880Z", v: 30 }, { t: "2026-03-05T23:24:42.439Z", v: 40 }, { t: "2026-03-06T00:25:35.972Z", v: 40 }, { t: "2026-03-06T01:26:29.612Z", v: 20 }, { t: "2026-03-06T02:27:23.063Z", v: 19 }, { t: "2026-03-06T03:28:16.346Z", v: 24 }, { t: "2026-03-06T04:29:09.638Z", v: 21 }, { t: "2026-03-06T05:30:03.066Z", v: 19 }, { t: "2026-03-06T06:30:56.288Z", v: 18 }, { t: "2026-03-06T07:31:49.421Z", v: 19 }, { t: "2026-03-06T08:32:42.632Z", v: 22 }, { t: "2026-03-06T09:33:36.141Z", v: 23 }, { t: "2026-03-06T10:34:29.743Z", v: 11 }, { t: "2026-03-06T11:35:23.575Z", v: 15 }, { t: "2026-03-06T12:36:16.907Z", v: 12 }, { t: "2026-03-06T13:37:10.202Z", v: 14 }, { t: "2026-03-06T14:38:03.249Z", v: 11 }, { t: "2026-03-06T15:38:56.629Z", v: 12 }, { t: "2026-03-06T16:39:50.177Z", v: 31 }, { t: "2026-03-06T17:40:43.803Z", v: 10 }, { t: "2026-03-06T18:41:37.213Z", v: 15 }, { t: "2026-03-06T19:42:30.397Z", v: 12 }, { t: "2026-03-06T20:43:23.708Z", v: 16 }, { t: "2026-03-06T21:44:17.185Z", v: 19 }, { t: "2026-03-06T22:45:10.719Z", v: 12 }, { t: "2026-03-06T23:46:04.032Z", v: 6 }, { t: "2026-03-07T00:46:57.393Z", v: 14 }, { t: "2026-03-07T01:47:50.882Z", v: 9 }, { t: "2026-03-07T02:48:44.683Z", v: 10 }, { t: "2026-03-07T03:49:38.525Z", v: 12 }, { t: "2026-03-07T04:50:32.000Z", v: 10 }, { t: "2026-03-07T05:51:25.616Z", v: 9 }, { t: "2026-03-07T06:52:19.378Z", v: 857 }, { t: "2026-03-07T07:53:13.122Z", v: 840 }, { t: "2026-03-07T08:54:06.702Z", v: 796 }, { t: "2026-03-07T09:55:00.581Z", v: 763 }, { t: "2026-03-07T10:55:54.198Z", v: 737 }, { t: "2026-03-07T11:56:48.046Z", v: 733 }, { t: "2026-03-07T12:57:41.830Z", v: 733 }, { t: "2026-03-07T13:58:35.441Z", v: 734 }, { t: "2026-03-07T14:59:29.026Z", v: 740 }, { t: "2026-03-07T16:00:22.459Z", v: 740 }, { t: "2026-03-07T17:01:16.224Z", v: 747 }, { t: "2026-03-07T18:02:09.622Z", v: 745 }, { t: "2026-03-07T19:03:03.092Z", v: 746 }, { t: "2026-03-07T20:03:56.831Z", v: 752 }, { t: "2026-03-07T21:04:50.884Z", v: 745 }, { t: "2026-03-07T22:05:44.770Z", v: 755 }, { t: "2026-03-07T23:06:38.319Z", v: 763 }, { t: "2026-03-08T00:07:32.155Z", v: 760 }, { t: "2026-03-08T01:08:25.423Z", v: 761 }, { t: "2026-03-08T02:09:18.450Z", v: 772 }, { t: "2026-03-08T03:10:11.521Z", v: 767 }, { t: "2026-03-08T04:11:04.730Z", v: 770 }, { t: "2026-03-08T05:11:58.017Z", v: 775 }, { t: "2026-03-08T06:12:51.387Z", v: 770 }, { t: "2026-03-08T07:13:44.918Z", v: 767 }, { t: "2026-03-08T08:14:38.568Z", v: 763 }, { t: "2026-03-08T09:15:31.932Z", v: 777 }, { t: "2026-03-08T10:16:25.319Z", v: 762 }, { t: "2026-03-08T11:17:18.911Z", v: 775 }, { t: "2026-03-08T12:18:12.617Z", v: 771 }, { t: "2026-03-08T13:19:06.275Z", v: 777 }, { t: "2026-03-08T14:19:59.729Z", v: 766 }, { t: "2026-03-08T15:20:53.123Z", v: 781 }, { t: "2026-03-08T16:21:46.927Z", v: 790 }, { t: "2026-03-08T17:22:40.509Z", v: 796 }, { t: "2026-03-08T18:23:34.247Z", v: 796 }, { t: "2026-03-08T19:24:28.164Z", v: 793 }, { t: "2026-03-08T20:25:21.618Z", v: 793 }, { t: "2026-03-08T21:26:14.653Z", v: 795 }, { t: "2026-03-08T22:27:08.166Z", v: 797 }, { t: "2026-03-08T23:28:01.657Z", v: 800 }, { t: "2026-03-09T00:28:54.996Z", v: 803 }, { t: "2026-03-09T01:29:48.305Z", v: 806 }, { t: "2026-03-09T02:30:41.630Z", v: 801 }, { t: "2026-03-09T03:31:34.850Z", v: 808 }, { t: "2026-03-09T04:32:28.227Z", v: 800 }, { t: "2026-03-09T05:33:21.426Z", v: 806 }, { t: "2026-03-09T06:34:14.679Z", v: 805 }, { t: "2026-03-09T07:35:07.647Z", v: 816 }, { t: "2026-03-09T08:36:00.811Z", v: 806 }, { t: "2026-03-09T09:36:53.918Z", v: 818 }, { t: "2026-03-09T10:37:46.994Z", v: 816 }, { t: "2026-03-09T11:38:40.118Z", v: 812 }, { t: "2026-03-09T12:39:33.350Z", v: 817 }, { t: "2026-03-09T13:40:26.707Z", v: 819 }, { t: "2026-03-09T14:41:19.955Z", v: 817 }, { t: "2026-03-09T15:42:13.143Z", v: 819 }, { t: "2026-03-09T16:43:06.385Z", v: 819 }, { t: "2026-03-09T17:43:59.647Z", v: 809 }, { t: "2026-03-09T18:44:53.223Z", v: 810 }, { t: "2026-03-09T19:45:46.454Z", v: 814 }, { t: "2026-03-09T20:46:39.474Z", v: 816 }, { t: "2026-03-09T21:47:32.360Z", v: 814 }];

  const data = RAW.map(d => ({ t: new Date(d.t), v: d.v }));

  const wateringIdx = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].v - data[i - 1].v > 200) wateringIdx.push(i);
  }

  function draw() {
    const svg = document.getElementById('moisture-chart');
    if (!svg) return;

    const PAD = { top: 16, right: 0, bottom: 36, left: 48 };
    const H = 280;
    const innerH = H - PAD.top - PAD.bottom;

    // measure the text label width to align left edge
    const W = svg.parentElement.clientWidth;
    const innerW = W - PAD.left - PAD.right;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('height', H);
    svg.innerHTML = '';

    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${PAD.left},${PAD.top})`);
    svg.appendChild(g);

    const tMin = data[0].t.getTime();
    const tMax = data[data.length - 1].t.getTime();
    const vMax = 1023;

    const xScale = t => (t.getTime() - tMin) / (tMax - tMin) * innerW;
    const yScale = v => innerH - (v / vMax) * innerH;

    // grid + y labels
    [0, 200, 400, 600, 800, 1023].forEach(tick => {
      const y = yScale(tick);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', 0); line.setAttribute('x2', innerW);
      line.setAttribute('y1', y); line.setAttribute('y2', y);
      line.setAttribute('stroke', '#e0e0e0');
      line.setAttribute('stroke-width', 1);
      g.appendChild(line);

      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', -6);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'rgb(214,214,214)');
      label.setAttribute('font-size', '11');
      label.setAttribute('font-family', 'Helvetica, Microsoft YaHei, sans-serif');
      label.textContent = tick;
      g.appendChild(label);
    });

    // x axis date labels
    const days = [...new Set(data.map(d => d.t.toISOString().slice(0, 10)))];
    days.forEach(day => {
      const dayStart = new Date(day + 'T00:00:00Z');
      const x = xScale(dayStart);
      if (x < 0 || x > innerW) return;
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', innerH + 26);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'rgb(214,214,214)');
      label.setAttribute('font-size', '11');
      label.setAttribute('font-family', 'Helvetica, Microsoft YaHei, sans-serif');
      label.textContent = `Mar ${dayStart.getUTCDate()}`;
      g.appendChild(label);
    });

    // area fill
    const defs = document.createElementNS(ns, 'defs');
    const grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', 'moistureAreaGrad');
    grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
    const s1 = document.createElementNS(ns, 'stop');
    s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#96b351'); s1.setAttribute('stop-opacity', '0.18');
    const s2 = document.createElementNS(ns, 'stop');
    s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#96b351'); s2.setAttribute('stop-opacity', '0');
    grad.appendChild(s1); grad.appendChild(s2);
    defs.appendChild(grad);
    svg.insertBefore(defs, g);

    const areaPath = `M0,${innerH} ` +
      data.map(d => `L${xScale(d.t)},${yScale(d.v)}`).join(' ') +
      ` L${xScale(data[data.length - 1].t)},${innerH} Z`;

    const area = document.createElementNS(ns, 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('fill', 'url(#moistureAreaGrad)');
    g.appendChild(area);

    // watering vertical lines (behind main line)
    wateringIdx.forEach(i => {
      const x = xScale(data[i].t);
      const vline = document.createElementNS(ns, 'line');
      vline.setAttribute('x1', x); vline.setAttribute('x2', x);
      vline.setAttribute('y1', 0); vline.setAttribute('y2', innerH);
      vline.setAttribute('stroke', '#1f1f1f');
      vline.setAttribute('stroke-width', 0.5);
      vline.setAttribute('stroke-dasharray', '3 3');
      vline.setAttribute('opacity', 0.3);
      g.appendChild(vline);
    });

    // main line
    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.t)},${yScale(d.v)}`).join(' ');
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('d', linePath);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#96b351');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-linejoin', 'round');
    g.appendChild(line);

    // watering dots
    wateringIdx.forEach(i => {
      const x = xScale(data[i].t);
      const circ = document.createElementNS(ns, 'circle');
      circ.setAttribute('cx', x);
      circ.setAttribute('cy', yScale(data[i].v));
      circ.setAttribute('r', 4);
      circ.setAttribute('fill', '#1f1f1f');
      circ.setAttribute('stroke', '#f4f4f4');
      circ.setAttribute('stroke-width', 1.5);
      g.appendChild(circ);
    });

    // hover overlay
    const overlay = document.createElementNS(ns, 'rect');
    overlay.setAttribute('x', 0); overlay.setAttribute('y', 0);
    overlay.setAttribute('width', innerW); overlay.setAttribute('height', innerH);
    overlay.setAttribute('fill', 'transparent');
    overlay.style.cursor = 'crosshair';
    g.appendChild(overlay);

    const hoverLine = document.createElementNS(ns, 'line');
    hoverLine.setAttribute('y1', 0); hoverLine.setAttribute('y2', innerH);
    hoverLine.setAttribute('stroke', '#1f1f1f'); hoverLine.setAttribute('stroke-width', 0.5);
    hoverLine.setAttribute('opacity', 0);
    g.appendChild(hoverLine);

    const hoverDot = document.createElementNS(ns, 'circle');
    hoverDot.setAttribute('r', 3);
    hoverDot.setAttribute('fill', '#96b351');
    hoverDot.setAttribute('stroke', '#1f1f1f');
    hoverDot.setAttribute('stroke-width', 1.5);
    hoverDot.setAttribute('opacity', 0);
    g.appendChild(hoverDot);

    const tooltip = document.getElementById('moisture-tooltip');

    overlay.addEventListener('mousemove', e => {
      const rect = overlay.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const ratio = mx / innerW;
      const targetT = tMin + ratio * (tMax - tMin);
      let closest = 0, minDist = Infinity;
      data.forEach((d, i) => {
        const dist = Math.abs(d.t.getTime() - targetT);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      const d = data[closest];
      const x = xScale(d.t);
      const y = yScale(d.v);

      hoverLine.setAttribute('x1', x); hoverLine.setAttribute('x2', x);
      hoverLine.setAttribute('opacity', 1);
      hoverDot.setAttribute('cx', x); hoverDot.setAttribute('cy', y);
      hoverDot.setAttribute('opacity', 1);

      document.getElementById('mtt-time').textContent =
        d.t.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
      document.getElementById('mtt-val').textContent = d.v;
      document.getElementById('mtt-label').textContent =
        wateringIdx.includes(closest) ? 'watering recorded' : 'moisture';
      tooltip.style.opacity = 1;
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY - 20) + 'px';
    });

    overlay.addEventListener('mouseleave', () => {
      hoverLine.setAttribute('opacity', 0);
      hoverDot.setAttribute('opacity', 0);
      tooltip.style.opacity = 0;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', draw);
  } else {
    draw();
  }
  window.addEventListener('resize', draw);
})();
