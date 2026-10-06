import logging
from typing import Awaitable, Callable

from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)


def send_later(background_tasks: BackgroundTasks, send: Callable[..., Awaitable[None]], **kwargs) -> None:
    """
    Send an email after the response has been returned. Email is best-effort: a mail
    outage must never fail (or slow down) the request that triggered it.
    """

    async def run():
        try:
            await send(**kwargs)
        except Exception:
            logger.exception("Email %s to %s failed", getattr(send, "__name__", send), kwargs.get("email"))

    background_tasks.add_task(run)
