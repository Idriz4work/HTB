# Use Node.js base image with Alpine Linux
FROM node:alpine

# Install required dependencies for MailHog and supervisord
RUN apk add --no-cache \
    wget \
    supervisor \
    apache2-utils \
    curl

# Install MailHog binary
WORKDIR /
RUN wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64
RUN chmod +x MailHog_linux_amd64

# Prepare email directory and copy app files
RUN mkdir -p /email
COPY email-app /email

WORKDIR /email
RUN npm install

# Generate a random password and create authentication file for MailHog
RUN RANDOM_VALUE=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1) \
    && htpasswd -nbBC 10 test "$RANDOM_VALUE" > /mailhog-auth \
    && echo $RANDOM_VALUE > /email/password.txt

# Set working directory for the main app
WORKDIR /app

# Copy challenge files and install dependencies
COPY challenge .
RUN npm install

# Copy supervisord configuration
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports for the app and email client
EXPOSE 8080
EXPOSE 1337

COPY flag.txt /flag.txt

# Start supervisord
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
