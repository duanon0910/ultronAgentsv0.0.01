from typing import Any, Dict
from src.interfaces.base_tool import AgentTool
from src.use_cases.network_admin import NetworkAdminUseCase

class PingNodeTool(AgentTool):
    """Tool to ping a network target."""
    
    def __init__(self):
        self.use_case = NetworkAdminUseCase()
        
    @property
    def name(self) -> str:
        return "ping_node"
        
    @property
    def description(self) -> str:
        return "Pings a target IP address to check if it is reachable on the network."
        
    def run(self, **kwargs: Any) -> Dict[str, Any]:
        ip_address = kwargs.get("ip_address")
        if not ip_address:
            return {"error": "Missing required argument 'ip_address'"}
            
        return self.use_case.ping_target(ip_address)
