# -*- coding: utf-8 -*-
# Copyright 2012, Israel Cruz Argil, Argil Consulting
# Copyright 2016, Jarsa Sistemas, S.A. de C.V.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


#import logging
from datetime import datetime

from odoo import models, fields, api

#from odoo import _, api, fields, models
#from odoo.exceptions import ValidationError

#_logger = logging.getLogger(__name__)


class HrEmployee(models.Model):
    _name = 'hr.employee'
    _inherit = 'hr.employee'

    agent = fields.Boolean(default=True, help='Used to define if this person will be used as a Driver')
    agent_type = fields.Selection(
        selection=[("none", "--"), ("driver", "Conducteur"),
        ("controller", "Controlleur"), ("fuel", "Dotation en carburant")],
        string="Type", required=True, default="none")
    driver_license = fields.Char(string="Permis de conduire")
    license_type = fields.Char(string='Catégorie du permis')
    days_to_expire = fields.Integer(string='Expire dans', compute='_compute_days_to_expire')
    license_valid_from = fields.Date(string='Date d\'emmission')
    license_expiration = fields.Date(string='Date d\'expiration')
    outsourcing = fields.Boolean(string='Outsourcing?')

    @api.depends('license_expiration')
    def _compute_days_to_expire(self):
        for rec in self:
            date = datetime.now()
            if rec.license_expiration:
                date = datetime.strptime(rec.license_expiration, '%Y-%m-%d')
            now = datetime.now()
            delta = date - now
            rec.days_to_expire = delta.days if delta.days > 0 else 0
