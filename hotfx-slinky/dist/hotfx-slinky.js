var Q = Object.defineProperty;
var C = (e) => {
  throw TypeError(e);
};
var U = (e, t, r) => t in e ? Q(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var P = (e, t, r) => U(e, typeof t != "symbol" ? t + "" : t, r), V = (e, t, r) => t.has(e) || C("Cannot " + r);
var q = (e, t, r) => t.has(e) ? C("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r);
var y = (e, t, r) => (V(e, t, "access private method"), r);
function E(e, t, r) {
  e.prototype = t.prototype = r, r.constructor = e;
}
function j(e, t) {
  var r = Object.create(e.prototype);
  for (var i in t) r[i] = t[i];
  return r;
}
function p() {
}
var b = 0.7, k = 1 / b, d = "\\s*([+-]?\\d+)\\s*", g = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", x = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", W = /^#([0-9a-f]{3,8})$/, X = new RegExp(`^rgb\\(${d},${d},${d}\\)$`), Z = new RegExp(`^rgb\\(${x},${x},${x}\\)$`), ee = new RegExp(`^rgba\\(${d},${d},${d},${g}\\)$`), te = new RegExp(`^rgba\\(${x},${x},${x},${g}\\)$`), re = new RegExp(`^hsl\\(${g},${x},${x}\\)$`), ie = new RegExp(`^hsla\\(${g},${x},${x},${g}\\)$`), T = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
E(p, R, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: L,
  // Deprecated! Use color.formatHex.
  formatHex: L,
  formatHex8: ne,
  formatHsl: ae,
  formatRgb: _,
  toString: _
});
function L() {
  return this.rgb().formatHex();
}
function ne() {
  return this.rgb().formatHex8();
}
function ae() {
  return z(this).formatHsl();
}
function _() {
  return this.rgb().formatRgb();
}
function R(e) {
  var t, r;
  return e = (e + "").trim().toLowerCase(), (t = W.exec(e)) ? (r = t[1].length, t = parseInt(t[1], 16), r === 6 ? D(t) : r === 3 ? new f(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : r === 8 ? w(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : r === 4 ? w(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = X.exec(e)) ? new f(t[1], t[2], t[3], 1) : (t = Z.exec(e)) ? new f(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = ee.exec(e)) ? w(t[1], t[2], t[3], t[4]) : (t = te.exec(e)) ? w(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = re.exec(e)) ? S(t[1], t[2] / 100, t[3] / 100, 1) : (t = ie.exec(e)) ? S(t[1], t[2] / 100, t[3] / 100, t[4]) : T.hasOwnProperty(e) ? D(T[e]) : e === "transparent" ? new f(NaN, NaN, NaN, 0) : null;
}
function D(e) {
  return new f(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function w(e, t, r, i) {
  return i <= 0 && (e = t = r = NaN), new f(e, t, r, i);
}
function fe(e) {
  return e instanceof p || (e = R(e)), e ? (e = e.rgb(), new f(e.r, e.g, e.b, e.opacity)) : new f();
}
function se(e, t, r, i) {
  return arguments.length === 1 ? fe(e) : new f(e, t, r, i ?? 1);
}
function f(e, t, r, i) {
  this.r = +e, this.g = +t, this.b = +r, this.opacity = +i;
}
E(f, se, j(p, {
  brighter(e) {
    return e = e == null ? k : Math.pow(k, e), new f(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? b : Math.pow(b, e), new f(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new f(c(this.r), c(this.g), c(this.b), A(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: I,
  // Deprecated! Use color.formatHex.
  formatHex: I,
  formatHex8: oe,
  formatRgb: O,
  toString: O
}));
function I() {
  return `#${h(this.r)}${h(this.g)}${h(this.b)}`;
}
function oe() {
  return `#${h(this.r)}${h(this.g)}${h(this.b)}${h((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function O() {
  const e = A(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${c(this.r)}, ${c(this.g)}, ${c(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function A(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function c(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function h(e) {
  return e = c(e), (e < 16 ? "0" : "") + e.toString(16);
}
function S(e, t, r, i) {
  return i <= 0 ? e = t = r = NaN : r <= 0 || r >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new l(e, t, r, i);
}
function z(e) {
  if (e instanceof l) return new l(e.h, e.s, e.l, e.opacity);
  if (e instanceof p || (e = R(e)), !e) return new l();
  if (e instanceof l) return e;
  e = e.rgb();
  var t = e.r / 255, r = e.g / 255, i = e.b / 255, n = Math.min(t, r, i), o = Math.max(t, r, i), a = NaN, s = o - n, m = (o + n) / 2;
  return s ? (t === o ? a = (r - i) / s + (r < i) * 6 : r === o ? a = (i - t) / s + 2 : a = (t - r) / s + 4, s /= m < 0.5 ? o + n : 2 - o - n, a *= 60) : s = m > 0 && m < 1 ? 0 : a, new l(a, s, m, e.opacity);
}
function M(e, t, r, i) {
  return arguments.length === 1 ? z(e) : new l(e, t, r, i ?? 1);
}
function l(e, t, r, i) {
  this.h = +e, this.s = +t, this.l = +r, this.opacity = +i;
}
E(l, M, j(p, {
  brighter(e) {
    return e = e == null ? k : Math.pow(k, e), new l(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? b : Math.pow(b, e), new l(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, r = this.l, i = r + (r < 0.5 ? r : 1 - r) * t, n = 2 * r - i;
    return new f(
      H(e >= 240 ? e - 240 : e + 120, n, i),
      H(e, n, i),
      H(e < 120 ? e + 240 : e - 120, n, i),
      this.opacity
    );
  },
  clamp() {
    return new l(B(this.h), $(this.s), $(this.l), A(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = A(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${B(this.h)}, ${$(this.s) * 100}%, ${$(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function B(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function $(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function H(e, t, r) {
  return (e < 60 ? t + (r - t) * e / 60 : e < 180 ? r : e < 240 ? t + (r - t) * (240 - e) / 60 : t) * 255;
}
const F = (e) => () => e;
function J(e, t) {
  return function(r) {
    return e + r * t;
  };
}
function le(e, t) {
  var r = t - e;
  return r ? J(e, r > 180 || r < -180 ? r - 360 * Math.round(r / 360) : r) : F(isNaN(e) ? t : e);
}
function v(e, t) {
  var r = t - e;
  return r ? J(e, r) : F(isNaN(e) ? t : e);
}
function Y(e) {
  return function(t, r) {
    var i = e((t = M(t)).h, (r = M(r)).h), n = v(t.s, r.s), o = v(t.l, r.l), a = v(t.opacity, r.opacity);
    return function(s) {
      return t.h = i(s), t.s = n(s), t.l = o(s), t.opacity = a(s), t + "";
    };
  };
}
const xe = Y(le);
var he = Y(v);
const G = document.createElement("template");
G.innerHTML = `
  <style>
    :host {
      position: relative;
    }

    :first-child {
      position: relative;
    }

    * {
      position: absolute;
      top: 0;
      margin: 0;
      color: var(--color);
      z-index: calc(var(--length) - var(--index));
      left: calc(var(--index) * var(--horizontal-offset, 1px));
      -webkit-text-stroke: 1px black;
      text-shadow: 4px 4px 3px rgba(0, 0, 0, .2);
      animation:
        bounce
        var(--speed, 1.5s)
        calc(var(--index) * var(--delay, 50ms))
        ease-in-out
        infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: translateY(var(--vertical-offset, 100%))
      }
    }
  </style>
`;
var u, N;
class K extends HTMLElement {
  constructor() {
    super();
    q(this, u);
    this.attachShadow({ mode: "open" }), y(this, u, N).call(this), new MutationObserver(() => y(this, u, N).call(this)).observe(
      this,
      { subtree: !0, childList: !0, characterData: !0 }
    );
  }
  attributeChangedCallback() {
    y(this, u, N).call(this);
  }
  get stops() {
    if (this.hasAttribute("colors"))
      return JSON.parse(this.getAttribute("colors"));
    if (this.hasAttribute("n")) {
      if (/\D/.test(this.getAttribute("n")))
        throw TypeError(`Invalid n attribute for <hotfx-slinky>: "${this.getAttribute("n")}". Expected a positive integer.`);
      const r = parseInt(this.getAttribute("n") || 1);
      if (this.hasAttribute("color-start") && this.hasAttribute("color-end")) {
        this.hasAttribute("interpolate-long");
        const n = (this.hasAttribute("interpolate-long") ? he : xe)(
          this.getAttribute("color-start"),
          this.getAttribute("color-end")
        );
        return Array(r).fill().map((o, a) => n(a / (r - 1)));
      }
      return Array(r).fill();
    }
    return ["white", "#D49C3D", "#D14B3D", "#CF52EB", "#44A3F7", "#5ACB3C", "#DEBF40"];
  }
}
u = new WeakSet(), N = function() {
  this.style.setProperty("--length", this.stops.length);
  const r = Array.from(this.children).find((n) => n.tagName != "TEMPLATE");
  this.shadowRoot.innerHTML = "", this.shadowRoot.append(
    ...this.stops.map((n, o) => {
      const a = r.cloneNode(!0);
      return n && a.style.setProperty("--color", n), a.setAttribute("part", "copy"), a.style.setProperty("--index", o), a;
    })
  );
  const i = Array.from(this.children).find(
    (n) => n.tagName == "TEMPLATE"
  ) || G;
  this.shadowRoot.appendChild(i.content.cloneNode(!0));
}, P(K, "observedAttributes", ["n", "color-start", "color-end", "interpolate-long"]);
customElements.define("hotfx-slinky", K);
