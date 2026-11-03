export function errorHandler(err,req,res,next)
{
  console.log(err);
  const status=err.status || 500;

  return res.status(status).json({
    message: (status===500)?"Internal Server Error":(err.message|| "Server Error")
  })
}