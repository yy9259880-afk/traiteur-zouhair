
(() => {
  "use strict";

  // Ajoute ici le numéro WhatsApp officiel au format international,
  // chiffres uniquement. Exemple Maroc : 2126XXXXXXXX
  const WHATSAPP_NUMBER = "";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("#year").textContent = new Date().getFullYear();

  function createIcons() {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }
  createIcons();
  window.addEventListener("load", createIcons);

  // Menu mobile
  const toggle = $(".menu-toggle");
  const nav = $("#main-nav");

  function closeMenu() {
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    toggle.innerHTML = '<i data-lucide="menu"></i>';
    createIcons();
  }

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    toggle.innerHTML = `<i data-lucide="${open ? "x" : "menu"}"></i>`;
    createIcons();
  });

  $$(".main-nav a").forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });

  // Header au scroll
  const header = $(".site-header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 25);
  }, { passive: true });

  // GSAP animations avec fallback si la bibliothèque ne charge pas
  if (!reduceMotion && window.gsap) {
    try {
      if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

      gsap.from(".hero-eyebrow", {
        opacity: 0, y: 18, duration: .8, delay: .15
      });
      gsap.from(".hero h1", {
        opacity: 0, y: 28, duration: 1, delay: .25
      });
      gsap.from(".hero-copy, .hero-actions", {
        opacity: 0, y: 18, duration: .8, delay: .45, stagger: .12
      });

      if (window.ScrollTrigger) {
        gsap.utils.toArray(".reveal").forEach(el => {
          gsap.fromTo(el, { opacity: 0, y: 24 }, {
            opacity: 1, y: 0, duration: .8,
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
          });
        });
      }
    } catch (error) {
      console.warn("Animations désactivées.", error);
    }
  }

  // Parallax de la photo du hero
  const hero = $(".hero");
  const heroImage = $(".hero-image");

  if (!reduceMotion) {
    hero.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      heroImage.style.transform = `scale(1.07) translate(${-x * 12}px, ${-y * 9}px)`;
    });

    hero.addEventListener("pointerleave", () => {
      heroImage.style.transform = "scale(1.04)";
    });
  }

  // Hero 3D avec Three.js : anneaux dorés et particules
  function init3D() {
    const canvas = $("#hero-canvas");
    if (!canvas || !window.THREE || reduceMotion) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, antialias: true
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(hero.clientWidth, hero.clientHeight, false);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        42, hero.clientWidth / hero.clientHeight, .1, 100
      );
      camera.position.set(0, 0, 12);

      const group = new THREE.Group();
      scene.add(group);

      const gold = new THREE.MeshStandardMaterial({
        color: 0xd8b76e, metalness: .82, roughness: .24,
        transparent: true, opacity: .74
      });

      const brightGold = new THREE.MeshStandardMaterial({
        color: 0xf1dca5, metalness: .72, roughness: .2,
        transparent: true, opacity: .8
      });

      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, .025, 12, 110), gold
      );
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, .018, 10, 100), brightGold
      );
      const ring3 = new THREE.Mesh(
        new THREE.TorusGeometry(.7, .012, 8, 90), gold
      );

      [ring1, ring2, ring3].forEach(ring => {
        ring.position.set(3.3, .1, -1.5);
        group.add(ring);
      });

      ring1.rotation.set(.9, .25, .2);
      ring2.rotation.set(1.1, -.4, .8);
      ring3.rotation.set(.2, .7, 1.1);

      const count = 180;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - .5) * 15;
        positions[i * 3 + 1] = (Math.random() - .5) * 9;
        positions[i * 3 + 2] = (Math.random() - .5) * 7 - 1;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position", new THREE.BufferAttribute(positions, 3)
      );

      const particles = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          color: 0xe8cf91, size: .025,
          transparent: true, opacity: .68,
          depthWrite: false
        })
      );
      scene.add(particles);
      scene.add(new THREE.AmbientLight(0xffffff, 1.2));

      const light = new THREE.PointLight(0xe4c27a, 2.1, 30);
      light.position.set(3, 2, 4);
      scene.add(light);

      let px = 0, py = 0, tx = 0, ty = 0;

      hero.addEventListener("pointermove", e => {
        if (e.pointerType === "touch") return;
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * .6;
        ty = ((e.clientY - r.top) / r.height - .5) * .3;
      }, { passive: true });

      let frame;
      function animate() {
        frame = requestAnimationFrame(animate);
        px += (tx - px) * .025;
        py += (ty - py) * .025;

        group.rotation.y = px;
        group.rotation.x = py;
        ring1.rotation.z += .0014;
        ring2.rotation.z -= .001;
        ring3.rotation.y += .0013;
        particles.rotation.y += .0002;

        const p = geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
          p[i * 3 + 1] += .002;
          if (p[i * 3 + 1] > 4.8) p[i * 3 + 1] = -4.8;
        }
        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener("resize", () => {
        camera.aspect = hero.clientWidth / hero.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(hero.clientWidth, hero.clientHeight, false);
      }, { passive: true });

    } catch (error) {
      console.warn("Three.js indisponible; la photo du hero reste visible.", error);
      canvas.style.display = "none";
      if (renderer) renderer.dispose();
    }
  }

  init3D();

  // Formulaire et validation
  const form = $("#quote-form");
  const result = $("#form-result");
  const required = [
    { el: $("#name"), message: "Veuillez saisir votre nom." },
    { el: $("#event"), message: "Veuillez choisir le type d’événement." },
    { el: $("#needs"), message: "Veuillez décrire votre besoin." }
  ];

  function errorFor(field, message) {
    const error = field.closest(".form-row")?.querySelector(".field-error");
    if (error) error.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  required.forEach(({el}) => {
    el.addEventListener("input", () => errorFor(el, ""));
    el.addEventListener("change", () => errorFor(el, ""));
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    let valid = true;

    required.forEach(({el, message}) => {
      const missing = !el.value.trim();
      errorFor(el, missing ? message : "");
      if (missing) valid = false;
    });

    const guests = $("#guests");
    if (guests.value && (+guests.value < 1 || +guests.value > 10000)) {
      guests.setCustomValidity("Veuillez saisir un nombre valide.");
      guests.reportValidity();
      valid = false;
    } else {
      guests.setCustomValidity("");
    }

    if (!valid) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const data = new FormData(form);
    const message = [
      "Bonjour TRAITEUR ZOUHAIR, je souhaite demander un devis.",
      `Nom : ${data.get("name")}`,
      `Événement : ${data.get("event")}`,
      `Date : ${data.get("date") || "À préciser"}`,
      `Invités : ${data.get("guests") || "À préciser"}`,
      `Besoin : ${data.get("needs")}`
    ].join("\n");

    result.hidden = false;
    result.replaceChildren();

    const text = document.createElement("p");
    text.textContent = "Votre demande est prête. Choisissez comment continuer.";
    result.append(text);

    if (WHATSAPP_NUMBER && /^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
      const link = document.createElement("a");
      link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ouvrir WhatsApp et envoyer la demande";
      result.append(link);
    } else {
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "button button-gold";
      copy.textContent = "Copier le message";

      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(message);
          copy.textContent = "Message copié ✓";
        } catch {
          const area = document.createElement("textarea");
          area.value = message;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
          copy.textContent = "Message copié ✓";
        }
      });

      result.append(copy);

      const instagram = document.createElement("a");
      instagram.href = "https://www.instagram.com/traiteur_haydar_zouhair/";
      instagram.target = "_blank";
      instagram.rel = "noopener noreferrer";
      instagram.textContent = "Contacter sur Instagram";
      result.append(document.createElement("br"), instagram);
    }
  });

  // CTA principal : utilise WhatsApp seulement si un numéro réel est configuré.
  const whatsappCTA = $("#whatsapp-cta");
  if (WHATSAPP_NUMBER && /^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
    whatsappCTA.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "Bonjour TRAITEUR ZOUHAIR, je souhaite demander un devis."
    )}`;
    whatsappCTA.target = "_blank";
    whatsappCTA.rel = "noopener noreferrer";
  }
})();
