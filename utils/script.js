const cron=require('node-cron');
const {todayDate,randomDate}=require('../utils/util');
const Subscription=require('../model/usersubscription');



async function updateSubscriptions(){
    try{
        let todaycompletedsubs=await Subscription.find({duedate:todayDate()});
        await Promise.all(todaycompletedsubs.map(async sub=>{
            let initialupdate={
                $push:{
                    delivereddates:todayDate()
                }
            }
            await Subscription.findOneAndUpdate({_id:sub._id,notdelivered:{$nin:[todayDate()]}},initialupdate,{new:true});
            if(interval==="Weekly"){
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",7)}},{new:true});
            }else if(interval==="Daily"){
               await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",1)}},{new:true});
            }else if(interval==="Monthly"){
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",30)}},{new:true});
            }else if(interval==="Bi-Weekly"){
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",3)}},{new:true});
            }else {
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",14)}},{new:true});
            }
        }))


    }catch(err){
        console.log(err);
    }
}