const express = require('express');
const app = express();
const port = 5000;
const http = require('http').createServer(app);
const cors = require('cors');
// const VideoRoutes =require("./routes/video")
const Playlist = require('./models/playlist')
const VideoChunks = require('./models/video_chunks')
const Video = require('./models/video')
const sequelize=require('./db/index')
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const outputDirectory = '../uploads';
let videoQueue = [];
let currentVideoIndex = 0;
let videoLinks={}
let videoDuration=0;
let playlistInterval;
let playlistTimeout;
app.use(cors())
app.get('/runPlaylist/:id', async(req, res) => {
  const playlistId = req.params.id
  loadVideoQueue(playlistId);
  res.json({ message: 'Video playlist is now running.'});
});
app.get('/stopPlaylist', (req, res) => {
  videoQueue = [];
  currentVideoIndex = 0;
  clearTimeout(playlistTimeout);
  clearInterval(playlistInterval);
  io.emit('playlist_stopped');
  res.json({ message: 'Video playlist has been stopped.' });
});
async function loadVideoQueue(playlistId) {
  videoQueue = []; // Clear existing video queue
  clearInterval(playlistInterval);
  clearTimeout(playlistTimeout);
  try {
  const playlist = await Playlist.findByPk(playlistId, {
    include: [
      {
        model: Video,
        as: 'videos',
        include: [
          {
            model: VideoChunks,
            as: 'video_chunks',
          },
        ],
      },
    ],
  });
  
  playlist.videos.sort((a, b) => a.order - b.order);

  playlist.videos.forEach((video) => {
  
    video.video_chunks.sort((a, b) => a.created_at - b.created_at);

    videoQueue.push(...video.video_chunks);
  });
    if (videoQueue.length > 0) {
      videoDuration = videoQueue[0].duration;
      videoLinks = {
        currentVideoLink: videoQueue[currentVideoIndex].name,
        nextVideoLink: videoQueue[currentVideoIndex+1].name,
      };
    }
    playlistInterval = setInterval(() => {
      io.emit('video_links', videoLinks);
    }, 1000);
  
    playlistTimeout = setTimeout(playNextVideo, videoDuration * 1000);
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
}
function playNextVideo() {
  currentVideoIndex++;
  if (currentVideoIndex < videoQueue.length) {

  videoDuration = videoQueue[currentVideoIndex].duration;

  videoLinks = {
    currentVideoLink: videoQueue[currentVideoIndex]?.name || null,
    nextVideoLink: videoQueue[currentVideoIndex+1]?.name || null,
  };
  }else{
    currentVideoIndex =0;
    videoDuration = videoQueue[0].dataValues.duration;
    videoLinks = {
      currentVideoLink: videoQueue[currentVideoIndex].name,
      nextVideoLink: videoQueue[currentVideoIndex+1].name,
    }
  }
  playlistTimeout = setTimeout(playNextVideo, videoDuration * 1000);
}

http.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    //  loadVideoQueue();
  });
    io.on('connection', async(socket) => {
    console.log('A new client has joined.');

  });