"use strict";
/* Aquarium Water Change Volume Calculator — Pure front-end widget math */
var GAL_L = 3.78541, EPS = 1e-9;
var $ = function (id) { return document.getElementById(id); };
var unit = "gal";
var FIELDS = ["tank", "pct", "bsize", "bhave"];

function num(id, fb) {
  var v = parseFloat($(id).value);
  return (isFinite(v) && v > 0) ? v : fb;
}

function fmt(x) {
  return String(Math.round(x * 100) / 100);
}

function band(p) {
  if (p <= 30) {
    return ["g", "Safe weekly change (10–30%)", ""];
  }
  if (p <= 50) {
    return ["y", "Deeper clean (31–50%)", ""];
  }
  return [
    "r",
    "Emergency change (51–90%)",
    "Fish stress warning: Large water changes (51–90%) cause sudden osmotic and temperature shifts. Match water temperature carefully, dechlorinate every bucket, pour slowly, and avoid cleaning filter media on the same day."
  ];
}

function save() {
  try {
    var s = { u: unit };
    FIELDS.forEach(function (id) { s[id] = $(id).value; });
    localStorage.setItem("aqa_widget", JSON.stringify(s));
  } catch (e) {}
}

function load() {
  try {
    var s = JSON.parse(localStorage.getItem("aqa_widget") || "null");
    if (!s) return;
    if (s.u === "l" || s.u === "gal") unit = s.u;
    FIELDS.forEach(function (id) {
      if (s[id] !== undefined && s[id] !== "") $(id).value = s[id];
    });
    syncUnits();
  } catch (e) {}
}

function syncUnits() {
  $("u-gal").className = unit === "gal" ? "on" : "";
  $("u-gal").setAttribute("aria-pressed", unit === "gal" ? "true" : "false");
  $("u-l").className = unit === "l" ? "on" : "";
  $("u-l").setAttribute("aria-pressed", unit === "l" ? "true" : "false");
  $("tank-u").textContent = unit;
  $("bsize-u").textContent = unit;
  updateTankChips();
}

function updateTankChips() {
  var vals = unit === "gal" ? [10, 20, 40, 55, 75] : [30, 60, 120, 200, 300];
  var btns = document.querySelectorAll("#tank-chips button");
  btns.forEach(function (b, i) {
    if (vals[i] !== undefined) {
      b.dataset.val = vals[i];
      b.textContent = vals[i] + " " + unit;
    }
  });
}

function update() {
  var tank = num("tank", 0), pct = parseInt($("pct").value, 10) || 0;
  var bs = num("bsize", 0), have = parseInt($("bhave").value, 10) || 0;

  $("pct-out").textContent = pct + "%";
  $("pct-label").textContent = "▲ " + pct + "% water to remove";
  $("pct").setAttribute("aria-valuenow", pct);
  if ($("water-void")) $("water-void").style.height = pct + "%";
  $("water").style.height = (100 - pct) + "%";

  if (!tank || !bs || !have) {
    $("v-gal").textContent = "—";
    $("v-l").textContent = "—";
    $("buckets").textContent = "Please enter valid tank size, bucket size, and bucket count.";
    $("trips").textContent = "";
    $("badge").textContent = "—";
    $("badge").className = "badge";
    $("warn").hidden = true;
    return;
  }

  var tankGal = unit === "gal" ? tank : tank / GAL_L;
  var bGal = unit === "gal" ? bs : bs / GAL_L;
  var vGal = tankGal * pct / 100;
  var vL = vGal * GAL_L;

  $("v-gal").textContent = fmt(vGal);
  $("v-l").textContent = fmt(vL);

  var full = Math.floor(vGal / bGal + EPS);
  var rem = vGal - full * bGal;
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

  var b = band(pct);
  $("badge").textContent = b[1];
  $("badge").className = "badge " + b[0];
  $("pct").className = b[0];

  if (b[0] === "r") {
    $("warn").textContent = b[2];
    $("warn").hidden = false;
  } else {
    $("warn").hidden = true;
  }

  save();
}

function setUnit(u) {
  if (u === unit) return;
  var t = parseFloat($("tank").value), s = parseFloat($("bsize").value);
  if (isFinite(t)) {
    $("tank").value = u === "gal" ? Math.round(t / GAL_L * 100) / 100 : Math.round(t * GAL_L * 100) / 100;
  }
  if (isFinite(s)) {
    $("bsize").value = u === "gal" ? Math.round(s / GAL_L * 100) / 100 : Math.round(s * GAL_L * 100) / 100;
  }
  if (u === "gal" && !$("bsize").value) $("bsize").value = 5;
  unit = u;
  syncUnits();
  update();
}

FIELDS.forEach(function (id) {
  $(id).addEventListener("input", update);
});

$("u-gal").addEventListener("click", function () { setUnit("gal"); });
$("u-l").addEventListener("click", function () { setUnit("l"); });

document.querySelectorAll("#tank-chips button").forEach(function (btn) {
  btn.addEventListener("click", function () {
    $("tank").value = this.dataset.val;
    update();
  });
});

load();
syncUnits();
update();
