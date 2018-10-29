# -*- coding: utf-8 -*-
from odoo import models, fields, api

class TmPlace(models.Model):
    _name = 'tm.place'
    _description = 'Cities / Places'

    name = fields.Char('Place', size=64, required=True, index=True)
    complete_name = fields.Char(compute='_compute_complete_name')
    state_id = fields.Many2one('res.country.state', string='State Name')
    country_id = fields.Many2one('res.country', string='Country')
    latitude = fields.Float(required=False, digits=(20, 10), help='GPS Latitude')
    longitude = fields.Float(required=False, digits=(20, 10), help='GPS Longitude')
#    point = geo_fields.GeoPoint(
#        string='Coordinate',
#        compute='_compute_point',
#        inverse='_set_lat_long',
#    )

    @api.onchange('state_id')
    def get_country_id(self):
        for rec in self:
            if rec.state_id:
                rec.country_id = rec.state_id.country_id
            else:
                rec.country_id = False

    
    @api.depends('name', 'state_id')
    def _compute_complete_name(self):
        for rec in self:
            if rec.state_id:
                rec.complete_name = rec.name + ', ' + rec.state_id.name
            else:
                rec.complete_name = rec.name

