from slowapi import Limiter
from slowapi.util import get_remote_address

# Central limiter instance so routers can apply decorators without circular imports.
limiter = Limiter(key_func=get_remote_address)

