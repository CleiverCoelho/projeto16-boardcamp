import { db } from "../database/db.js";
import joi from "joi";

export async function findAllRentals(req, res) {

    try {
        const customers = await db.query(`
            SELECT customers.name AS customer, customers.id AS "customerId", 
                games.name AS game, games.id AS "gameId", rentals.* 
                FROM rentals
                JOIN games 
                    ON games.id=rentals."gameId"
                JOIN customers 
                    ON customers.id=rentals."customerId";`);
            
        const responsePattern = customers.rows.map(customer => {
            return ({
                id: customer.id,
                rentDate: new Date(customer.rentDate).toISOString().split('T')[0],
                daysRented: customer.daysRented,
                returnDate: customer.returnDate,
                originalPrice: customer.originalPrice,
                delayFee: customer.delayFee,
                customer: {id: customer.customerId, name: customer.customer},
                game: {id: customer.gameId, name: customer.game} 
            })
        })
        
        res.send(responsePattern);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createRental(req, res) {

    const {customerId, gameId, daysRented} = req.body;
    if (isNaN(customerId) || isNaN(gameId)) return res.sendStatus(400);


    const verificaCustomer = await db.query(`SELECT * FROM customers WHERE id=$1`, [customerId]);
    const verificaGame = await db.query(`SELECT * FROM games WHERE id=$1`, [gameId]);
    const verificaDisponibilidade = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1`, [gameId])

    let openRentalsCounter = 0;
    verificaDisponibilidade.rows.forEach(rental => {
        if(rental.returnDate === null){
            openRentalsCounter++;
            if(openRentalsCounter === 3) return res.status(400).send("estoque indisponivel para o jogo");
        }
    })
    if(!verificaCustomer.rows[0]) return res.status(400).send("customer nao encontrado");
    if(!verificaGame.rows[0]) return res.status(400).send("game nao encontrado");

    try {
    // Implemente essa função
    // requisicao para realizar a verificacao do ids de customer e game
    
    
    const reponse = await db.query(`INSERT INTO rentals ("customerId", "gameId", "daysRented", "originalPrice", "rentDate", "delayFee", "returnDate")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [customerId, gameId, daysRented, daysRented * verificaGame.rows[0].pricePerDay, new Date(), null, null]);
    res.status(201);
    } catch (err) {
    res.status(404).send(err.message);
    }
}

  
