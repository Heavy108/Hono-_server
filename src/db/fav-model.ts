import {Number, Schema ,model} from "mongoose";

export interface Alumni_Details{
    Roll_Number:string;
    Name:string;
    Year:Number;
    Program_ID:string;
    Phone:Number;
    Email:string;
}
const Alumni_schema =new Schema<Alumni_Details>({
    Roll_Number:{
        type:String,
        required:true
    },
    Name:{
        type:String,
        required:true
    },
    Year:{
        type:Number,
        // default:"https://via.placeholder.com/1600x900.webp",
        required:true
    },
    Program_ID:{
        type:String,
        required:true
    },
    Phone:{
        type:Number,
        // default:"https://via.placeholder.com/1600x900.webp",
        required:true
    },
    Email:{
        type:String,
        required:true
    }
    
})
const Alumni =model('alumni_details' ,Alumni_schema)

export default Alumni;