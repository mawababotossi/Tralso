docker run -d -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo --name db postgres:9.4

docker run -p 8069:8069 --name odoo --link db:db -t odoo

Stop and restart an Odoo instance

$ docker stop odoo
$ docker start -a odoo

Run Odoo with a custom configuration

The default configuration file for the server (located at /etc/odoo/openerp-server.conf) can be overriden at startup using volumes. Suppose you have a custom configuration at /path/to/config/openerp-server.conf, then

$ docker run -v /path/to/config:/etc/odoo -p 8069:8069 --name odoo --link db:db -t odoo

Mount custom addons

You can mount your own Odoo addons within the Odoo container, at /mnt/extra-addons

$ docker run -v /path/to/addons:/mnt/extra-addons -p 8069:8069 --name odoo --link db:db -t odoo

Docker Compose examples

The simplest docker-compose.yml file would be:

version: '2'
services:
  web:
    image: odoo:10.0
    depends_on:
      - db
    ports:
      - "8069:8069"
  db:
    image: postgres:9.4
    environment:
      - POSTGRES_PASSWORD=odoo
      - POSTGRES_USER=odoo


If the default postgres credentials does not suit you, tweak the environment variables:

version: '2'
services:
  web:
    image: odoo:10.0
    depends_on:
      - mydb
    ports:
      - "8069:8069"
    environment:
    - HOST=mydb
    - USER=odoo
    - PASSWORD=myodoo
  mydb:
    image: postgres:9.4
    environment:
      - POSTGRES_USER=odoo
      - POSTGRES_PASSWORD=myodoo

Here's a last example showing you how to mount custom addons, how to use a custom configuration file and how to use volumes for the Odoo and postgres data dir:

version: '2'
services:
  web:
    image: odoo:10.0
    depends_on:
      - db
    ports:
      - "8069:8069"
    volumes:
      - odoo-web-data:/var/lib/odoo
      - ./config:/etc/odoo
      - ./addons:/mnt/extra-addons
  db:
    image: postgres:9.4
    environment:
      - POSTGRES_PASSWORD=odoo
      - POSTGRES_USER=odoo
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - odoo-db-data:/var/lib/postgresql/data/pgdata
volumes:
  odoo-web-data:
  odoo-db-data:

To start your Odoo instance, go in the directory of the docker-compose.yml file you created from the previous examples and type:

docker-compose up -d
