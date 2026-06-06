/**
 * TrustGate TokenShield widget. Embeddable coin legitimacy badge for Sui.
 *
 * Usage on any site (e.g. a DEX):
 *
 *   <script
 *     src="https://sui.trustgated.xyz/widget.js"
 *     data-api="https://sui.trustgated.xyz/api/coin"
 *     defer></script>
 *
 *   <span data-trustgate-coin="0x2::sui::SUI"></span>
 *
 * Every element with data-trustgate-coin gets a compact badge showing score,
 * tier, and a hover panel with the signals. No dependencies, no framework,
 * styles are namespaced so they will not touch the host page.
 *
 * For dynamically rendered token lists, call window.TrustGate.scan() after
 * your rows mount.
 */
(function () {
  "use strict";

  var thisScript = document.currentScript;
  var API =
    (thisScript && thisScript.getAttribute("data-api")) ||
    "https://sui.trustgated.xyz/api/coin";


  var TIERS = {
    VERIFIED: { c: "#2DD4BF", l: "Verified" },
    HIGH: { c: "#4ADE80", l: "High" },
    MEDIUM: { c: "#FBBF24", l: "Medium" },
    LOW: { c: "#F97316", l: "Low" },
    FLAGGED: { c: "#F43F5E", l: "Flagged" },
  };

  var FLAGS = {
    NEW_TOKEN: "New token",
    LOW_LIQUIDITY: "Low liquidity",
    CONCENTRATED_HOLDERS: "Concentrated holders",
    MINTABLE_SUPPLY: "Mintable supply",
    UNVERIFIED_METADATA: "Unverified metadata",
    DEPLOYER_UNTRUSTED: "Untrusted deployer",
    FEW_HOLDERS: "Few holders",
  };

  function flagLabel(code) {
    return FLAGS[code] || code.replace(/_/g, " ").toLowerCase();
  }

  function fmtNum(n) {
    if (n === null || n === undefined) return "unknown";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
  }

  function fmtUsd(n) {
    if (n === null || n === undefined) return "unknown";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + n;
  }

  var STYLE_ID = "tgts-style";
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      ".tgts{position:relative;display:inline-flex;align-items:center;gap:6px;" +
      "font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" +
      "font-size:12px;line-height:1;padding:4px 9px;border-radius:9999px;" +
      "border:1px solid var(--tgc);background:color-mix(in srgb,var(--tgc) 12%,#0b1120);" +
      "color:#e2e8f0;cursor:default;vertical-align:middle;}" +
      ".tgts-dot{width:7px;height:7px;border-radius:9999px;background:var(--tgc);}" +
      ".tgts-score{font-weight:700;color:var(--tgc);}" +
      ".tgts-tier{font-weight:600;color:var(--tgc);text-transform:uppercase;letter-spacing:.04em;font-size:10px;}" +
      ".tgts-chk{color:var(--tgc);}" +
      ".tgts-pop{position:absolute;z-index:2147483647;top:calc(100% + 8px);left:0;width:240px;" +
      "padding:12px 14px;border-radius:12px;border:1px solid color-mix(in srgb,var(--tgc) 30%,#1e293b);" +
      "background:#0d1426;color:#cbd5e1;box-shadow:0 16px 40px -12px rgba(0,0,0,.7);" +
      "opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .12s,transform .12s;" +
      "text-align:left;font-size:12px;}" +
      ".tgts:hover .tgts-pop,.tgts:focus .tgts-pop,.tgts:focus-within .tgts-pop{opacity:1;visibility:visible;transform:translateY(0);}" +
      ".tgts-pop-h{display:flex;align-items:center;gap:6px;font-weight:600;color:#f1f5f9;margin-bottom:8px;}" +
      ".tgts-row{display:flex;justify-content:space-between;padding:2px 0;}" +
      ".tgts-row span:first-child{color:#94a3b8;}" +
      ".tgts-row span:last-child{color:#e2e8f0;font-weight:500;}" +
      ".tgts-flags{margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;}" +
      ".tgts-flag{font-size:10px;padding:2px 6px;border-radius:6px;border:1px solid rgba(244,63,94,.3);" +
      "background:rgba(244,63,94,.1);color:#fda4af;}" +
      ".tgts-foot{margin-top:10px;padding-top:8px;border-top:1px solid #1e293b;font-size:10px;color:#64748b;}" +
      ".tgts-muted{color:#64748b;border-color:#334155;background:#0d1426;}";
    var el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderBadge(el, d) {
    var t = TIERS[d.tier] || TIERS.MEDIUM;
    var s = d.signals || {};
    var name = (d.metadata && d.metadata.name) || "Token";
    var sym = (d.metadata && d.metadata.symbol) || "";

    var rows =
      row("Liquidity", fmtUsd(s.liquidityUsd)) +
      row("Holders", fmtNum(s.holderCount)) +
      row("Age", s.ageInDays == null ? "unknown" : s.ageInDays + " days") +
      row("Supply", s.isMintable ? "mintable" : "fixed");

    var flags = "";
    if (d.flags && d.flags.length) {
      flags = '<div class="tgts-flags">';
      for (var i = 0; i < d.flags.length; i++) {
        flags += '<span class="tgts-flag">' + escapeHtml(flagLabel(d.flags[i])) + "</span>";
      }
      flags += "</div>";
    }

    el.innerHTML =
      '<span class="tgts" style="--tgc:' + t.c + '" tabindex="0">' +
      '<span class="tgts-dot"></span>' +
      '<span class="tgts-score">' + d.score + "</span>" +
      '<span class="tgts-tier">' + t.l + "</span>" +
      (d.verified ? '<span class="tgts-chk">&#10003;</span>' : "") +
      '<span class="tgts-pop">' +
      '<span class="tgts-pop-h">' + escapeHtml(name) +
      (sym ? ' <span style="color:#64748b;font-weight:400">' + escapeHtml(sym) + "</span>" : "") +
      "</span>" +
      rows +
      flags +
      '<div class="tgts-foot">Scored by TrustGate</div>' +
      "</span>" +
      "</span>";
  }

  function row(label, value) {
    return (
      '<span class="tgts-row"><span>' + label + "</span><span>" + escapeHtml(value) + "</span></span>"
    );
  }

  function renderMuted(el, text) {
    el.innerHTML =
      '<span class="tgts tgts-muted" style="--tgc:#64748b">' +
      '<span class="tgts-dot"></span><span>' + escapeHtml(text) + "</span></span>";
  }

  function score(el, coinType, attempt) {
    fetch(API + "?type=" + encodeURIComponent(coinType), {
      headers: { accept: "application/json" },
    })
      .then(function (r) {
        return r.json().catch(function () {
          return null;
        });
      })
      .then(function (d) {
        if (!d) {
          renderMuted(el, "unavailable");
          return;
        }
        if (typeof d.score === "number" && d.tier) {
          renderBadge(el, d);
          return;
        }
        if (d.status === "PENDING") {
          renderMuted(el, "scoring");
          if ((attempt || 0) < 6) {
            setTimeout(function () {
              score(el, coinType, (attempt || 0) + 1);
            }, 5000);
          }
          return;
        }
        if (d.code === "NOT_FOUND") {
          renderMuted(el, "not found");
          return;
        }
        renderMuted(el, "unknown");
      })
      .catch(function () {
        renderMuted(el, "unavailable");
      });
  }

  function scan(root) {
    injectStyles();
    var nodes = (root || document).querySelectorAll("[data-trustgate-coin]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute("data-tgts-done") === "1") continue;
      el.setAttribute("data-tgts-done", "1");
      var coinType = el.getAttribute("data-trustgate-coin");
      if (!coinType) continue;
      renderMuted(el, "scoring");
      score(el, coinType, 0);
    }
  }

  window.TrustGate = window.TrustGate || {};
  window.TrustGate.scan = scan;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      scan();
    });
  } else {
    scan();
  }
})();
