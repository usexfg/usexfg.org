document.addEventListener("DOMContentLoaded", () => {
  const galaxy = document.getElementById("xfg-galaxy");
  if (!galaxy) return;

  const coins = [
    { id: "btc", name: "Bitcoin" },
    { id: "eth", name: "Ethereum" },
    { id: "sol", name: "Solana" },
    { id: "bnb", name: "BNB Chain" },
    { id: "monero", name: "Monero" },
    { id: "doge", name: "Dogecoin" },
    { id: "avax", name: "Avalanche" },
    { id: "bch", name: "Bitcoin Cash" },
    { id: "matic", name: "Polygon" },
    { id: "ltc", name: "Litecoin" },
    { id: "dash", name: "Dash" },
    { id: "zec", name: "Zcash" },
    { id: "arb", name: "Arbitrum" },
    { id: "base", name: "Base" },
    { id: "cro", name: "Cronos" },
    { id: "kmd", name: "Komodo" },
    { id: "dcr", name: "Decred" },
    { id: "gleec", name: "Gleec" },
    { id: "robinhood", name: "Robinhood" },
    { id: "bob", name: "BOB" },
    { id: "unichain", name: "Unichain" },
    { id: "plasma", name: "Plasma" },
    { id: "pls", name: "PulseChain" },
    { id: "monad", name: "Monad" },
    { id: "linea", name: "Linea" },
    { id: "zksync", name: "ZKsync" },
    { id: "hyperevm", name: "HyperEVM" },
    { id: "ink", name: "Ink" },
    { id: "rootstock", name: "Rootstock" },
    { id: "gnosis", name: "Gnosis" },
    { id: "flare", name: "Flare" },
    { id: "kaia", name: "Kaia" },
    { id: "scroll", name: "Scroll" },
    { id: "abstract", name: "Abstract" },
    { id: "plume", name: "Plume" },
    { id: "soneium", name: "Soneium" },
    { id: "doma", name: "Doma" },
    { id: "beam", name: "Beam" },
    { id: "moonriver", name: "Moonriver" },
    { id: "peaq", name: "peaq" },
    { id: "sei", name: "Sei" },
    { id: "ton", name: "TON" }
  ];

  const ringsConfig = [
    { radius: 22, count: 6, dur: 45, dir: 1 },
    { radius: 36, count: 10, dur: 70, dir: -1 },
    { radius: 52, count: 12, dur: 100, dir: 1 },
    { radius: 68, count: 14, dur: 140, dir: -1 }
  ];

  let coinIdx = 0;
  let activeDragNode = null;
  let startX, startY;

  ringsConfig.forEach((ring) => {
    const ringEl = document.createElement("div");
    ringEl.className = "orbit-ring";
    ringEl.style.width = `${ring.radius * 2}%`;
    ringEl.style.height = `${ring.radius * 2}%`;
    ringEl.style.animationDuration = `${ring.dur}s`;
    ringEl.style.animationDirection = ring.dir === 1 ? 'normal' : 'reverse';

    for (let i = 0; i < ring.count; i++) {
      if (coinIdx >= coins.length) break;
      const coin = coins[coinIdx++];

      const angle = (i / ring.count) * 360;

      const placement = document.createElement("div");
      placement.className = "orbit-node-placement";
      placement.style.transform = `rotate(${angle}deg)`;

      const offset = document.createElement("div");
      offset.className = "orbit-node-offset";

      const counterSpin = document.createElement("div");
      counterSpin.className = "orbit-node-counter-spin";
      counterSpin.style.animationDuration = `${ring.dur}s`;
      counterSpin.style.animationDirection = ring.dir === 1 ? 'reverse' : 'normal';

      const upright = document.createElement("div");
      upright.className = "orbit-node-upright";
      upright.style.transform = `rotate(-${angle}deg)`;

      const dragTarget = document.createElement("div");
      dragTarget.className = "orbit-node-drag-target";

      const img = document.createElement("img");
      img.src = `coins/${coin.id}.png`;
      img.alt = coin.name;
      img.draggable = false;
      
      const tooltip = document.createElement("div");
      tooltip.className = "orbit-tooltip";
      tooltip.innerText = coin.name;

      img.onerror = () => { placement.remove(); };

      dragTarget.appendChild(img);
      dragTarget.appendChild(tooltip);

      // Robust pointer capture for flawless dragging
      dragTarget.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        activeDragNode = dragTarget;
        startX = e.clientX;
        startY = e.clientY;
        
        dragTarget.style.transition = 'none';
        upright.classList.add('is-dragging');
        dragTarget.setPointerCapture(e.pointerId);
      });

      dragTarget.addEventListener('pointermove', (e) => {
        if (activeDragNode !== dragTarget) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        dragTarget.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      const releaseDrag = (e) => {
        if (activeDragNode === dragTarget) {
          dragTarget.releasePointerCapture(e.pointerId);
          activeDragNode = null;
          
          dragTarget.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
          dragTarget.style.transform = 'translate(0px, 0px)';
          upright.classList.remove('is-dragging');
          
          setTimeout(() => {
            if (activeDragNode !== dragTarget) {
              dragTarget.style.transition = 'none';
            }
          }, 600);
        }
      };

      dragTarget.addEventListener('pointerup', releaseDrag);
      dragTarget.addEventListener('pointercancel', releaseDrag);

      upright.appendChild(dragTarget);
      counterSpin.appendChild(upright);
      offset.appendChild(counterSpin);
      placement.appendChild(offset);
      ringEl.appendChild(placement);
    }

    galaxy.appendChild(ringEl);
  });
});
