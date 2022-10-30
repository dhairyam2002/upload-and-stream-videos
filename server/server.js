import express from 'express';
import { DataTypes, Sequelize } from 'sequelize';
import Cloudinary from 'cloudinary';
import Multer from 'multer';

import bodyParser from 'body-parser';
const app = express();

app.use(express.json());
const cloudinary = Cloudinary.v2;

app.use(bodyParser.urlencoded({ extended: false }))
cloudinary.config({
    cloud_name: 'dxggnrc06',
    api_key: '249421539341832',
    api_secret: 'B3PxZTamK91uwCALklP2EBr37Iw'
});

const sequelize = new Sequelize("UploadVideo", "root", "Hjsywt45s2w3#", {
    dialect: 'mysql',
    host: 'localhost'
})


sequelize.authenticate().then(() => { console.log('Connected to database') }).catch((err) => console.log(err));


const storage = Multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

const multer = Multer({
    storage: storage,
    limits: 50 * 1024 * 1024
})

const Videos = sequelize.define('Videos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
    },
    thumbnail_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    video_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "Videos"
})


const VideoFiles = await Videos.sync({alter: true});
app.post('/upload', multer.fields([{ name: 'thumbnail' }, { name: 'video' }]), async (req, res, next) => {
    try {
        let thumbnail = req.files['thumbnail'][0];
        let video = req.files['video'][0];
        console.log(thumbnail.path);
        const result1 = await cloudinary.uploader.upload(thumbnail.path);
        console.log(result1);
        if(result1.secure_url == undefined) return res.json({success: false, message: "There was some error!"});
        console.log(video.path);
        const result2 = await cloudinary.uploader.upload(video.path, {
            resource_type: 'video'
        });
        if(result2.secure_url == undefined) return res.json({success: false, message: "There was some error!"});

        const videoInfo = await VideoFiles.create({
            name: req.body.name,
            thumbnail_url : result1.secure_url,
            video_url: result2.secure_url
        })
        

        res.json({
            success: true,
            videoInfo
        })
    } catch (error) {
        res.json({message: error.message});
    }

})




app.listen(4000, () => console.log('Server running!'));