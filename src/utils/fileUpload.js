import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// a method which would file link as param
// and upload it to cloudinary then unlink if success

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        //upload to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,
            { resource_type: "auto" });

        //file has been uploaded succesfuly
        console.log("file uploaded!")
    } catch (err) {

        // in failure we're still confirmed that file 
        // has been added to local storage, there's only
        // upload issue, so we must remove from local

        fs.unlinkSync(localFilePath) //reomve locally saved temp file
        return null;
    }
}

export default uploadOnCloudinary




