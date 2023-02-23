# 1fox-onchain-signals
 - debank segments

## remove queue
redis-cli KEYS "bull:debank:*" | xargs redis-cli DEL

redis-cli KEYS "bull:debank:projects*" | xargs redis-cli DEL
redis-cli KEYS "bull:debank:balances*" | xargs redis-cli DEL


redis-cli KEYS "bull:nansen:*" | xargs redis-cli DEL

redis-cli KEYS "bull:top-holders:*" | xargs redis-cli DEL

docker image prune --all --filter until=48h

sudo docker run -d --name container-redis -p 6379:6379  -v /redis/redis.conf:/redis.conf redis redis-server /redis.conf --appendonly yes