import pg from "pg";
const { Pool } = pg;

const pool = new Pool({max: 10});

async function db(...query){
    return await pool.query(...query).then(res=> res.rows).catch(err => err.message);
}

async function getStock(param){
    const sqlGetStockId = `
        SELECT stock_id FROM ozon_cards
        WHERE ${typeof param === 'number' ? 'ozon_id' : 'article'} = $1`;

    const sql = `SELECT id, stock FROM stocks WHERE id = (${sqlGetStockId})`;

    return (await db(sql, [param]))[0];
    
}

async function getOzonCards(stock_id){
    return db ('SELECT article, ozon_id FROM ozon_cards WHERE stock_id = $1', [stock_id]);
}

async function setStock({id, stock}){
    return db('UPDATE stocks SET stock = $1 WHERE id = $2', [stock, id]);
}

async function getTitle(stock_id){
    const sql = `SELECT t.title AS type, pv.title AS param FROM stocks as s
                    JOIN types AS t ON t.id = s.type_id
                    JOIN stock_params AS sp ON sp.stock_id = s.id
                    JOIN params_values AS pv ON pv.id = sp.param_value_id
                    WHERE s.id = $1`;
    let dbres = await db(sql, [stock_id]);
    dbres = dbres.reduce((acc, i) => {
        acc += acc.length === 0 ? i.type : '';
        return acc += ' ' + i.param
    }, '');
    return dbres
}

export { db, getStock, setStock, getTitle, getOzonCards }