/* Velvet Touch Spa - Resilient Privacy & Staff Verification Module
 * Professional gracefully-degrading vision check with instant client fallback.
 */
(async () => {
  const section = document.querySelector('.staff-section');
  if (!section) return;

  const cardsContainer = document.querySelector('.staff-grid');
  const button = document.getElementById('camera-toggle');
  const status = document.getElementById('privacy-status');

  // Sync with Admin configured Privacy Mode
  const storeData = window.VTStore ? window.VTStore.get() : null;
  const privacySetting = storeData?.settings?.privacyMode || 'resilient';

  let stream = null;
  let video = null;
  let active = false;
  let faceDetector = null;
  let objectModel = null;
  let scanTimer = null;
  let startTimer = null;
  let scanning = false;
  let modelsPromise = null;

  const say = (t) => { if (status) status.textContent = t; };

  const getCards = () => [...document.querySelectorAll('.staff-card')];

  const revealAll = (sourceBadge = 'VERIFIED PROFILE') => {
    getCards().forEach(c => {
      c.classList.add('photo-visible');
      const s = c.querySelector('.photo-status');
      if (s) s.textContent = sourceBadge;
    });
    say('Verified staff profiles displayed.');
  };

  const hideAll = (reason = 'PRIVACY MODE — staff portraits hidden.') => {
    getCards().forEach(c => {
      c.classList.remove('photo-visible');
      const s = c.querySelector('.photo-status');
      if (s) s.textContent = reason.toUpperCase().replace('STAFF PORTRAITS ', 'STAFF ');
    });
  };

  // If Admin set to Always Visible
  if (privacySetting === 'always_show') {
    revealAll('DIRECT VERIFIED');
    if (button) button.style.display = 'none';
    if (status) status.textContent = 'Care team portraits verified by Velvet Touch Spa.';
    return;
  }

  // Graceful Fallback Handler: Called when Camera / Model is unavailable
  function activateGracefulFallback(errorMessage = 'Camera or vision module unavailable') {
    console.warn('[VT Privacy] Graceful Fallback activated:', errorMessage);
    stopCamera(false);

    let notice = document.getElementById('vt-privacy-fallback-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'vt-privacy-fallback-notice';
      notice.className = 'camera-fallback-card';
      notice.innerHTML = `
        <div class="camera-fallback-icon">🛡️</div>
        <div style="flex:1">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
            <strong style="color:var(--text);font-size:13px">Verified Therapist Presentation</strong>
            <span class="camera-pill-tag">Fallback Active</span>
          </div>
          <p style="margin:0;font-size:12px;color:var(--muted)">
            Vision checks are resting (${errorMessage}). You can inspect therapist bios and portraits directly below.
          </p>
        </div>
        <button id="vt-fallback-reveal-btn" class="button button-gold btn-sm" type="button">
          Reveal All Portraits ↗
        </button>
      `;
      const banner = document.querySelector('.privacy-banner');
      if (banner && banner.parentNode) {
        banner.parentNode.insertBefore(notice, banner.nextSibling);
      }
    }

    const fallbackBtn = document.getElementById('vt-fallback-reveal-btn');
    if (fallbackBtn) {
      fallbackBtn.addEventListener('click', () => {
        revealAll('VERIFIED STAFF');
        fallbackBtn.textContent = 'Portraits Active ✓';
        fallbackBtn.disabled = true;
      });
    }

    if (button) {
      button.textContent = 'Reveal Staff Portraits';
      button.onclick = () => {
        revealAll('VERIFIED STAFF');
        button.textContent = 'Portraits Active ✓';
      };
    }

    // Also enable individual click-to-reveal on staff cards
    getCards().forEach(card => {
      card.style.cursor = 'pointer';
      card.setAttribute('title', 'Click to reveal portrait');
      card.onclick = (e) => {
        // don't interfere if clicking modal link
        if (e.target.closest('.profile-link')) return;
        card.classList.toggle('photo-visible');
        const s = card.querySelector('.photo-status');
        if (s) s.textContent = card.classList.contains('photo-visible') ? 'VERIFIED' : 'CLICK TO REVEAL';
      };
    });

    say('Portraits ready for view (Click card or tap "Reveal All Portraits").');
  }

  // Robust Model Loader with timeouts & catch
  async function loadModels() {
    if (modelsPromise) return modelsPromise;
    modelsPromise = (async () => {
      say('Loading privacy checks…');
      // Set a strict 6-second timeout so page never hangs
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Model loading timed out (network/CDN delay)')), 6500)
      );

      const loader = (async () => {
        const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14');
        const files = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
        faceDetector = await vision.FaceDetector.createFromOptions(files, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.65
        });

        const tf = await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/+esm');
        const coco = await import('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/+esm');
        await tf.ready();
        objectModel = await coco.load({ base: 'lite' });

        if (!faceDetector || !objectModel) {
          throw new Error('Vision detector module did not initialise');
        }
        return true;
      })();

      return await Promise.race([loader, timeoutPromise]);
    })();

    try {
      return await modelsPromise;
    } catch (err) {
      modelsPromise = null;
      faceDetector = null;
      objectModel = null;
      throw err;
    }
  }

  function stopCamera(updateStatusText = true, reason = 'Camera stopped.') {
    active = false;
    if (scanTimer) clearInterval(scanTimer);
    scanTimer = null;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    if (video) {
      video.remove();
      video = null;
    }
    if (button) button.textContent = 'Enable camera preview';
    if (updateStatusText) say(reason);
  }

  async function scan() {
    if (!active || scanning || !video || video.readyState < 2) return;
    scanning = true;
    try {
      if (!faceDetector || !objectModel) throw new Error('Detectors unavailable');
      const now = performance.now();
      const fr = faceDetector.detectForVideo(video, now);
      const faces = fr?.detections || [];
      const hasFace = faces.some(d => (d.categories?.[0]?.score ?? d.score ?? 0) >= 0.60);

      if (!hasFace) {
        hideAll('NO FACE — PRIVACY MODE');
        say('No face detected in preview. Staff portraits hidden.');
        return;
      }

      const predictions = await objectModel.detect(video, 20, 0.35);
      const deviceClasses = new Set(['cell phone', 'laptop', 'tv', 'remote', 'keyboard', 'mouse']);
      const device = predictions.find(o => deviceClasses.has(String(o.class).toLowerCase()) && o.score >= 0.35);

      if (device) {
        hideAll('DEVICE DETECTED');
        say('Recording device detected (' + device.class + '). Staff portraits hidden.');
        return;
      }

      revealAll('CHECKS PASSED');
      say('Face verified; no recording device detected. Portraits visible.');
    } catch (e) {
      activateGracefulFallback('Vision detector interrupted');
    } finally {
      scanning = false;
    }
  }

  async function startCamera() {
    if (active) return;
    hideAll();
    say('Requesting camera & vision checks…');

    // Check secure context
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      activateGracefulFallback('Camera requires HTTPS or localhost');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      activateGracefulFallback('Camera API not supported on this browser');
      return;
    }

    try {
      await loadModels();
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });

      video = document.createElement('video');
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'camera-preview';
      video.setAttribute('aria-label', 'Camera preview used for privacy checks');
      video.srcObject = stream;
      document.body.appendChild(video);
      await video.play();

      active = true;
      if (button) button.textContent = 'Disable camera preview';
      say('Camera active. Scanning for face and privacy security…');
      await new Promise(r => setTimeout(r, 400));
      await scan();
      scanTimer = setInterval(scan, 1500);
    } catch (err) {
      console.warn('[VT Privacy] Camera/Vision startup failed:', err);
      const msg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied'
        : (err.message || 'Camera or vision module unavailable');
      activateGracefulFallback(msg);
    }
  }

  if (button) {
    button.addEventListener('click', () => {
      if (active) {
        stopCamera(true, 'Camera disabled — staff portraits hidden.');
        hideAll('PRIVACY MODE');
      } else {
        startCamera();
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hideAll('PAGE HIDDEN');
    else if (active) scan();
  });

  window.addEventListener('pagehide', () => stopCamera(false));

  // Intersection observer: only try automatic camera if supported and not in fallback
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && !startTimer && !active) {
        // If insecure context, trigger fallback immediately without noisy failure
        if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          activateGracefulFallback('Camera requires HTTPS or localhost');
          return;
        }
        say('Care team in view. Initializing camera in 2s…');
        startTimer = setTimeout(() => {
          startTimer = null;
          startCamera();
        }, 2000);
      } else if (!entry.isIntersecting) {
        if (startTimer) {
          clearTimeout(startTimer);
          startTimer = null;
        }
        if (active) stopCamera(true, 'Care team out of view — camera stopped.');
      }
    }
  }, { threshold: 0.18 });

  observer.observe(section);
})();
