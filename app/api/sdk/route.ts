import { NextResponse } from "next/server";

function jsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const host = url.searchParams.get("host") ?? url.origin; // куда слать события

  const apiKey = jsEscape(key);
  const apiHost = jsEscape(host);

  const code = `/*!
 * projecttt tracker (minimal)
 * Usage:
 *   <script src="${apiHost}/api/sdk?key=YOUR_KEY&host=${apiHost}"></script>
 */
(function(){
  var API_KEY = \`${apiKey}\`;
  var HOST = \`${apiHost}\`;
  if(!API_KEY){ console.warn("projecttt: missing key"); return; }

  function uid(){
    try{
      var k="projecttt_sid";
      var v=localStorage.getItem(k);
      if(!v){ v="sid_"+Math.random().toString(16).slice(2)+Date.now().toString(16); localStorage.setItem(k,v); }
      return v;
    }catch(e){ return "sid_"+Math.random().toString(16).slice(2); }
  }

  function device(){
    var w=window.innerWidth||1024;
    if(w<640) return "mobile";
    if(w<1024) return "tablet";
    return "desktop";
  }

  function send(type, meta){
    var payload = {
      sessionId: uid(),
      type: type,
      path: location.pathname + location.search,
      referrer: document.referrer || "direct",
      device: device(),
      country: "",
      metadata: meta || {}
    };

    try{
      navigator.sendBeacon
        ? navigator.sendBeacon(HOST+"/api/events", new Blob([JSON.stringify(payload)], {type:"application/json"}))
        : fetch(HOST+"/api/events", {
            method:"POST",
            headers: {"content-type":"application/json", "x-api-key": API_KEY},
            body: JSON.stringify(payload),
            keepalive: true
          }).catch(function(){});
    }catch(e){}
  }

  // Page view
  send("page_view", {title: document.title});

  // Clicks (light)
  document.addEventListener("click", function(e){
    var el = e.target;
    if(!el) return;
    var tag = (el.tagName||"").toLowerCase();
    var txt = (el.innerText||"").trim().slice(0,80);
    var href = el.href || (el.closest && el.closest("a") && el.closest("a").href) || "";
    send("click", {tag: tag, text: txt, href: href});
  }, {capture:true});

  // Form submit
  document.addEventListener("submit", function(e){
    var f = e.target;
    if(!f) return;
    send("form_submit", {id: f.id || "", name: f.name || ""});
  }, {capture:true});

})();`;

  return new NextResponse(code, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}