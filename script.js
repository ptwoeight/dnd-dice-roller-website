// Keep clicked option visually active; only one active at a time
document.addEventListener('DOMContentLoaded', () => {
    // select all option buttons inside the selection container
    const diceOptions = document.querySelectorAll('#selection-options .options');
    const dieBg = document.querySelector('#die-bg');

    // map option ids to media images (files are in /media)
    const dieImageMap = {
        'option-d4': 'media/d4-rotate.webm',
        'option-d6': 'media/d6-rotate.webm',
        'option-d8': 'media/d8-rotate.webm',
        'option-d10': 'media/d10-rotate.webm',
        'option-d12': 'media/d12-rotate.webm',
        'option-d20': 'media/d20-rotate.webm',
        'option-d%': 'media/d10P-rotate.webm'
    };

    // add click listener to each option; clicking removes 'active' from all and adds to the clicked one
    diceOptions.forEach(option => {
        option.addEventListener('click', () => {
            console.log(option.id + ' clicked');
            diceOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');

            // update decorative die background to match the selected die (use looping webm)
            if (dieBg) {
                const src = dieImageMap[option.id];
                const existing = dieBg.querySelector('video');

                // if same source already present, just ensure it's visible and don't recreate
                if (src && existing && existing.getAttribute('data-src') === src) {
                    dieBg.classList.add('visible');
                } else if (src) {
                    // remove any previous video cleanly
                    if (existing) {
                        try { existing.pause(); } catch (e) {}
                        try { existing.removeAttribute('src'); existing.load(); } catch (e) {}
                        dieBg.removeChild(existing);
                    } else {
                        dieBg.innerHTML = '';
                    }

                    const vid = document.createElement('video');
                    // set attributes for reliable autoplay/looping
                    vid.setAttribute('preload', 'auto');
                    vid.src = src;
                    vid.autoplay = true;
                    vid.loop = true;
                    vid.muted = true;
                    vid.playsInline = true;
                    vid.setAttribute('playsinline', '');
                    vid.setAttribute('webkit-playsinline', '');
                    vid.setAttribute('aria-hidden', 'true');
                    vid.setAttribute('data-src', src);
                    vid.style.width = '100%';
                    vid.style.height = '100%';
                    vid.style.objectFit = 'contain';
                    // disable CSS opacity transition for immediate switch
                    vid.style.transition = 'none';
                    vid.style.display = 'block';
                    dieBg.appendChild(vid);

                    // try to play (some browsers require a play call even if muted)
                    const playPromise = vid.play();
                    if (playPromise && playPromise.catch) playPromise.catch(() => {/* autoplay blocked */});
                    dieBg.classList.add('visible');
                } else {
                    // no source mapped for this option
                    if (existing) {
                        try { existing.pause(); } catch (e) {}
                        try { existing.removeAttribute('src'); existing.load(); } catch (e) {}
                        dieBg.removeChild(existing);
                    }
                    dieBg.classList.remove('visible');
                }
            }
        });
    });
});

const jumbleBtn = document.querySelector('#jumble-btn');
jumbleBtn.addEventListener('click', () => {
    const active = document.querySelector('#selection-options .options.active');
    
    // If no option is active, show error animation and return
    if (!active) {
        jumbleBtn.classList.remove('error-shake');
        void jumbleBtn.offsetWidth;
        jumbleBtn.classList.add('error-shake');
        return;
    }
    
    const rollValueEl = document.querySelector('#roll-value');
    const result = rollValue();
    rollValueEl.textContent = result;
    
    // Trigger the zoom-pop animation
    rollValueEl.classList.remove('animate-pop');
    // Force reflow to restart animation
    void rollValueEl.offsetWidth;
    rollValueEl.classList.add('animate-pop');
    
    // Trigger button press animation
    jumbleBtn.classList.remove('press');
    void jumbleBtn.offsetWidth;
    jumbleBtn.classList.add('press');

    // briefly speed up the background die video (instant change, then restore)
    try {
        const dieBg = document.querySelector('#die-bg');
        const vid = dieBg && dieBg.querySelector('video');
        if (vid) {
            // clear any previous restore timer
            if (dieBg._speedTimeout) clearTimeout(dieBg._speedTimeout);
            const original = vid.playbackRate || 1;
            // instant large speed-up
            const peak = 8;
            vid.playbackRate = peak;

            // cancel any previous ramp
            if (dieBg._speedAnim) cancelAnimationFrame(dieBg._speedAnim);
            if (dieBg._speedTimeout) { clearTimeout(dieBg._speedTimeout); dieBg._speedTimeout = null; }

            // ease back to original over a longer duration
            const duration = 1000; // ms - lasts longer
            const start = performance.now();

            function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

            function ramp(now) {
                const elapsed = now - start;
                let t = Math.min(1, elapsed / duration);
                const eased = easeOutQuad(t);
                // interpolate from peak -> original using eased progress
                const value = peak + (original - peak) * eased;
                try { vid.playbackRate = value; } catch (e) { /* ignore */ }

                if (t < 1) {
                    dieBg._speedAnim = requestAnimationFrame(ramp);
                } else {
                    dieBg._speedAnim = null;
                    try { vid.playbackRate = original; } catch (e) { /* ignore */ }
                }
            }

            dieBg._speedAnim = requestAnimationFrame(ramp);
        }
    } catch (e) { /* defensive: don't break on errors */ }
});

/**
 * Return a roll value based on the active option (or the provided dice id).
 * If no option is active, defaults to d20.
 * Accepts an optional `diceId` like 'option-d6'.
 */
function rollValue(diceId) {
    const active = document.querySelector('#selection-options .options.active');
    const id = diceId || (active && active.id) || 'option-d20';

    switch (id) {
        case 'option-d4':
            return Math.floor(Math.random() * 4) + 1;
        case 'option-d6':
            return Math.floor(Math.random() * 6) + 1;
        case 'option-d8':
            return Math.floor(Math.random() * 8) + 1;
        case 'option-d10':
            return Math.floor(Math.random() * 10) + 1;
        case 'option-d%': {
            // return 00, 10, 20, ..., 90
            const n = Math.floor(Math.random() * 10) * 10;
            return n.toString().padStart(2, '0');
        }
        case 'option-d12':
            return Math.floor(Math.random() * 12) + 1;
        case 'option-d20':
        default:
            return Math.floor(Math.random() * 20) + 1;
    }
}