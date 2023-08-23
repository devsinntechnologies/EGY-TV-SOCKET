const express = require('express');
const app = express();
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const { v4: uuidv4 } = require('uuid');
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
let liveStream=false;
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
// Generate a unique broadcasterId for each request
app.get('/startLiveStream', async (req, res) => {
  const broadcasterId = uuidv4(); // Generate a unique ID
  try {
    // Generate Agora token for the broadcaster using broadcasterId
    const token = await generateAgoraToken(broadcasterId, "publisher");

    // Emit Agora token to the broadcaster's socket
    // io.to(broadcasterId).emit('agora_token', { agoraToken: agoraBroadcasterToken });
    liveStream=true
    res.json({ token, message: 'Live stream started for the broadcaster.' });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    res.status(500).json({ error: 'Error generating Agora token' });
  }
});
app.get('/stopLiveStream', (req, res) => {
  liveStream=false
  res.json({ message: 'Live stream stopped.' });
});
async function generateAgoraToken(uid, role) {
  return new Promise((resolve, reject) => {
    const expirationTimeInSeconds = 3600; // Token expiration time in seconds

    // Set up the token builder
    const key = "25c38680de234f618db5b23c3500c5fe"; // Your Agora App Key
    const certificate = "35d50916370c4fb7ae518abbcc472d8b"; // Your Agora App Certificate
    const channelName = "My New Project"; // Channel name

    // Define the privilege
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;

    // Build the token using agora-access-token
    const token = RtcTokenBuilder.buildTokenWithUid(
      key,
      certificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    resolve(token);
  });
}
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
  //   io.on('connection', async(socket) => {
  //   console.log('A new client has joined.');

  // });
  function stopPlaylist() {
    videoQueue = [];
    currentVideoIndex = 0;
    clearTimeout(playlistTimeout);
    clearInterval(playlistInterval);
    io.emit('playlist_stopped');
    io.emit('stop_live_stream');
  }
io.on('connection', async (socket) => {
  console.log('A new client has joined.');
  if(liveStream){
    const broadcasterId = uuidv4();
    const agoraSubscriberToken = await generateAgoraToken(broadcasterId, "subscriber");
    socket.emit('agora_token', { agoraToken: agoraSubscriberToken });
  }

  // Handle subscriber's request for Agora token
  // socket.on('subscriber_token_request', async (data) => {
  //   const agoraSubscriberToken = await generateAgoraToken(data.subscriberId, "subscriber");
  //   socket.emit('agora_token', { agoraToken: agoraSubscriberToken });
  // });

})