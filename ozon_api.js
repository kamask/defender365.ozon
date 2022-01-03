import fetch from "node-fetch";


async function postOzon(uri, data){
    let res;
    try{
        res = await fetch('https://api-seller.ozon.ru' + uri, {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': process.env.OZON_CLIENT_ID,
                'Api-Key': process.env.OZON_API_KEY
            }
        })
    }catch(e){console.log(e);}
    return res.status === 200 ? res.json() : null
}


async function getNewPostings(){
        const today = new Date();
        const res = await postOzon('/v3/posting/fbs/unfulfilled/list', {
            filter: {
                status: 'awaiting_packaging',
                cutoff_from: today,
                cutoff_to: new Date().setMonth(today.getMonth + 1)
            },
            limit: 1000
        });

    return res ? res?.result?.postings : res
}


async function packagePosting(posting){
    let res = await postOzon('/v3/posting/fbs/ship', {
        posting_number: posting.posting_number,
        packages: [{
            products: posting.products.map( i => ({product_id: i.sku, quantity: i.quantity}))
        }]
    });
    return res ? res?.result : null
}


async function setStock(stocks){
    const res = await postOzon('/v1/product/import/stocks', { stocks });
    return res ? res?.result : null
}


async function getStock(param){
    let res;

    if(typeof param === 'string'){
        res = await postOzon('/v2/product/info', { offer_id: param });
        res = res?.result.stocks.present
    }

    if(typeof param === 'number'){
        res = await postOzon('/v2/product/info', { product_id: param });
        res = res?.result.stocks.present
    }

    if(Array.isArray(param)){
        res = await postOzon('/v2/product/info/list', { [typeof param[0] === 'string' ? 'offer_id' : 'product_id']: param });
        res = res?.result.items.map(i => {
            return {
                product_id: i.id,
                offer_id: i.offer_id,
                stock: i.stocks.present
            }
        })
    }

    if(param === undefined){
        let items = [], page = 1, total

        while(true){
            res = await postOzon('/v2/product/info/stocks', {
                page: page,
                page_size: 100
            });
            items = items.concat(res?.result.items);
            total = res.result.total;
            if(total / 100 < page++) break;
        }

        items = items.map(i => {
            const { product_id, offer_id } = i
            return {
                product_id,
                offer_id,
                stock: i.stocks.find(i => i.type === 'fbs').present
            }
        });

        res = items
    }

    return res
}

export { getNewPostings, getStock, packagePosting, setStock }