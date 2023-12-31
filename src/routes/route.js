const express =require('express')
const router= express.Router()
const multer = require('multer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath);



// Set up multer for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
    
  });
  
const upload = multer({ storage: storage });

// Define routes for video uploads
router.post('/api/videos', upload.single('video'),(req, res) => {
    
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No video file provided' });
    }
    return res.status(200).send({status:true,message:"video uploded successfully"})
    
    // Save video file to cloud storage
});

// Define route for trimming a video
router.post('/api/videos/:id/trim', (req, res) => {
    const videoId = req.params.id;
    const startTime = req.body.startTime; 
    const duration = req.body.duration; 

    // Path to the input video file
    const inputPath = `uploads/${videoId}.mp4`;

    // Path to the output trimmed video file
    const outputPath = `trimmed/${videoId}-trimmed.mp4`;
  
    ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .on('end', function(err) {
            if(!err) { 
                console.log('conversion Done')
                return res.status(200).send({status:true,message:"trim successfully"})
            }
        })
        .on('error', err => {
            console.log('error: ', err)
            return res.status(400).send({status:false,message:"error during trimming"})
        })
        .run()

});

router.post('/api/videos/:id/merge', (req, res) => {
    const videoId = req.params.id;
    const clipIds = req.body.clipIds; // Array of clip IDs to merge
  
    // Path to the input video files
    const inputPaths = clipIds.map((clipId) => `uploads/${clipId}.mp4`);
  
    // Path to the output merged video file
    const outputPath = `merged/${videoId}-merged.mp4`;
  
    const ffmpegCommand = ffmpeg();
    
    // Add inputs
    inputPaths.forEach((inputPath) => {
      ffmpegCommand.input(inputPath);
    });
  
    // Merge video clips
    ffmpegCommand.mergeToFile(outputPath)
      .on('error', (err) => {
        console.error('Error while merging videos:', err);
        return res.status(400).send({ status: false, message: 'Error during merging' });
      })
      .on('end', () => {
        console.log('Video merging completed');
        return res.status(200).send({ status: true, message: 'Merge successful' });
      });
});

module.exports=router