from typing import Dict, Any, List
from src.interfaces.base_tool import AgentTool
from src.interfaces.tools.system_tools import GetSystemVitalsTool, ExecuteLocalCommandTool
from src.interfaces.tools.network_tools import PingNodeTool

class AgentLoop:
    def __init__(self):
        self.tools: Dict[str, AgentTool] = {
            "get_system_vitals": GetSystemVitalsTool(),
            "execute_local_command": ExecuteLocalCommandTool(),
            "ping_node": PingNodeTool()
        }
    
    def process_input(self, user_input: str) -> str:
        """Processes the input and routes to the correct tool."""
        user_input = user_input.strip()
        user_input_lower = user_input.lower()
        
        if user_input_lower in ["vitals", "status"]:
            result = self.tools["get_system_vitals"].run()
            return f"[Agent] Executed get_system_vitals:\n{result}"
            
        elif user_input_lower.startswith("ping "):
            ip = user_input.split(" ", 1)[1]
            result = self.tools["ping_node"].run(ip_address=ip)
            return f"[Agent] Executed ping_node on {ip}:\n{result}"
            
        elif user_input_lower.startswith("exec "):
            command = user_input[5:]
            result = self.tools["execute_local_command"].run(command=command)
            return f"[Agent] Executed command '{command}':\n{result}"
            
        else:
            return f"[Agent] Unknown command: '{user_input}'. Available: vitals, ping <ip>, exec <cmd>"
