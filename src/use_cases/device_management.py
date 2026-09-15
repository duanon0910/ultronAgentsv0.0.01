from typing import Dict, Any
from src.infrastructure.os_system.local_machine import LocalMachine

class DeviceManagementUseCase:
    """Orchestrates device management actions."""
    
    def __init__(self):
        self.local_machine = LocalMachine()
        
    def get_local_vitals(self) -> Dict[str, Any]:
        """Retrieves system vitals of the local machine."""
        return self.local_machine.get_status()
        
    def execute_local_command(self, command: str) -> str:
        """Executes a command on the local machine."""
        return self.local_machine.execute_command(command)
