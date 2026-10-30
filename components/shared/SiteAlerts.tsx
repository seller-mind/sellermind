const SNIPPET = "(function(){\n  var E=\"https://alerts.saaslaunch.dev/report\";\n  var S=document.documentElement.getAttribute(\"data-alert-site\")||\"unknown\";\n  var N=0;\n  function P(o){if(N>15)return;try{o.site=S;o.ua=navigator.userAgent;var b=JSON.stringify(o);\n    if(navigator.sendBeacon){navigator.sendBeacon(E,new Blob([b],{type:\"application/json\"}))}\n    else{fetch(E,{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:b,keepalive:true})}N++}catch(e){}}\n  window.addEventListener(\"error\",function(e){\n    var t=e.target;\n    if(t&&t!==window&&(t.tagName===\"IMG\"||t.tagName===\"SCRIPT\"||t.tagName===\"LINK\")){\n      P({type:\"resource\",message:\"failed to load \"+t.tagName+\" \"+String(t.src||t.href||\"\").slice(0,300),url:location.href});\n      return;}\n    P({type:\"error\",message:String(e.message||\"script error\").slice(0,600),\n       stack:e.error&&e.error.stack?String(e.error.stack).slice(0,1500):\"\",url:location.href});\n  },true);\n  window.addEventListener(\"unhandledrejection\",function(e){\n    var r=e.reason;\n    P({type:\"promise\",message:String((r&&r.message)||r||\"unhandled rejection\").slice(0,600),\n       stack:r&&r.stack?String(r.stack).slice(0,1500):\"\",url:location.href});\n  });\n  var F=window.fetch;\n  if(F){window.fetch=function(){\n    var a=arguments,u=\"\";\n    try{u=typeof a[0]===\"string\"?a[0]:(a[0]&&a[0].url)||\"\"}catch(e){}\n    return F.apply(this,a).then(function(res){\n      try{if(res&&res.status>=400&&/checkout|billing|subscription|payment|dodo|api/i.test(u)){\n        P({type:\"payment\",message:\"HTTP \"+res.status+\" \"+String(u).slice(0,300),url:location.href});}}catch(e){}\n      return res;});\n  }}\n  window.reportIssue=function(note,email){\n    P({type:\"feedback\",message:\"user feedback\",note:String(note||\"\").slice(0,800),email:String(email||\"\"),url:location.href});\n  };\n})();";

export function SiteAlerts() {
  return <script dangerouslySetInnerHTML={{ __html: SNIPPET }} />;
}

declare global {
  interface Window {
    reportIssue?: (note: string, email?: string) => void;
  }
}
