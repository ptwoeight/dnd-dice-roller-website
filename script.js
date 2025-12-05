// Keep clicked option visually active; only one active at a time
document.addEventListener('DOMContentLoaded', () => {
    // select all option buttons inside the selection container
    const diceOptions = document.querySelectorAll('#selection-options .options');
    const dieBg = document.querySelector('#die-bg');

    // map option ids to media images (files are in /media)
    const dieImageMap = {
        'option-d4': 'media/d4-filler.png',
        'option-d6': 'media/d6-filler.png',
        'option-d8': 'media/d8-filler.png',
        'option-d10': 'media/d10_-filler.png',
        'option-d12': 'media/d12-filler.png',
        'option-d20': 'media/d20-filler.png',
        'option-d%': 'media/d10_-filler.png'
    };

    // add click listener to each option; clicking removes 'active' from all and adds to the clicked one
    diceOptions.forEach(option => {
        option.addEventListener('click', () => {
            console.log(option.id + ' clicked');
            diceOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');

            // update decorative die background to match the selected die
            if (dieBg) {
                const img = dieImageMap[option.id];
                if (img) {
                    dieBg.style.backgroundImage = `url('${img}')`;
                    dieBg.classList.add('visible');
                } else {
                    dieBg.classList.remove('visible');
                    dieBg.style.backgroundImage = '';
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