from odoo import models, fields, api
import logging

_logger = logging.getLogger(__name__)

class StrlBusStop(models.Model):
    _name = "strl.busstop"

    _description = 'Bus stop'

    name = fields.Char('Place', size=64, required=True, index=True)

    latitude = fields.Float(required=False, digits=(20, 10), help='GPS Latitude')
    longitude = fields.Float(required=False, digits=(20, 10), help='GPS Longitude')


class StrlBusLine(models.Model):
    _name = "strl.busline"

    _description = 'Bus line'

    name = fields.Char(string='Name', required=True)
    bus_stops = fields.Many2many('strl.busstop', string='Bus stops')
    bus_stops_count = fields.Integer(compute='_compute_stops_count', store=True)
    vehicles = fields.Char(compute='_get_vehicles_on_this_line')

    @api.multi
    def _get_vehicles_on_this_line(self):
        Vehicle = self.env['fleet.vehicle']
        vals = []
        for record in self:
            _vehicle_ids = Vehicle.search([('bus_line_id', '=', record.id)])
            for _v in _vehicle_ids:
                vals.append(_v.name + '/' +_v.license_plate)

            if len(vals) > 0:
                record.vehicles = ', '.join(vals)

    @api.depends('bus_stops')
    def _compute_stops_count(self):
        for record in self:
            record.bus_stops_count = len(record.bus_stops)


class StrlBusBoardings(models.Model):
    _name = "strl.busboardings"

    _description = 'Bus boardings'

    datetime = fields.Datetime(string='Boarding date', default=fields.Datetime.now())
    bus_stop = fields.Many2one('strl.busstop', string='Bus stop', required=True)
    bus_line = fields.Many2one('strl.busline', string='Bus line', required=True)
    boarded = fields.Integer(required=False, digits=(20, 10), help='Onboarded nbr. of persons')
    alighting = fields.Integer(required=False, digits=(20, 10), help='Alighting nbr of persons ')
