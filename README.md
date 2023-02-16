# 1fox-onchain-signals
 - debank segments

## remove queue
redis-cli KEYS "bull:debank:*" | xargs redis-cli DEL