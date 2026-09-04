"use strict";
/* Aquarium water-change math. All state lives in the DOM; update() is total. */
var GAL_L = 3.78541, EPS = 1e-9;
var $ = function (id) { return document.getElementById(id); };
var unit = "gal"; // toggle state; bucket size follows it

function num(id, fb) {
  var v = parseFloat($(id).value);
  return (isFinite(v) && v > 0) ? v : fb;
}
function fmt(x) { // 2 decimals, trimmed ("13.70" -> "13.7", "5.00" -> "5")
  return String(Math.round(x * 100) / 100);
}
function band(p) {
  if (p <= 30) return ["g", "Safe weekly change",
    "Routine 10–30% changes hold nitrate under ~20 ppm without shocking livestock."];
  if (p <= 50) return ["y", "Deeper clean — watch parameters",
    "For stocked tanks or nitrate 20–40 ppm: test ammonia / nitrite / pH after, match temperature."];
  return ["r", "Emergency range — fish stress risk",
    "For nitrate crises only: match temperature, dechlorinate every bucket, " +
    "pour slowly, and never change filter media on the same day."];
}
function update() {
  var tank = num("tank", 0), pct = parseInt($("pct").value, 10) || 0;
  var bs = num("bsize", 0), have = parseInt($("bhave").value, 10) || 0;
  $("pct-out").textContent = pct + "%";
  $("pct-label").textContent = pct + "%";
  $("water").style.height = pct + "%";
  if (!tank || !bs || !have) {
    $("v-gal").textContent = "—"; $("v-l").textContent = "—";
    $("buckets").textContent = "Enter tank, bucket size and bucket count.";
    $("trips").textContent = ""; $("no3-out").textContent = "";
    $("badge").textContent = "—"; $("badge").className = "badge";
    $("warn").hidden = true;
    return;
  }
  var tankGal = unit === "gal" ? tank : tank / GAL_L;
  var bGal = unit === "gal" ? bs : bs / GAL_L;
  var vGal = tankGal * pct / 100, vL = vGal * GAL_L;
  $("v-gal").textContent = fmt(vGal);
  $("v-l").textContent = fmt(vL);
  var full = Math.floor(vGal / bGal + EPS), rem = vGal - full * bGal;
  var exact = rem < 0.005;
  var remUnit = unit === "gal" ? rem : rem * GAL_L;
  var bTxt;
  if (exact) {
    bTxt = "Exactly " + full + " full bucket" + (full === 1 ? "" : "s") + " — no partial.";
  } else if (full === 0) {
    bTxt = "Just 1 partial bucket (" + fmt(remUnit) + " " + unit + ") — no full bucket needed.";
  } else {
    bTxt = full + " full bucket" + (full === 1 ? "" : "s") +
      " + 1 partial bucket (" + fmt(remUnit) + " " + unit + ").";
  }
  $("buckets").textContent = bTxt;
  var need = full + (exact ? 0 : 1);
  var trips = Math.ceil(need / have);
  $("trips").textContent = trips <= 1
    ? "Fits in one trip with your " + have + " bucket" + (have === 1 ? "" : "s") + "."
    : "Needs " + trips + " trips with your " + have + " bucket" + (have === 1 ? "" : "s") + ".";
  var n = parseFloat($("no3").value), no3 = "";
  if (isFinite(n) && n >= 0) {
    no3 = "Nitrate after ≈ " + fmt(n * (1 - pct / 100)) + " ppm (dilution estimate).";
  }
  $("no3-out").textContent = no3;
  var b = band(pct);
  $("badge").textContent = b[1]; $("badge").className = "badge " + b[0];
  $("pct").className = b[0];
  $("warn").textContent = b[2]; $("warn").hidden = (b[0] !== "r");
}
function setUnit(u) {
  if (u === unit) return;
  // convert carried values so nothing is lost on toggle
  var t = parseFloat($("tank").value), s = parseFloat($("bsize").value);
  if (isFinite(t)) $("tank").value = u === "gal"
    ? Math.round(t / GAL_L * 100) / 100 : Math.round(t * GAL_L * 100) / 100;
  if (isFinite(s)) $("bsize").value = u === "gal"
    ? Math.round(s / GAL_L * 100) / 100 : Math.round(s * GAL_L * 100) / 100;
  if (u === "gal" && !$("bsize").value) $("bsize").value = 5;
  unit = u;
  $("u-gal").className = u === "gal" ? "on" : "";
  $("u-l").className = u === "l" ? "on" : "";
  $("tank-u").textContent = u; $("bsize-u").textContent = u;
  update();
}
["tank", "pct", "bsize", "bhave", "no3"].forEach(function (id) {
  $(id).addEventListener("input", update);
});
$("u-gal").addEventListener("click", function () { setUnit("gal"); });
$("u-l").addEventListener("click", function () { setUnit("l"); });
update();
