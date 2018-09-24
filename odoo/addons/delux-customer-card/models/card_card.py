from odoo import models, fields, api, time

class CardRecord(models.Model):
    _name = "card.card"
    card_code = fields.Char(string='Code', required=True)
    card_type = fields.Selection([('argent', 'Argent'), ('or', 'Or'), ('diamand', 'Diamand')], string='Type')
    card_owner = fields.Many2one('res.partner', string="Owner")
    card_issue_date = fields.Date(string='Issue date', default=fields.Date.today())
    card_expiry_date = fields.Date(string='Expiry date')
    card_value = fields.Integer(string="Value")
    card_status = fields.Boolean('Active?')

    @api.multi
    def _change_value_on_topup(self):
         self.write({'card_value': 1200})
