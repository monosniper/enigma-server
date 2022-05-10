const CardService = require('../services/card-service');

class CardController {
    async getCards(req, res, next) {
        try {
            const cards = await CardService.getAllCards();
            return res.json(cards);
        } catch (e) {
            next(e);
        }
    }

    async makeCard(req, res, next) {
        try {
            const {user_id, data} = req.body;
            const response = await CardService.makeCard(user_id, data);

            return res.json([response]);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CardController();