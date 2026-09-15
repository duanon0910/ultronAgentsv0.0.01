from typing import Any, Dict
from src.use_cases.network_admin import NetworkAdminUseCase

def ping_node(ip_address: str) -> Dict[str, Any]:
    """Pings a target IP address to check if it is reachable on the network."""
    if not ip_address:
        return {"error": "Missing required argument 'ip_address'"}
        
    use_case = NetworkAdminUseCase()
    return use_case.ping_target(ip_address)
