const video = document.getElementById("videoCam");

const runStream = () => {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.log(err)
  );
};

runStream();

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./src/js/models"),
  faceapi.nets.ageGenderNet.load("./src/js/models"),
  faceapi.loadFaceLandmarkModel("./src/js/models"),
  faceapi.loadFaceLandmarkTinyModel("./src/js/models"),
  faceapi.loadFaceRecognitionModel("./src/js/models"),
  faceapi.loadFaceExpressionModel("./src/js/models"),
]).then(runStream);

videoCam.onplay = async () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  faceapi.matchDimensions(canvas, { width: video.width, height: video.height });
  setInterval(async () => {
    const detectionsHandle = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withAgeAndGender()
      .withFaceExpressions();
    const detectionSize = faceapi.resizeResults(detectionsHandle, {
      width: video.width,
      height: video.height,
    });
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, detectionSize);
    faceapi.draw.drawFaceLandmarks(canvas, detectionSize);
    faceapi.draw.drawFaceExpressions(canvas, detectionSize);
  }, 100);
};
