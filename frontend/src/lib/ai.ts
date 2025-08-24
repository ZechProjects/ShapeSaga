// This is a placeholder for calling your backend to generate an image.
// In a real application, this would make a POST request to your backend
// with the prompt, and the backend would return the image data or a URL.
export async function generateImage(prompt: string): Promise<Blob> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // This is a placeholder response.
  // Replace this with an actual call to your image generation service.
  // For example, you could fetch a placeholder image.
  const response = await fetch(`https://picsum.photos/seed/${prompt}/512`);
  if (!response.ok) {
    throw new Error("Failed to generate image");
  }
  const imageBlob = await response.blob();
  return imageBlob;
}

// This is a placeholder for calling your backend to generate a video.
// In a real application, this would make a POST request to your backend
// with the prompt, and the backend would return the video data or a URL.
export async function generateVideo(prompt: string): Promise<Blob> {
  // Simulate API call with longer delay for video generation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // This is a placeholder response that creates a proper MP4 video file
  // Replace this with an actual call to your video generation service.
  // For now, we'll create a more realistic mock video file
  try {
    // Create a simple canvas-based video frames
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Create multiple frames for a short animation
    const frames: Blob[] = [];
    const frameCount = 30; // 1 second at 30fps

    for (let i = 0; i < frameCount; i++) {
      // Clear canvas
      ctx.fillStyle = "#1f2937"; // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add animated elements
      const progress = i / frameCount;
      const pulse = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;

      // Add pulsing background effect
      ctx.fillStyle = `rgba(59, 130, 246, ${pulse * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add text with animation
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "AI Generated Video",
        canvas.width / 2,
        canvas.height / 2 - 60
      );

      ctx.font = "20px Arial";
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + pulse * 0.3})`;
      const promptText =
        prompt.length > 40 ? prompt.substring(0, 40) + "..." : prompt;
      ctx.fillText(promptText, canvas.width / 2, canvas.height / 2 - 20);

      ctx.font = "16px Arial";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(
        "ShapeSaga Story Contribution",
        canvas.width / 2,
        canvas.height / 2 + 20
      );

      // Add progress indicator
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(50, canvas.height - 50, (canvas.width - 100) * progress, 4);

      // Add frame to array (convert to blob)
      const frameBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/jpeg",
          0.8
        );
      });
      frames.push(frameBlob);
    }

    // Create a proper MP4 video blob using Web Codecs API (if available) or fallback
    if (typeof MediaRecorder !== "undefined") {
      // Use MediaRecorder for better video generation
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      });

      const chunks: Blob[] = [];

      return new Promise((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: "video/webm" });
          resolve(videoBlob);
        };

        recorder.onerror = (error) => {
          reject(new Error(`Video recording failed: ${error}`));
        };

        // Record a short animation
        recorder.start();

        // Animate the canvas for recording
        let frameIndex = 0;
        const animate = () => {
          if (frameIndex >= frameCount) {
            recorder.stop();
            return;
          }

          // Update canvas with current frame animation
          ctx.fillStyle = "#1f2937";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const progress = frameIndex / frameCount;
          const pulse = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;

          ctx.fillStyle = `rgba(59, 130, 246, ${pulse * 0.3})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 28px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            "AI Generated Video",
            canvas.width / 2,
            canvas.height / 2 - 60
          );

          ctx.font = "20px Arial";
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + pulse * 0.3})`;
          const promptText =
            prompt.length > 40 ? prompt.substring(0, 40) + "..." : prompt;
          ctx.fillText(promptText, canvas.width / 2, canvas.height / 2 - 20);

          ctx.font = "16px Arial";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText(
            "ShapeSaga Story Contribution",
            canvas.width / 2,
            canvas.height / 2 + 20
          );

          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(
            50,
            canvas.height - 50,
            (canvas.width - 100) * progress,
            4
          );

          frameIndex++;
          setTimeout(animate, 1000 / 30); // 30 FPS
        };

        animate();
      });
    } else {
      // Fallback: create a minimal but valid MP4-like blob
      // This creates a more realistic mock video file structure
      const mockMP4Header = new Uint8Array([
        // ftyp box
        0x00,
        0x00,
        0x00,
        0x20,
        0x66,
        0x74,
        0x79,
        0x70, // box size and type 'ftyp'
        0x69,
        0x73,
        0x6f,
        0x6d, // major brand 'isom'
        0x00,
        0x00,
        0x02,
        0x00, // minor version
        0x69,
        0x73,
        0x6f,
        0x6d, // compatible brand 'isom'
        0x69,
        0x73,
        0x6f,
        0x32, // compatible brand 'iso2'
        0x61,
        0x76,
        0x63,
        0x31, // compatible brand 'avc1'
        0x6d,
        0x70,
        0x34,
        0x31, // compatible brand 'mp41'

        // moov box header
        0x00,
        0x00,
        0x00,
        0x08,
        0x6d,
        0x6f,
        0x6f,
        0x76, // minimal moov box
      ]);

      // Add some metadata to make it more realistic
      const promptBuffer = new TextEncoder().encode(prompt);
      const combinedData = new Uint8Array(
        mockMP4Header.length + promptBuffer.length + 1024
      );
      combinedData.set(mockMP4Header, 0);
      combinedData.set(promptBuffer, mockMP4Header.length);

      // Fill remaining space with padding
      for (
        let i = mockMP4Header.length + promptBuffer.length;
        i < combinedData.length;
        i++
      ) {
        combinedData[i] = 0x00;
      }

      return new Blob([combinedData], { type: "video/mp4" });
    }
  } catch (error) {
    console.error("Error in video generation:", error);

    // Final fallback: create a minimal valid video blob
    const fallbackData = new Uint8Array([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
      0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31,
    ]);

    return new Blob([fallbackData], { type: "video/mp4" });
  }
}
