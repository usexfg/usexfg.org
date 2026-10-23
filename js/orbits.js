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
    { radius: 20, count: 6, dur: 45, dir: 1 },
    { radius: 32, count: 10, dur: 70, dir: -1 },
    { radius: 44, count: 12, dur: 100, dir: 1 },
    { radius: 56, count: 14, dur: 140, dir: -1 }
  ];

  let coinIdx = 0;

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

      const hitTarget = document.createElement("div");
      hitTarget.className = "orbit-node-hit";

      const img = document.createElement("img");
      /* Single-tone maison treatment: every external chain is rendered in muted gold. */
      img.src = `coins/mono/${coin.id}.png?v=3`;
      img.alt = coin.name;
      img.draggable = false;
      
      const tooltip = document.createElement("div");
      tooltip.className = "orbit-tooltip";
      tooltip.innerText = coin.name;

      img.onerror = () => {
        if (!img.dataset.fallback) {
          img.dataset.fallback = '1';
          img.src = `coins/${coin.id}.png?v=2`;
        } else {
          placement.remove();
        }
      };

      hitTarget.appendChild(img);
      hitTarget.appendChild(tooltip);

      upright.appendChild(hitTarget);
      counterSpin.appendChild(upright);
      offset.appendChild(counterSpin);
      placement.appendChild(offset);
      ringEl.appendChild(placement);
    }

    galaxy.appendChild(ringEl);
  });
});
