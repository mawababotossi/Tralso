# -*- coding: utf-8 -*-

from odoo import api, fields, models


class ResUser(models.Model):
    """Modify user model"""
    _inherit = "res.users"

    """employee_id = fields.Many2one('hr.employee_id', compute='_get_associated_employee', string='Associated employee')

    @api.multi
    def _get_associated_employee(self):
        Employee = self.env['hr.employee']
        vals = []
        for record in self:
            _employee_id = Employee.search([('user_id', '=', record.id)])

            if _employee_id:
                record.employee_id = _employee_id

                """
