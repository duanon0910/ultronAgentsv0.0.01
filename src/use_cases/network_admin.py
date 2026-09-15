from typing import Dict, Any
from src.infrastructure.networking.local_network import LocalNetworkNode

class NetworkAdminUseCase:
    """Orchestrates network administration actions."""
    
    def ping_target(self, ip_address: str) -> Dict[str, Any]:
        """Pings a target IP and returns the reachability status."""
        node = LocalNetworkNode(ip_address=ip_address, mac_address="unknown", hostname="unknown")
        is_reachable = node.is_reachable()
        
        return {
            "target": ip_address,
            "reachable": is_reachable,
            "status": "Online" if is_reachable else "Offline"
        }
