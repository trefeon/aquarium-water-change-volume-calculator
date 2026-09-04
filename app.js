"use strict";
/* Aquarium water-change math. All state lives in the DOM; update() is total. */
var GAL_L = 3.78541, EPS = 1e-9;
var $ = function (id) { return document.getElementById(id); };
var unit = "gal"; // toggle state; bucket size follows it
var FIELDS = ["tank", "pct", "bsize", "bhave", "no3"];

function num(id, fb) {
  var v = parseFloat($(id).value);
  return (isFinite(v) && v > 0) ? v : fb;
}
function fmt(x) { // 2 decimals, trimmed ("13.70" -> "13.7", "5.00" -> "5")
  return String(Math.round(x * 100) / 100);
}
function band(p) {
  if (p <= 30) return ["g", "Safe weekly change (10–30%)",
    "Routine safe weekly change: Maintains good water parameters and keeps nitrates low without stressing fish."];
  if (p <= 50) return ["y", "Deeper clean (31–50%)",
    "Deeper clean: Suitable for heavily stocked tanks or reducing elevated nitrates. Test parameters and match temperature."];
  return ["r", "Emergency change (51–90%)",
    "Fish stress warning: 51–90% is an emergency water change. Large shifts cause severe osmotic and temperature shock. Match water temperature carefully, dechlorinate every bucket, pour slowly, and avoid cleaning filter media on the same day."];
}
function save() { // routine tool: remember last setup across visits
  try {
    var s = { u: unit };
    FIELDS.forEach(function (id) { s[id] = $(id).value; });
    localStorage.setItem("aqa", JSON.stringify(s));
  } catch (e) {}
}
function load() {
  try {
    var s = JSON.parse(localStorage.getItem("aqa") || "null");
    if (!s) return;
    if (s.u === "l" || s.u === "gal") unit = s.u;
    FIELDS.forEach(function (id) {
      if (s[id] !== undefined && s[id] !== "") $(id).value = s[id];
    });
    $("u-gal").className = unit === "gal" ? "on" : "";
    $("u-gal").setAttribute("aria-pressed", unit === "gal" ? "true" : "false");
    $("u-l").className = unit === "l" ? "on" : "";
    $("u-l").setAttribute("aria-pressed", unit === "l" ? "true" : "false");
    $("tank-u").textContent = unit; $("bsize-u").textContent = unit;
  } catch (e) {}
}
function update() {
  var tank = num("tank", 0), pct = parseInt($("pct").value, 10) || 0;
  var bs = num("bsize", 0), have = parseInt($("bhave").value, 10) || 0;
  $("pct-out").textContent = pct + "%";
  $("pct-label").textContent = pct + "% to remove";
  $("pct").setAttribute("aria-valuenow", pct);
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
    bTxt = full + " full bucket" + (full === 1 ? "" : "s") + " needed (exact — no partial bucket leftover).";
  } else {
    bTxt = full + " full bucket" + (full === 1 ? "" : "s") + " needed + 1 partial bucket (" + fmt(remUnit) + " " + unit + " leftover).";
  }
  $("buckets").textContent = bTxt;
  var need = full + (exact ? 0 : 1);
  var trips = Math.ceil(need / have);
  $("trips").textContent = trips <= 1
    ? "Fits in 1 trip with your " + have + " planned bucket" + (have === 1 ? "" : "s") + "."
    : "Requires " + trips + " trips with your " + have + " planned bucket" + (have === 1 ? "" : "s") + ".";
  var n = parseFloat($("no3").value), no3 = "";
  if (isFinite(n) && n >= 0) {
    no3 = "Nitrate after ≈ " + fmt(n * (1 - pct / 100)) + " ppm (dilution estimate).";
  }
  $("no3-out").textContent = no3;
  var b = band(pct);
  $("badge").textContent = b[1]; $("badge").className = "badge " + b[0];
  $("pct").className = b[0];
  $("warn").textContent = b[2]; $("warn").hidden = false;
  $("warn").className = b[0] === "r" ? "warn" : "info";
  save();
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
  $("u-gal").setAttribute("aria-pressed", u === "gal" ? "true" : "false");
  $("u-l").className = u === "l" ? "on" : "";
  $("u-l").setAttribute("aria-pressed", u === "l" ? "true" : "false");
  $("tank-u").textContent = u; $("bsize-u").textContent = u;
  update();
}
FIELDS.forEach(function (id) {
  $(id).addEventListener("input", update);
});
$("u-gal").addEventListener("click", function () { setUnit("gal"); });
$("u-l").addEventListener("click", function () { setUnit("l"); });
load();
update();
