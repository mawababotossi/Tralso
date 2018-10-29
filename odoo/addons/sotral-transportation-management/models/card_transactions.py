from odoo import models, fields, api, time

class CardRecord(models.Model):
    _name = "card.card"
    name = fields.Char(compute="_compute_card_name", store=True)
    code = fields.Char(string='Code', required=True)
    type = fields.Selection([('argent', 'Argent'), ('or', 'Or'), ('diamand', 'Diamand')], string='Type')
    owner_id = fields.Many2one('res.partner', string="Owner")
    issue_date = fields.Date(string='Issue date', default=fields.Date.today())
    expiry_date = fields.Date(string='Expiry date')
    value = fields.Integer(string="Value")
    status = fields.Boolean('Active?')

    @api.depends('code', 'owner_id')
    def _compute_card_name(self):
        for record in self:
            if record.owner_id.phone:
                record.name = record.code + ' - ' + record.owner_id.phone
            else:
                record.name = record.code


class CardTransactions(models.Model):
    _name = "card.transactions"

    date = fields.Datetime(string='Transaction date', default=fields.Datetime.now())
    card = fields.Many2one('card.card', string="Card")
    amount = fields.Integer(string="Amount")
    telco = fields.Char(string="Telco")
    type = fields.Selection([('payement', 'Payement'), ('topup', 'Topup')], string='Type')
    service = fields.Char(string='Service')
    bus_line = fields.Many2one('strl.busline', string="Bus line")
    bus = fields.Many2one('fleet.vehicle', string="Bus")
    driver = fields.Many2one('hr.employee', string="Driver", domain=[('agent_type', '=', 'driver')])
    #handled = fields.Boolean('Handled?')
    #sms = fields.Char(string="Sms content")

    @api.multi
    @api.depends('handled')
    def _compute_card_amount(self):
            _card = self.env['card.card'].search([('id', '=', 1)])
            self.env['card.card'].write(1, {'card_value':1200})
