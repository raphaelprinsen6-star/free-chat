let isGhostMode = false;
let activeContact = null;
let isLoginMode = true; // We starten op inloggen

let accounts = JSON.parse(localStorage.getItem('freechat_accounts')) || {};
let currentUser = JSON.parse(localStorage.getItem('freechat_current_session')) || null;
let chatHistory = JSON.parse(localStorage.getItem('freechat_history')) || {};

window.onload = function() {
    if (currentUser) showChatInterface();
};

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Inloggen" : "Aanmelden";
    document.getElementById('main-auth-btn').innerText = isLoginMode ? "Inloggen" : "Account Aanmaken";
    document.getElementById('switch-link').innerText = isLoginMode ? "Account aanmaken" : "Inloggen";
}

function handleAuth() {
    const name = document.getElementById('username').value.trim();
    const number = document.getElementById('usernumber').value.trim();

    if (!name || !number) return alert("Vul beide velden in!");

    if (isLoginMode) {
        // Controleren of NAAM en NUMMER overeenkomen
        if (accounts[number] && accounts[number] === name) {
            currentUser = { name, number };
            saveSession();
        } else {
            alert("Combinatie van naam en nummer is onjuist!");
        }
    } else {
        // Aanmelden
        if (accounts[number]) return alert("Dit nummer bestaat al!");
        accounts[number] = name;
        localStorage.setItem('freechat_accounts', JSON.stringify(accounts));
        currentUser = { name, number };
        saveSession();
    }
}

function saveSession() {
    localStorage.setItem('freechat_current_session', JSON.stringify(currentUser));
    showChatInterface();
    renderContacts();
}

function showChatInterface() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    document.getElementById('display-name').innerText = `${currentUser.name} (${currentUser.number})`;
}

// CONTACT TOEVOEGEN OP BASIS VAN ALLEEN NUMMER
function addContact() {
    const number = document.getElementById('new-contact').value.trim();
    if (number === "" || number === currentUser.number) return;

    // We maken de chat aan, ook als hij (nog) niet bestaat
    if (!chatHistory[number]) {
        chatHistory[number] = [];
    }
    
    saveToStorage();
    renderContacts();
    document.getElementById('new-contact').value = "";
}

function renderContacts() {
    const list = document.getElementById('contact-list');
    list.innerHTML = "";
    
    Object.keys(chatHistory).forEach(num => {
        const div = document.createElement('div');
        div.className = "contact-item";
        div.style.padding = "15px";
        div.style.borderBottom = "1px solid #eee";
        div.style.cursor = "pointer";
        
        // Controleer of nummer bestaat in accounts
        const exists = accounts[num] ? '<span class="status-tag exists">Bestaat</span>' : '<span class="status-tag not-exists">Onbekend</span>';
        const contactName = accounts[num] || "Onbekende Gebruiker";
        
        div.innerHTML = `<strong>${contactName}</strong><br><small>${num}</small> ${exists}`;
        
        div.onclick = () => {
            activeContact = num;
            renderMessages();
        };
        list.appendChild(div);
    });
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    if (!activeContact || input.value.trim() === "") return;

    const msg = {
        text: input.value,
        ghost: isGhostMode,
        sender: currentUser.number
    };

    chatHistory[activeContact].push(msg);
    saveToStorage();
    renderMessages();
    input.value = "";
}

function renderMessages() {
    const box = document.getElementById('message-box');
    box.innerHTML = "";
    if (!activeContact) return;

    document.getElementById('display-name').innerText = `Chat met ${accounts[activeContact] || activeContact}`;

    chatHistory[activeContact].forEach(msg => {
        const mDiv = document.createElement('div');
        mDiv.style.padding = "10px";
        mDiv.style.margin = "5px";
        mDiv.style.borderRadius = "10px";
        mDiv.style.alignSelf = "flex-end";
        mDiv.style.backgroundColor = msg.ghost ? "#334155" : "#0ea5e9";
        mDiv.style.color = "white";
        mDiv.innerHTML = msg.ghost ? `<i>👻 ${msg.text}</i>` : msg.text;
        box.appendChild(mDiv);
        
        if(msg.ghost) setTimeout(() => mDiv.remove(), 5000);
    });
    box.scrollTop = box.scrollHeight;
}

function saveToStorage() {
    localStorage.setItem('freechat_history', JSON.stringify(chatHistory));
}

function logout() {
    localStorage.removeItem('freechat_current_session');
    location.reload();
}
