// Draws the wrap-around tub label on a 2D canvas. Used as the 3D tub's texture.
// The front of the tub is the horizontal centre of the canvas.
export const LABEL_W = 2048;
export const LABEL_H = 768;

function chrome(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.42, '#aeb5be');
  g.addColorStop(0.5, '#4a5059');
  g.addColorStop(0.62, '#d9dee4');
  g.addColorStop(1, '#7f8792');
  return g;
}

function fitFont(ctx, text, weight, size, maxW) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px "Barlow Condensed", sans-serif`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 4;
  } while (s > 20);
  return s;
}

export function drawLabel(canvas, product, size, images) {
  const ctx = canvas.getContext('2d');
  const W = LABEL_W, H = LABEL_H, cx = W / 2;
  canvas.width = W; canvas.height = H;

  // body
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#121418');
  bg.addColorStop(1, '#040506');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // brushed texture (seeded so redraws match)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.012 + rnd() * 0.025})`;
    ctx.fillRect(rnd() * W, rnd() * H, 80 + rnd() * 400, 1);
  }

  // accent slash behind the name (echoes the spike of the N)
  ctx.save();
  const slash = ctx.createLinearGradient(cx - 300, H, cx + 300, 0);
  slash.addColorStop(0, product.accent + '00');
  slash.addColorStop(0.5, product.accent + 'cc');
  slash.addColorStop(1, product.accent + '00');
  ctx.fillStyle = slash;
  ctx.beginPath();
  ctx.moveTo(cx - 470, H); ctx.lineTo(cx - 330, H);
  ctx.lineTo(cx + 470, 0); ctx.lineTo(cx + 330, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = product.accent + '55';
  ctx.beginPath();
  ctx.moveTo(cx - 300, H); ctx.lineTo(cx - 285, H);
  ctx.lineTo(cx + 515, 0); ctx.lineTo(cx + 500, 0);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // chrome bands top and bottom
  ctx.fillStyle = chrome(ctx, 0, 24); ctx.fillRect(0, 0, W, 24);
  ctx.fillStyle = chrome(ctx, H - 24, H); ctx.fillRect(0, H - 24, W, 24);
  ctx.fillStyle = product.accent; ctx.fillRect(0, 24, W, 4); ctx.fillRect(0, H - 28, W, 4);

  // logo
  if (images.mark) {
    const mh = 150, mw = mh * images.mark.width / images.mark.height;
    ctx.drawImage(images.mark, cx - mw / 2, 52, mw, mh);
  }
  if (images.word) {
    const ww = 360, wh = ww * images.word.height / images.word.width;
    ctx.drawImage(images.word, cx - ww / 2, 216, ww, wh);
  }

  // product name
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  fitFont(ctx, product.lines[0], '800 italic', 210, 760);
  ctx.fillStyle = chrome(ctx, 300, 470);
  ctx.fillText(product.lines[0], cx, 468);
  fitFont(ctx, product.lines[1], '700 italic', 96, 560);
  ctx.fillStyle = product.accent;
  ctx.fillText(product.lines[1], cx, 556);

  // flavour pill
  ctx.font = '600 32px "Barlow Condensed", sans-serif';
  const fl = product.flavour.toUpperCase();
  const fw = ctx.measureText(fl).width + 48;
  ctx.strokeStyle = product.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(cx - fw / 2, 584, fw, 48, 24); ctx.stroke();
  ctx.fillStyle = '#f3f5f7';
  ctx.fillText(fl, cx, 619);

  // net weight + headline fact
  ctx.font = '600 28px "Barlow Condensed", sans-serif';
  ctx.fillStyle = '#9aa1ab';
  ctx.textAlign = 'right';
  ctx.fillText(`NET WT ${size.label.toUpperCase()} (${size.lb.toUpperCase()})`, cx - 40, 700);
  ctx.textAlign = 'left';
  ctx.fillText(`${product.spin[0][0]}${product.spin[0][1].toUpperCase()} ${product.spin[0][2].toUpperCase()}`, cx + 40, 700);
  ctx.fillStyle = product.accent;
  ctx.fillRect(cx - 2, 678, 4, 28);

  // back panels
  const panel = (x, rows, title) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d9dee4';
    ctx.font = '700 34px "Barlow Condensed", sans-serif';
    ctx.fillText(title, x, 150);
    ctx.fillStyle = '#4a5059'; ctx.fillRect(x, 168, 330, 3);
    ctx.font = '500 26px "Barlow Condensed", sans-serif';
    rows.forEach(([a, b], i) => {
      const y = 214 + i * 46;
      ctx.fillStyle = '#9aa1ab'; ctx.textAlign = 'left'; ctx.fillText(a, x, y);
      ctx.fillStyle = '#f3f5f7'; ctx.textAlign = 'right'; ctx.fillText(b, x + 330, y);
      ctx.fillStyle = '#23272d'; ctx.fillRect(x, y + 14, 330, 1);
    });
  };
  panel(190, [['Serving size', product.serving], ...product.facts.slice(0, 6)], 'SUPPLEMENT FACTS');
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9aa1ab';
  ctx.font = '500 26px "Barlow Condensed", sans-serif';
  const notes = [
    'DIRECTIONS',
    'Mix one serving with water or milk',
    'in a shaker. Take after training.',
    '',
    'Store in a cool, dry place.',
    'Food supplement. Not a substitute',
    'for a varied diet.',
  ];
  notes.forEach((t, i) => {
    ctx.fillStyle = i === 0 ? '#d9dee4' : '#9aa1ab';
    ctx.font = i === 0 ? '700 34px "Barlow Condensed", sans-serif' : '500 26px "Barlow Condensed", sans-serif';
    ctx.fillText(t, 1530, 150 + (i === 0 ? 0 : 30 + i * 40));
  });
  ctx.fillStyle = product.accent;
  ctx.font = '700 30px "Barlow Condensed", sans-serif';
  ctx.fillText('NOVANUTRITIONLABS.COM', 1530, 640);
}
