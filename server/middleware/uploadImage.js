const fs = require('fs');


module.exports = async (req,res,next)=>{
    try {
        if(!req.files || Object.keys(req.files).length ===0)
        return res.status(400).json({msg: "No files were uploaded"})

        const file= req.files.file;
        console.log(file)
        if(file.size > 1024*1024){
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "Size too large"})
        } //1mb
        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "File Format is Incorrect"})
        }
        next()
    } catch (error) {
        return res.status(501).json({msg: error.message})
    }
}
const removeTmp = (path) => {
    fs.unlink(path,err =>{
        if(err) throw err
    })
}