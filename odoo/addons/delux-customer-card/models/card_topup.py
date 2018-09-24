from odoo import models, fields, api

class CardTopup(models.Model):
    _name = "card.topup"

    card = fields.Many2one('card.card', string="Card")
    date = fields.Date(string='Topup date', default=fields.Date.today())
    amount = fields.Integer(string="amount")
    operator = fields.Char(string="Operator")
    handled = fields.Boolean('Handled?')
    #sms = fields.Char(string="Sms content")

    @api.multi
    @api.depends('handled')
    def _compute_card_amount(self):
            _card = self.env['card.card'].search([('id', '=', 1)])
            self.env['card.card'].write(1, {'card_value':1200})
