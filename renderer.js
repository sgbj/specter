const { desktopCapturer } = require('electron');

const screens = document.getElementById('screens'),
      screen = document.getElementById('screen'),
      capture = document.getElementById('capture'),
      placeholder = document.getElementById('placeholder');
    
let isCapturing = false,
    recorder,
    chunks = [];

$('.ui.dropdown').dropdown();
screen.style.display = 'none';
capture.disabled = true;

desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
    if (error) {
        handleError(error);
        return;
    }
    populateScreens(sources);
});

screens.addEventListener('change', previewScreen);
capture.addEventListener('click', handleCapture);

function populateScreens(sources) {
    sources.forEach(source => {
        capture.disabled = false;
        const option = document.createElement('option');
        option.value = source.id;
        option.innerText = source.name;
        screens.appendChild(option);
    });
}

function previewScreen(event) {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: screens.value,
                maxWidth: 1920,
                maxHeight: 1080
            }
        }
    }).then(previewRecording).catch(handleError);
}

function handleCapture(event) {
    isCapturing = !isCapturing;

    if (isCapturing) {
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: screens.value,
                    maxWidth: 1920,
                    maxHeight: 1080
                }
            }
        }).then(startRecording).catch(handleError);
    } else {
        stopRecording();
    }
}

function previewRecording(stream) {
    screen.src = URL.createObjectURL(stream);
    screen.style.display = 'block';
    placeholder.style.display = 'none';
}

function startRecording(stream) {
    screen.src = URL.createObjectURL(stream);
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', event => chunks.push(event.data));
    recorder.start();
    capture.innerText = 'Stop';
    screen.style.display = 'block';
    placeholder.style.display = 'none';
    document.querySelector('.ui.dropdown').classList.add('disabled');
}

function stopRecording() {
    URL.revokeObjectURL(screen.src);
    recorder.stop();
    download(new Blob(chunks, { type : 'video/mp4' }));
    chunks = [];
    capture.innerText = 'Start';
    document.querySelector('.ui.dropdown').classList.remove('disabled');
}

function download(blob) {
    const a = document.createElement('a'),
          url = URL.createObjectURL(blob);
    a.style = 'display: none';
    a.href = url;
    a.download = 'Capture.mp4'
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleError(error) {
    console.log(error);
}