import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import "./styles.css";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [capturedImages, setCapturedImages] = useState([]);
  const [isOpened, setIsOpened] = useState(false);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsOpened(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const captureImage = () => {
    if (!isOpened) {
      return alert("Please open the camera first.");
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      const imageDataURL = canvas.toDataURL("image/png");
      setCapturedImages((prevImages) => [...prevImages, imageDataURL]);
    }
  };

  const downloadPdf = () => {
    const pdf = new jsPDF();
    if (capturedImages.length === 0) {
      return alert("Please capture at least one image.");
    }
    capturedImages.forEach((image, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      pdf.setFontSize(40);
      pdf.text(`Image ${index + 1}`, 35, 25);
      pdf.addImage(image, "PNG", 15, 25, 180, 180);
    });

    try {
      pdf.save("captured_images.pdf");
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Error saving PDF. Please try again.");
    }
  };

  const removeCapturedImage = (indexToRemove) => {
    setCapturedImages((prevImages) => {
      // Create a new array without the image at the specified index
      const updatedImages = prevImages.filter(
        (_, index) => index !== indexToRemove
      );
      return updatedImages;
    });
  };

  return (
    <>
      <span style={{ textAlign: "center", display: "block" }}>
        <button
          onClick={captureImage}
          style={{
            backgroundColor: "lightseagreen",
          }}
        >
          Capture Image
        </button>
        <button
          onClick={downloadPdf}
          style={{
            backgroundColor: "midnightblue",
          }}
        >
          Download PDF
        </button>
        {isOpened ? (
          <button
            style={{
              backgroundColor: "lightcoral",
            }}
            onClick={() => {
              const stream = videoRef.current?.srcObject;
              if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
              }
              setIsOpened(false);
            }}
          >
            Stop Camera
          </button>
        ) : (
          <button
            onClick={openCamera}
            style={{
              backgroundColor: "green",
            }}
          >
            Open Camera
          </button>
        )}
      </span>

      <div
        style={{
          maxHeight: " 400px",
          minHeight: "300px",
          overflowY: "auto",
          textAlign: "center",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={
            isOpened
              ? {
                  maxWidth: "480px",
                  borderRadius: "12px",
                  display: "block",
                  margin: "0px auto 10px auto",
                }
              : { display: "none" }
          }
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {capturedImages.map((image, index) => (
          <main
            key={index}
            style={{ position: "relative", display: "inline-block" }}
          >
            <img
              src={image}
              alt={`Captured ${index + 1}`}
              style={{
                maxWidth: "150px",
                maxHeight: "150px",
                borderRadius: "10px",
                padding: "5px",
              }}
            />
            <button
              onClick={() => removeCapturedImage(index)}
              className="cross"
            >
              &times;
            </button>
          </main>
        ))}

        {!isOpened && capturedImages.length === 0 && (
          <>
            <h2>How to use this website?</h2>
            <p>
              This website allows you to capture images from your webcam and
              download them as a PDF file.
            </p>

            <h3>Steps to use this website:</h3>
            <ol>
              <li>Open the camera by clicking on the "Open Camera" button.</li>
              <li>
                Capture an image by clicking on the "Capture Image" button.
              </li>
              <li>
                Repeat the above step to capture more images (if you want to).
              </li>
              <li>
                Click on the "Download PDF" button to download the captured
                images as a PDF file.
              </li>
              <li>
                Click on the "Stop Camera" button to stop the camera and close
                the video stream.
              </li>
            </ol>
          </>
        )}
      </div>
    </>
  );
}

export default App;
