/**
 * Celestial Canvas Engine
 * Page 1: Vincent van Gogh Starry Night impasto waves, glowing stars, and cypress silhouette
 * Page 2+: The breathtaking "Good Night Sky" with crescent moon, crater details, atmospheric halo,
 *          multi-spectral stars, constellation lines, drifting cosmic nebulas, and shooting stars.
 */

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  driftSpeedY: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  fadeSpeed: number;
  width: number;
  active: boolean;
}

interface CosmicCloud {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
}

export class CelestialCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private currentView: string = 'landing';
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  private time: number = 0;

  // Good Night Sky Elements
  private stars: Star[] = [];
  private meteors: Meteor[] = [];
  private lastMeteorTime: number = 0;
  private clouds: CosmicCloud[] = [];

  private constellationStars = [
    { xRatio: 0.18, yRatio: 0.22 },
    { xRatio: 0.16, yRatio: 0.29 },
    { xRatio: 0.22, yRatio: 0.31 },
    { xRatio: 0.25, yRatio: 0.24 },
    { xRatio: 0.29, yRatio: 0.22 },
    { xRatio: 0.33, yRatio: 0.19 },
    { xRatio: 0.37, yRatio: 0.16 },
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = ctx;

    this.init();
  }

  public setView(view: string) {
    this.currentView = view;
  }

  private init() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    window.addEventListener('resize', this.handleResize);

    // Initialize Stars
    const starColors = ['#ffffff', '#e0e7ff', '#c7d2fe', '#fef08a', '#fed7aa', '#bfdbfe'];
    const starCount = Math.min(Math.floor((this.width * this.height) / 7000), 220);
    this.stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() < 0.85 ? Math.random() * 0.9 + 0.4 : Math.random() * 1.5 + 1.1,
      baseAlpha: Math.random() * 0.6 + 0.35,
      twinkleSpeed: Math.random() * 0.03 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      driftSpeedY: Math.random() * 0.04 + 0.01,
    }));

    // Initialize Clouds
    this.clouds = [
      { x: this.width * 0.2, y: this.height * 0.25, radius: this.width * 0.35, color: 'rgba(49, 46, 129, 0.04)', speedX: 0.02, speedY: 0.01 },
      { x: this.width * 0.75, y: this.height * 0.45, radius: this.width * 0.4, color: 'rgba(30, 58, 138, 0.05)', speedX: -0.015, speedY: 0.015 },
      { x: this.width * 0.5, y: this.height * 0.7, radius: this.width * 0.45, color: 'rgba(88, 28, 135, 0.03)', speedX: 0.01, speedY: -0.02 },
    ];

    this.render();
  }

  private handleResize = () => {
    this.resize();
  };

  private resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  private spawnMeteor() {
    this.meteors.push({
      x: Math.random() * this.width * 0.8 + this.width * 0.1,
      y: Math.random() * this.height * 0.35,
      length: Math.random() * 110 + 70,
      speed: Math.random() * 10 + 8,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
      alpha: 1.0,
      fadeSpeed: Math.random() * 0.018 + 0.012,
      width: Math.random() * 1.5 + 1.0,
      active: true,
    });
  }

  private render = () => {
    this.time += 0.015;
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    ctx.clearRect(0, 0, width, height);

    if (this.currentView === 'landing') {
      // PAGE 1: VAN GOGH STARRY NIGHT AMBIENT SKY
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#04091a');
      bgGrad.addColorStop(0.35, '#0a1738');
      bgGrad.addColorStop(0.7, '#071026');
      bgGrad.addColorStop(1, '#03050d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Swirling impasto ribbons
      ctx.save();
      ctx.lineCap = 'round';
      for (let wave = 0; wave < 6; wave++) {
        ctx.beginPath();
        const baseY = height * 0.26 + wave * 42;
        ctx.lineWidth = 12 + wave * 2;

        for (let x = -80; x < width + 80; x += 16) {
          const y =
            baseY +
            Math.sin(x * 0.0042 + this.time * 0.8 + wave * 0.5) * 45 +
            Math.cos(x * 0.0018 - this.time * 0.4) * 25 +
            Math.sin(x * 0.008 + wave) * 12;

          if (x === -80) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const waveColor =
          wave % 2 === 0
            ? `rgba(37, 99, 235, ${0.12 + wave * 0.018})`
            : `rgba(99, 102, 241, ${0.09 + wave * 0.02})`;
        ctx.strokeStyle = waveColor;
        ctx.stroke();
      }
      ctx.restore();

      // Van Gogh Golden Swirling Stars
      const vanGoghStars = [
        { x: width * 0.32, y: height * 0.36, r: 24, coreColor: '#fffbeb', glowColor: 'rgba(253, 224, 71, 0.35)', rings: 4 },
        { x: width * 0.84, y: height * 0.18, r: 52, coreColor: '#fef08a', glowColor: 'rgba(251, 191, 36, 0.38)', rings: 5, isMoon: true },
        { x: width * 0.15, y: height * 0.22, r: 19, coreColor: '#fde047', glowColor: 'rgba(245, 158, 11, 0.3)', rings: 3 },
        { x: width * 0.48, y: height * 0.15, r: 22, coreColor: '#fef9c3', glowColor: 'rgba(253, 224, 71, 0.28)', rings: 3 },
        { x: width * 0.68, y: height * 0.42, r: 18, coreColor: '#fde047', glowColor: 'rgba(245, 158, 11, 0.26)', rings: 3 },
        { x: width * 0.58, y: height * 0.28, r: 16, coreColor: '#fed7aa', glowColor: 'rgba(251, 191, 36, 0.25)', rings: 3 },
        { x: width * 0.08, y: height * 0.48, r: 15, coreColor: '#fef08a', glowColor: 'rgba(253, 224, 71, 0.25)', rings: 2 },
      ];

      vanGoghStars.forEach((s) => {
        ctx.save();
        const halo = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, s.r * 2.8);
        halo.addColorStop(0, s.glowColor);
        halo.addColorStop(0.4, s.glowColor.replace('0.3', '0.12'));
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2.4;
        for (let ring = 1; ring <= s.rings; ring++) {
          ctx.beginPath();
          const ringRadius = s.r * (0.45 + ring * 0.38);
          const rotation = this.time * (ring % 2 === 0 ? 0.7 : -0.7) + ring;
          ctx.strokeStyle = `rgba(254, 240, 138, ${0.45 - ring * 0.08})`;
          ctx.arc(s.x, s.y, ringRadius, rotation, rotation + Math.PI * 1.6);
          ctx.stroke();
        }

        if (s.isMoon) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 0.75, 0.2 * Math.PI, 1.8 * Math.PI);
          ctx.bezierCurveTo(s.x + s.r * 0.2, s.y - s.r * 0.4, s.x + s.r * 0.2, s.y + s.r * 0.4, s.x + s.r * 0.5, s.y + s.r * 0.7);
          ctx.fill();
        } else {
          ctx.fillStyle = s.coreColor;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Cypress Silhouette
      ctx.save();
      ctx.fillStyle = '#010309';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.85);
      ctx.quadraticCurveTo(width * 0.04, height * 0.55, width * 0.03, height * 0.24);
      ctx.quadraticCurveTo(width * 0.07, height * 0.38, width * 0.06, height * 0.52);
      ctx.quadraticCurveTo(width * 0.11, height * 0.42, width * 0.09, height * 0.68);
      ctx.quadraticCurveTo(width * 0.15, height * 0.82, width * 0.17, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

    } else {
      // PAGE 2+: GOOD NIGHT SKY
      const nightGrad = ctx.createLinearGradient(0, 0, 0, height);
      nightGrad.addColorStop(0, '#01040e');
      nightGrad.addColorStop(0.3, '#04081c');
      nightGrad.addColorStop(0.7, '#070f2b');
      nightGrad.addColorStop(1, '#020511');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(0, 0, width, height);

      // Cosmic Clouds
      this.clouds.forEach((cloud) => {
        cloud.x += cloud.speedX;
        cloud.y += cloud.speedY;
        if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius;
        if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius;

        const cloudGrad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
        cloudGrad.addColorStop(0, cloud.color);
        cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Glowing Crescent Moon in Upper Right
      const moonX = width * 0.86;
      const moonY = height * 0.14;
      const moonRadius = Math.min(width * 0.038, 38);

      // Atmospheric Halo
      const lunarHalo = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 4.5);
      lunarHalo.addColorStop(0, 'rgba(219, 234, 254, 0.18)');
      lunarHalo.addColorStop(0.35, 'rgba(165, 180, 252, 0.08)');
      lunarHalo.addColorStop(0.7, 'rgba(99, 102, 241, 0.02)');
      lunarHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lunarHalo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Earthshine
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Crescent Moon Disc
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, -0.45 * Math.PI, 0.65 * Math.PI, false);
      ctx.bezierCurveTo(
        moonX + moonRadius * 0.35,
        moonY + moonRadius * 0.65,
        moonX + moonRadius * 0.35,
        moonY - moonRadius * 0.45,
        moonX + moonRadius * 0.1,
        moonY - moonRadius
      );
      ctx.closePath();
      ctx.fill();

      // Surface texture crater
      ctx.fillStyle = 'rgba(203, 213, 225, 0.3)';
      ctx.beginPath();
      ctx.arc(moonX - moonRadius * 0.25, moonY + moonRadius * 0.1, moonRadius * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Constellation Lines
      ctx.save();
      ctx.strokeStyle = 'rgba(199, 210, 254, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const cPoints = this.constellationStars.map((pt) => ({ x: pt.xRatio * width, y: pt.yRatio * height }));
      cPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      cPoints.forEach((pt) => {
        ctx.fillStyle = 'rgba(224, 231, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(165, 180, 252, 0.25)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Twinkling Starfield
      this.stars.forEach((star) => {
        star.y -= star.driftSpeedY;
        if (star.y < -5) {
          star.y = height + 5;
          star.x = Math.random() * width;
        }

        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.35 + 0.65;
        const currentAlpha = Math.max(0.1, Math.min(1.0, star.baseAlpha * twinkle));

        ctx.save();
        if (star.radius > 1.2) {
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha * 0.3;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();

          if (star.radius > 1.6 && twinkle > 0.85) {
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.6;
            ctx.globalAlpha = currentAlpha * 0.45;
            const spikeLen = star.radius * 3.5;
            ctx.beginPath();
            ctx.moveTo(star.x - spikeLen, star.y);
            ctx.lineTo(star.x + spikeLen, star.y);
            ctx.moveTo(star.x, star.y - spikeLen);
            ctx.lineTo(star.x, star.y + spikeLen);
            ctx.stroke();
          }
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Shooting Stars (Meteors)
      if (Date.now() - this.lastMeteorTime > 8000 + Math.random() * 4000) {
        this.spawnMeteor();
        this.lastMeteorTime = Date.now();
      }

      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        if (!m.active) {
          this.meteors.splice(i, 1);
          continue;
        }

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= m.fadeSpeed;

        if (m.alpha <= 0 || m.x > width + 100 || m.y > height + 100) {
          m.active = false;
          continue;
        }

        ctx.save();
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        meteorGrad.addColorStop(0.6, `rgba(199, 210, 254, ${m.alpha * 0.4})`);
        meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha * 0.95})`);

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = m.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  public destroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
