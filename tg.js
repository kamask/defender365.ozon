import fetch from "node-fetch";
import { db } from './db.js'

let users = [];

;(async ()=>{
    users = (await db('SELECT tg_id FROM tgusers')).map(i => i.tg_id);
})();

async function postTG(apiMethod, data){
    try{await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/getUpdates`)}catch(e){};
    let res;
    try{
        for(const u of users){
            data.chat_id = u;
            res = await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/` + apiMethod, {
                method: 'post',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    }catch(e){}
    return res.status === 200 ? true : null
}

export { postTG };