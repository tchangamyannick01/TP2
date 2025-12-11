# Dockerfile
FROM php:8.3-apache

COPY php/ /var/www/html/

RUN echo 'Options +Indexes' > /var/www/html/.htaccess && \
    chmod 644 /var/www/html/.htaccess

RUN chmod -R u+rwX,g+rX,o+rX /var/www/html
