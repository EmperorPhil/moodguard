  const chatbox = document.getElementById('chatbox');
  const sidebar = document.getElementById('sidebar');

  let chatHistory = JSON.parse(localStorage.getItem('moodguardChats')) || [];

  function displayMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerText = text;
    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (text === '') return;

  displayMessage('user', text);
  chatHistory.push({ sender: 'user', text });
  localStorage.setItem('moodguardChats', JSON.stringify(chatHistory));

  input.value = '';

  // ✅ Hugging Face API request
  fetch('https://api-inference.huggingface.co/models/google/flan-t5-small', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: text })
  })
  .then(res => res.json())
  .then(data => {
    let replyText = '';

    if (Array.isArray(data) && data[0].generated_text) {
      replyText = data[0].generated_text;
    } else if (data.error) {
      replyText = "Sorry — Lumi couldn't get a reply right now.";
    } else {
      replyText = "Hmm... I didn't quite get that. Could you try again?";
    }

    displayMessage('lumi', replyText);
    chatHistory.push({ sender: 'lumi', text: replyText });
    localStorage.setItem('moodguardChats', JSON.stringify(chatHistory));
  })
  .catch(() => {
    displayMessage('lumi', "I'm here for you ❤️");
    chatHistory.push({ sender: 'lumi', text: "I'm here for you ❤️" });
    localStorage.setItem('moodguardChats', JSON.stringify(chatHistory));
  });
}

  function startNewChat() {
    let savedChats = JSON.parse(localStorage.getItem('savedConversations')) || [];
    savedChats.push(chatHistory);
    localStorage.setItem('savedConversations', JSON.stringify(savedChats));
    chatHistory = [];
    localStorage.setItem('moodguardChats', JSON.stringify([]));
    chatbox.innerHTML = '';
    loadChatList();
  }

  function loadChatList() {
    sidebar.innerHTML = '';
    const savedChats = JSON.parse(localStorage.getItem('savedConversations')) || [];
    savedChats.forEach((chat, index) => {
      const btn = document.createElement('button');
      btn.textContent = `Chat #${index + 1}`;
      btn.onclick = () => viewChat(chat);
      sidebar.appendChild(btn);
    });
  }

  function viewChat(chat) {
    chatbox.innerHTML = '';
    chat.forEach(msg => displayMessage(msg.sender, msg.text));
  }

  function loadExistingChat() {
    chatHistory.forEach(msg => displayMessage(msg.sender, msg.text));
  }

  loadExistingChat();
  loadChatList();
