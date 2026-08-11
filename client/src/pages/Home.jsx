import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Heart, ShieldAlert, Award, ArrowRight, Clock } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';
import heroBg from '../assets/hero_bg.jpg';

const Home = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const rafRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = [
      'rgba(251,191,36,',  // amber
      'rgba(253,230,138,', // light amber
      'rgba(245,158,11,',  // saffron
      'rgba(255,255,200,', // warm white
    ];

    const spawnParticle = () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 40,
      radius: 1 + Math.random() * 2.5,
      speed: 0.4 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: 0,
      maxOpacity: 0.3 + Math.random() * 0.5,
      fadeIn: true,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: 120 + Math.random() * 160,
    });

    // Pre-populate
    particlesRef.current = Array.from({ length: 60 }, () => {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      p.opacity = p.maxOpacity * (p.life / p.maxLife);
      return p;
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        p.life++;
        p.y -= p.speed;
        p.x += Math.sin(p.life * 0.03) * p.drift;

        if (p.life < p.maxLife * 0.3) {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.02);
        } else {
          p.opacity = Math.max(0, p.opacity - 0.008);
        }

        if (p.life >= p.maxLife || p.y < -10) {
          particlesRef.current[i] = spawnParticle();
          return;
        }

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `${p.color}${p.opacity})`);
        gradient.addColorStop(1, `${p.color}0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTilt({ x: dx * 18, y: dy * 12 });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setTilt({ x: 0, y: 0 }));
  }, []);

  useEffect(() => {
    const handleOrientation = (e) => {
      // gamma = left-right tilt (-90 to 90), beta = front-back (-180 to 180)
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      const y = Math.max(-1, Math.min(1, ((e.beta || 0) - 30) / 30));
      setTilt({ x: x * 18, y: y * 12 });
    };
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [contentRes, noticeRes] = await Promise.all([
          api.get('/admin/content'),
          api.get('/announcements')
        ]);
        setContent(contentRes.data.data);
        setNotices(noticeRes.data.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 font-spiritual pb-16">
      {/* 1. Hero Banner Slider / Section */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-slate-900 text-white min-h-[500px] flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-[-6%] opacity-45 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBg})`,
            transform: `translate(${tilt.x * 0.5}px, ${tilt.y * 0.4}px) scale(1.06)`,
            transition: 'transform 0.12s ease-out',
            willChange: 'transform',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-950 via-maroon-900/60 to-transparent" />
        {/* Floating golden embers */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left space-y-6">
          <span className="bg-saffron-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            {t('home.bannerText')}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
            {t('home.welcome')}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/donate"
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <Heart className="h-5 w-5 fill-white" />
              <span>{t('home.donateOnline')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Intro and Timings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-maroon-900 dark:text-amber-500">
            {t('home.aboutTitle')}
          </h2>
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
            {content?.history || t('home.aboutFallback')}
          </p>
          <Link
            to="/about"
            className="text-saffron-600 hover:text-saffron-700 font-bold inline-flex items-center gap-2"
          >
            <span>{t('home.readFullHistory')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Timings */}
        <div className="bg-amber-50/60 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 text-maroon-900 dark:text-amber-400">
            <Clock className="h-6 w-6" />
            <h3 className="text-xl font-bold">{t('home.timings')}</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="divide-y divide-amber-200/50 dark:divide-slate-800">
              {content?.timings?.map((time, index) => (
                <div key={index} className="flex justify-between py-3 text-sm">
                  <span className="font-semibold text-gray-700 dark:text-slate-300">{time.activity}</span>
                  <span className="text-saffron-700 dark:text-amber-400 font-bold">{time.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Notices board */}
      <section className="bg-amber-50/40 dark:bg-slate-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-maroon-900 dark:text-amber-500">{t('home.noticeBoardTitle')}</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">{t('home.noticeBoardSub')}</p>
            </div>
            <Link to="/announcements" className="text-saffron-600 font-bold flex items-center gap-1 hover:underline">
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)
            ) : notices.length === 0 ? (
              <p className="text-slate-500 col-span-3 text-center">{t('home.noActiveNotices')}</p>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice._id}
                  className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow hover-lift relative"
                >
                  {notice.isPinned && (
                    <span className="absolute top-4 right-4 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {t('home.pinned')}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${notice.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {notice.category}
                  </span>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-white mt-3 mb-2">{notice.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-3">{notice.content}</p>
                  <div className="mt-4 text-[10px] text-gray-400">
                    {t('home.published')} {new Date(notice.publishDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Statistics CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-100 dark:border-slate-800/60 shadow">
          <Heart className="h-10 w-10 text-saffron-600 mx-auto mb-4" />
          <h3 className="text-3xl font-extrabold text-maroon-900 dark:text-white">{t('home.stat1Value')}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{t('home.stat1Text')}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-100 dark:border-slate-800/60 shadow">
          <ShieldAlert className="h-10 w-10 text-saffron-600 mx-auto mb-4" />
          <h3 className="text-3xl font-extrabold text-maroon-900 dark:text-white">{t('home.stat2Value')}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{t('home.stat2Text')}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-100 dark:border-slate-800/60 shadow">
          <Award className="h-10 w-10 text-saffron-600 mx-auto mb-4" />
          <h3 className="text-3xl font-extrabold text-maroon-900 dark:text-white">{t('home.stat3Value')}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{t('home.stat3Text')}</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
export { Home };
