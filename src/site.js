/* tat.it.too — shared behaviour: smooth scroll, menu, anchors bar, scroll effects */
(function () {
	'use strict';

	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var desktop = window.matchMedia('(min-width: 992px)');

	/* Smooth scroll (same feel as the reference) */
	var lenis = null;
	if (!reduce && typeof window.Lenis === 'function') {
		lenis = new window.Lenis({
			duration: 1.12,
			easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
			smoothWheel: true,
			syncTouch: false
		});
		var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
		requestAnimationFrame(raf);
	}

	function scrollTo(target) {
		if (lenis) { lenis.scrollTo(target); return; }
		if (typeof target === 'number') {
			window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
		} else {
			target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
		}
	}

	/* Studio clock (Chicago) */
	var clocks = document.querySelectorAll('[data-clock]');
	if (clocks.length) {
		var fmt = null;
		try {
			fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago' });
		} catch (e) { fmt = null; }
		var tick = function () {
			if (!fmt) { return; }
			var t = fmt.format(new Date()).toUpperCase() + ', CT';
			clocks.forEach(function (el) { el.textContent = t; });
		};
		tick();
		setInterval(tick, 15000);
	}

	/* Current page marker */
	var path = window.location.pathname.split('/').pop() || 'index.html';
	document.querySelectorAll('[data-page]').forEach(function (el) {
		if (el.getAttribute('data-page') === path) {
			el.classList.add('is-current');
			el.setAttribute('aria-current', 'page');
		}
	});

	/* Mobile menu */
	var toggle = document.querySelector('.menu-toggle');
	var menu = document.getElementById('mobile-menu');
	if (toggle && menu) {
		var setOpen = function (open) {
			menu.classList.toggle('is-open', open);
			menu.setAttribute('aria-hidden', String(!open));
			toggle.setAttribute('aria-expanded', String(open));
			document.body.classList.toggle('menu-open', open);
			if (lenis) { if (open) { lenis.stop(); } else { lenis.start(); } }
			if (open) {
				var first = menu.querySelector('a');
				if (first) { first.focus(); }
			} else {
				toggle.focus();
			}
		};
		toggle.addEventListener('click', function () {
			setOpen(!menu.classList.contains('is-open'));
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); }
		});
		menu.querySelectorAll('a').forEach(function (a) {
			a.addEventListener('click', function () {
				if (menu.classList.contains('is-open')) { setOpen(false); }
			});
		});
	}

	/* In-page anchors (bar, back to top) */
	document.querySelectorAll('a[href^="#"]').forEach(function (a) {
		a.addEventListener('click', function (e) {
			var id = a.getAttribute('href').slice(1);
			if (id === '' || id === 'top') { e.preventDefault(); scrollTo(0); return; }
			var t = document.getElementById(id);
			if (t) { e.preventDefault(); scrollTo(t); }
		});
	});

	/* Fixed anchors bar: mark the section in the middle band of the viewport */
	var bar = document.querySelector('.anchors-bar');
	if (bar) {
		document.body.classList.add('has-bar');
		if ('IntersectionObserver' in window) {
			var links = Array.prototype.slice.call(bar.querySelectorAll('.anchor-link'));
			var visible = {};
			var io = new IntersectionObserver(function (entries) {
				entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
				links.forEach(function (l) {
					l.classList.toggle('is-current', !!visible[l.getAttribute('href').slice(1)]);
				});
			}, { rootMargin: '-45% 0px -45% 0px' });
			links.forEach(function (l) {
				var s = document.getElementById(l.getAttribute('href').slice(1));
				if (s) { io.observe(s); }
			});
		}
	}

	/* Latest works: click a preview to swap the stage photo */
	document.querySelectorAll('.works-wrap').forEach(function (wrap) {
		var photos = wrap.querySelectorAll('.works-photo');
		var previews = wrap.querySelectorAll('.works-preview');
		previews.forEach(function (p) {
			p.addEventListener('click', function () {
				var id = p.getAttribute('data-id');
				photos.forEach(function (ph) { ph.classList.toggle('is-active', ph.getAttribute('data-id') === id); });
				previews.forEach(function (pv) {
					var on = pv.getAttribute('data-id') === id;
					pv.classList.toggle('is-active', on);
					pv.setAttribute('aria-pressed', String(on));
				});
			});
		});
	});

	/* Scroll-driven effects: full-bleed parallax and the pinned gallery rail */
	var fullsize = document.querySelector('.fullsize img');
	var track = document.querySelector('.gallery-track');
	var rail = document.querySelector('.gallery-rail');
	var col = document.querySelector('.gallery-col');
	var ticking = false;

	function update() {
		ticking = false;
		var vh = window.innerHeight;
		if (fullsize && !reduce) {
			var r = fullsize.parentElement.getBoundingClientRect();
			var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
			p = Math.max(-1, Math.min(1, p));
			fullsize.style.transform = 'scale(1.12) translate3d(0,' + (p * 5).toFixed(2) + '%,0)';
		}
		if (track && rail && col) {
			if (desktop.matches) {
				var tr = track.getBoundingClientRect();
				var dist = tr.height - vh;
				var prog = dist > 0 ? Math.max(0, Math.min(1, -tr.top / dist)) : 0;
				var move = Math.max(0, col.scrollHeight - rail.clientHeight);
				col.style.transform = 'translate3d(0,' + (-move * prog).toFixed(1) + 'px,0)';
			} else {
				col.style.transform = '';
			}
		}
	}
	function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

	if (fullsize || track) {
		if (lenis) { lenis.on('scroll', request); } else { window.addEventListener('scroll', request, { passive: true }); }
		window.addEventListener('resize', request);
		update();
	}
})();
