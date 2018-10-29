# -*- coding: utf-8 -*-

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

#    route = fields.Many2one('tm.route', String='Route', required=True)
