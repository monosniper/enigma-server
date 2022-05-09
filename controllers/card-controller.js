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
            const response = await CardService.makeCard(req.body);

            return res.json([response]);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CardController();