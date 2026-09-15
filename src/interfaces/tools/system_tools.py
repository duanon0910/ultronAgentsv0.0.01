from typing import Any, Dict
from src.use_cases.device_management import DeviceManagementUseCase

def get_system_vitals() -> Dict[str, Any]:
    """Retrieves the current CPU and RAM usage of the host machine."""
    use_case = DeviceManagementUseCase()
    return use_case.get_local_vitals()

def execute_local_command(command: str) -> Dict[str, Any]:
    """Executes a shell command on the host machine and returns the output."""
    if not command:
        return {"error": "Missing required argument 'command'"}
    
    use_case = DeviceManagementUseCase()
    output = use_case.execute_local_command(command)
    return {"output": output}
