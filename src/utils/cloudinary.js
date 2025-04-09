import {v2 as cloudinary} from "cloudinary";
 import fs from "fs"
 


    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


    const uploadoncloudinary = async (localFilePath)=>{
        try {
            if (!localFilePath) return null
        // upload file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file upload sucessfully
        /*console.log("file is uploaded on cloudinary", 
           response.url  ); */
           fs.unlinkSync(localFilePath)

            return response
        } catch (error) {
            fs.unlinkSync(localFilePath)      //remove the locally saved temporary file as upload operation failed
            return null;
        }
    }

    export {uploadoncloudinary}