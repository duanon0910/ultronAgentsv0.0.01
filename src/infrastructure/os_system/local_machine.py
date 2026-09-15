import psutil
import subprocess
import platform
from typing import Dict, Any
from src.domain.entities import Device

class LocalMachine(Device):
    """Concrete implementation of a Device for the local host machine."""
    
    def __init__(self, device_id: str = "localhost"):
        super().__init__(
            device_id=device_id,
            os_type=platform.system().lower(),
            is_online=True
        )

    def get_status(self) -> Dict[str, Any]:
        """Returns the current CPU and RAM usage of the local machine."""
        cpu = psutil.cpu_percent(interval=0.1)
        ram = psutil.virtual_memory().percent
        return {
            "device_id": self.device_id,
            "os": self.os_type,
            "cpu_percent": cpu,
            "ram_percent": ram,
            "is_online": self.is_online
        }

    def execute_command(self, command: str) -> str:
        """Executes a shell command locally and returns the output."""
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                check=True
            )
            return result.stdout
        except subprocess.CalledProcessError as e:
            return f"Error executing command: {e.stderr}"
