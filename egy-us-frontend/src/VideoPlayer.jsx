// VideoStreamer.js
import React, { useEffect } from 'react';
import io from 'socket.io-client';

const VideoPlayer = () => {
  useEffect(() => {
    // Establish a socket connection with the server
    const socket = io('http://localhost:3000');

    // Listen for video_links event from the server
    socket.on('video_links', (videoLinks) => {
      console.log('Current Video Link:', videoLinks.currentVideoLink);
      console.log('Next Video Link:', videoLinks.nextVideoLink);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Listening to video links... Check the console.</div>;
};

export default VideoPlayer;
