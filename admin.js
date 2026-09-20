const G = {
  owner: "", repo: "", token: "", branch: "main",
  products: [], config: {}, productSha: null, configSha: null, logoSha: null
};
const $ = id => document.getElementById(id);

function loadCreds() {
  G.owner = localStorage.getItem("gh_owner") || "";
  G.repo = localStorage.getItem("gh_repo") || "";
  G.token = localStorage.getItem("gh_token") || "";
  $("owner").value = G.owner;
  $("repo").value = G.repo;
  $("token").value = G.token;
}

async function api(path, opts = {}) {
  const r = await fetch("https://api.github.com/repos/" + G.owner + "/" + G.repo + "/contents/" + path, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + G.token,
      ...(opts.headers || {})
    }
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.message || ("GitHub HTTP " + r.status));
  return d;
}

async function getFile(path) {
  try { return await api(path); }
  catch (e) {
    if (e.message.includes("Not Found")) return null;
    throw e;
  }
}

async function readJson(path) {
  const f = await getFile(path);
  if (!f) return { data: null, sha: null };
  const txt = decodeURIComponent(escape(atob(f.content.replace(/\n/g, ""))));
  return { data: JSON.parse(txt), sha: f.sha };
}

function b64(bytes) {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk)
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
}

async function putText(path, text, message, sha) {
  const body = {
    message,
    content: b64(new TextEncoder().encode(text)),
    branch: G.branch
  };
  if (sha) body.sha = sha;
  return api(path, { method: "PUT", body: JSON.stringify(body) });
}

async function putImage(path, file, quality = 0.82) {
  const data = await compress(file, quality);
  const f = await getFile(path);
  const body = {
    message: "Atualizar imagem",
    content: b64(data),
    branch: G.branch
  };
  if (f) body.sha = f.sha;
  return api(path, { method: "PUT", body: JSON.stringify(body) });
}

async function compress(file, quality = 0.82) {
  return new Uint8Array(await new Promise((res, rej) => {
    const im = new Image();
    const u = URL.createObjectURL(file);
    im.onload = () => {
      const max = 1400;
      const s = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = Math.round(im.width * s);
      c.height = Math.round(im.height * s);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      c.toBlob(async blob => {
        if (!blob) return rej(Error("Falha ao comprimir imagem"));
        res(await blob.arrayBuffer());
      }, "image/jpeg", quality);
      URL.revokeObjectURL(u);
    };
    im.onerror = rej;
    im.src = u;
  }));
}

async function load() {
  const p = await readJson("products.json");
  const c = await readJson("config.json");
  G.products = p.data || [];
  G.productSha = p.sha;
  G.config = c.data || {};
  G.configSha = c.sha;
  render();
  $("storeName").value = G.config.storeName || "";
  $("subtitle").value = G.config.subtitle || "";
  $("whatsapp1").value = G.config.whatsapp1 || G.config.whatsapp || "";
  $("whatsapp2").value = G.config.whatsapp2 || "";
  $("seller1Name").value = G.config.seller1Name || "Vendedor 1";
  $("seller2Name").value = G.config.seller2Name || "Vendedor 2";
  $("primaryColor").value = G.config.primaryColor || "#FB675B";
  $("status").textContent = "Conectado ✓";
}

function render() {
  const el = $("products");
  el.innerHTML = G.products.map(p =>
    `<div class="item">
      <img src="${p.image}">
      <div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.theme || "")}</p>
      </div>
      <div class="actions">
        <button onclick="edit('${esc(p.id)}')">Editar</button>
        <button class="secondary" onclick="removeProduct('${esc(p.id)}')">Excluir</button>
      </div>
    </div>`
  ).join("") || "<p>Nenhum produto cadastrado.</p>";
}

window.edit = id => {
  const p = G.products.find(x => x.id === id);
  if (!p) return;
  $("pid").value = p.id;
  $("oldimage").value = p.image;
  $("title").value = p.title;
  $("theme").value = p.theme;
  $("description").value = p.description || "";
  scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" });
};

window.removeProduct = async id => {
  if (!confirm("Excluir este produto do catálogo?")) return;
  G.products = G.products.filter(p => p.id !== id);
  const r = await putText("products.json", JSON.stringify(G.products, null, 2), "Excluir produto", G.productSha);
  G.productSha = r.content.sha;
  render();
  alert("Produto excluído.");
};

$("connect").onclick = async () => {
  G.owner = $("owner").value.trim();
  G.repo = $("repo").value.trim();
  G.token = $("token").value.trim();
  if (!G.owner || !G.repo || !G.token) return alert("Preencha usuário, repositório e token.");
  localStorage.setItem("gh_owner", G.owner);
  localStorage.setItem("gh_repo", G.repo);
  localStorage.setItem("gh_token", G.token);
  try {
    await load();
    alert("Conectado!");
  } catch (e) {
    alert(e.message);
  }
};

$("product-form").onsubmit = async e => {
  e.preventDefault();
  if (!G.token) return alert("Conecte ao GitHub primeiro.");
  const id = $("pid").value || crypto.randomUUID();
  let image = $("oldimage").value;
  const file = $("photo").files[0];
  try {
    if (file) {
      const path = "assets/products/" + id + ".jpg";
      await putImage(path, file);
      image = path;
    }
    if (!image) return alert("Escolha uma foto.");
    const item = {
      id,
      title: $("title").value.trim(),
      theme: $("theme").value.trim(),
      image,
      description: $("description").value.trim()
    };
    const idx = G.products.findIndex(x => x.id === id);
    if (idx >= 0) G.products[idx] = item;
    else G.products.unshift(item);
    const r = await putText("products.json", JSON.stringify(G.products, null, 2), "Atualizar catálogo", G.productSha);
    G.productSha = r.content.sha;
    clearForm();
    render();
    alert("Produto publicado!");
  } catch (e) {
    alert("Erro: " + e.message);
  }
};

$("clear").onclick = clearForm;
function clearForm() {
  $("product-form").reset();
  $("pid").value = "";
  $("oldimage").value = "";
  $("preview").style.display = "none";
}

$("photo").onchange = e => {
  const f = e.target.files[0], im = $("preview");
  if (f) {
    im.src = URL.createObjectURL(f);
    im.style.display = "block";
  }
};

$("logo-file").onchange = e => {
  const f = e.target.files[0], im = $("logo-preview");
  if (f) {
    im.src = URL.createObjectURL(f);
    im.style.display = "block";
  }
};

$("save-logo").onclick = async () => {
  if (!G.token) return alert("Conecte ao GitHub primeiro.");
  const file = $("logo-file").files[0];
  if (!file) return alert("Escolha uma imagem de logo.");
  try {
    // save as PNG-compatible but we use jpeg compression for size; logo path is assets/logo.png
    // For better quality on logo, use higher quality and keep extension
    await putImage("assets/logo.png", file, 0.9);
    alert("Logo atualizada! Pode levar alguns instantes para aparecer no site.");
  } catch (e) {
    alert("Erro ao atualizar logo: " + e.message);
  }
};

$("saveconfig").onclick = async () => {
  try {
    G.config = {
      ...G.config,
      storeName: $("storeName").value.trim(),
      subtitle: $("subtitle").value.trim(),
      whatsapp1: $("whatsapp1").value.trim(),
      whatsapp2: $("whatsapp2").value.trim(),
      seller1Name: $("seller1Name").value.trim() || "Vendedor 1",
      seller2Name: $("seller2Name").value.trim() || "Vendedor 2",
      primaryColor: $("primaryColor").value.trim() || "#FB675B"
    };
    // remove old single whatsapp if present
    delete G.config.whatsapp;
    const r = await putText("config.json", JSON.stringify(G.config, null, 2), "Atualizar configurações da loja", G.configSha);
    G.configSha = r.content.sha;
    alert("Configurações salvas!");
  } catch (e) {
    alert(e.message);
  }
};

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])
  );
}

loadCreds();
if (G.token) load().catch(() => { $("status").textContent = "Credenciais precisam ser revisadas"; });
