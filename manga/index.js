const fs=require("fs");
const path = require("path");
const { json } = require("stream/consumers");
const fsPromise=fs.promises;
const filePath=path.join(__dirname,"..","data","manga.json");
class MyPromise
{
    async getAll()
    {
        return fsPromise
        .readFile(filePath,{encoding:"utf-8"})
        .then((data)=>
        {
            return{success:true,data:data};
        })
        .catch((error)=>
        {
            return{error};
        })
    }

    async add(manga) {
        const content = await fsPromise.readFile(filePath, { "Content-Type": "application/json" });
        const jsonData = JSON.parse(content)
        const newData = JSON.parse(manga)
        const errors = {};
        if (newData.name === "" || !newData.name) {
            errors.name = "Name is missing";
        }
        
        if (!newData.price || newData.price === "") {
            errors.price = "Price is missing";
        }
        else if (newData.price < 4) {
            errors.pricelimit = "Price cant be less than 4";
        }
        if (!newData.stock || newData.stock === "") {
            errors.stock = "Stock is missing";
        }
        else if (newData.stock < 10) {
            errors.stocklimit = "Stock cant be less than 10";
        }
        if (!newData.author || newData.author === "") {
            errors.author = "Author is missing";
        }


        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.keys(errors).map(field => errors[field]);
            return { failure: true, message: errorMessages };
        }


        else if (!newData.id) {
            const resultData = { ...newData, id: jsonData[jsonData.length - 1].id + 1 }
            jsonData.push(resultData)
            const data = JSON.stringify(jsonData)
            return fsPromise
                .writeFile(filePath, data)
                .then((data) => {
                    return { success: true, data: data }
                })
                .catch((error) => {
                    return { error }
                })
        }
        else if (newData.id) {
            const arr = jsonData.filter((ob) => ob.id === newData.id)
            if (arr.length > 0) {
                return { success: false, message: "ID already exists" };
            }
            else {
                jsonData.push(newData);
                const data = JSON.stringify(jsonData)
                return fsPromise
                    .writeFile(filePath, data)
                    .then((data) => {
                        return { success: true, data: data }
                    })
                    .catch((error) => {
                        return { error }
                    })
            }
        }

    }
    async getById(id)
    {
        return fsPromise
        .readFile(filePath,{encoding:"utf-8"})
        .then((data)=>
        {
            const Data=JSON.parse(data);
            const checkId=Data.filter((x)=>x.id!=id)
            if(checkId.length==Data.length)
            {
                return{success:false,message:"Id does not exist!"};
            }
            else
            {
                const index=Data.findIndex((item)=>item.id==id)
                const ans=Data[index];
                return{success:true,data:ans}
            }

        })
        .catch((error)=>
        {
            return{error}
        })

    }

    // async updatebyId(id,fields)
    // {
    //     const content=await fsPromise.readFile(filePath,{encoding:"utf-8"})
    //     const Data=JSON.parse(content)
    //     const upfields=JSON.parse(fields);
    //     const findId=Data.filter((x)=>x.id!=id)
    //     if(findId.length==Data.length)
    //     {
    //         return{success:false,message:"Id does not exist!"};
    //     }
    //     else
    //     {
    //         const index=Data.findIndex((item)=>item.id==id)
    //         Data[index]={...Data[index],...upfields}
    //         const data=JSON.stringify(Data[index])
    //         return fsPromise
    //         .writeFile(filePath,data)
    //         .then((data)=>
    //         {
    //             return {success:true,data:data}
    //         })
    //         .catch((error)=>
    //         {
    //             return {error}
    //         })
    //     }
    // }
    async updatebyId(id, fields) {
        try {
            const content = await fsPromise.readFile(filePath, { encoding: "utf-8" });
            const Data = JSON.parse(content);
            const upfields = JSON.parse(fields);
            const findId = Data.filter((x) => x.id != id)
            const index = Data.findIndex((item) => item.id == id);

            if (findId.length == Data.length) {
                return { success: false, message: "Id does not exist!" };
            }
            if(upfields.id)
            {
                return {success:false,message:"id cant be provided"}
            }
            const errors = {};
        if (upfields.name === "") {
            errors.name = "Name is missing";
        }
        
        if ( upfields.price === "") {
            errors.price = "Price is missing";
        }
        else if (upfields.price < 4) {
            errors.pricelimit = "Price cant be less than 4";
        }
        if (upfields.stock === "") {
            errors.stock = "Stock is missing";
        }
        else if (upfields.stock < 10) {
            errors.stocklimit = "Stock cant be less than 10";
        }
        if (upfields.author === "") {
            errors.author = "Author is missing";
        }


        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.keys(errors).map(field => errors[field]);
            return { failure: true, message: errorMessages.join(', ') };
        }



            Data[index] = { ...Data[index], ...upfields };
            const data = JSON.stringify(Data);

            await fsPromise.writeFile(filePath, data);

            return { success: true, data: Data[index] };
        } catch (error) {
            return { error };
        }
    }

  

async deletebyId(id)
{
    try {
        const content=await fsPromise.readFile(filePath,{encoding:"utf-8"})
        const jsonData=JSON.parse(content)
        const filterItem=jsonData.filter((x)=>x.id!=id)
        if(filterItem.length==jsonData.length)
        {
            return {success:false,message:"Id not found!"}
        }
        //const index=jsonData.findIndex((item)=>item.id==id)
        //jsonData.splice(index,1)
        const data=JSON.stringify(filterItem)
        await fsPromise.writeFile(filePath,data)
         return {success:true,data:JSON.parse(data)}
        } catch (error) {
            return {error}
        }
    
}

async deleteAll() {
    try {
        const content = await fsPromise.readFile(filePath, { encoding: "utf-8" })
        const data = JSON.parse(content)
        await fsPromise.writeFile(filePath, "[]")
        return { success: true,message:"Successfully deleted all data" }
    } catch (error) {
        return { error };
    }
}

async searchByname(name)
    {
        try {
            const data=await fsPromise.readFile(filePath,{encoding:"utf-8"})
            let arr=[];
            const jsonData=JSON.parse(data);
            const res=jsonData.map((x,i)=>{
                if(x.name==name)
                {
                    arr.push(x);
                }
            })
            if(arr.length==0)
            {
                return{success:false,message:"No data found"}
            }
            else
            {
                return{success:true,data:arr}
            }
           
        } catch (error) {
            return {error}
        }
    }

    
}

module.exports=new MyPromise();