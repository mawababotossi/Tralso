from datetime import datetime
from odoo import api, fields, models


class FleetVehicle(models.Model):
    _inherit = 'fleet.vehicle'
    _description = "Vehicle"
    _order = 'name'

    name = fields.Char(compute=False, required=True)
    #operating_unit_id = fields.Many2one('operating.unit', string='Operating Unit')
    year_model = fields.Char()
    serial_number = fields.Char()
    registration = fields.Char()
    notes = fields.Text()
    active = fields.Boolean(default=True)
    driver_id = fields.Many2one('res.partner', string="Driver")
    employee_id = fields.Many2one(
        'hr.employee',
        string="Driver",
        domain=[('agent_type', '=', 'driver')])
    engine_id = fields.Many2one('fleet.vehicle.engine', string='Engine')
    bus_line_id = fields.Many2one('strl.busline', string='Bus line affectation')
    supplier_unit = fields.Boolean()
    insurance_policy = fields.Char()
    insurance_policy_data = fields.Char()
    insurance_expiration = fields.Date()
    insurance_supplier_id = fields.Many2one('res.partner', string='Insurance Supplier')
    insurance_days_to_expire = fields.Integer(compute='_compute_insurance_days_to_expire', string='Days to expire')

    @api.onchange('employee_id')
    def onchange_employee_id(self):
        Found = False
        Old_employee_id = self.employee_id
        for record in self:
            if record.employee_id == self.employee_id:
                Found = True

        if Found == True:
            return {
                'warning': {
                    'title': 'Changed driver',
                    'message': 'Ce chauffeur a deja une vehicule attribue'
                }
            }
            record.employee_id = Old_employee_id
            return False

    @api.depends('insurance_expiration')
    def _compute_insurance_days_to_expire(self):
        for rec in self:
            now = datetime.now()
            date_expire = datetime.strptime(
                rec.insurance_expiration,
                '%Y-%m-%d') if rec.insurance_expiration else datetime.now()
            delta = date_expire - now
            if delta.days >= -1:
                rec.insurance_days_to_expire = delta.days + 1
            else:
                rec.insurance_days_to_expire = 0
