const ffmpeg = require('fluent-ffmpeg');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const Video = require('../models/video')
const outputDirectory = '../uploads';
function getVideoDuration(filePath) {
    // Use ffprobe to get the duration of a video file
    const result = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath]);
    if (result.error || result.status !== 0) {
      console.error(`Error getting duration for ${filePath}`);
      return 0;
    }
    return parseFloat(result.stdout.toString());
  }
function transcodeVideo(inputFilePath, outputFilePath, videoName) {
    ffmpeg(inputFilePath)
      .outputOptions([
        '-f segment',
        '-segment_time 60', // Each chunk will be 60 seconds long (adjust as needed)
        '-reset_timestamps 1',
        '-map 0',
      ])
      .output(`${outputFilePath}/${videoName}%#%d.mp4`)
      .on('end', async() => {
        console.log('HLS transcoding complete!');
        fs.unlinkSync(inputFilePath); // Remove the original video file after processing
        
        // Get all the files in the output directory with the videoName in their filenames
        const files = fs.readdirSync(outputFilePath).filter(file => file.includes(videoName));
        files.sort((a, b) => {
          const numA = parseInt(a.split('%#')[1].split('.')[0]);
          const numB = parseInt(b.split('%#')[1].split('.')[0]);
          return numA - numB;
        });
        
        console.log(files)
        // Create an array of objects with chunk names and their durations
        // const chunksInfo = [];
        // files.forEach(file => {
        //     const id = crypto.randomBytes(16).toString("hex");
        //   const filePath = path.join(outputFilePath, file);
        //   const duration = getVideoDuration(filePath);
        //   const newChunk = await Video.create({
        //     id: id,
        //     name: file,
        //     duration: duration,
        //     // Other properties you might have
        //   });
        //   chunksInfo.push({ name: file, duration: duration });
        // });

        for (const file of files) {
            const id = crypto.randomBytes(16).toString("hex");
            const filePath = path.join(outputFilePath, file);
            const duration = getVideoDuration(filePath);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            try {
              // Create a new record in the database for each chunk
              const newChunk = await Video.create({
                id: id,
                name: file,
                duration: duration,
                // Other properties you might have
              });
      
              chunksInfo.push({ name: file, duration: duration });
              console.log(`Chunk ${file} added to the database.`);
            } catch (error) {
              console.error(`Error adding chunk ${file} to the database:`, error);
            }
          }
        // console.log('Chunk information:', chunksInfo);
      })
    //   .on('end', () => {

    //     console.log('HLS transcoding complete!');
    //     fs.unlinkSync(inputFilePath); // Remove the original video file after processing
    
    //   })
      .on('progress', (progress) => {
        // console.log(process)
        console.log(`Processing: ${progress.percent}% done`);
      })
      .run();
  }

  const addVideo = (req,res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
    
      const inputFilePath = req.file.path;
      const outputFilePath = `${outputDirectory}`;
      const videoName = req.file.originalname.split(".mp4")[0]
      // Create the output directory if it doesn't exist
      if (!fs.existsSync(outputFilePath)) {
        fs.mkdirSync(outputFilePath);
      }
    
      // Transcode the uploaded video into HLS format and create chunks
      transcodeVideo(inputFilePath, outputFilePath, videoName);
    
      // Respond with a success message or other relevant data
      res.status(200).json({ message: 'File uploaded successfully.' });
  }

  const getAll = (req,res)=>{
    Video.findAll({order: [['createdAt', 'ASC']],})
    .then((result) => {
      res.status(200).json({
        success: true,
        message: "Data Fetch Successfully!",
        data: result,
      });
    })
    .catch((err) => {
      // return next(new HttpError("Data cannot fetch try again later!", 200));
      console.log(err)
    });
  }

  
  const deleteOne = (req,res,next) => {
    try {
      Video.findByPk(req.params.id)
        .then((val) => {
          return val.destroy();
        })
        .then((result) => {
          res.status(200).json({
            success: true,
            message: "Data Delete Successfully!",
            result: result,
          });
        })
        .catch((err) => {
          return next(new HttpError("Data not Found!", 200));
        });
    } catch (error) {
      new HttpError("Something Went Wrong Please Try Later.", 500);
    }
  };
  exports.addVideo = addVideo;
  exports.getAll = getAll;
  exports.deleteOne  = deleteOne ;