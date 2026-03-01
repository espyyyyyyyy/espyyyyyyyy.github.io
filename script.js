// Microphone Audio Context
let audioContext;
let analyser;
let dataArray;
let micEnabled = false;
let candlesBlown = 0;
let totalCandles = 22;

// Initialize candles
function initializeCandles() {
    const container = document.getElementById('candles-container');
    container.innerHTML = '';
    
    for (let i = 0; i < totalCandles; i++) {
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.innerHTML = '<div class="flame"></div>';
        candle.id = `candle-${i}`;
        container.appendChild(candle);
    }
}

// Request microphone access
document.getElementById('mic-toggle').addEventListener('click', async function() {
    if (!micEnabled) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            micEnabled = true;
            
            document.getElementById('mic-toggle').textContent = '🎤 Microphone Active!';
            document.getElementById('mic-toggle').style.background = '#51cf66';
            
            detectBlowing();
        } catch (error) {
            alert('Please allow microphone access to blow out the candles!');
            console.error('Microphone error:', error);
        }
    }
});

// Detect blowing via microphone
function detectBlowing() {
    if (!micEnabled) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average frequency
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    // If volume is high enough (blowing detected)
    if (average > 50) {
        blowOutCandles();
    }
    
    requestAnimationFrame(detectBlowing);
}

// Blow out candles (1-3 at a time)
function blowOutCandles() {
    if (candlesBlown >= totalCandles) return;
    
    const candlesToBlowOut = Math.min(Math.floor(Math.random() * 3) + 1, totalCandles - candlesBlown);
    
    for (let i = 0; i < candlesToBlowOut; i++) {
        const candle = document.getElementById(`candle-${candlesBlown}`);
        if (candle) {
            candle.classList.add('blown');
            const flame = candle.querySelector('.flame');
            if (flame) {
                flame.classList.add('out');
            }
        }
        candlesBlown++;
    }
    
    // Update candle count
    updateCandleCount();
    
    // Check if all candles are blown out
    if (candlesBlown >= totalCandles) {
        setTimeout(() => {
            transitionToNextSection();
        }, 2000);
    }
}

// Update candle count display
function updateCandleCount() {
    const remaining = totalCandles - candlesBlown;
    document.getElementById('candle-count').textContent = `Candles remaining: ${remaining}`;
}

// Transition between sections
function transitionToNextSection() {
    const sections = document.querySelectorAll('.section');
    const activeIndex = Array.from(sections).findIndex(s => s.classList.contains('active'));
    
    if (activeIndex < sections.length - 1) {
        sections[activeIndex].classList.remove('active');
        sections[activeIndex + 1].classList.add('active');
        
        // Auto-transition to message section after envelope animation
        if (activeIndex + 1 === 1) {
            setTimeout(() => {
                sections[1].classList.remove('active');
                sections[2].classList.add('active');
            }, 3500);
        }
    }
}

// Scroll button functionality
document.getElementById('scroll-btn').addEventListener('click', function() {
    const messageContainer = document.querySelector('.message-container');
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

// Scroll detection to move to photo section
document.querySelector('.message-container').addEventListener('scroll', function() {
    if (this.scrollTop + this.clientHeight >= this.scrollHeight - 50) {
        const sections = document.querySelectorAll('.section');
        sections[2].classList.remove('active');
        sections[3].classList.add('active');
        
        // Auto-play music when reaching photo section
        setTimeout(() => {
            document.getElementById('bg-music').play().catch(e => {
                console.log('Autoplay prevented:', e);
            });
        }, 500);
    }
});

// Music player controls
document.getElementById('play-btn').addEventListener('click', function() {
    document.getElementById('bg-music').play();
});

document.getElementById('pause-btn').addEventListener('click', function() {
    document.getElementById('bg-music').pause();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCandles();
    updateCandleCount();
});