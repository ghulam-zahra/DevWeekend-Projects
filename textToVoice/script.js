let speech = new SpeechSynthesisUtterance();
let voices = [];
let voiceSelect = document.querySelector("select");

// Function to load voices
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
        // If no voices are available, try again after a delay
        setTimeout(loadVoices, 100);
        return;
    }
    
    // Clear existing options
    voiceSelect.innerHTML = '';
    
    // Populate dropdown with available voices
    voices.forEach((voice, i) => {
        let option = new Option(voice.name, i);
        voiceSelect.appendChild(option);
    });
    
    // Set default voice
    speech.voice = voices[0];
}

// Load voices when they become available
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
} else {
    // Fallback for browsers that don't support onvoiceschanged
    loadVoices();
}

// Also try loading voices immediately (for some browsers)
loadVoices();

// Change voice when dropdown selection changes
voiceSelect.addEventListener("change", () => {
    if (voices[voiceSelect.value]) {
        speech.voice = voices[voiceSelect.value];
    }
});

// Listen button functionality
document.querySelector("button").addEventListener("click", () => {
    const textarea = document.querySelector("textarea");
    const text = textarea.value.trim();
    
    if (text === "") {
        alert("Please enter some text to convert to speech!");
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Set the text and speak
    speech.text = text;
    window.speechSynthesis.speak(speech);
});

// Optional: Auto-focus on textarea
document.querySelector("textarea").focus();

// Keyboard shortcut: Ctrl+Enter to speak
document.querySelector("textarea").addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
        document.querySelector("button").click();
    }
});