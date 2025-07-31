// UPDATE THIS to your local backend's LAN IP and port
const API_BASE = 'http://192.168.1.100:5000/api';

const normalEventForm = document.getElementById('normalEventForm');
const specialEventForm = document.getElementById('specialEventForm');
const loadEsp32Btn = document.getElementById('loadEsp32Btn');
const updateEsp32Btn = document.getElementById('updateEsp32Btn');
const esp32EventsList = document.getElementById('esp32EventsList');

function alertMsg(msg) {
  window.alert(msg);
}

normalEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('normalTitle').value.trim();
  const time = document.getElementById('normalTime').value.trim();
  const delay = parseInt(document.getElementById('normalDelay').value, 10);
  const tone = document.getElementById('normalTone').value.trim();
  const active = document.getElementById('normalActive').checked;

  const freqRaw = document.getElementById('normalFrequency').value.trim();
  if (!freqRaw) {
    alertMsg('Frequency days are required');
    return;
  }
  const frequency = freqRaw.toLowerCase().split(',').map(d => d.trim());

  try {
    const res = await fetch(`${API_BASE}/normalEvents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, time, delay, tone, active, frequency }),
    });
    const data = await res.json();
    if (!res.ok) {
      alertMsg('Error: ' + (data.error || 'Failed to create normal event'));
      return;
    }
    alertMsg('Normal event created!');
    normalEventForm.reset();
  } catch (err) {
    alertMsg('Error: ' + err.message);
  }
});

specialEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const date = document.getElementById('specialDate').value;
  const time = document.getElementById('specialTime').value.trim();
  const description = document.getElementById('specialDescription').value.trim();
  const tone = document.getElementById('specialTone').value.trim();
  const completed = document.getElementById('specialCompleted').checked;

  try {
    const res = await fetch(`${API_BASE}/specialEvents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time, description, tone, completed }),
    });
    const data = await res.json();
    if (!res.ok) {
      alertMsg('Error: ' + (data.error || 'Failed to create special event'));
      return;
    }
    alertMsg('Special event created!');
    specialEventForm.reset();
  } catch (err) {
    alertMsg('Error: ' + err.message);
  }
});

loadEsp32Btn.addEventListener('click', async () => {
  esp32EventsList.innerHTML = '<li>Loading...</li>';
  try {
    const res = await fetch(`${API_BASE}/esp32`);
    if (!res.ok) throw new Error(`Failed to fetch ESP32 events (${res.status})`);
    const events = await res.json();
    if (!events.length) {
      esp32EventsList.innerHTML = '<li>No ESP32 events for today</li>';
      return;
    }
    esp32EventsList.innerHTML = '';
    for (const ev of events) {
      const li = document.createElement('li');
      li.textContent = `${ev.title} at ${ev.time} (${ev.source}), delay: ${ev.delay}s`;
      esp32EventsList.appendChild(li);
    }
  } catch (err) {
    esp32EventsList.innerHTML = `<li>Error: ${err.message}</li>`;
  }
});

updateEsp32Btn.addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE}/update_esp32`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alertMsg('Error: ' + (data.error || 'Failed to update esp32 events'));
      return;
    }
    alertMsg(`ESP32 events updated: Normal(${data.normalEventsInserted}), Special(${data.specialEventsInserted})`);
  } catch (err) {
    alertMsg('Error: ' + err.message);
  }
});
