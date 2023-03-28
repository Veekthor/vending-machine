module.exports = (err, req, res, next)=>{
    console.log(err.message, err);
    res.status(500).json({
        error: true,
        message: err.message || 'Something failed'
    });
};