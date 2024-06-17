

export default function animate(tween) {
  tween.startTime = performance.now();
  tween.active = true;

  let tick = (time) => {

    // lets it be cancelled
    if (!tween.active)
      return;

    // tween.time is number between 0 and 1 which is pct complete
    tween.time = (time - tween.startTime) / tween.duration;
    tween.time = Math.min(1, Math.max(0, tween.time));

    try {
      tween.tick(tween.time);
    }
    catch (e) {
      console.error(e);
    }

    // continue animating
    if (tween.time < 1)
      requestAnimationFrame(tick);
    // complete callback
    else {
      tween.active = false;
      if (tween.done) 
        tween.done();
    }

  };

  requestAnimationFrame(tick);

  tween.cancel = () => { tween.active = false; };

  return tween;
};




function curry(fn, ...args) {
  if (args.length >= fn.length)
    return fn.call(this, ...args);
  return curry.bind(this, fn, ...args);
};


/*

cheat sheet:
  http://easings.net/

article: 
  http://upshots.org/actionscript/jsas-understanding-easing

source:
 https://github.com/danro/jquery-easing/blob/master/jquery.easing.js

*/

// the major change here is I curried them and removed the duration parameter
// so time comes in as value between 0 and 1. I did that but I haven't actually
// tested anything. WORK IN PROGRESS

// D3 does it like this where the function takes just one argument which is
// time between 0 and 1 and returns value between 0 and 1

// https://github.com/d3/d3-ease/blob/master/src/cubic.js

// ours return real values but take time as between 0 and 1

// b: begInnIng value, e: endValue, t: time progress as %

export const quadIn = curry((b, e, t) => {
  return (e-b)*t*t + b;
});

export const quadOut = curry((b, e, t) => {
  return -(e-b) *t*(t-2) + b;
});

export const quadInOut = curry((b, e, t) => {
  if ((t/=2) < 1) return (b - e)/2*t*t + b;
  return -(e-b)/2 * ((--t)*(t-2) - 1) + b;
});

export const cubicIn = curry((b, e, t) => {
  return (e-b)*t*t*t + b;
});

export const cubicOut = curry((b, e, t) => {
  return (e-b)*((t-=1)*t*t + 1) + b;
});

export const cubicInOut = curry((b, e, t) => {
  if ((t/=2) < 1) return (e-b)/2*t*t*t + b;
  return (e-b)/2*((t-=2)*t*t + 2) + b;
});


export const quartIn = curry((b, e, t) => {
  return (e-b)*t*t*t*t + b;
});

export const quartOut = curry((b, e, t) => {
  return -(e-b) * ((t-=1)*t*t*t - 1) + b;
});

export const quartInOut = curry((b, e, t) => {
  if ((t/2) < 1) return (e-b)/2*t*t*t*t + b;
  return -(e-b)/2 * ((t-=2)*t*t*t - 2) + b;
});

export const quintIn = curry((b, e, t) => {
  return (e-b)*t*t*t*t*t + b;
});

export const quintOut = curry((b, e, t) => {
  return (e-b)*((t-=1)*t*t*t*t + 1) + b;
});

export const quintInOut = curry((b, e, t) => {
  if ((t/=2) < 1) return (e-b)/2*t*t*t*t*t + b;
  return (e-b)/2*((t-=2)*t*t*t*t + 2) + b;
});

export const sineIn = curry((b, e, t) => {
  return -(e-b) * Math.cos(t * (Math.PI/2)) + (e-b) + b;
});

export const sineOut = curry((b, e, t) => {
  return (e-b) * Math.sin(t * (Math.PI/2)) + b;
});

export const sineInOut = curry((b, e, t) => {
  return -(e-b)/2 * (Math.cos(Math.PI*t) - 1) + b;
});

export const expoIn = curry((b, e, t) => {
  return (t==0) ? b : (e-b) * Math.pow(2, 10 * (t - 1)) + b;
});

export const expoOut = curry((b, e, t) => {
  return (t==1) ? e : (e-b) * (-Math.pow(2, -10 * t) + 1) + b;
});

export const expoInOut = curry((b, e, t) => {
  if (t==0) return b;
  if (t==1) return e;
  if ((t/=2) < 1) return (e-b)/2 * Math.pow(2, 10 * (t - 1)) + b;
  return (e-b)/2 * (-Math.pow(2, -10 * --t) + 2) + b;
});

export const circIn = curry((b, e, t) => {
  return -(e-b) * (Math.sqrt(1 - t*t) - 1) + b;
});

export const circOut = curry((b, e, t) => {
  return (e-b) * Math.sqrt(1 - (t-=1)*t) + b;
});

export const circInOut = curry((b, e, t) => {
  if ((t/=2) < 1) return -(e-b)/2 * (Math.sqrt(1 - t*t) - 1) + b;
  return (e-b)/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
});


// (e-b)ould in(e-b)lude options for period and amplitude like d3.  Although it gets
// (e-b)onfusing with currying....

export const elasticIn = curry((b, e, t) => {
  var s=1.70158;var p=0;var a=(e-b);
  if (t==0) return b;  if (t==1) return e;  if (!p) p=.3;
  if (a < Math.abs(e-b)) { a=e-b; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin ((e-b)/a);
  //return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
  return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p)) + b;
});

export const elasticOut = curry((b, e, t) => {
  var s=1.70158; var p=0; var a=e-b;
  if (t==0) return b;
  if (t==1) return e;
  if (!p) p=.3;
  if (a < Math.abs((e-b))) { a=(e-b); var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin ((e-b)/a);
  // not sure if just removing D here is correct... confusing
  // return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + (e-b) + b;
  return a*Math.pow(2,-10*t) * Math.sin( (t-s)*(2*Math.PI)/p ) + e;
});

export const elasticInOut = curry((b, e, t) => {
  var s=1.70158;var p=0;var a=(e-b);
  if (t==0) return b;  if ((t/=2)==2) return e;  if (!p) p=(.3*1.5);
  if (a < Math.abs(e-b)) { a=(e-b); var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin ((e-b)/a);
  // same as above re duration:
  //if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  //return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + (e-b) + b;
  if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p )) + b;
  return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p )*.5 + (e-b) + b;
});

export const backIn = curry((b, e, s, t) => {
  if (s == undefined) s = 1.70158;
  return (e-b)*t*t*((s+1)*t - s) + b;
});

export const backOut = curry((b, e, s, t) => {
  if (s == undefined) s = 1.70158;
  return (e-b)*((t-=1)*t*((s+1)*t + s) + 1) + b;
});

export const backInOut = curry((b, e, s, t) => {
  if (s == undefined) s = 1.70158; 
  if ((t/=2) < 1) return (e-b)/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
  return (e-b)/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
});

// okay super confused about how to remove D in these so just commenting them out
// export const bounceIn = curry((b, c, t) => {
//   return c - bounceOut(d-t, 0, c, d) + b;
// });

// export const bounceOut = curry((b, c, t) => {
//   if (t < (1/2.75)) {
//     return c*(7.5625*t*t) + b;
//   } else if (t < (2/2.75)) {
//     return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
//   } else if (t < (2.5/2.75)) {
//     return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
//   } else {
//     return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
//   }
// });

// export const bounceInOut = curry((b, c, t) => {
//   if (t < 0.5) return bounceIn(t*2, 0, c, d) * .5 + b;
//   return bounceOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
// });



// copies them into default export

Object.assign(animate,
{
  quadIn,    quadOut,    quadInOut,
  cubicIn,   cubicOut,   cubicInOut,
  quartIn,   quartOut,   quartInOut,
  quintIn,   quintOut,   quintInOut,
  sineIn,    sineOut,    sineInOut,
  expoIn,    expoOut,    expoInOut,
  circIn,    circOut,    circInOut,
  elasticIn, elasticOut, elasticInOut,
  backIn,    backOut,    backInOut,
//  bounceIn,  bounceOut,  bounceIn,
});
