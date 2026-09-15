import asyncio
from typing import Dict, Callable
from src.interfaces.tools.system_tools import get_system_vitals, execute_local_command
from src.interfaces.tools.network_tools import ping_node

class HermesAgentAdapter:
    """Adapter connecting Ultron to the Hermes Agent core engine."""
    
    def __init__(self):
        # Register skills (tools) for Hermes
        self.skills: Dict[str, Callable] = {
            "get_system_vitals": get_system_vitals,
            "execute_local_command": execute_local_command,
            "ping_node": ping_node
        }
        
    async def process_input(self, user_input: str) -> str:
        """Processes the input asynchronously using Hermes Agent reasoning."""
        user_input = user_input.strip()
        user_input_lower = user_input.lower()
        
        # Simulate async reasoning delay for the agent
        await asyncio.sleep(0.5)
        
        # Generic routing logic matching previous AgentLoop behavior
        if user_input_lower in ["vitals", "status"]:
            result = self.skills["get_system_vitals"]()
            return f"[Hermes] System Vitals:\n{result}"
            
        elif user_input_lower.startswith("ping "):
            ip = user_input.split(" ", 1)[1]
            result = self.skills["ping_node"](ip)
            return f"[Hermes] Ping Results for {ip}:\n{result}"
            
        elif user_input_lower.startswith("exec "):
            command = user_input[5:]
            result = self.skills["execute_local_command"](command)
            return f"[Hermes] Command Execution '{command}':\n{result}"
            
        else:
            return f"[Hermes] I couldn't understand '{user_input}'. Try: vitals, ping <ip>, exec <cmd>"
