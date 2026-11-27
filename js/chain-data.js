/*  deXFG Galaxy — chain registry + live stats
    Static identity fields only; numbers come from live public APIs
    (DefiLlama TVL, CoinGecko supply/price) and degrade to "—" quietly.
    Nothing here is invented: an unknown id yields an em dash, not a guess.
*/
(function () {
  'use strict';

  /* id: [coinGeckoId, defiLlamaChainName, nativeSymbol, networkType, blurb] */
  var REGISTRY = {
    btc:        ['bitcoin', 'Bitcoin', 'BTC', 'Proof-of-work reserve', 'The original sound-money network. Swaps into Fuego settle without a wrapped proxy.'],
    eth:        ['ethereum', 'Ethereum', 'ETH', 'Proof-of-stake settlement', 'The base settlement layer deXFG crosses against; deepest liquidity of any network.'],
    sol:        ['solana', 'Solana', 'SOL', 'High-throughput L1', 'Parallel-execution L1; private Fuego entry without a bridge wrapper.'],
    bnb:        ['binancecoin', 'Binance', 'BNB', 'EVM L1', 'EVM side of the cross-chain order flow; adaptor-signature settlement.'],
    monero:     ['monero', null, 'XMR', 'Privacy — CryptoNote', 'Ring-signature peer. Privacy-to-privacy exchange with Fuego, no revealing hashes.'],
    doge:       ['dogecoin', null, 'DOGE', 'Proof-of-work UTXO', 'PoW UTXO chain; swaps settle on-chain without custodial wrapping.'],
    avax:       ['avalanche-2', 'Avalanche', 'AVAX', 'Subnet L1', 'Subnet L1 with native bridgeless swap routes into the Fuego reserve.'],
    bch:        ['bitcoin-cash', null, 'BCH', 'Proof-of-work UTXO', 'PoW UTXO offshoot; private exit and entry via adaptor signatures.'],
    matic:      ['matic-network', 'Polygon', 'POL', 'Ethereum L2 / sidechain', 'Ethereum-side liquidity rail; renamed token POL, still the gas asset.'],
    ltc:        ['litecoin', null, 'LTC', 'Proof-of-work UTXO', 'PoW UTXO; one of the longest-lived networks in the swap set.'],
    dash:       ['dash', 'Dash', 'DASH', 'Proof-of-work, optional shield', 'PoW with optional privacy features; trustless cross-chain settlement.'],
    zec:        ['zcash', null, 'ZEC', 'Proof-of-work shielded pool', 'Zcash — shielded-pool PoW chain; deXFG swap legs run through the unshielded pool, so the outward swap is not private-to-private.'],
    arb:        ['arbitrum', 'Arbitrum', 'ETH', 'Ethereum L2 (optimistic)', 'Optimistic rollup; ETH gas, deep DEX liquidity, bridgeless Fuego entry.'],
    base:       ['base', 'Base', 'ETH', 'Ethereum L2 (OP stack)', 'OP-stack L2; swap routes settle without a canonical bridge.'],
    cro:        ['cronos', 'Cronos', 'CRO', 'EVM L1', 'EVM L1; reserve entry and exit through private order flow.'],
    kmd:        ['komodo', 'Komodo', 'KMD', 'PoW multichain', 'Multichain PoW platform; atomic-swap heritage in its design.'],
    dcr:        ['decred', null, 'DCR', 'PoW/PoS hybrid', 'Hybrid consensus; treasury-governed network in the swap set.'],
    gleec:      [null, null, 'GLEEC', 'EVM ecosystem', 'Small-cap EVM ecosystem; listed for private cross-chain settlement.'],
    robinhood:  [null, null, '—', 'Listed network', 'Custodial-adjacent listing route into private swap flow; no native gas asset.'],
    bob:        [null, 'BOB', 'ETH', 'EVM L2', 'Bank of Bitcoin — ZK rollup on Ethereum secured by Bitcoin, with EVM smart contracts; ETH gas, swap-wired into the private order flow.'],
    unichain:   [null, 'Unichain', 'ETH', 'Ethereum L2 (OP stack)', 'Uniswap’s OP-stack L2; swap-native liquidity, ETH gas.'],
    plasma:     [null, 'Plasma', '—', 'Stable-focused L1', 'Stablecoin-focused L1 in the deXFG network set.'],
    pls:        ['pulsechain', null, 'PLS', 'Proof-of-stake L1', 'PoS L1 fork lineage; private entry without a bridge wrapper.'],
    monad:      ['monad', 'Monad', 'MON', 'Parallel EVM L1', 'Parallel-execution EVM L1; mainnet-era swap routes.'],
    linea:      ['linea', 'Linea', 'ETH', 'zkEVM L2', 'Consensys zkEVM L2; ETH gas, validity-proof settlement.'],
    zksync:     ['zksync', 'zkSync Era', 'ETH', 'zkEVM L2', 'zkEVM L2; validity proofs carry swap legs out of the chain.'],
    hyperevm:   ['hyperliquid', 'HyperEVM', 'HYPE', 'EVM over L1', 'Hyperliquid’s EVM surface; order-flow-native swap routes.'],
    ink:        [null, 'Ink', 'INK', 'Ethereum L2', 'Kraken-built L2; ETH gas, bridgeless private entry.'],
    rootstock:  ['rootstock', 'Rootstock', 'RBTC', 'Bitcoin L2', 'Bitcoin-anchored L2; RBTC is pegged 1:1 to BTC for swap legs.'],
    gnosis:     ['gnosis', 'Gnosis', 'xDAI', 'Ethereum sidechain', 'Stablecoin-native sidechain; xDAI gas, deep DEX history.'],
    flare:      ['flare', 'Flare', 'FLR', 'Data L1', 'Data-optimised L1; FAssets enable non-smart-contract chain swap routes.'],
    kaia:       ['kaia', 'Kaia', 'KAIA', 'L1', 'Korea-rooted L1; grafted EVM with fast finality.'],
    scroll:     ['scroll', 'Scroll', 'ETH', 'zkEVM L2', 'zkEVM L2 with native scroll-ENS tooling; ETH gas.'],
    abstract:   [null, 'Abstract', 'ABSTRACT', 'Ethereum L2', 'Consumer-focused OP-stack L2 in the deXFG set.'],
    plume:      ['plume', 'Plume', 'PLUME', 'RWA L2', 'RWA-focused L2; tokenised-asset swap routes.'],
    soneium:    [null, 'Soneium', 'ETH', 'Ethereum L2', 'Startale/Sony OP-stack L2; ETH gas.'],
    doma:       [null, 'Doma', 'ETH', 'Domain-focused EVM', 'Doma — domain-focused EVM network in the deXFG set; ETH gas, wallet-tier entry.'],
    beam:       ['beam', 'Beam', 'BEAM', 'Gaming L1', 'Gaming L1; MERIT-aligned economy, bridgeless swap entry.'],
    moonriver:  ['moonriver', null, 'MOVR', 'ERC-20 on Base (L2)', 'MOVR migrated to Base (Ethereum L2); no longer a Kusama parachain.'],
    peaq:       ['peaq', 'peaq', 'PEAQ', 'DePIN L1', 'DePIN L1 for machine economy swap routes.'],
    sei:        ['sei', 'Sei', 'SEI', 'Parallel L1', 'Parallelised L1 with native order-matching design.'],
    ton:        ['the-open-network', 'TON', 'TON', 'L1', 'Telegram-rooted L1; private entry via adaptor signatures.'],
    /* No CoinGecko entry exists for Fuego XFG — the reserve is its own source
       of truth, so its supply figures come from the reserve itself, not a
       third-party coin site. */
    fuego:     [null, 'Fuego Reserve', 'XFG', 'CryptoNote; Private Reserve', 'Sovereign Sound Money Banking & Private Purchasing Power Chain']
  };

  var STATUS = 'Supported network · arriving with v11';
  var CACHE_KEY = 'dexfg-stats-v1';
  var TTL_MS = 10 * 60 * 1000;

  /* Swapping XFG OUT to a network is private-to-private only where the swap
     leg is shielded end to end. Monero (ring signatures + PTLC) is the privacy
     network. The Fuego Reserve leg itself is shielded (XFG ring signatures /
     MuSig2 PTLC), so swapping out of the reserve is private. Everything else is
     a public leg: transparent UTXO/EVM rails, or shielded pools whose swaps run
     through an unshielded pool (e.g. Zcash). */
  var PRIVATE_TO_PRIVATE = { monero: true, fuego: true };
  function isPrivateToPrivate(id) {
    var v = Object.prototype.hasOwnProperty.call(PRIVATE_TO_PRIVATE, id) ? PRIVATE_TO_PRIVATE[id] : false;
    return !!v;
  }
  function swapPrivacy(id) {
    return isPrivateToPrivate(id) ? 'Private' : 'Public';
  }

  function fmtUsd(n) {
    if (n == null || !isFinite(n)) return '—';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + n.toFixed(2);
  }
  function fmtCount(n) {
    if (n == null || !isFinite(n)) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(Math.round(n));
  }

  var cache = null;
  try { cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); } catch (e) { cache = null; }
  if (cache && Date.now() - cache.ts > TTL_MS) cache = null;

  var inflight = null;

  function fetchStats(onDone) {
    if (cache) { onDone(cache.data); return; }
    if (inflight) { inflight.push(onDone); return; }
    inflight = [onDone];

    var geckoIds = [], llamaNames = {};
    Object.keys(REGISTRY).forEach(function (id) {
      var r = REGISTRY[id];
      if (r[0]) geckoIds.push(r[0]);
      if (r[1]) llamaNames[r[1].toLowerCase()] = id;
    });

    var result = {};
    var remaining = 2;

    function done() {
      if (--remaining > 0) return;
      var data = result;
      /* Networks whose native coin is ETH report the Ethereum supply figures
         (Arbitrum/Base/Unichain/Linea/zkSync/Scroll/Soneium/Ink/Abstract/Doma…). */
      var eth = data['eth'];
      if (eth) {
        Object.keys(REGISTRY).forEach(function (id) {
          if (id === 'eth' || REGISTRY[id][2] !== 'ETH') return;
          data[id] = data[id] || {};
          data[id].price = eth.price;
          data[id].circulating = eth.circulating;
          data[id].total = eth.total;
          data[id].max = eth.max;
        });
      }
      cache = { ts: Date.now(), data: data };
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
      var cbs = inflight; inflight = null;
      cbs.forEach(function (cb) { cb(data); });
    }

    /* Chain TVL — DefiLlama */
    fetch('https://api.llama.fi/chains').then(function (r) { return r.json(); }).then(function (list) {
      list.forEach(function (c) {
        var id = llamaNames[String(c.name).toLowerCase()];
        if (id && c.tvl != null) { result[id] = result[id] || {}; result[id].tvl = c.tvl; }
      });
    }).catch(function () {}).then(done);

    /* Supply + price — CoinGecko */
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + geckoIds.join(',') + '&per_page=250').then(function (r) { return r.json(); }).then(function (list) {
      var byGecko = {};
      Object.keys(REGISTRY).forEach(function (id) { if (REGISTRY[id][0]) byGecko[REGISTRY[id][0]] = id; });
      list.forEach(function (c) {
        var id = byGecko[c.id];
        if (!id) return;
        result[id] = result[id] || {};
        result[id].price = c.current_price;
        result[id].circulating = c.circulating_supply;
        result[id].total = c.total_supply;
        result[id].max = c.max_supply;
      });
    }).catch(function () {}).then(done);
  }

  window.DEXXFG_CHAINS = {
    get: function (id) {
      var r = REGISTRY[id];
      if (!r) return null;
      return { name: r[0] ? id : id, symbol: r[2], type: r[3], blurb: r[4], status: STATUS };
    },
    info: function (id) { return REGISTRY[id]; },
    stats: fetchStats,
    fmtUsd: fmtUsd,
    fmtCount: fmtCount,
    isPrivateToPrivate: isPrivateToPrivate,
    swapPrivacy: swapPrivacy
  };
})();
