# 1fox-onchain-signals
 - debank segments

## remove queue
redis-cli KEYS "bull:debank:*" | xargs redis-cli DEL

redis-cli KEYS "bull:debank:projects*" | xargs redis-cli DEL
redis-cli KEYS "bull:debank:balances*" | xargs redis-cli DEL

