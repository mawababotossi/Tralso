# -*- coding: utf-8 -*-

from odoo import api, fields, models


class ResPartner(models.Model):
    """Add some fields related to agents"""
    _inherit = "res.partner"

    agent_code = fields.Char(string="Code")
    agents = fields.Many2many(
        comodel_name="res.partner", relation="partner_agent_rel",
        column1="partner_id", column2="agent_id",
        domain="[('agent', '=', True)]")
    # Fields for the partner when it acts as an agent
    agent = fields.Boolean(string="Agent", help="Check this field if the partner is an agent.")
    agent_type = fields.Selection(
        selection=[("agent_driver", "Driver agent"),
        ("agent_controller", "Controller agent"),
        ("agent_fuel", "Fuel agent")], string="Type", required=True,
        default="agent_driver")

    @api.onchange('agent_type')
    def onchange_agent_type(self):
        if self.agent_type == 'agent' and self.agent:
            self.supplier = True
