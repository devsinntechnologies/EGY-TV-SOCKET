const express = require('express');
const Video = require('./models/video')
const app = express();
const port = 3000;
const http = require('http').createServer(app);
const cors = require('cors');
const VideoRoutes =require("./routes/video")
const sequelize=require('./db/index')
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const outputDirectory = './directory';
app.use(cors())
app.use('/video',VideoRoutes);
let videoQueue = [];
let currentVideoIndex = 0;
let videoLinks={}
let videoDuration=0;
async function loadVideoQueue() {
  try {

    videoQueue = await Video.findAll({
      order: [['createdAt', 'ASC']],
    });
    
    if (videoQueue.length > 0) {
      videoDuration = videoQueue[0].dataValues.duration;
      videoLinks = {
        currentVideoLink: videoQueue[currentVideoIndex].dataValues.name,
        nextVideoLink: videoQueue[currentVideoIndex+1].dataValues.name,
      };
    }
    setInterval(() => {
      io.emit('video_links', videoLinks);
    }, 1000);

    setTimeout(playNextVideo, videoDuration * 1000);
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
}
function playNextVideo() {
  currentVideoIndex++;
  if (currentVideoIndex < videoQueue.length) {

  videoDuration = videoQueue[currentVideoIndex].dataValues.duration;

  videoLinks = {
    currentVideoLink: videoQueue[currentVideoIndex]?.dataValues?.name || null,
    nextVideoLink: videoQueue[currentVideoIndex+1]?.dataValues?.name || null,
  };
  }else{
    currentVideoIndex =0;
    videoDuration = videoQueue[0].dataValues.duration;
    videoLinks = {
      currentVideoLink: videoQueue[currentVideoIndex].dataValues.name,
      nextVideoLink: videoQueue[currentVideoIndex+1].dataValues.name,
    }
  }
  setTimeout(playNextVideo, videoDuration * 1000);
}

http.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    loadVideoQueue();
  });
    io.on('connection', async(socket) => {
    console.log('A new client has joined.');
  //   try {
  //   const recentVideos = await Video.findAll({
  //     order: [['createdAt', 'DESC']],
  //     limit: 2,
  //   });
    
  //   if (recentVideos.length === 2) {
  //     const videoLinks = {
  //       currentVideoLink: recentVideos[0].name,
  //       nextVideoLink: recentVideos[1].name,
  //     };
  //     socket.emit('video_links', videoLinks);
  //   } else if (recentVideos.length === 1) {
  //     const videoLinks = {
  //       currentVideoLink: recentVideos[0].name,
  //       nextVideoLink: null, // No next video if there's only one
  //     };
  //     socket.emit('video_links', videoLinks);
  //   }
  // } catch (error) {
  //   console.error('Error fetching recent videos:', error);
  // }
  });