function success(message,data=null)
{
   return JSON.stringify(
      {
         success:true,
         data:data,
         message:message
      }
   )
   
}

function failure(message,data=null)
{
   return JSON.stringify(
      {
         success:false,
         data:data,
         message:message
   
      }
   )
  
}

module.exports={success,failure};