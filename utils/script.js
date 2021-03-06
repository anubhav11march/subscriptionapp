const cron=require('node-cron');
const {todayDate,randomDate}=require('../utils/util');
const Subscription=require('../model/usersubscription');



async function updateSubscriptions(){
    try{
        let todaycompletedsubs=await Subscription.find({duedate:todayDate()});
        console.log('fhhfg',todaycompletedsubs);
        await Promise.all(todaycompletedsubs.map(async sub=>{
            let initialupdate={
                $push:{
                    delivereddates:todayDate()
                }
            }
            // console.log('hj',todayDate());
            // console.log('ewf',randomDate("",1));
            await Subscription.findOneAndUpdate({_id:sub._id,notdelivered:{$nin:[todayDate()]}},initialupdate,{new:true});
            if(sub.interval==="Weekly"){
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",7)}},{new:true});
            }else if(sub.interval==="Daily"){
               await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",1)}},{new:true});
            }else if(sub.interval==="Monthly"){
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",30)}},{new:true});
            }else if(sub.interval==="Bi-Weekly"){
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",3)}},{new:true});
            }else {
                await Subscription.findOneAndUpdate({_id:sub._id},{$set:{duedate:randomDate("",14)}},{new:true});
            }
        }))
    }catch(err){
        console.log(err);
    }
}
//updateSubscriptions();
// cron.schedule('30 11 * * *',updateSubscriptions);

setInterval(updateSubscriptions,24*60*60000);