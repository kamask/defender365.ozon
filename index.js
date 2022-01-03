import { getStock, setStock, getTitle, getOzonCards } from './db.js';
import { getNewPostings, packagePosting, setStock as setOzonStock } from './ozon_api.js';
import { postTG } from './tg.js';


const failPostings = new Set();

async function monitoringAndPackageNewPosting(){
    let postings = await getNewPostings();
    for(const p of postings){
        if(failPostings.has(p.posting_number)) continue;
        
        let check = true, changeStock = new Map();
        for(const pr of p.products){
            const stock = await getStock(pr.offer_id);
            if(!changeStock.has(stock.id)) changeStock.set(stock.id, stock.stock);

            if(changeStock.get(stock.id) < pr.quantity){
                check = false;
                break;
            }

            changeStock.set(stock.id, changeStock.get(stock.id) - pr.quantity);
        }

        if(!check){
            failPostings.add(p.posting_number);
            await postTG('sendMessage', {
                text: `${p.posting_number}\nОшибка остатка!\nПроверить в ЛК seller.ozon.ru!`
            });
            continue;
        }

        await packagePosting(p);

        let text = 'Новый заказ собран автоматически.\n\n' + p.posting_number;

        for(const pr of p.products){
            const stock = await getStock(pr.offer_id);
            const title = await getTitle(stock.id);
            const newStock = stock.stock - pr.quantity;
            await setStock({id: stock.id, stock: newStock});
            const cards = (await getOzonCards(stock.id)).map(i => ({offer_id: i.article, stock: newStock}));
            await setOzonStock(cards);
            text += '\n\n' + title + ' ' + pr.quantity + 'шт.\nОсталось ' + newStock + 'шт.'
        }

        await postTG('sendMessage', {text});
    }

}

function sleep(){
    return new Promise(resolve => {
        setTimeout(resolve, 3000);
    });
}

;(async () => {
    while(true){
        await monitoringAndPackageNewPosting();
        await sleep();
    }
})();