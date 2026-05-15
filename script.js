const N8N_WEBHOOK_URL = "https://n8n.therightdot.com/webhook/seasons";

// ── MODALS ──
function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "";
}
function closeModalOutside(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.open").forEach(function(m) {
      m.classList.remove("open");
    });
    document.body.style.overflow = "";
  }
});

// ── CLIPBOARD ──
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(function() {
    var original = btn.textContent;
    btn.textContent = "Copiato!";
    btn.style.background = "var(--cyan)";
    showToast();
    setTimeout(function() {
      btn.textContent = original;
      btn.style.background = "";
    }, 2000);
  });
}

function showToast() {
  var toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 2200);
}

// ── PHONE: only digits and + ──
var phoneInput = document.getElementById("telefono");
if (phoneInput) {
  phoneInput.addEventListener("input", function() {
    var cursor = this.selectionStart;
    var cleaned = this.value.replace(/[^+\d\s]/g, "");
    // + only allowed at start
    cleaned = cleaned.replace(/(?!^)\+/g, "");
    if (cleaned !== this.value) {
      this.value = cleaned;
      this.setSelectionRange(cursor - 1, cursor - 1);
    }
  });
  phoneInput.addEventListener("keydown", function(e) {
    var allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"];
    if (allowed.includes(e.key)) return;
    if (e.key === "+" && this.selectionStart === 0) return;
    if (/^\d$/.test(e.key)) return;
    if (e.key === " ") return;
    e.preventDefault();
  });
}

// ── FORM SUBMISSION ──
var form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var valid = validateForm();
    if (!valid) return;

    var submitBtn = form.querySelector(".submit-btn");
    submitBtn.textContent = "Invio in corso...";
    submitBtn.disabled = true;

    var payload = {
      nome: document.getElementById("nome").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      email: document.getElementById("email").value.trim(),
      timestamp: new Date().toISOString()
    };

    fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(function() {}).finally(function() {
      form.classList.add("hidden");
      document.getElementById("success-msg").classList.remove("hidden");
    });
  });
}

function validateForm() {
  var ok = true;

  var nome = document.getElementById("nome");
  var errNome = document.getElementById("err-nome");
  if (!nome.value.trim() || nome.value.trim().length < 2) {
    errNome.textContent = "Il nome è obbligatorio.";
    nome.classList.add("invalid");
    ok = false;
  } else {
    errNome.textContent = "";
    nome.classList.remove("invalid");
  }

  var email = document.getElementById("email");
  var errEmail = document.getElementById("err-email");
  var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  if (!emailOk) {
    errEmail.textContent = "Inserisci un'email valida.";
    email.classList.add("invalid");
    ok = false;
  } else {
    errEmail.textContent = "";
    email.classList.remove("invalid");
  }

  var privacy = document.getElementById("privacy");
  var errPrivacy = document.getElementById("err-privacy");
  if (!privacy.checked) {
    errPrivacy.textContent = "Devi accettare la Privacy Policy per continuare.";
    ok = false;
  } else {
    errPrivacy.textContent = "";
  }

  return ok;
}

// Clear errors on input
["nome", "email"].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener("input", function() {
    document.getElementById("err-" + id).textContent = "";
    el.classList.remove("invalid");
  });
});
document.getElementById("privacy").addEventListener("change", function() {
  document.getElementById("err-privacy").textContent = "";
});
