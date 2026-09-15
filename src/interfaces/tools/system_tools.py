from typing import Any, Dict
from src.interfaces.base_tool import AgentTool
from src.use_cases.device_management import DeviceManagementUseCase

class GetSystemVitalsTool(AgentTool):
    """Tool to retrieve local system vitals."""
    
    def __init__(self):
        self.use_case = DeviceManagementUseCase()
        
    @property
    def name(self) -> str:
        return "get_system_vitals"
        
    @property
    def description(self) -> str:
        return "Retrieves the current CPU and RAM usage of the host machine."
        
    def run(self, **kwargs: Any) -> Dict[str, Any]:
        return self.use_case.get_local_vitals()

class ExecuteLocalCommandTool(AgentTool):
    """Tool to execute shell commands locally."""
    
    def __init__(self):
        self.use_case = DeviceManagementUseCase()
        
    @property
    def name(self) -> str:
        return "execute_local_command"
        
    @property
    def description(self) -> str:
        return "Executes a shell command on the host machine and returns the output."
        
    def run(self, **kwargs: Any) -> Dict[str, Any]:
        command = kwargs.get("command")
        if not command:
            return {"error": "Missing required argument 'command'"}
        
        output = self.use_case.execute_local_command(command)
        return {"output": output}
