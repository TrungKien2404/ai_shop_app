FROM nginx:alpine

# Copy toan bo source code frontend vao thu muc Mac dinh cua Nginx
COPY . /usr/share/nginx/html

# Ghi de file cau hinh nginx.conf mac dinh de ho tro proxy /api
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script de thay the dong API_BASE trong constants.js luc container run
COPY docker-entrypoint.sh /usr/local/bin/
RUN apk add --no-cache dos2unix && dos2unix /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
