import logging

import redis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, socket_timeout=1, socket_connect_timeout=1)


def hit(key: str, limit: int, window_seconds: int) -> bool:
    """
    Count one attempt for `key` in a fixed window. Returns False once `limit` is exceeded.
    Fails open if Redis is unreachable so an outage doesn't lock everyone out.
    """
    try:
        pipe = _redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, window_seconds, nx=True)
        count, _ = pipe.execute()
        return int(count) <= limit
    except redis.RedisError as e:
        logger.warning("Rate limiter unavailable (%s); allowing request", e)
        return True


def reset(key: str) -> None:
    try:
        _redis.delete(key)
    except redis.RedisError:
        pass
